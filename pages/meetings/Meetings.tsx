import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Card, Input, Modal, Select, SearchInput } from '../../components/Components';
import { Meeting, MeetingParticipant, MeetingType, RsvpStatus, User } from '../../types';
import { isMasterUser } from '../../utils';

const meetingRoomId = (meetingId: string) => `sprtechforge-meet-${meetingId}`;

const RSVP_LABEL: Record<RsvpStatus, string> = {
  pending: 'Pending',
  accepted: 'Going',
  declined: 'Declined',
  tentative: 'Maybe',
};

const RSVP_COLOR: Record<RsvpStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  tentative: 'bg-amber-100 text-amber-700',
};

const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  meeting: 'Meeting',
  class: 'Class',
  other: 'Other',
};

const MEETING_TYPE_COLOR: Record<MeetingType, string> = {
  meeting: 'bg-blue-100 text-blue-700',
  class: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-700',
};

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
const fmtDateShort = (iso: string) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
const isoToLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const localInputToIso = (s: string) => new Date(s).toISOString();

const groupForMeeting = (iso: string): 'past' | 'today' | 'tomorrow' | 'this-week' | 'later' => {
  const t = new Date(iso).getTime();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTomorrow = startOfToday + 24 * 60 * 60 * 1000;
  const startOfDayAfter = startOfTomorrow + 24 * 60 * 60 * 1000;
  const startOfNextWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;
  if (t < startOfToday) return 'past';
  if (t < startOfTomorrow) return 'today';
  if (t < startOfDayAfter) return 'tomorrow';
  if (t < startOfNextWeek) return 'this-week';
  return 'later';
};

const GROUP_LABEL: Record<string, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This week',
  later: 'Later',
  past: 'Past',
};

