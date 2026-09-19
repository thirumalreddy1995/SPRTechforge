// Admin → Website Content: the pieces of the public marketing site that
// change over time — hero banners, photo gallery, student testimonials, the
// numbers on the stats strip, and social/contact links. Everything else on
// the site is authored in pages/LandingPage.tsx.

import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Modal, Select } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { uploadService } from '../../services/uploadService';
import { generateId } from '../../utils';
import {
  SiteBanner, SitePhoto, SiteTestimonial, SiteStats, SiteSettings, defaultSettings, defaultStats,
} from '../../site/types';
import {
  subscribeBanners, saveBanner, updateBanner, deleteBanner,
  subscribePhotos, savePhoto, updatePhoto, deletePhoto,
  subscribeTestimonials, saveTestimonial, updateTestimonial, deleteTestimonial,
  loadStats, saveStats, loadSettings, saveSettings,
} from '../../site/services/siteDb';

type Tab = 'banners' | 'photos' | 'testimonials' | 'settings';

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" {...props} />
  </div>
);

const swapOrder = async (items: { id: string; order: number }[], id: string, dir: -1 | 1, update: (id: string, patch: any) => Promise<any>) => {
  const i = items.findIndex(x => x.id === id); const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return;
  const a = items[i], b = items[j];
  const oa = a.order, ob = b.order === oa ? oa + dir : b.order;
  await Promise.all([update(a.id, { order: ob }), update(b.id, { order: oa })]);
};

