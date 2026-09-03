import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal, ConfirmationModal, BackButton } from '../../components/Components';
import { CandidateStatus, InterviewSchedule, InterviewStatus } from '../../types';
import * as utils from '../../utils';
import { isMasterUser } from '../../utils';

// ─── Status colours (task colour spec) ───────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending_confirmation: 'bg-amber-100 text-amber-800 border-amber-200',
  Scheduled:            'bg-blue-100  text-blue-800  border-blue-200',
  Attended:             'bg-teal-100  text-teal-800  border-teal-200',
  Completed:            'bg-teal-100  text-teal-800  border-teal-200', // legacy BC
  Cleared:              'bg-green-100 text-green-800 border-green-200',
  Rejected:             'bg-red-100   text-red-800   border-red-200',
  'No-show':            'bg-gray-100  text-gray-700  border-gray-200',
  Rescheduled:          'bg-amber-100 text-amber-800 border-amber-200',
  Cancelled:            'bg-red-100   text-red-800   border-red-200',
};

const STATUS_LABEL: Record<string, string> = {
  pending_confirmation: 'Pending Approval',
  Scheduled:            'Scheduled',
  Attended:             'Attended',
  Completed:            'Attended',
  Cleared:              'Cleared',
  Rejected:             'Rejected',
  'No-show':            'No-show',
  Rescheduled:          'Rescheduled',
  Cancelled:            'Cancelled',
};

// All statuses admins/staff can set
const ADMIN_STATUSES: InterviewStatus[] = [
  'Scheduled', 'Attended', 'No-show', 'Cleared', 'Rejected', 'Rescheduled', 'Cancelled',
];

// Statuses that mean the interview is still upcoming/active
const ACTIVE_STATUSES = new Set(['Scheduled', 'pending_confirmation']);

// ─── Conflict detection ───────────────────────────────────────────────────────
function timeMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function interviewsConflict(a: InterviewSchedule, b: InterviewSchedule): boolean {
  if (a.id === b.id || a.date !== b.date) return false;
  if (['Cancelled', 'Rescheduled'].includes(a.status) || ['Cancelled', 'Rescheduled'].includes(b.status)) return false;
  const startA = timeMins(a.time);
  const endA   = a.endTime ? timeMins(a.endTime) : startA + 60;
  const startB = timeMins(b.time);
  const endB   = b.endTime ? timeMins(b.endTime) : startB + 60;
  return startA < endB && startB < endA;
}

function hasConflict(interview: InterviewSchedule, all: InterviewSchedule[]): boolean {
  return all.some(other => interviewsConflict(interview, other));
}