export const NewOrEditMeetingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initial?: Meeting | null;
  defaultParticipantIds?: string[];
}> = ({ isOpen, onClose, initial, defaultParticipantIds }) => {
  const { users, user, createMeeting, updateMeeting, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('meeting');
  const [description, setDescription] = useState('');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userQ, setUserQ] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setTitle(initial.title);
      setType(initial.meetingType);
      setDescription(initial.description || '');
      setStartInput(isoToLocalInput(initial.startTime));
      setEndInput(isoToLocalInput(initial.endTime));
      setLocation(initial.location || '');
      setSelectedIds(initial.participants.map(p => p.userId));
    } else {
      setTitle('');
      setType('meeting');
      setDescription('');
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 30));
      const start = new Date(now);
      const end = new Date(now);
      end.setMinutes(end.getMinutes() + 30);
      setStartInput(isoToLocalInput(start.toISOString()));
      setEndInput(isoToLocalInput(end.toISOString()));
      setLocation('');
      setSelectedIds(defaultParticipantIds || []);
    }
    setUserQ('');
  }, [isOpen, initial, defaultParticipantIds]);

  if (!user) return null;

  const candidateUsers = useMemo(() => {
    const lower = userQ.trim().toLowerCase();
    return users
      .filter(u => u.id !== user.id)
      .filter(u => !lower || u.name.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, user.id, userQ]);

  const handleSave = async () => {
    if (!title.trim()) { showToast('Title required', 'error'); return; }
    if (!startInput || !endInput) { showToast('Start and end time required', 'error'); return; }
    const startIso = localInputToIso(startInput);
    const endIso = localInputToIso(endInput);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      showToast('End time must be after start time', 'error');
      return;
    }

    setSaving(true);
    try {
      const participants: MeetingParticipant[] = selectedIds.map(id => {
        const existing = initial?.participants.find(p => p.userId === id);
        return existing || { userId: id, rsvp: 'pending' };
      });
      if (initial) {
        await updateMeeting({
          ...initial,
          title: title.trim(),
          meetingType: type,
          description: description.trim() || undefined,
          startTime: startIso,
          endTime: endIso,
          location: location.trim() || undefined,
          participants,
        });
        showToast('Meeting updated', 'success');
      } else {
        await createMeeting({
          title: title.trim(),
          meetingType: type,
          description: description.trim() || undefined,
          startTime: startIso,
          endTime: endIso,
          location: location.trim() || undefined,
          participants,
        });
        showToast('Meeting scheduled', 'success');
      }
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => {
    if (selectedIds.length >= candidateUsers.length) setSelectedIds([]);
    else setSelectedIds(candidateUsers.map(u => u.id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit meeting' : 'Schedule a meeting'} size="lg">
      <div className="space-y-3">
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Weekly trainer sync" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={type} onChange={e => setType(e.target.value as MeetingType)}>
            <option value="meeting">Meeting</option>
            <option value="class">Class</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Location (optional)" value={location} onChange={e => setLocation(e.target.value)} placeholder="Room / link" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
            <input type="datetime-local" value={startInput} onChange={e => setStartInput(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
            <input type="datetime-local" value={endInput} onChange={e => setEndInput(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Agenda, notes..." />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">Participants ({selectedIds.length})</label>
            <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline">
              {selectedIds.length >= candidateUsers.length ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <SearchInput value={userQ} onChange={e => setUserQ(e.target.value)} onClear={() => setUserQ('')} placeholder="Search users..." />
          <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {candidateUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">No users found</p>
            ) : candidateUsers.map(u => (
              <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggle(u.id)} className="rounded" />
                <span className="text-sm text-slate-800">{u.name}</span>
                <span className="text-[10px] text-slate-500 ml-auto">{u.role}</span>
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">You're auto-included as the organizer.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (initial ? 'Save changes' : 'Schedule')}</Button>
        </div>
      </div>
    </Modal>
  );
};

const DetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onEdit: () => void;
}> = ({ isOpen, onClose, meeting, onEdit }) => {
  const navigate = useNavigate();
  const { user, users, setRsvp, cancelMeeting, showToast } = useApp();
  if (!meeting || !user) return null;

  const isOrganizer = meeting.organizerId === user.id;
  const isMaster = isMasterUser(user);
  const canEdit = (isOrganizer || isMaster) && meeting.status === 'scheduled';
  const myRsvp = meeting.participants.find(p => p.userId === user.id)?.rsvp || 'pending';

  const rsvp = async (s: RsvpStatus) => {
    try {
      await setRsvp(meeting.id, s);
      showToast(`Marked as ${RSVP_LABEL[s]}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const doCancel = async () => {
    if (!confirm('Cancel this meeting? Participants will see it as cancelled.')) return;
    try {
      await cancelMeeting(meeting.id);
      showToast('Meeting cancelled', 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const userById = (id: string) => users.find(u => u.id === id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meeting.title} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${MEETING_TYPE_COLOR[meeting.meetingType]}`}>{MEETING_TYPE_LABEL[meeting.meetingType]}</span>
          {meeting.status === 'cancelled' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">Cancelled</span>}
          {meeting.status === 'completed' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">Completed</span>}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <div>
              <div className="text-slate-800">{fmtDate(meeting.startTime)}</div>
              <div className="text-slate-600">{fmtTime(meeting.startTime)} – {fmtTime(meeting.endTime)}</div>
            </div>
          </div>
          {meeting.location && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-slate-700">{meeting.location}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-slate-700">Organized by {meeting.organizerName}</span>
          </div>
        </div>

        {meeting.description && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">{meeting.description}</div>
        )}

        {meeting.status === 'scheduled' && (
          <button
            onClick={() => {
              const url = `/call/${encodeURIComponent(meetingRoomId(meeting.id))}?title=${encodeURIComponent(meeting.title)}&returnTo=${encodeURIComponent('/meetings')}`;
              onClose();
              navigate(url);
            }}
            className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Join video call
          </button>
        )}

        {meeting.status === 'scheduled' && (
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Your response</h4>
            <div className="flex gap-2">
              {(['accepted', 'tentative', 'declined'] as RsvpStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => rsvp(s)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    myRsvp === s
                      ? s === 'accepted' ? 'bg-green-600 text-white border-green-600'
                        : s === 'declined' ? 'bg-red-600 text-white border-red-600'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {RSVP_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Participants ({meeting.participants.length})</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {meeting.participants.length === 0 ? (
              <p className="text-xs text-slate-500">No participants</p>
            ) : meeting.participants.map(p => {
              const u = userById(p.userId);
              return (
                <div key={p.userId} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {(u?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-800 truncate">{u?.name || 'Unknown'}</span>
                    {p.userId === meeting.organizerId && <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0">Host</span>}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${RSVP_COLOR[p.rsvp]}`}>{RSVP_LABEL[p.rsvp]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <div>
            {canEdit && (
              <Button variant="danger" onClick={doCancel}>Cancel meeting</Button>
            )}
          </div>
          <div className="flex gap-2">
            {canEdit && <Button variant="secondary" onClick={onEdit}>Edit</Button>}
            <Button variant="primary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const MeetingCard: React.FC<{ meeting: Meeting; onOpen: () => void; currentUserId: string }> = ({ meeting, onOpen, currentUserId }) => {
  const navigate = useNavigate();
  const myRsvp = meeting.participants.find(p => p.userId === currentUserId)?.rsvp || 'pending';
  const isPast = new Date(meeting.endTime).getTime() < Date.now();
  const goingCount = meeting.participants.filter(p => p.rsvp === 'accepted').length;
  const canJoinCall = !isPast && meeting.status === 'scheduled';

  const handleJoinCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `/call/${encodeURIComponent(meetingRoomId(meeting.id))}?title=${encodeURIComponent(meeting.title)}&returnTo=${encodeURIComponent('/meetings')}`;
    navigate(url);
  };

  return (
    <div
      onClick={onOpen}
      className={`w-full text-left bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer ${meeting.status === 'cancelled' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-center shrink-0 bg-slate-50 rounded-lg px-2 py-1 w-14">
          <div className="text-[10px] uppercase font-bold text-slate-500">{fmtDateShort(meeting.startTime).split(' ')[0]}</div>
          <div className="text-lg font-bold text-slate-800 leading-tight">{new Date(meeting.startTime).getDate()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-slate-900 truncate ${meeting.status === 'cancelled' ? 'line-through' : ''}`}>{meeting.title}</h3>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${MEETING_TYPE_COLOR[meeting.meetingType]}`}>{MEETING_TYPE_LABEL[meeting.meetingType]}</span>
            {meeting.status === 'cancelled' && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">Cancelled</span>}
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            {fmtTime(meeting.startTime)} – {fmtTime(meeting.endTime)} · {meeting.organizerName}
            {meeting.location && <> · {meeting.location}</>}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-slate-500">{goingCount} of {meeting.participants.length} going</span>
            {!isPast && meeting.status === 'scheduled' && (
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${RSVP_COLOR[myRsvp]}`}>You: {RSVP_LABEL[myRsvp]}</span>
            )}
          </div>
        </div>
        {canJoinCall && (
          <button
            onClick={handleJoinCall}
            title="Join the video call"
            className="shrink-0 self-center px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Join
          </button>
        )}
      </div>
    </div>
  );
};

type Tab = 'upcoming' | 'mine' | 'past';

export const MeetingsPage: React.FC = () => {
  const { user, meetings } = useApp();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [showNew, setShowNew] = useState(false);

  if (!user) return null;

  const visible = useMemo(() => {
    const now = Date.now();
    let list = meetings;
    if (tab === 'upcoming') {
      list = list.filter(m => new Date(m.endTime).getTime() >= now && m.status === 'scheduled');
      list = list.filter(m => m.organizerId === user.id || m.participants.some(p => p.userId === user.id));
    } else if (tab === 'mine') {
      list = list.filter(m => m.organizerId === user.id);
    } else if (tab === 'past') {
      list = list.filter(m => new Date(m.endTime).getTime() < now || m.status !== 'scheduled');
      list = list.filter(m => m.organizerId === user.id || m.participants.some(p => p.userId === user.id));
    }
    return [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [meetings, tab, user.id]);

  const groups = useMemo(() => {
    const out: Record<string, Meeting[]> = {};
    for (const m of visible) {
      const g = groupForMeeting(m.startTime);
      out[g] = out[g] || [];
      out[g].push(m);
    }
    return out;
  }, [visible]);

  const groupOrder = tab === 'past'
    ? ['past']
    : ['today', 'tomorrow', 'this-week', 'later'];

  const selected = selectedId ? meetings.find(m => m.id === selectedId) || null : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings &amp; Classes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedule sessions, track RSVPs, manage your calendar.</p>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}>+ New meeting</Button>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(['upcoming', 'mine', 'past'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t === 'upcoming' ? 'Upcoming' : t === 'mine' ? 'Organized by me' : 'Past'}
          </button>
        ))}
      </div>

      <Card className="p-3">
        {visible.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="font-medium">No {tab === 'past' ? 'past' : tab === 'mine' ? 'meetings organized by you' : 'upcoming meetings'}</p>
            <p className="text-xs mt-1">Click "+ New meeting" to schedule one.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupOrder.filter(g => (groups[g] || []).length > 0).map(g => (
              <div key={g}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">{GROUP_LABEL[g]}</h2>
                <div className="space-y-2">
                  {groups[g].map(m => (
                    <MeetingCard key={m.id} meeting={m} currentUserId={user.id} onOpen={() => setSelectedId(m.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <DetailModal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        meeting={selected}
        onEdit={() => { setEditing(selected); setSelectedId(null); }}
      />
      <NewOrEditMeetingModal isOpen={showNew} onClose={() => setShowNew(false)} />
      <NewOrEditMeetingModal isOpen={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </div>
  );
};