export const WebsiteContent: React.FC = () => {
  const { user, showToast } = useApp();
  const [tab, setTab] = useState<Tab>('banners');
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [testimonials, setTestimonials] = useState<SiteTestimonial[]>([]);
  const [stats, setStats] = useState<SiteStats>(defaultStats());
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings());
  const [busy, setBusy] = useState<string | null>(null);

  const [bannerEdit, setBannerEdit] = useState<SiteBanner | null>(null);
  const bannerFile = useRef<HTMLInputElement>(null);
  const photoFile = useRef<HTMLInputElement>(null);
  const testiFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u1 = subscribeBanners(setBanners);
    const u2 = subscribePhotos(setPhotos);
    const u3 = subscribeTestimonials(setTestimonials);
    loadStats().then(setStats).catch(() => {});
    loadSettings().then(setSettings).catch(() => {});
    return () => { u1(); u2(); u3(); };
  }, []);

  const fail = (e: any) => showToast(`Failed: ${e?.message || e}`, 'error');
  const upload = async (file: File, folder: string, maxWidth: number) => {
    const up = await uploadService.uploadImage(`site/${folder}/${Date.now()}-${file.name}`, file, { maxWidth });
    return up.url;
  };

  // ---------- banners ----------
  const newBanner = (): SiteBanner => ({ id: `banner-${generateId()}`, imageUrl: '', title: '', subtitle: '', ctaLabel: 'Enquire now', ctaUrl: '#contact', order: (banners.reduce((m, b) => Math.max(m, b.order), 0) + 1), active: true, createdAt: new Date().toISOString() });
  const saveBannerEdit = async () => {
    if (!bannerEdit) return;
    if (!bannerEdit.imageUrl) { showToast('Upload a banner image first', 'error'); return; }
    if (!bannerEdit.title.trim()) { showToast('Give the banner a headline', 'error'); return; }
    setBusy('banner');
    try { await saveBanner({ ...bannerEdit, title: bannerEdit.title.trim(), subtitle: bannerEdit.subtitle.trim(), ctaLabel: bannerEdit.ctaLabel.trim(), ctaUrl: bannerEdit.ctaUrl.trim() }); setBannerEdit(null); showToast('Banner saved', 'success'); }
    catch (e) { fail(e); } finally { setBusy(null); }
  };

  // ---------- photos ----------
  const addPhotos = async (files: File[]) => {
    setBusy('photos');
    let order = photos.reduce((m, p) => Math.max(m, p.order), 0), n = 0;
    try {
      for (const f of files) {
        if (!/^image\//.test(f.type)) continue;
        const url = await upload(f, 'gallery', 1600);
        await savePhoto({ id: `photo-${generateId()}`, imageUrl: url, caption: '', order: ++order, createdAt: new Date().toISOString() });
        n++;
      }
      showToast(`${n} photo${n === 1 ? '' : 's'} added to the website`, 'success');
    } catch (e) { fail(e); } finally { setBusy(null); if (photoFile.current) photoFile.current.value = ''; }
  };

  // ---------- testimonials (image cards) ----------
  const addTestimonialImages = async (files: File[]) => {
    setBusy('testimonials');
    let order = testimonials.reduce((m, t) => Math.max(m, t.order), 0);
    let n = 0;
    try {
      for (const f of files) {
        if (!/^image\//.test(f.type)) continue;
        const url = await upload(f, 'testimonials', 1200);
        await saveTestimonial({ id: `testi-${generateId()}`, name: f.name.replace(/\.[a-z0-9]+$/i, ''), role: '', quote: '', photoUrl: url, rating: 5, order: ++order, approved: true, createdAt: new Date().toISOString() });
        n++;
      }
      showToast(`${n} testimonial${n === 1 ? '' : 's'} added to the website`, 'success');
    } catch (e) { fail(e); } finally { setBusy(null); if (testiFile.current) testiFile.current.value = ''; }
  };

  // ---------- settings ----------
  const saveAllSettings = async () => {
    setBusy('settings');
    try {
      const urlOk = (u: string) => !u || /^https?:\/\//i.test(u);
      if (![settings.linkedinUrl, settings.twitterUrl, settings.youtubeUrl, settings.instagramUrl, settings.mapUrl].every(urlOk)) { showToast('Links must start with http:// or https://', 'error'); return; }
      await saveStats(stats);
      await saveSettings({ ...settings, whatsappNumber: settings.whatsappNumber.replace(/\D/g, '') });
      showToast('Website numbers and links saved', 'success');
    } catch (e) { fail(e); } finally { setBusy(null); }
  };

  if (!user) return null;

  const tabs: [Tab, string][] = [['banners', `Hero banners (${banners.length})`], ['photos', `Photo gallery (${photos.length})`], ['testimonials', `Testimonials (${testimonials.length})`], ['settings', 'Numbers & links']];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Website Content</h1>
          <p className="text-gray-600">What visitors see on <a href="#/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">sprtechforge.com</a> — banners, photos, testimonials, numbers and links. Changes go live immediately.</p>
        </div>
        <a href="#/" target="_blank" rel="noopener noreferrer"><Button variant="secondary">Open website ↗</Button></a>
      </div>

      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 -mb-px ${tab === k ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{label}</button>
        ))}
      </div>

      {/* ---------- BANNERS ---------- */}
      {tab === 'banners' && (
        <Card title="Hero banners" action={<Button onClick={() => setBannerEdit(newBanner())}>+ Add banner</Button>}>
          <p className="text-sm text-gray-600 mb-4">Full-width slides at the top of the website, rotating every 6 seconds. Use 1920×800 (or wider) images with the important part in the middle. With no active banners the site shows its built-in slides.</p>
          {banners.length === 0 ? <p className="text-sm text-gray-400 italic">No custom banners yet — the default slides are showing.</p> : (
            <div className="space-y-3">
              {banners.map((b, i) => (
                <div key={b.id} className={`flex flex-col sm:flex-row gap-4 border rounded-xl p-3 ${b.active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'}`}>
                  <img src={b.imageUrl} alt="" className="w-full sm:w-52 h-24 object-cover rounded-lg shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{b.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{b.subtitle}</p>
                    <p className="text-xs text-gray-400 mt-1">{b.ctaLabel ? `Button: "${b.ctaLabel}" → ${b.ctaUrl}` : 'No button'} · {b.active ? 'Active' : 'Hidden'}</p>
                  </div>
                  <div className="flex sm:flex-col gap-1.5 text-xs shrink-0">
                    <button onClick={() => setBannerEdit(b)} className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">Edit</button>
                    <button onClick={() => updateBanner(b.id, { active: !b.active }).catch(fail)} className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">{b.active ? 'Hide' : 'Show'}</button>
                    <button onClick={() => swapOrder(banners, b.id, -1, updateBanner).catch(fail)} disabled={i === 0} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40">↑</button>
                    <button onClick={() => swapOrder(banners, b.id, 1, updateBanner).catch(fail)} disabled={i === banners.length - 1} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40">↓</button>
                    <button onClick={() => { if (window.confirm('Delete this banner?')) deleteBanner(b.id).catch(fail); }} className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ---------- PHOTOS ---------- */}
      {tab === 'photos' && (
        <Card title="Photo gallery" action={<><input ref={photoFile} type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files || []); if (f.length) addPhotos(f); }} /><Button onClick={() => photoFile.current?.click()} disabled={busy === 'photos'}>{busy === 'photos' ? 'Uploading…' : '+ Add photos'}</Button></>}>
          <p className="text-sm text-gray-600 mb-4">Classroom moments, seminars, celebrations, placements. Shown in the "Life at SPR TechForge" section; the section hides when empty.</p>
          {photos.length === 0 ? <p className="text-sm text-gray-400 italic">No photos yet.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {photos.map((p, i) => (
                <div key={p.id} className="flex gap-3 border border-gray-200 rounded-xl p-3">
                  <img src={p.imageUrl} alt="" className="w-32 h-24 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Input label="Caption" defaultValue={p.caption} placeholder="e.g. Batch 14 — Selenium project demo" maxLength={120}
                      onBlur={e => { const v = e.currentTarget.value.trim(); if (v !== p.caption) updatePhoto(p.id, { caption: v }).catch(fail); }} />
                    <div className="flex gap-2 text-xs -mt-2">
                      <button onClick={() => swapOrder(photos, p.id, -1, updatePhoto).catch(fail)} disabled={i === 0} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40">↑ Earlier</button>
                      <button onClick={() => swapOrder(photos, p.id, 1, updatePhoto).catch(fail)} disabled={i === photos.length - 1} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40">↓ Later</button>
                      <button onClick={() => { if (window.confirm('Remove this photo from the website?')) deletePhoto(p.id).catch(fail); }} className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 ml-auto">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ---------- TESTIMONIALS (image cards only) ---------- */}
      {tab === 'testimonials' && (
        <Card title="Student success stories" action={<><input ref={testiFile} type="file" accept="image/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files || []); if (f.length) addTestimonialImages(f); }} /><Button onClick={() => testiFile.current?.click()} disabled={busy === 'testimonials'}>{busy === 'testimonials' ? 'Uploading…' : '+ Upload testimonial'}</Button></>}>
          <p className="text-sm text-gray-600 mb-4">Each testimonial is one designed image (student photo, name, package, company). Upload the finished card; it appears in the "Students success stories" carousel on the website. Portrait or square images work best — every card is shown at the same size.</p>
          {testimonials.length === 0 ? <p className="text-sm text-gray-400 italic">No testimonials yet. Upload the first card.</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {testimonials.map((t, i) => (
                <div key={t.id} className={`border rounded-xl overflow-hidden flex flex-col ${t.approved ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'}`}>
                  <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden">
                    {t.photoUrl ? <img src={t.photoUrl} alt={t.name} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400 px-3 text-center">No image — text-only testimonials are no longer shown. Replace or delete.</span>}
                  </div>
                  <div className="p-2 flex flex-wrap gap-1.5 text-xs justify-between items-center">
                    <span className="text-gray-400">{t.approved ? 'Visible' : 'Hidden'}</span>
                    <div className="flex gap-1">
                      <label className={`px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer ${busy === `testiphoto-${t.id}` ? 'opacity-60 pointer-events-none' : ''}`} title="Replace image">
                        {busy === `testiphoto-${t.id}` ? '…' : 'Replace'}
                        <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; setBusy(`testiphoto-${t.id}`); try { const url = await upload(f, 'testimonials', 1200); await updateTestimonial(t.id, { photoUrl: url, name: t.name || f.name }); showToast('Testimonial image replaced', 'success'); } catch (err) { fail(err); } finally { setBusy(null); } }} />
                      </label>
                      <button onClick={() => updateTestimonial(t.id, { approved: !t.approved }).catch(fail)} className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">{t.approved ? 'Hide' : 'Show'}</button>
                      <button onClick={() => swapOrder(testimonials, t.id, -1, updateTestimonial).catch(fail)} disabled={i === 0} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40" title="Move left">←</button>
                      <button onClick={() => swapOrder(testimonials, t.id, 1, updateTestimonial).catch(fail)} disabled={i === testimonials.length - 1} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40" title="Move right">→</button>
                      <button onClick={() => { if (window.confirm('Delete this testimonial?')) deleteTestimonial(t.id).catch(fail); }} className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ---------- NUMBERS & LINKS ---------- */}
      {tab === 'settings' && (
        <div className="space-y-6">
          <Card title="Numbers shown on the website">
            <p className="text-sm text-gray-600 mb-4">Only real figures, please — anything left at 0 is hidden, and the whole strip hides when everything is 0.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {([['studentsTrained', 'Students trained'], ['placements', 'Placements'], ['batchesCompleted', 'Batches completed'], ['yearsExperience', 'Years of experience'], ['liveProjects', 'Live projects'], ['hiringPartners', 'Hiring partners']] as [keyof SiteStats, string][]).map(([k, label]) => (
                <Input key={k} label={label} type="number" min={0} value={String(stats[k])} onChange={e => setStats({ ...stats, [k]: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
              ))}
            </div>
          </Card>
          <Card title="Social links, WhatsApp and address">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="YouTube channel URL" value={settings.youtubeUrl} onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })} placeholder="https://youtube.com/@sprtechforge" />
              <Input label="Instagram URL" value={settings.instagramUrl} onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })} placeholder="https://www.instagram.com/sprtechforgepvt" />
              <Input label="LinkedIn URL (leave empty to hide)" value={settings.linkedinUrl} onChange={e => setSettings({ ...settings, linkedinUrl: e.target.value })} placeholder="https://www.linkedin.com/company/…" />
              <Input label="X / Twitter URL (leave empty to hide)" value={settings.twitterUrl} onChange={e => setSettings({ ...settings, twitterUrl: e.target.value })} placeholder="https://x.com/…" />
              <Input label="WhatsApp number (with country code, digits only)" value={settings.whatsappNumber} onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="918297276500" />
              <Input label="Google Maps link (optional)" value={settings.mapUrl} onChange={e => setSettings({ ...settings, mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
              <Input label="Address line 1" value={settings.addressLine1} onChange={e => setSettings({ ...settings, addressLine1: e.target.value })} />
              <Input label="Address line 2" value={settings.addressLine2} onChange={e => setSettings({ ...settings, addressLine2: e.target.value })} />
            </div>
            <p className="text-xs text-gray-500 -mt-2 mb-4">Emails (admin@ and hr@) and the two phone numbers are fixed in the site; tell the developer if they change.</p>
            <Button onClick={saveAllSettings} disabled={busy === 'settings'}>{busy === 'settings' ? 'Saving…' : 'Save numbers & links'}</Button>
          </Card>
        </div>
      )}

      {/* ---------- banner editor ---------- */}
      <Modal isOpen={!!bannerEdit} onClose={() => setBannerEdit(null)} title={bannerEdit && banners.some(b => b.id === bannerEdit.id) ? 'Edit banner' : 'New banner'} size="lg">
        {bannerEdit && (
          <div>
            <div className="mb-4">
              {bannerEdit.imageUrl
                ? <img src={bannerEdit.imageUrl} alt="" className="w-full aspect-[12/5] object-cover rounded-xl border border-gray-200" />
                : <div className="w-full aspect-[12/5] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">No image yet — 1920×800 recommended</div>}
              <input ref={bannerFile} type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setBusy('bannerimg'); try { const url = await upload(f, 'banners', 1920); setBannerEdit(b => b ? { ...b, imageUrl: url } : b); } catch (err) { fail(err); } finally { setBusy(null); } }} />
              <Button variant="secondary" className="mt-2" onClick={() => bannerFile.current?.click()} disabled={busy === 'bannerimg'}>{busy === 'bannerimg' ? 'Uploading…' : bannerEdit.imageUrl ? 'Replace image' : 'Upload image'}</Button>
            </div>
            <Input label="Headline" value={bannerEdit.title} onChange={e => setBannerEdit({ ...bannerEdit, title: e.target.value })} placeholder="e.g. New weekend batch starts 5 October" maxLength={90} />
            <TextArea label="Sub-text" rows={2} value={bannerEdit.subtitle} onChange={e => setBannerEdit({ ...bannerEdit, subtitle: e.target.value })} placeholder="One or two lines" maxLength={200} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Button label (optional)" value={bannerEdit.ctaLabel} onChange={e => setBannerEdit({ ...bannerEdit, ctaLabel: e.target.value })} placeholder="Enquire now" />
              <Select label="Button goes to" value={['#contact', '#training', '#services', '#/events', '#placements'].includes(bannerEdit.ctaUrl) ? bannerEdit.ctaUrl : 'custom'} onChange={e => setBannerEdit({ ...bannerEdit, ctaUrl: e.target.value === 'custom' ? (bannerEdit.ctaUrl.startsWith('#') ? 'https://' : bannerEdit.ctaUrl) : e.target.value })}>
                <option value="#contact">Enquiry form</option>
                <option value="#training">Training programs</option>
                <option value="#services">Services</option>
                <option value="#placements">Placements</option>
                <option value="#/events">Events page</option>
                <option value="custom">Custom link…</option>
              </Select>
            </div>
            {!['#contact', '#training', '#services', '#/events', '#placements'].includes(bannerEdit.ctaUrl) && (
              <Input label="Custom link" value={bannerEdit.ctaUrl} onChange={e => setBannerEdit({ ...bannerEdit, ctaUrl: e.target.value })} placeholder="https://…" />
            )}
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-4"><input type="checkbox" className="w-4 h-4" checked={bannerEdit.active} onChange={e => setBannerEdit({ ...bannerEdit, active: e.target.checked })} /> Show on website</label>
            <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
              <Button variant="secondary" onClick={() => setBannerEdit(null)}>Cancel</Button>
              <Button onClick={saveBannerEdit} disabled={busy === 'banner' || busy === 'bannerimg'}>{busy === 'banner' ? 'Saving…' : 'Save banner'}</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
