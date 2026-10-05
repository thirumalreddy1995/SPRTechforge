// "Feedback" tab of the event control room: live view of the post-event survey
// answers (events_feedback) with counts, reasons, course interest and CSV export.

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import * as utils from '../../utils';
import { EventFeedback, SprEvent } from '../types';
import { deleteFeedback, subscribeFeedback } from '../services/eventsDb';
import { formatISTDateTime } from '../lib/datetime';
import { FEEDBACK_REASON_LABELS, followupLinkUrl } from '../lib/invites';
import { CopyButton } from '../components/shared';

type Filter = 'all' | 'joined' | 'missed' | 'interested' | 'next';

const INTEREST: Record<string, string> = { yes: 'Yes, tell me more', maybe: 'Maybe, send details', no: 'Not now' };
const NEXT: Record<string, string> = { yes: 'Yes', maybe: 'Maybe', no: 'No' };

export const EventFeedbackPanel: React.FC<{ ev: SprEvent }> = ({ ev }) => {
  const { user, showToast } = useApp();
  const [rows, setRows] = useState<EventFeedback[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  useEffect(() => subscribeFeedback(ev.id, items => { setRows(items); setLoaded(true); }, () => setLoaded(true)), [ev.id]);

  const stats = useMemo(() => {
    const joined = rows.filter(r => r.joined);
    const missed = rows.filter(r => !r.joined);
    const rated = joined.filter(r => r.rating > 0);
    const reasons: Record<string, number> = {};
    missed.forEach(r => { const k = r.reason || 'other'; reasons[k] = (reasons[k] || 0) + 1; });
    const liked: Record<string, number> = {};
    joined.forEach(r => (r.liked || []).forEach(l => { liked[l] = (liked[l] || 0) + 1; }));
    return {
      total: rows.length, joined: joined.length, missed: missed.length,
      avgRating: rated.length ? Math.round(rated.reduce((a, r) => a + r.rating, 0) / rated.length * 10) / 10 : 0,
      interested: rows.filter(r => r.courseInterest === 'yes').length,
      maybe: rows.filter(r => r.courseInterest === 'maybe').length,
      nextYes: missed.filter(r => r.nextSession === 'yes').length,
      nextMaybe: missed.filter(r => r.nextSession === 'maybe').length,
      recording: missed.filter(r => r.wantRecording).length,
      linkProblems: missed.filter(r => r.reason === 'link_mobile' || r.reason === 'link_failed' || r.reason === 'no_details').length,
      reasons: Object.entries(reasons).sort((a, b) => b[1] - a[1]),
      liked: Object.entries(liked).sort((a, b) => b[1] - a[1]),
    };
  }, [rows]);

  const visible = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return [...rows].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .filter(r => filter === 'all' || (filter === 'joined' ? r.joined : filter === 'missed' ? !r.joined : filter === 'interested' ? (r.courseInterest === 'yes' || r.courseInterest === 'maybe') : (!r.joined && (r.nextSession === 'yes' || r.nextSession === 'maybe'))))
      .filter(r => !lower || (r.name || '').toLowerCase().includes(lower) || r.email.includes(lower) || (r.mobile || '').includes(lower));
  }, [rows, filter, q]);

  const exportCsv = () => {
    if (visible.length === 0) { showToast('Nothing to export with the current filter', 'info'); return; }
    utils.downloadCSV(visible.map(r => ({
      Name: r.name, Email: r.email, Mobile: r.mobile, RegistrationCode: r.registrationCode,
      Joined: r.joined ? 'Yes' : 'No', Rating: r.joined ? r.rating || '' : '', Liked: (r.liked || []).join('; '), Improve: r.improve,
      Reason: r.joined ? '' : (FEEDBACK_REASON_LABELS[r.reason] || r.reason), ReasonOther: r.reasonOther, NextSession: r.joined ? '' : (NEXT[r.nextSession] || ''), WantsRecording: r.joined ? '' : (r.wantRecording ? 'Yes' : 'No'),
      CourseInterest: INTEREST[r.courseInterest] || '', PreferredMode: r.preferredMode, BestTimeToCall: r.callTime, Comments: r.comments,
      SubmittedAt: formatISTDateTime(r.submittedAt), Source: r.source,
    })), `${ev.slug}-feedback.csv`);
  };

  const interestedEmails = rows.filter(r => r.courseInterest === 'yes' || r.courseInterest === 'maybe').map(r => r.email).join(', ');
  const nextSessionEmails = rows.filter(r => !r.joined && (r.nextSession === 'yes' || r.nextSession === 'maybe')).map(r => r.email).join(', ');
  const surveyLink = followupLinkUrl(ev, '', '', ev.followupTemplate?.linkOverride);

  const remove = async (r: EventFeedback) => {
    if (!utils.isMasterUser(user)) { showToast('Only the master admin can delete feedback', 'error'); return; }
    if (!window.confirm(`Delete the answer from ${r.email}?`)) return;
    try { await deleteFeedback([r.id]); } catch (e: any) { showToast(`Delete failed: ${e.message || e}`, 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Responses', value: stats.total, tint: 'text-gray-700 bg-gray-50 border-gray-200' },
          { label: 'Joined', value: stats.joined, tint: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Did not join', value: stats.missed, tint: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Avg rating', value: stats.avgRating ? `${stats.avgRating} ★` : '—', tint: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Course: yes / maybe', value: `${stats.interested} / ${stats.maybe}`, tint: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Next session: yes / maybe', value: `${stats.nextYes} / ${stats.nextMaybe}`, tint: 'text-purple-700 bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.tint}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Why people did not join">
          {stats.reasons.length === 0 ? <p className="text-sm text-gray-500 italic">No answers yet.</p> : (
            <div className="space-y-2">
              {stats.reasons.map(([k, n]) => (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-gray-800">{FEEDBACK_REASON_LABELS[k] || k}</span>
                  <div className="w-32 bg-gray-100 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.round(n * 100 / Math.max(1, stats.missed))}%` }} /></div>
                  <span className="w-8 text-right font-bold">{n}</span>
                </div>
              ))}
              <p className="text-xs text-gray-500 pt-2">{stats.linkProblems} of {stats.missed} could not get in because of the link or missing details. {stats.recording} want the recording.</p>
            </div>
          )}
        </Card>
        <Card title="What attendees liked">
          {stats.liked.length === 0 ? <p className="text-sm text-gray-500 italic">No answers yet.</p> : (
            <div className="space-y-2">
              {stats.liked.map(([k, n]) => (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-gray-800">{k}</span>
                  <div className="w-32 bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.round(n * 100 / Math.max(1, stats.joined))}%` }} /></div>
                  <span className="w-8 text-right font-bold">{n}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Follow-up lists">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold text-gray-800">Interested in the course ({stats.interested + stats.maybe})</p>
              <div className="flex gap-2 items-center mt-1"><CopyButton text={interestedEmails} label="Copy emails" /><span className="text-xs text-gray-500">Paste into the Invite tab's list or your mail client.</span></div>
            </div>
            <div>
              <p className="font-bold text-gray-800">Want the next session ({stats.nextYes + stats.nextMaybe})</p>
              <div className="flex gap-2 items-center mt-1"><CopyButton text={nextSessionEmails} label="Copy emails" /><span className="text-xs text-gray-500">Send them the new joining details.</span></div>
            </div>
            <div>
              <p className="font-bold text-gray-800">Survey link</p>
              <div className="flex gap-2 items-center mt-1 flex-wrap"><span className="font-mono text-xs text-gray-700 break-all">{surveyLink}</span><CopyButton text={surveyLink} /></div>
              <p className="text-xs text-gray-500 mt-1">Works without an email too, for WhatsApp. The follow-up email adds the person's email so the page pre-fills.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <p className="font-bold text-gray-800 mr-auto">Answers <span className="text-gray-400 font-normal">({visible.length}{visible.length !== rows.length ? ` of ${rows.length}` : ''})</span></p>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, mobile…" className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56" />
          <select value={filter} onChange={e => setFilter(e.target.value as Filter)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All</option>
            <option value="joined">Joined</option>
            <option value="missed">Did not join</option>
            <option value="interested">Interested in course</option>
            <option value="next">Want next session</option>
          </select>
          <Button variant="secondary" onClick={exportCsv}>⬇ Export CSV</Button>
        </div>
        {!loaded ? <p className="p-6 text-sm text-gray-500">Loading…</p>
        : rows.length === 0 ? <p className="p-6 text-sm text-gray-500 italic">No answers yet. Send the follow-up survey from the "Invite by email" tab (mode: Follow-up survey).</p>
        : visible.length === 0 ? <p className="p-6 text-sm text-gray-500 italic">Nobody matches this filter.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200"><th className="py-2 px-4">Person</th><th className="py-2 px-4">Joined</th><th className="py-2 px-4">Rating / reason</th><th className="py-2 px-4">Next session</th><th className="py-2 px-4">Course</th><th className="py-2 px-4">Comments</th><th className="py-2 px-4">When</th><th className="py-2 px-4"></th></tr></thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <td className="py-2 px-4"><p className="font-medium text-gray-900">{r.name || <span className="text-gray-400">—</span>}</p><p className="text-xs text-gray-500">{r.email}{r.mobile ? ` · ${r.mobile}` : ''}</p></td>
                    <td className="py-2 px-4">{r.joined ? <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">Joined</span> : <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600">Did not join</span>}</td>
                    <td className="py-2 px-4 text-gray-700">{r.joined ? <>{'★'.repeat(r.rating || 0)}<span className="text-gray-300">{'★'.repeat(5 - (r.rating || 0))}</span>{(r.liked || []).length ? <p className="text-xs text-gray-500">{r.liked.join(', ')}</p> : null}{r.improve && <p className="text-xs text-gray-600 italic">"{r.improve}"</p>}</> : <>{FEEDBACK_REASON_LABELS[r.reason] || r.reason}{r.reasonOther && <p className="text-xs text-gray-600 italic">"{r.reasonOther}"</p>}</>}</td>
                    <td className="py-2 px-4 text-gray-700">{r.joined ? '—' : `${NEXT[r.nextSession] || '—'}${r.wantRecording ? ' · recording' : ''}`}</td>
                    <td className="py-2 px-4 text-gray-700">{INTEREST[r.courseInterest] || '—'}{r.courseInterest && r.courseInterest !== 'no' && (r.preferredMode || r.callTime) ? <p className="text-xs text-gray-500">{[r.preferredMode, r.callTime].filter(Boolean).join(' · ')}</p> : null}</td>
                    <td className="py-2 px-4 text-xs text-gray-600 max-w-[220px]">{r.comments}</td>
                    <td className="py-2 px-4 text-xs text-gray-500 whitespace-nowrap">{formatISTDateTime(r.updatedAt || r.submittedAt)}</td>
                    <td className="py-2 px-4 text-right">{utils.isMasterUser(user) && <button onClick={() => remove(r)} className="text-xs text-gray-400 hover:text-red-600" title="Delete">✕</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
