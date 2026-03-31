import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal, ConfirmationModal, BackButton } from '../../components/Components';
import { CandidateStatus, InterviewSchedule } from '../../types';
import * as utils from '../../utils';

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Rescheduled: 'bg-amber-100 text-amber-800 border-amber-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const OUTCOME_COLORS: Record<string, string> = {
  Selected: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Pending: 'bg-gray-100 text-gray-700',
};

export const Interviews: React.FC = () => {
  const { candidates, updateCandidate, interviews, addInterview, updateInterview, deleteInterview, showToast, user } = useApp();

  const isMaster = user?.username === 'thirumalreddy@sprtechforge.com';
  const isAdmin = user?.role === 'admin' || isMaster;

  const [activeTab, setActiveTab] = useState<'ReadyCandidates' | 'Active' | 'History'>('Active');
  const [viewResume, setViewResume] = useState<{ type: string; data: string; name: string } | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Partial<InterviewSchedule>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [statusUpdateValue, setStatusUpdateValue] = useState<InterviewSchedule['status']>('Scheduled');
  const [outcomeValue, setOutcomeValue] = useState<InterviewSchedule['outcome']>('Pending');

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>, cId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Max file size is 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const c = candidates.find(x => x.id === cId);
      if (c) updateCandidate({ ...c, resume: evt.target?.result as string, resumeName: file.name });
      showToast('Resume uploaded successfully');
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
    const data: InterviewSchedule = {
      id: scheduleForm.id || utils.generateId(),
      candidateId: scheduleForm.candidateId,
      date: scheduleForm.date!,
      time: scheduleForm.time || '10:00',
      companyName: scheduleForm.companyName!,
      interviewType: scheduleForm.interviewType || 'Zoom',
      round: scheduleForm.round || 'L1',
      supportPerson: scheduleForm.supportPerson,
      status: scheduleForm.id ? (scheduleForm.status || 'Scheduled') : 'Scheduled',
      notes: scheduleForm.notes,
      outcome: scheduleForm.outcome,
    };
    if (scheduleForm.id) { updateInterview(data); showToast('Interview updated'); }
    else { addInterview(data); showToast('Interview scheduled'); }
    setIsModalOpen(false);
    setScheduleForm({});
  };

  const handleStatusUpdate = () => {
    const interview = interviews.find(i => i.id === statusUpdateId);
    if (!interview) return;
    updateInterview({ ...interview, status: statusUpdateValue, outcome: outcomeValue });
    setStatusUpdateId(null);
    showToast('Interview status updated');
  };

  const readyCandidates = candidates.filter(c => c.status === CandidateStatus.ReadyForInterview && c.isActive);

  // Active = only Scheduled interviews
  const activeInterviews = useMemo(() =>
    interviews
      .filter(i => i.status === 'Scheduled')
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()),
    [interviews]
  );

  // History = all non-Scheduled interviews
  const historyInterviews = useMemo(() =>
    interviews
      .filter(i => i.status !== 'Scheduled')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [interviews]
  );

  const today = new Date().toISOString().split('T')[0];

  const renderInterviewCard = (i: InterviewSchedule, showHistory = false) => {
    const c = candidates.find(x => x.id === i.candidateId);
    const isToday = i.date === today;
    const isPast = i.date < today && i.status === 'Scheduled';
    return (
      <div key={i.id} className={`flex flex-col md:flex-row justify-between gap-3 p-4 rounded-xl border transition-all ${
        isToday ? 'bg-purple-50 border-purple-200' :
        isPast ? 'bg-red-50 border-red-100' :
        showHistory ? 'bg-gray-50 border-gray-200' :
        'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
      }`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-gray-900">{i.time}</span>
            <span className="text-gray-400">·</span>
            <span className="font-semibold text-gray-800">{c?.name || 'Unknown'}</span>
            <span className="text-xs text-gray-400 font-mono">({c?.batchId})</span>
            {isToday && <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded uppercase">Today</span>}
            {isPast && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded uppercase">Overdue</span>}
          </div>
          <p className="text-sm text-indigo-700 font-medium">{i.companyName} · <span className="text-gray-600">{i.round}</span> · {i.interviewType}</p>
          {i.supportPerson && <p className="text-xs text-amber-700 mt-1">Support: {i.supportPerson}</p>}
          {i.notes && <p className="text-xs text-gray-500 mt-1 italic">{i.notes}</p>}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${STATUS_COLORS[i.status] || 'bg-gray-100'}`}>{i.status}</span>
            {i.outcome && i.outcome !== 'Pending' && (
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${OUTCOME_COLORS[i.outcome] || 'bg-gray-100'}`}>{i.outcome}</span>
            )}
          </div>
          <p className="text-xs text-gray-400">{new Date(i.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <div className="flex gap-1.5">
            {/* Update Status */}
            <button
              onClick={() => { setStatusUpdateId(i.id); setStatusUpdateValue(i.status); setOutcomeValue(i.outcome || 'Pending'); }}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg font-medium transition-colors"
              title="Update Status"
            >
              Update
            </button>
            {/* Edit - admin only */}
            {isAdmin && (
              <button
                onClick={() => { setScheduleForm(i); setIsModalOpen(true); }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
            )}
            {/* Delete - admin only */}
            {isAdmin && (
              <button
                onClick={() => setDeleteId(i.id)}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium transition-colors"
                title="Delete Interview"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interviews & Placements</h1>
            <p className="text-sm text-gray-500 mt-0.5">{activeInterviews.length} active · {historyInterviews.length} completed</p>
          </div>
        </div>
        <Button onClick={() => { setScheduleForm({}); setIsModalOpen(true); }}>+ Schedule Interview</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'Active', label: 'Active Schedule', count: activeInterviews.length },
          { key: 'ReadyCandidates', label: 'Ready Candidates', count: readyCandidates.length },
          { key: 'History', label: 'History', count: historyInterviews.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`pb-2.5 px-4 text-sm font-medium transition-colors ${activeTab === tab.key ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-spr-100 text-spr-700' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Active Schedule Tab */}
      {activeTab === 'Active' && (
        <div className="space-y-3">
          {activeInterviews.length > 0 ? (
            Object.entries(
              activeInterviews.reduce((acc, i) => {
                const list = acc[i.date] || [];
                list.push(i);
                acc[i.date] = list;
                return acc;
              }, {} as Record<string, InterviewSchedule[]>)
            ).sort().map(([date, items]) => (
              <Card key={date} title={`${new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}${date === today ? ' · TODAY' : ''}`}>
                <div className="space-y-2">
                  {(items as InterviewSchedule[]).map(i => renderInterviewCard(i))}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-16 text-gray-400">
                <svg className="w-14 h-14 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="font-medium text-gray-500">No active interviews scheduled</p>
                <p className="text-xs mt-1">Schedule an interview using the button above</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Ready Candidates Tab */}
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

      {/* History Tab */}
      {activeTab === 'History' && (
        <div className="space-y-2">
          {historyInterviews.length > 0 ? (
            historyInterviews.map(i => renderInterviewCard(i, true))
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-400">
                <p className="font-medium">No interview history yet</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Schedule / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setScheduleForm({}); }} title={scheduleForm.id ? 'Edit Interview' : 'Schedule Interview'}>
        <form onSubmit={handleBookInterview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate <span className="text-red-500">*</span></label>
            <select className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
              value={scheduleForm.candidateId || ''} onChange={e => setScheduleForm({ ...scheduleForm, candidateId: e.target.value })} required>
              <option value="">Select Candidate</option>
              {candidates.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.batchId})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Date" value={scheduleForm.date || ''} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} required />
            <Input type="time" label="Time" value={scheduleForm.time || ''} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} required />
          </div>
          <Input label="Company Name" value={scheduleForm.companyName || ''} onChange={e => setScheduleForm({ ...scheduleForm, companyName: e.target.value })} required placeholder="e.g. Google, TCS" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
              <select className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
                value={scheduleForm.interviewType || 'Zoom'} onChange={e => setScheduleForm({ ...scheduleForm, interviewType: e.target.value as any })}>
                <option>Zoom</option><option>Teams</option><option>F2F</option><option>Telephonic</option>
              </select>
            </div>
            <Input label="Round" value={scheduleForm.round || ''} onChange={e => setScheduleForm({ ...scheduleForm, round: e.target.value })} placeholder="e.g. L1, HR" />
          </div>
          <Input label="Support Person (optional)" value={scheduleForm.supportPerson || ''} onChange={e => setScheduleForm({ ...scheduleForm, supportPerson: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none" rows={2}
              value={scheduleForm.notes || ''} onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setScheduleForm({}); }}>Cancel</Button>
            <Button type="submit">{scheduleForm.id ? 'Update Interview' : 'Schedule Interview'}</Button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={!!statusUpdateId} onClose={() => setStatusUpdateId(null)} title="Update Interview Status">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Status</label>
            <select className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
              value={statusUpdateValue} onChange={e => setStatusUpdateValue(e.target.value as any)}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {statusUpdateValue === 'Completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
              <select className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-spr-accent outline-none bg-white"
                value={outcomeValue} onChange={e => setOutcomeValue(e.target.value as any)}>
                <option value="Pending">Pending / Unknown</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStatusUpdateId(null)}>Cancel</Button>
            <Button onClick={handleStatusUpdate}>Save Status</Button>
          </div>
        </div>
      </Modal>

      {/* Resume Viewer */}
      <Modal isOpen={!!viewResume} onClose={() => setViewResume(null)} title={`Resume: ${viewResume?.name}`}>
        <div className="h-[80vh] flex flex-col">
          <div className="flex justify-end mb-2">
            <a href={viewResume?.data} download={viewResume?.name} className="text-blue-600 font-bold hover:underline text-sm">Download</a>
          </div>
          <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden">
            {viewResume?.type === 'pdf' ? (
              <object data={viewResume.data} type="application/pdf" className="w-full h-full"><p className="p-4 text-gray-500">Preview not supported. Please download.</p></object>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">Preview only available for PDF. Please download to view.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteInterview(deleteId); setDeleteId(null); showToast('Interview deleted'); } }}
        title="Delete Interview"
        message="Are you sure you want to delete this scheduled interview? This action cannot be undone." />
    </div>
  );
};