// ─── Initials avatar ──────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'md' }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const cls = size === 'sm'
    ? 'w-7 h-7 text-xs'
    : 'w-9 h-9 text-sm';
  return (
    <div className={`${cls} rounded-full bg-spr-600 text-white flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    {STATUS_LABEL[status] || status}
  </span>
);

// ─── Conflict badge ───────────────────────────────────────────────────────────
const ConflictBadge: React.FC = () => (
  <span className="text-xs px-2 py-0.5 rounded border font-semibold bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
    Conflict
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
type TabKey = 'Dashboard' | 'Active' | 'ReadyCandidates' | 'History' | 'MySchedule';

export const Interviews: React.FC = () => {
  const {
    candidates, updateCandidate,
    interviews, addInterview, updateInterview, deleteInterview, changeInterviewStatus,
    showToast, user,
  } = useApp();

  const isMaster  = isMasterUser(user);
  const isAdmin   = user?.role === 'admin' || isMaster;
  const isStaff   = user?.role === 'staff';
  const isCandidate = user?.role === 'candidate';
  // Candidates are linked to a candidate record via linkedCandidateId
  const linkedCandidateId = user?.linkedCandidateId;

  // ── tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>('Dashboard');

  // ── dashboard ──────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const [dashDate, setDashDate] = useState<string>(today);
  const [candidateFilter, setCandidateFilter] = useState<string>('');
  const [statsOpen, setStatsOpen] = useState(true);

  // ── schedule form ──────────────────────────────────────────────────────────
  const [scheduleForm, setScheduleForm] = useState<Partial<InterviewSchedule>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── status update ──────────────────────────────────────────────────────────
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [statusUpdateValue, setStatusUpdateValue] = useState<string>('Scheduled');
  const [statusUpdateFeedback, setStatusUpdateFeedback] = useState('');
  const [statusUpdateInterviewer, setStatusUpdateInterviewer] = useState('');
  const [statusUpdateSupport, setStatusUpdateSupport] = useState('');

  // ── self-schedule (candidate) ──────────────────────────────────────────────
  const [selfForm, setSelfForm] = useState<Partial<InterviewSchedule>>({});
  const [selfModalOpen, setSelfModalOpen] = useState(false);

  // ── detail modal ───────────────────────────────────────────────────────────
  const [detailInterview, setDetailInterview] = useState<InterviewSchedule | null>(null);

  // ── confirm / reject pending ───────────────────────────────────────────────
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectId,  setRejectId]  = useState<string | null>(null);

  // ── delete ─────────────────────────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── resume viewer ──────────────────────────────────────────────────────────
  const [viewResume, setViewResume] = useState<{ type: string; data: string; name: string } | null>(null);

  // ── derived sets ──────────────────────────────────────────────────────────
  const activeInterviews = useMemo(() =>
    interviews
      .filter(i => ACTIVE_STATUSES.has(i.status as any))
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()),
    [interviews]
  );

  const pendingInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'pending_confirmation'),
    [interviews]
  );

  const historyInterviews = useMemo(() =>
    interviews
      .filter(i => !ACTIVE_STATUSES.has(i.status as any))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [interviews]
  );

  const myInterviews = useMemo(() => {
    if (!linkedCandidateId) return [];
    return interviews
      .filter(i => i.candidateId === linkedCandidateId)
      .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
  }, [interviews, linkedCandidateId]);

  const readyCandidates = useMemo(() =>
    candidates.filter(c => c.status === CandidateStatus.ReadyForInterview && c.isActive),
    [candidates]
  );

  // ── dashboard: day view ───────────────────────────────────────────────────
  const dayInterviews = useMemo(() => {
    return interviews
      .filter(i => {
        if (i.date !== dashDate) return false;
        if (isCandidate) return i.candidateId === linkedCandidateId;
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [interviews, dashDate, isCandidate, linkedCandidateId]);

  // ── candidate stats ───────────────────────────────────────────────────────
  const filterCandidateInterviews = useMemo(() => {
    if (!candidateFilter) return [];
    return interviews.filter(i => i.candidateId === candidateFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interviews, candidateFilter]);

  const candidateStats = useMemo(() => {
    const list = filterCandidateInterviews;
    return {
      total:    list.length,
      attended: list.filter(i => ['Attended', 'Completed'].includes(i.status)).length,
      cleared:  list.filter(i => i.status === 'Cleared' || i.outcome === 'Selected').length,
      rejected: list.filter(i => i.status === 'Rejected' || i.outcome === 'Rejected').length,
      noShow:   list.filter(i => i.status === 'No-show').length,
      pending:  list.filter(i => ACTIVE_STATUSES.has(i.status as any)).length,
    };
  }, [filterCandidateInterviews]);

  // ── navigation ────────────────────────────────────────────────────────────
  const navigateDay = useCallback((delta: number) => {
    const d = new Date(dashDate);
    d.setDate(d.getDate() + delta);
    setDashDate(d.toISOString().split('T')[0]);
  }, [dashDate]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>, cId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Max file size is 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const c = candidates.find(x => x.id === cId);
      if (c) updateCandidate({ ...c, resume: evt.target?.result as string, resumeName: file.name });
      showToast('Resume uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleViewResume = (c: any) => {
    if (!c.resume) return;
    setViewResume({ type: c.resumeName?.endsWith('.pdf') ? 'pdf' : 'docx', data: c.resume, name: c.resumeName || 'Resume' });
  };

  const handleBookInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.candidateId || !scheduleForm.date || !scheduleForm.companyName) return;

    const now = new Date().toISOString();
    const data: InterviewSchedule = {
      id:               scheduleForm.id || utils.generateId(),
      candidateId:      scheduleForm.candidateId!,
      date:             scheduleForm.date!,
      time:             scheduleForm.time || '10:00',
      endTime:          scheduleForm.endTime,
      companyName:      scheduleForm.companyName!,
      interviewType:    scheduleForm.interviewType || 'Zoom',
      round:            scheduleForm.round || 'L1',
      supportPerson:    scheduleForm.supportPerson,
      interviewerName:  scheduleForm.interviewerName,
      status:           scheduleForm.id ? (scheduleForm.status || 'Scheduled') : 'Scheduled',
      notes:            scheduleForm.notes,
      outcome:          scheduleForm.outcome,
      scheduledBy:      scheduleForm.scheduledBy || user?.id,
      scheduledByRole:  scheduleForm.scheduledByRole || (isAdmin ? 'admin' : 'staff'),
      scheduledAt:      scheduleForm.scheduledAt || now,
      statusHistory:    scheduleForm.statusHistory || [],
    };

    // Conflict check for new interviews
    if (!scheduleForm.id) {
      const others = interviews.filter(i => !['Cancelled', 'Rescheduled'].includes(i.status));
      const conflict = others.some(other => interviewsConflict(data, other));
      if (conflict) {
        showToast('This slot conflicts with an existing interview. Please choose a different time.', 'error');
        return;
      }
    }

    if (scheduleForm.id) { updateInterview(data); showToast('Interview updated'); }
    else                  { addInterview(data);    showToast('Interview scheduled'); }
    setIsModalOpen(false);
    setScheduleForm({});
  };

  const handleSelfSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfForm.date || !selfForm.time || !selfForm.companyName) return;
    if (!linkedCandidateId) { showToast('Your account is not linked to a candidate profile.', 'error'); return; }

    const draft: InterviewSchedule = {
      id:              utils.generateId(),
      candidateId:     linkedCandidateId,
      date:            selfForm.date!,
      time:            selfForm.time!,
      endTime:         selfForm.endTime,
      companyName:     selfForm.companyName!,
      interviewType:   selfForm.interviewType || 'Zoom',
      round:           selfForm.round || 'L1',
      notes:           selfForm.notes,
      status:          'pending_confirmation',
      scheduledBy:     user?.id,
      scheduledByRole: 'candidate',
      scheduledAt:     new Date().toISOString(),
      statusHistory:   [],
    };

    // Conflict check
    const others = interviews.filter(i => !['Cancelled', 'Rescheduled'].includes(i.status));
    if (others.some(other => interviewsConflict(draft, other))) {
      showToast('This slot conflicts with another interview. Please pick a different time.', 'error');
      return;
    }

    addInterview(draft);
    showToast('Interview request submitted — awaiting admin confirmation.', 'info');
    setSelfModalOpen(false);
    setSelfForm({});
  };

  const handleStatusUpdate = () => {
    if (!statusUpdateId || !user) return;
    changeInterviewStatus(statusUpdateId, statusUpdateValue, user.id, user.name, statusUpdateFeedback, {
      interviewerName: statusUpdateInterviewer,
      supportPerson: statusUpdateSupport,
    });
    setStatusUpdateId(null);
    showToast(statusUpdateFeedback.trim() ? 'Status and feedback saved' : 'Status updated');
  };

  const handleConfirmPending = () => {
    if (!confirmId || !user) return;
    changeInterviewStatus(confirmId, 'Scheduled', user.id, user.name);
    showToast('Interview confirmed and scheduled');
    setConfirmId(null);
  };

  const handleRejectPending = () => {
    if (!rejectId || !user) return;
    changeInterviewStatus(rejectId, 'Cancelled', user.id, user.name);
    showToast('Interview request rejected');
    setRejectId(null);
  };

  // ── interview card (shared) ────────────────────────────────────────────────
  const renderInterviewCard = (i: InterviewSchedule, opts: { showDate?: boolean; compact?: boolean } = {}) => {
    const c     = candidates.find(x => x.id === i.candidateId);
    const isToday = i.date === today;
    const isPast  = i.date < today && ACTIVE_STATUSES.has(i.status as any);
    const conflict = hasConflict(i, interviews);
    const isPending = i.status === 'pending_confirmation';

    return (
      <div
        key={i.id}
        className={`flex flex-col md:flex-row justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
          isPending ? 'bg-amber-50 border-amber-200' :
          isToday   ? 'bg-purple-50 border-purple-200' :
          isPast    ? 'bg-red-50 border-red-100' :
          'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
        }`}
        onClick={() => setDetailInterview(i)}
      >
        {/* Left: avatar + info */}
        <div className="flex gap-3 flex-1 min-w-0">
          <Avatar name={c?.name || '?'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-bold text-gray-900">{i.time}</span>
              {i.endTime && <span className="text-gray-400 text-xs">→ {i.endTime}</span>}
              <span className="text-gray-400">·</span>
              <span className="font-semibold text-gray-800">{c?.name || 'Unknown'}</span>
              <span className="text-xs text-gray-400 font-mono">({c?.batchId})</span>
              {isToday  && <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded uppercase">Today</span>}
              {isPast   && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded uppercase">Overdue</span>}
            </div>
            <p className="text-sm text-indigo-700 font-medium">
              {i.companyName} · <span className="text-gray-600">{i.round}</span> · {i.interviewType}
            </p>
            {i.interviewerName && <p className="text-xs text-gray-500 mt-0.5">Interviewer: {i.interviewerName}</p>}
            {i.supportPerson   && <p className="text-xs text-amber-700 mt-0.5">Support: {i.supportPerson}</p>}
            {i.notes           && <p className="text-xs text-gray-400 mt-0.5 italic truncate">{i.notes}</p>}
            {i.feedback        && <p className="text-xs text-emerald-700 mt-0.5 truncate" title={i.feedback}>&#128172; Feedback: {i.feedback}</p>}
            {opts.showDate && (
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(i.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {i.scheduledByRole === 'candidate' && (
              <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                Self-scheduled
              </span>
            )}
          </div>
        </div>

        {/* Right: badges + actions */}
        <div className="flex flex-col items-end gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <StatusBadge status={i.status} />
            {conflict && <ConflictBadge />}
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {/* Pending approval actions for admin */}
            {isPending && (isAdmin || isStaff) && (
              <>
                <button
                  onClick={() => setConfirmId(i.id)}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium transition-colors"
                >Confirm</button>
                <button
                  onClick={() => setRejectId(i.id)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium transition-colors"
                >Reject</button>
              </>
            )}
            {/* Regular status update */}
            {!isPending && (isAdmin || isStaff) && (
              <button
                onClick={() => {
                  setStatusUpdateId(i.id);
                  setStatusUpdateValue(i.status);
                  setStatusUpdateFeedback(i.feedback || '');
                  setStatusUpdateInterviewer(i.interviewerName || '');
                  setStatusUpdateSupport(i.supportPerson || '');
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg font-medium transition-colors"
              >Update</button>
            )}
            {/* Edit / Delete - admin only */}
            {isAdmin && (
              <>
                <button
                  onClick={() => { setScheduleForm(i); setIsModalOpen(true); }}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium transition-colors"
                >Edit</button>
                <button
                  onClick={() => setDeleteId(i.id)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium transition-colors"
                >Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── stat card helper ───────────────────────────────────────────────────────
  const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className={`rounded-xl p-3 text-center border ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-0.5 opacity-80">{label}</div>
    </div>
  );

  // ── formatted date header ──────────────────────────────────────────────────
  const dashDateLabel = useMemo(() => {
    if (dashDate === today) return 'Today';
    return new Date(dashDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }, [dashDate, today]);

  // ── tabs config ───────────────────────────────────────────────────────────
  const tabs = [
    { key: 'Dashboard',       label: 'Dashboard',         count: null,                     show: true },
    { key: 'Active',          label: 'Active Schedule',   count: activeInterviews.length,  show: !isCandidate },
    { key: 'ReadyCandidates', label: 'Ready Candidates',  count: readyCandidates.length,   show: isAdmin || isStaff },
    { key: 'History',         label: 'History',           count: historyInterviews.length, show: !isCandidate },
    { key: 'MySchedule',      label: 'My Schedule',       count: myInterviews.length,      show: isCandidate },
  ].filter(t => t.show);

  // ── pending badge count for Dashboard tab ────────────────────────────────
  const pendingCount = pendingInterviews.length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interviews &amp; Placements</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeInterviews.filter(i => i.status === 'Scheduled').length} scheduled
              {pendingCount > 0 && ` · ${pendingCount} pending approval`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isCandidate && (
            <Button onClick={() => setSelfModalOpen(true)} variant="outline">
              Request Interview Slot
            </Button>
          )}
          {(isAdmin || isStaff) && (
            <Button onClick={() => { setScheduleForm({}); setIsModalOpen(true); }}>
              + Schedule Interview
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`pb-2.5 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-b-2 border-spr-600 text-spr-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-spr-100 text-spr-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: DASHBOARD
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Dashboard' && (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Left: date navigator + day view ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Pending approval banner (admin/staff) */}
            {(isAdmin || isStaff) && pendingCount > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  {pendingCount} interview request{pendingCount > 1 ? 's' : ''} awaiting your confirmation
                </p>
                <button
                  onClick={() => setActiveTab('Active')}
                  className="ml-auto text-xs font-semibold text-amber-700 underline"
                >
                  View
                </button>
              </div>
            )}

            {/* Date navigator */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigateDay(-1)}
                className="flex items-center gap-1 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <button
                onClick={() => setDashDate(today)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors border ${
                  dashDate === today
                    ? 'bg-spr-600 text-white border-spr-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => navigateDay(1)}
                className="flex items-center gap-1 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <input
                type="date"
                value={dashDate}
                onChange={e => setDashDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-spr-accent"
              />
              {/* Mobile toggle for stats panel */}
              <button
                onClick={() => setStatsOpen(v => !v)}
                className="xl:hidden ml-auto text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                {statsOpen ? 'Hide Stats' : 'Candidate Stats'}
              </button>
            </div>

            {/* Day view header */}
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-bold text-gray-900">{dashDateLabel}</h2>
              <span className="text-sm text-gray-400">
                {dayInterviews.length > 0
                  ? `${dayInterviews.length} interview${dayInterviews.length > 1 ? 's' : ''}`
                  : 'No interviews'}
              </span>
            </div>

            {/* Day interview cards */}
            <div className="space-y-3">
              {dayInterviews.length > 0 ? (
                dayInterviews.map(i => renderInterviewCard(i))
              ) : (
                <Card>
                  <div className="text-center py-14 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium text-gray-500">No interviews on this day</p>
                    <p className="text-xs mt-1">Use the navigator above to browse other dates</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* ── Right: candidate stats panel ── */}
          {(isAdmin || isStaff) && (
            <div className={`w-full xl:w-80 shrink-0 ${statsOpen ? 'block' : 'hidden xl:block'}`}>
              <Card title="Candidate Stats">
                <div className="space-y-4">
                  {/* Candidate search */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Filter by Candidate</label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
                      value={candidateFilter}
                      onChange={e => setCandidateFilter(e.target.value)}
                    >
                      <option value="">— Select a candidate —</option>
                      {candidates
                        .filter(c => interviews.some(i => i.candidateId === c.id))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.batchId})</option>
                        ))}
                    </select>
                  </div>

                  {candidateFilter ? (
                    <>
                      {/* Stat cards grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <StatCard label="Total"    value={candidateStats.total}    color="bg-gray-50 border-gray-200 text-gray-700" />
                        <StatCard label="Attended" value={candidateStats.attended} color="bg-teal-50 border-teal-200 text-teal-700" />
                        <StatCard label="Cleared"  value={candidateStats.cleared}  color="bg-green-50 border-green-200 text-green-700" />
                        <StatCard label="Rejected" value={candidateStats.rejected} color="bg-red-50 border-red-200 text-red-700" />
                        <StatCard label="No-show"  value={candidateStats.noShow}   color="bg-gray-50 border-gray-300 text-gray-600" />
                        <StatCard label="Pending"  value={candidateStats.pending}  color="bg-blue-50 border-blue-200 text-blue-700" />
                      </div>

                      {/* Detail table */}
                      {filterCandidateInterviews.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="pb-1.5 font-semibold text-gray-500">Date</th>
                                <th className="pb-1.5 font-semibold text-gray-500">Company</th>
                                <th className="pb-1.5 font-semibold text-gray-500">Round</th>
                                <th className="pb-1.5 font-semibold text-gray-500">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {filterCandidateInterviews.map(i => (
                                <tr key={i.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailInterview(i)}>
                                  <td className="py-1.5 text-gray-600">
                                    {new Date(i.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-1.5 text-gray-800 font-medium max-w-[80px] truncate">{i.companyName}</td>
                                  <td className="py-1.5 text-gray-600">{i.round}</td>
                                  <td className="py-1.5">
                                    <StatusBadge status={i.status} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No interviews found</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">Select a candidate to see their interview history and stats</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: ACTIVE SCHEDULE (admin / staff)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Active' && (
        <div className="space-y-4">
          {/* Pending approval section */}
          {pendingInterviews.length > 0 && (
            <Card title={`Pending Approval (${pendingInterviews.length})`} className="border-amber-200">
              <div className="space-y-2">
                {pendingInterviews.map(i => renderInterviewCard(i, { showDate: true }))}
              </div>
            </Card>
          )}

          {/* Confirmed scheduled */}
          {activeInterviews.filter(i => i.status === 'Scheduled').length > 0 ? (
            Object.entries(
              activeInterviews
                .filter(i => i.status === 'Scheduled')
                .reduce((acc, i) => {
                  (acc[i.date] = acc[i.date] || []).push(i);
                  return acc;
                }, {} as Record<string, InterviewSchedule[]>)
            ).sort().map(([date, items]) => (
              <Card
                key={date}
                title={`${new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}${date === today ? ' · TODAY' : ''}`}
              >
                <div className="space-y-2">
                  {(items as InterviewSchedule[]).map(i => renderInterviewCard(i))}
                </div>
              </Card>
            ))
          ) : (
            pendingInterviews.length === 0 && (
              <Card>
                <div className="text-center py-16 text-gray-400">
                  <svg className="w-14 h-14 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-gray-500">No active interviews scheduled</p>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: READY CANDIDATES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ReadyCandidates' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Candidate</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Batch</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Resume</th>
                  <th className="py-3 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {readyCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono text-xs font-bold border border-blue-100">{c.batchId}</span>
                    </td>
                    <td className="py-3 px-4">
                      {c.resume ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 truncate max-w-[140px]">{c.resumeName}</span>
                          <button onClick={() => handleViewResume(c)} className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline">View</button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No resume</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <label className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Upload Resume
                          <input type="file" className="hidden" accept=".pdf,.docx" onChange={e => handleResumeUpload(e, c.id)} />
                        </label>
                        <button
                          onClick={() => { setScheduleForm({ candidateId: c.id }); setIsModalOpen(true); }}
                          className="text-xs bg-spr-600 hover:bg-spr-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Book Interview
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {readyCandidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      <p className="font-medium">No candidates marked as 'Ready for Interview'</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: HISTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'History' && (
        <div className="space-y-2">
          {historyInterviews.length > 0 ? (
            historyInterviews.map(i => renderInterviewCard(i, { showDate: true }))
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-400">
                <p className="font-medium">No interview history yet</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: MY SCHEDULE (candidate self-scheduling)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'MySchedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {linkedCandidateId
                ? 'Your upcoming and past interviews. Use the button above to request a new slot.'
                : 'Your account is not linked to a candidate profile. Contact admin.'}
            </p>
          </div>
          {myInterviews.length > 0 ? (
            myInterviews.map(i => renderInterviewCard(i, { showDate: true }))
          ) : (
            <Card>
              <div className="text-center py-14 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-medium text-gray-500">No interviews yet</p>
                <p className="text-xs mt-1">Click "Request Interview Slot" to submit a request</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Admin Schedule / Edit Interview
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setScheduleForm({}); }}
        title={scheduleForm.id ? 'Edit Interview' : 'Schedule Interview'}
        size="lg"
      >
        <form onSubmit={handleBookInterview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate <span className="text-red-500">*</span></label>
            <select
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
              value={scheduleForm.candidateId || ''}
              onChange={e => setScheduleForm({ ...scheduleForm, candidateId: e.target.value })}
              required
            >
              <option value="">Select Candidate</option>
              {candidates.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.batchId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Date *" value={scheduleForm.date || ''} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <Input type="time" label="Start Time *" value={scheduleForm.time || ''} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} required />
              <Input type="time" label="End Time" value={scheduleForm.endTime || ''} onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} />
            </div>
          </div>

          <Input
            label="Company Name *"
            value={scheduleForm.companyName || ''}
            onChange={e => setScheduleForm({ ...scheduleForm, companyName: e.target.value })}
            required
            placeholder="e.g. Google, TCS"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
                value={scheduleForm.interviewType || 'Zoom'}
                onChange={e => setScheduleForm({ ...scheduleForm, interviewType: e.target.value as any })}
              >
                <option>Zoom</option><option>Teams</option><option>F2F</option><option>Telephonic</option>
              </select>
            </div>
            <Input
              label="Round"
              value={scheduleForm.round || ''}
              onChange={e => setScheduleForm({ ...scheduleForm, round: e.target.value })}
              placeholder="e.g. L1, HR"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Interviewer Name"
              value={scheduleForm.interviewerName || ''}
              onChange={e => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
              placeholder="Who will conduct it"
            />
            <Input
              label="Support Person"
              value={scheduleForm.supportPerson || ''}
              onChange={e => setScheduleForm({ ...scheduleForm, supportPerson: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none"
              rows={2}
              value={scheduleForm.notes || ''}
              onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setScheduleForm({}); }}>Cancel</Button>
            <Button type="submit">{scheduleForm.id ? 'Update Interview' : 'Schedule Interview'}</Button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Candidate Self-Schedule Request
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={selfModalOpen}
        onClose={() => { setSelfModalOpen(false); setSelfForm({}); }}
        title="Request Interview Slot"
        size="md"
      >
        <form onSubmit={handleSelfSchedule} className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-800">
            Your request will be submitted for admin confirmation before it is added to the shared calendar.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Preferred Date *" value={selfForm.date || ''} onChange={e => setSelfForm({ ...selfForm, date: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <Input type="time" label="Start *" value={selfForm.time || ''} onChange={e => setSelfForm({ ...selfForm, time: e.target.value })} required />
              <Input type="time" label="End" value={selfForm.endTime || ''} onChange={e => setSelfForm({ ...selfForm, endTime: e.target.value })} />
            </div>
          </div>

          <Input
            label="Company Name *"
            value={selfForm.companyName || ''}
            onChange={e => setSelfForm({ ...selfForm, companyName: e.target.value })}
            required
            placeholder="e.g. Infosys, Wipro"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
                value={selfForm.interviewType || 'Zoom'}
                onChange={e => setSelfForm({ ...selfForm, interviewType: e.target.value as any })}
              >
                <option>Zoom</option><option>Teams</option><option>F2F</option><option>Telephonic</option>
              </select>
            </div>
            <Input
              label="Round"
              value={selfForm.round || ''}
              onChange={e => setSelfForm({ ...selfForm, round: e.target.value })}
              placeholder="e.g. L1, HR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none"
              rows={2}
              value={selfForm.notes || ''}
              onChange={e => setSelfForm({ ...selfForm, notes: e.target.value })}
              placeholder="Any additional details for the admin..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setSelfModalOpen(false); setSelfForm({}); }}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Status Update (admin / staff)
      ════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={!!statusUpdateId} onClose={() => setStatusUpdateId(null)} title="Update Interview Result & Feedback" size="lg">
        <div className="space-y-4">
          {/* Status lifecycle guide */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
            Flow: <span className="font-medium">Scheduled</span> → <span className="font-medium">Attended</span> / <span className="font-medium">No-show</span> → <span className="font-medium">Cleared</span> / <span className="font-medium">Rejected</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
              value={statusUpdateValue}
              onChange={e => setStatusUpdateValue(e.target.value)}
            >
              {ADMIN_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
              <input
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none"
                value={statusUpdateInterviewer}
                onChange={e => setStatusUpdateInterviewer(e.target.value)}
                placeholder="Who actually took the interview"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Person</label>
              <input
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none"
                value={statusUpdateSupport}
                onChange={e => setStatusUpdateSupport(e.target.value)}
                placeholder="Who supported the candidate"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback for the candidate <span className="text-gray-400 font-normal">(saved to their record; the candidate sees it on their schedule)</span>
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none"
              value={statusUpdateFeedback}
              onChange={e => setStatusUpdateFeedback(e.target.value)}
              placeholder="What went well, what to improve — e.g. Good SQL basics and communication; struggled to explain test scenarios for the login flow. Practice writing test cases aloud and revise Selenium waits before the next round."
            />
            {['Cleared', 'Rejected', 'No-show', 'Attended'].includes(statusUpdateValue) && !statusUpdateFeedback.trim() && (
              <p className="text-xs text-amber-600 mt-1">Tip: add feedback while it's fresh — it becomes the candidate's improvement record.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStatusUpdateId(null)}>Cancel</Button>
            <Button onClick={handleStatusUpdate}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Interview Detail
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!detailInterview}
        onClose={() => setDetailInterview(null)}
        title="Interview Detail"
        size="lg"
      >
        {detailInterview && (() => {
          const c = candidates.find(x => x.id === detailInterview.candidateId);
          return (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <Avatar name={c?.name || '?'} />
                <div>
                  <p className="font-bold text-gray-900 text-lg">{c?.name || 'Unknown Candidate'}</p>
                  <p className="text-sm text-gray-500">{c?.batchId} · {c?.email}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={detailInterview.status} />
                </div>
              </div>

              {/* Core info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Date &amp; Time</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(detailInterview.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-gray-600">{detailInterview.time}{detailInterview.endTime && ` → ${detailInterview.endTime}`}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Company &amp; Round</p>
                  <p className="font-semibold text-gray-800">{detailInterview.companyName}</p>
                  <p className="text-gray-600">{detailInterview.round} · {detailInterview.interviewType}</p>
                </div>
                {detailInterview.interviewerName && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Interviewer</p>
                    <p className="font-semibold text-gray-800">{detailInterview.interviewerName}</p>
                  </div>
                )}
                {detailInterview.supportPerson && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Support Person</p>
                    <p className="font-semibold text-gray-800">{detailInterview.supportPerson}</p>
                  </div>
                )}
              </div>

              {detailInterview.notes && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-gray-700">{detailInterview.notes}</p>
                </div>
              )}

              {detailInterview.feedback && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm">
                  <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-1">Feedback for Candidate</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{detailInterview.feedback}</p>
                  {detailInterview.feedbackByName && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      — {detailInterview.feedbackByName}
                      {detailInterview.feedbackAt && `, ${new Date(detailInterview.feedbackAt).toLocaleString()}`}
                    </p>
                  )}
                </div>
              )}

              {/* Scheduled by */}
              <div className="text-xs text-gray-400">
                Scheduled by: <span className="font-medium text-gray-600 capitalize">{detailInterview.scheduledByRole || 'admin'}</span>
                {detailInterview.scheduledAt && ` on ${new Date(detailInterview.scheduledAt).toLocaleDateString()}`}
              </div>

              {/* Status history */}
              {detailInterview.statusHistory && detailInterview.statusHistory.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status History</p>
                  <div className="space-y-1.5">
                    {detailInterview.statusHistory.map((h, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <StatusBadge status={h.status} />
                          <span className="text-gray-400">←</span>
                          <span className="text-gray-400">{h.previousStatus}</span>
                          <span className="text-gray-300">·</span>
                          <span>{h.changedByName}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-400">{new Date(h.changedAt).toLocaleString()}</span>
                        </div>
                        {h.feedback && (
                          <p className="text-xs text-emerald-700 mt-0.5 ml-1 pl-2 border-l-2 border-emerald-200 whitespace-pre-wrap">{h.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflict warning */}
              {hasConflict(detailInterview, interviews) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-orange-800">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  This interview slot overlaps with another interview on the same day.
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Confirm Pending
      ════════════════════════════════════════════════════════════════════ */}
      <ConfirmationModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleConfirmPending}
        title="Confirm Interview Request"
        message="Confirm this candidate-scheduled interview? It will be moved to Scheduled status and appear on the shared calendar."
      />

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Reject Pending
      ════════════════════════════════════════════════════════════════════ */}
      <ConfirmationModal
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        onConfirm={handleRejectPending}
        title="Reject Interview Request"
        message="Reject this interview request? It will be marked as Cancelled and the candidate will be notified."
      />

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Delete Confirmation
      ════════════════════════════════════════════════════════════════════ */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteInterview(deleteId); setDeleteId(null); showToast('Interview deleted'); } }}
        title="Delete Interview"
        message="Are you sure you want to delete this interview? This action cannot be undone."
      />

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: Resume Viewer
      ════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={!!viewResume} onClose={() => setViewResume(null)} title={`Resume: ${viewResume?.name}`} size="xl">
        <div className="h-[80vh] flex flex-col">
          <div className="flex justify-end mb-2">
            <a href={viewResume?.data} download={viewResume?.name} className="text-blue-600 font-bold hover:underline text-sm">Download</a>
          </div>
          <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden">
            {viewResume?.type === 'pdf' ? (
              <object data={viewResume.data} type="application/pdf" className="w-full h-full">
                <p className="p-4 text-gray-500">Preview not supported. Please download.</p>
              </object>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Preview only available for PDF. Please download to view.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
