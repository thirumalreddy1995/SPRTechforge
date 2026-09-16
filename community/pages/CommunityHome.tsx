// Community — the home page every logged-in user lands on (the master user
// can still open the Director Dashboard). One place for what is happening:
// announcements, today's birthdays and celebrations, achievements, upcoming
// events, and something new to learn every day. Staff and admins post;
// everyone reads and reacts; students see posts addressed to them.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input, Modal, Select } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { uploadService } from '../../services/uploadService';
import { isMasterUser, generateId } from '../../utils';
import { CandidateStatus, NotificationType } from '../../types';
import { CommunityPost, GalleryImage, PostAudience, PostKind, POST_KIND_META, REACTIONS, ReactionKey, emptyReactions } from '../types';
import { subscribePosts, savePost, updatePost, deletePost, toggleReaction, subscribeGallery, saveGalleryImage, updateGalleryImage, deleteGalleryImage } from '../services/communityDb';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { DailyQuote, LearningTip, fetchQuoteOfTheDay, fallbackQuote, learningTipOfTheDay, upcomingBirthdays, greetingFor, BirthdayHit } from '../lib/daily';
import { fetchPublicEvents } from '../../events/services/eventsPublicDb';
import { SprEvent } from '../../events/types';
import { formatISTRange, relativeToNow } from '../../events/lib/datetime';
import { lifecycleOf } from '../../events/lib/validate';
import { publicEventUrl } from '../../events/components/shared';
import { runCommunityTests, CommunityTestResult } from '../tests/communityTests';

const timeAgo = (iso: string): string => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const kindToNotification: Record<PostKind, NotificationType> = {
  announcement: 'announcement', birthday: 'birthday', celebration: 'celebration', achievement: 'achievement', learning: 'learning',
};

type Filter = 'all' | PostKind;

interface Draft {
  kind: PostKind;
  title: string;
  body: string;
  audience: PostAudience;
  pinned: boolean;
  candidateId: string;
  linkUrl: string;
  imageUrl: string;
  expiresAt: string; // yyyy-mm-dd or ''
}

const emptyDraft = (kind: PostKind = 'announcement'): Draft => ({
  kind, title: '', body: '', audience: 'all', pinned: false, candidateId: '', linkUrl: '', imageUrl: '', expiresAt: '',
});

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm ${className}`} {...props} />
  </div>
);

export const CommunityHome: React.FC = () => {
  const { user, candidates, candidateProfiles, notifyUsers, showToast, isCloudEnabled } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [quote, setQuote] = useState<DailyQuote>(fallbackQuote());
  const [events, setEvents] = useState<SprEvent[]>([]);
  const [eventsState, setEventsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testResults, setTestResults] = useState<CommunityTestResult[] | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const isStudent = user?.role === 'candidate';
  const canPost = !!user && !isStudent;
  const canModerate = !!user && (user.role === 'admin' || isMasterUser(user));
  const tip: LearningTip = learningTipOfTheDay();

  useEffect(() => {
    if (!isCloudEnabled) { setLoaded(true); return; }
    const unsub = subscribePosts(items => { setPosts(items); setLoaded(true); });
    return unsub;
  }, [isCloudEnabled]);

  useEffect(() => {
    if (!isCloudEnabled) return;
    return subscribeGallery(setGallery);
  }, [isCloudEnabled]);

  useEffect(() => { fetchQuoteOfTheDay().then(setQuote).catch(() => {}); }, []);
  useEffect(() => {
    // One retry after a short pause — a flaky connection should not leave the
    // card claiming "No upcoming events".
    let cancelled = false;
    const load = (attempt: number) => fetchPublicEvents()
      .then(items => { if (!cancelled) { setEvents(items); setEventsState('ready'); } })
      .catch(() => { if (cancelled) return; if (attempt < 2) setTimeout(() => load(attempt + 1), 2500); else setEventsState('error'); });
    load(1);
    return () => { cancelled = true; };
  }, []);

  // ---------------- gallery management ----------------

  const addGalleryPhotos = async (files: File[]) => {
    setGalleryUploading(true);
    let added = 0;
    try {
      let order = gallery.reduce((m, g) => Math.max(m, g.order), 0);
      for (const f of files) {
        if (!/^image\//.test(f.type)) continue;
        const up = await uploadService.uploadImage(`community/gallery/${Date.now()}-${f.name}`, f, { maxWidth: 1600 });
        order += 1;
        await saveGalleryImage({ id: `photo-${generateId()}`, imageUrl: up.url, caption: '', order, createdAt: new Date().toISOString(), createdBy: user!.id, createdByName: user!.name });
        added++;
      }
      showToast(`${added} photo${added === 1 ? '' : 's'} added to the home page`, 'success');
    } catch (e: any) { showToast(`Upload failed: ${e.message || e}`, 'error'); }
    finally { setGalleryUploading(false); }
  };
  const captionGalleryPhoto = async (id: string, caption: string) => { try { await updateGalleryImage(id, { caption }); } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); } };
  const moveGalleryPhoto = async (id: string, direction: -1 | 1) => {
    const i = gallery.findIndex(g => g.id === id); const j = i + direction;
    if (i < 0 || j < 0 || j >= gallery.length) return;
    const a = gallery[i], b = gallery[j];
    // swap orders (use distinct values even if both were 0)
    const oa = a.order, ob = b.order === oa ? oa + direction : b.order;
    try { await Promise.all([updateGalleryImage(a.id, { order: ob }), updateGalleryImage(b.id, { order: oa })]); } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); }
  };
  const removeGalleryPhoto = async (id: string) => { try { await deleteGalleryImage(id); } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); } };

  const visiblePosts = useMemo(() => {
    const now = Date.now();
    return posts
      .filter(p => !p.expiresAt || new Date(p.expiresAt).getTime() + 86_400_000 > now)
      .filter(p => !isStudent || p.audience === 'all' || p.audience === 'candidates')
      .filter(p => filter === 'all' || p.kind === filter)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  }, [posts, filter, isStudent]);

  const birthdays: BirthdayHit[] = useMemo(() => {
    const active = candidates.filter(c => c.isActive);
    const people = active.map(c => ({ candidateId: c.id, name: c.name, dob: candidateProfiles.find(p => p.candidateId === c.id)?.dob }));
    return upcomingBirthdays(people, 8);
  }, [candidates, candidateProfiles]);
  const todayBirthdays = birthdays.filter(b => b.inDays === 0);
  const laterBirthdays = birthdays.filter(b => b.inDays > 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const wishedToday = new Set(posts.filter(p => p.kind === 'birthday' && p.createdAt.slice(0, 10) === todayKey).map(p => p.candidateId));

  const upcomingEvents = useMemo(() =>
    events.filter(e => e.status === 'published' && lifecycleOf(e) !== 'past').sort((a, b) => a.startAt.localeCompare(b.startAt)).slice(0, 4),
  [events]);

  const placements = useMemo(() =>
    candidates.filter(c => c.status === CandidateStatus.Placed).slice(-5).reverse(),
  [candidates]);

  if (!user) return null;

  // ---------------- composer ----------------

  const openComposer = (kind: PostKind = 'announcement', candidateId = '') => {
    const c = candidates.find(x => x.id === candidateId);
    const d = emptyDraft(kind);
    d.candidateId = candidateId;
    if (kind === 'birthday' && c) {
      d.title = `Happy Birthday, ${c.name.split(' ')[0]}! 🎂`;
      d.body = `Wishing you a fantastic year ahead, ${c.name.split(' ')[0]} — from all of us at SPR Techforge. Have a wonderful day!`;
    }
    if (kind === 'achievement' && c) {
      d.title = `Congratulations, ${c.name}! 🏆`;
      d.body = c.placedCompany ? `${c.name} has been placed at ${c.placedCompany}${c.packageDetails ? ` (${c.packageDetails})` : ''}. Proud of you!` : '';
    }
    setDraft(d); setEditingId(null); setComposerOpen(true);
  };

  const openEdit = (p: CommunityPost) => {
    setDraft({ kind: p.kind, title: p.title, body: p.body, audience: p.audience, pinned: p.pinned, candidateId: p.candidateId, linkUrl: p.linkUrl, imageUrl: p.imageUrl, expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '' });
    setEditingId(p.id); setComposerOpen(true);
  };

  const handleImage = async (file: File) => {
    setUploading(true);
    try {
      const up = await uploadService.uploadImage(`community/${Date.now()}-${file.name}`, file, { maxWidth: 1200 });
      setDraft(d => ({ ...d, imageUrl: up.url }));
    } catch (e: any) { showToast(`Image upload failed: ${e.message || e}`, 'error'); }
    finally { setUploading(false); if (imgRef.current) imgRef.current.value = ''; }
  };

  const submitPost = async () => {
    if (!draft.title.trim()) { showToast('Give the post a title', 'error'); return; }
    if (!draft.body.trim() && !draft.imageUrl) { showToast('Write something or add an image', 'error'); return; }
    if (draft.linkUrl.trim() && !/^https?:\/\//i.test(draft.linkUrl.trim())) { showToast('The link must start with http:// or https://', 'error'); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const c = candidates.find(x => x.id === draft.candidateId);
      const base = {
        kind: draft.kind, title: draft.title.trim(), body: draft.body.trim(), imageUrl: draft.imageUrl,
        audience: draft.audience, pinned: canModerate ? draft.pinned : false,
        candidateId: c?.id || '', candidateName: c?.name || '', linkUrl: draft.linkUrl.trim(),
        expiresAt: draft.expiresAt ? new Date(draft.expiresAt + 'T23:59:59').toISOString() : '',
        updatedAt: now,
      };
      if (editingId) {
        await updatePost(editingId, base);
        showToast('Post updated', 'success');
      } else {
        const post: CommunityPost = { ...base, id: `post-${generateId()}`, authorId: user.id, authorName: user.name, createdAt: now, reactions: emptyReactions() };
        await savePost(post);
        notifyUsers('all', kindToNotification[post.kind], `${POST_KIND_META[post.kind].emoji} ${post.title}`, { body: post.body.slice(0, 140), link: '/community' });
        showToast('Posted — everyone will see it on their home page', 'success');
      }
      setComposerOpen(false);
    } catch (e: any) { showToast(`Could not save: ${e.message || e}`, 'error'); }
    finally { setSaving(false); }
  };

  const removePost = async (p: CommunityPost) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try { await deletePost(p.id); showToast('Post deleted', 'info'); } catch (e: any) { showToast(`Delete failed: ${e.message || e}`, 'error'); }
  };

  const togglePin = async (p: CommunityPost) => {
    try { await updatePost(p.id, { pinned: !p.pinned }); } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); }
  };

  const react = async (p: CommunityPost, key: ReactionKey) => {
    // optimistic
    const mine = (p.reactions[key] || []).includes(user.id);
    setPosts(prev => prev.map(x => x.id === p.id ? { ...x, reactions: { ...x.reactions, [key]: mine ? x.reactions[key].filter(u => u !== user.id) : [...(x.reactions[key] || []), user.id] } } : x));
    try { await toggleReaction(p, key, user.id); } catch { /* snapshot will correct */ }
  };

  // ---------------- render ----------------

  const PostCard: React.FC<{ p: CommunityPost }> = ({ p }) => {
    const meta = POST_KIND_META[p.kind];
    const mineOrMod = canModerate || p.authorId === user.id;
    return (
      <article className={`bg-white rounded-2xl border ${p.pinned ? 'border-blue-300 shadow-md shadow-blue-100' : 'border-gray-200'} p-5 sm:p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${meta.tint}`}>{meta.emoji} {meta.label}</span>
            {p.pinned && <span className="text-[11px] font-bold text-blue-700">📌 Pinned</span>}
            {p.audience !== 'all' && canPost && <span className="text-[11px] font-bold text-gray-400 uppercase">{p.audience === 'staff' ? 'Staff only' : 'Students'}</span>}
          </div>
          {mineOrMod && (
            <div className="flex gap-1 shrink-0 text-xs">
              {canModerate && <button onClick={() => togglePin(p)} className="px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100" title={p.pinned ? 'Unpin' : 'Pin to top'}>{p.pinned ? 'Unpin' : 'Pin'}</button>}
              <button onClick={() => openEdit(p)} className="px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100">Edit</button>
              <button onClick={() => removePost(p)} className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-50">Delete</button>
            </div>
          )}
        </div>
        <h3 className="text-lg font-black text-gray-900 mt-3 leading-snug">{p.title}</h3>
        {p.candidateName && <p className="text-xs font-bold text-gray-500 mt-0.5">🎓 {p.candidateName}</p>}
        {p.body && <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap mt-2">{p.body}</p>}
        {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" className="w-full rounded-xl border border-gray-100 mt-3 max-h-[420px] object-cover" />}
        {p.linkUrl && <a href={p.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm font-bold text-blue-600 underline break-all">{p.linkUrl.replace(/^https?:\/\//, '').slice(0, 60)} ↗</a>}
        <div className="flex items-center justify-between gap-3 flex-wrap mt-4 pt-3 border-t border-gray-100">
          <div className="flex gap-1.5 flex-wrap">
            {REACTIONS.map(r => {
              const users = p.reactions[r.key] || [];
              const mine = users.includes(user.id);
              return (
                <button key={r.key} onClick={() => react(p, r.key)} title={r.label}
                  className={`px-2.5 py-1 rounded-full text-sm border transition-colors ${mine ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  {r.emoji}{users.length > 0 && <span className="ml-1 text-xs">{users.length}</span>}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">{p.authorName} · {timeAgo(p.createdAt)}</p>
        </div>
      </article>
    );
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'announcement', label: '📢 Announcements' },
    { key: 'birthday', label: '🎂 Birthdays' },
    { key: 'celebration', label: '🎉 Celebrations' },
    { key: 'achievement', label: '🏆 Achievements' },
    { key: 'learning', label: '💡 Learning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">{greetingFor(user.name)} 👋</h1>
          <p className="text-blue-100 mt-1 text-sm">
            {todayBirthdays.length > 0
              ? `🎂 ${todayBirthdays.map(b => b.name.split(' ')[0]).join(', ')} ${todayBirthdays.length === 1 ? 'has' : 'have'} a birthday today!`
              : upcomingEvents.length > 0
                ? `Next event: ${upcomingEvents[0].title} · ${relativeToNow(upcomingEvents[0].startAt)}`
                : 'Here is what is happening at SPR Techforge.'}
          </p>
        </div>
        {canPost && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => openComposer('announcement')} className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-sm shadow hover:bg-blue-50">📢 New announcement</button>
            <button onClick={() => openComposer('celebration')} className="px-4 py-2.5 rounded-xl bg-blue-700/60 border border-blue-400/40 text-white font-bold text-sm hover:bg-blue-700">🎉 Celebrate</button>
          </div>
        )}
      </div>

      {/* Today's birthdays */}
      {todayBirthdays.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {todayBirthdays.map(b => (
            <div key={b.candidateId} className="bg-gradient-to-br from-pink-50 to-amber-50 border border-pink-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-4xl">🎂</div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-gray-900 truncate">{b.name}</p>
                <p className="text-xs text-pink-700 font-bold">Birthday today{b.turning ? ` · turns ${b.turning}` : ''}</p>
                {canPost && !wishedToday.has(b.candidateId) && (
                  <button onClick={() => openComposer('birthday', b.candidateId)} className="mt-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded-lg">Post wishes</button>
                )}
                {wishedToday.has(b.candidateId) && <p className="mt-1 text-xs font-bold text-emerald-700">✓ Wishes posted</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Feed. min-w-0 lets the column shrink to its grid track — without it the
            chip row's intrinsic width pushed the column under the side panel on laptops. */}
        <div className="lg:col-span-2 min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${filter === f.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {!loaded ? (
            <div className="space-y-4">{[0, 1].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-40 animate-pulse" />)}</div>
          ) : visiblePosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <div className="text-5xl mb-3">📝</div>
              <p className="font-bold text-gray-700">Nothing here yet</p>
              <p className="text-sm text-gray-500 mt-1">{canPost ? 'Post the first announcement — every user sees it on their home page.' : 'Announcements from the team will appear here.'}</p>
              {canPost && <Button className="mt-4 mx-auto" onClick={() => openComposer('announcement')}>+ New post</Button>}
            </div>
          ) : (
            visiblePosts.map(p => <PostCard key={p.id} p={p} />)
          )}

          {/* Photo carousel — under the announcements, visible to everyone */}
          <PhotoCarousel
            images={gallery}
            canManage={canPost}
            uploading={galleryUploading}
            onAdd={addGalleryPhotos}
            onCaption={captionGalleryPhoto}
            onMove={moveGalleryPhoto}
            onRemove={removeGalleryPhoto}
          />
        </div>

        {/* Side column */}
        <aside className="space-y-4 min-w-0">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-200">Quote of the day</p>
            <p className="text-lg font-semibold leading-snug mt-2">“{quote.text}”</p>
            <p className="text-sm text-violet-200 mt-2">— {quote.author}</p>
          </div>

          <Card title="💡 Learning of the day">
            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">{tip.tag}</span>
            <p className="font-black text-gray-900 mt-2">{tip.title}</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-1">{tip.body}</p>
            {canPost && <button onClick={() => openComposer('learning')} className="mt-3 text-xs font-bold text-blue-600 underline">Share your own tip →</button>}
          </Card>

          <Card title="Upcoming events" action={canPost && (user.role === 'admin' || user.modules.includes('users')) ? <Link to="/events/manage" className="text-xs font-bold text-blue-600">Manage</Link> : undefined}>
            {eventsState === 'loading' ? (
              <div className="space-y-2">{[0, 1].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : eventsState === 'error' ? (
              <p className="text-sm text-gray-500">Couldn't load events right now. <Link to="/events" className="text-blue-600 font-bold underline">Open the events page</Link></p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events. <Link to="/events" className="text-blue-600 font-bold underline">See all events</Link></p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(e => (
                  <a key={e.id} href={publicEventUrl(e.slug)} target="_blank" rel="noopener noreferrer" className="block group">
                    <p className="font-bold text-gray-900 group-hover:text-blue-700 leading-snug">{e.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatISTRange(e.startAt, e.endAt)} · <span className="font-bold text-blue-700">{relativeToNow(e.startAt)}</span></p>
                  </a>
                ))}
              </div>
            )}
          </Card>

          {laterBirthdays.length > 0 && (
            <Card title="🎈 Upcoming birthdays">
              <div className="space-y-2">
                {laterBirthdays.map(b => (
                  <div key={b.candidateId} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-800 truncate">{b.name}</span>
                    <span className="text-xs text-gray-500 shrink-0 ml-2">{b.inDays === 1 ? 'Tomorrow' : b.dateLabel}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {placements.length > 0 && (
            <Card title="🏆 Recent placements">
              <div className="space-y-2.5">
                {placements.map(c => (
                  <div key={c.id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.placedCompany || 'Placed'}{c.packageDetails ? ` · ${c.packageDetails}` : ''}</p>
                    </div>
                    {canPost && <button onClick={() => openComposer('achievement', c.id)} className="text-xs font-bold text-emerald-700 shrink-0">Celebrate</button>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {isMasterUser(user) && (
            <div className="text-right">
              <button onClick={() => setTestResults(runCommunityTests())} className="text-xs text-gray-400 hover:text-gray-600 underline">Run module tests</button>
              {testResults && (
                <div className="mt-2 text-left bg-white border border-gray-200 rounded-xl p-3 text-xs space-y-1">
                  {testResults.map(r => <p key={r.name} className={r.status === 'PASS' ? 'text-emerald-700' : 'text-red-600'}>{r.status} · {r.name}{r.message ? ` — ${r.message}` : ''}</p>)}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Composer */}
      <Modal isOpen={composerOpen} onClose={() => !saving && setComposerOpen(false)} title={editingId ? 'Edit post' : 'New post'} size="lg">
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Type" value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as PostKind })}>
              {(Object.keys(POST_KIND_META) as PostKind[]).map(k => <option key={k} value={k}>{POST_KIND_META[k].emoji} {POST_KIND_META[k].label}</option>)}
            </Select>
            <Select label="Who sees it" value={draft.audience} onChange={e => setDraft({ ...draft, audience: e.target.value as PostAudience })}>
              <option value="all">Everyone (staff + students)</option>
              <option value="staff">Staff only</option>
              <option value="candidates">Students only</option>
            </Select>
          </div>
          {(draft.kind === 'birthday' || draft.kind === 'celebration' || draft.kind === 'achievement') && (
            <Select label="About (optional)" value={draft.candidateId} onChange={e => { const id = e.target.value; const c = candidates.find(x => x.id === id); setDraft(d => ({ ...d, candidateId: id, title: d.title || (c && d.kind === 'birthday' ? `Happy Birthday, ${c.name.split(' ')[0]}! 🎂` : d.title) })); }}>
              <option value="">— Not about a specific student —</option>
              {candidates.filter(c => c.isActive).sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          )}
          <Input label="Title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder={draft.kind === 'announcement' ? 'e.g. Holiday on Friday — classes resume Monday' : 'Say it in one line'} maxLength={120} />
          <TextArea label="Message" rows={5} value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} placeholder="Blank lines make paragraphs." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Link (optional)" value={draft.linkUrl} onChange={e => setDraft({ ...draft, linkUrl: e.target.value })} placeholder="https://…" />
            <Input label="Hide after (optional)" type="date" value={draft.expiresAt} onChange={e => setDraft({ ...draft, expiresAt: e.target.value })} />
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
            <Button variant="secondary" onClick={() => imgRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : draft.imageUrl ? 'Replace image' : '+ Add image'}</Button>
            {draft.imageUrl && <><img src={draft.imageUrl} alt="" className="h-12 rounded-lg border border-gray-200" /><button onClick={() => setDraft({ ...draft, imageUrl: '' })} className="text-xs text-red-500 font-bold">Remove</button></>}
            {canModerate && (
              <label className="flex items-center gap-2 text-sm text-gray-700 ml-auto">
                <input type="checkbox" className="w-4 h-4" checked={draft.pinned} onChange={e => setDraft({ ...draft, pinned: e.target.checked })} /> Pin to top
              </label>
            )}
          </div>
          <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => setComposerOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={submitPost} disabled={saving || uploading}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Post'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
