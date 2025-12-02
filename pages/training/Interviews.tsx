import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal, BackButton } from '../../components/Components';
import { CandidateStatus, InterviewSchedule } from '../../types';
import * as utils from '../../utils';

export const Interviews: React.FC = () => {
  const { candidates, updateCandidate, interviews, addInterview, updateInterview, deleteInterview, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'ReadyCandidates' | 'Schedule' | 'DailyView'>('ReadyCandidates');
  
  // --- Resume Logic ---
  const [viewResume, setViewResume] = useState<{type:string, data:string, name:string} | null>(null);
  
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>, cId: string) => {
     const file = e.target.files?.[0];
     if (!file) return;
     if (file.size > 5 * 1024 * 1024) { showToast('Max 5MB', 'error'); return; }
     const reader = new FileReader();
     reader.onload = (evt) => {
        const c = candidates.find(x => x.id === cId);
        if(c) updateCandidate({ ...c, resume: evt.target?.result as string, resumeName: file.name });
        showToast('Resume uploaded');
     };
     reader.readAsDataURL(file);
  };

  const handleViewResume = (c: any) => {
     if(!c.resume) return;
     const isPdf = c.resumeName?.endsWith('.pdf');
     setViewResume({ type: isPdf ? 'pdf' : 'docx', data: c.resume, name: c.resumeName || 'Resume' });
  };

  // --- Interview Scheduling Logic ---
  const [scheduleForm, setScheduleForm] = useState<Partial<InterviewSchedule>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookInterview = (e: React.FormEvent) => {
     e.preventDefault();
     if(!scheduleForm.candidateId || !scheduleForm.date || !scheduleForm.companyName) return;
     
     const data: InterviewSchedule = {
        id: scheduleForm.id || utils.generateId(),
        candidateId: scheduleForm.candidateId,
        date: scheduleForm.date!,
        time: scheduleForm.time || '10:00',
        companyName: scheduleForm.companyName!,
        interviewType: scheduleForm.interviewType || 'Zoom',
        round: scheduleForm.round || 'L1',
        supportPerson: scheduleForm.supportPerson,
        status: 'Scheduled',
        notes: scheduleForm.notes
     };
     
     if(scheduleForm.id) updateInterview(data);
     else addInterview(data);
     
     showToast('Interview scheduled');
     setIsModalOpen(false);
     setScheduleForm({});
  };

  const readyCandidates = candidates.filter(c => c.status === CandidateStatus.ReadyForInterview && c.isActive);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <BackButton />
             <h1 className="text-3xl font-bold text-gray-900">Interviews & Placements</h1>
          </div>
          <Button onClick={() => { setScheduleForm({}); setIsModalOpen(true); }}>+ Schedule Interview</Button>
       </div>

       <div className="flex gap-4 border-b border-gray-200">
          <button onClick={() => setActiveTab('ReadyCandidates')} className={`pb-2 px-4 font-medium ${activeTab === 'ReadyCandidates' ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500'}`}>Ready Candidates</button>
          <button onClick={() => setActiveTab('DailyView')} className={`pb-2 px-4 font-medium ${activeTab === 'DailyView' ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500'}`}>Interview Schedule</button>
       </div>

       {activeTab === 'ReadyCandidates' && (
          <Card>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                   <thead className="bg-gray-50 border-b">
                      <tr>
                         <th className="p-3">Candidate</th>
                         <th className="p-3">Batch</th>
                         <th className="p-3">Resume</th>
                         <th className="p-3 text-center">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {readyCandidates.map(c => (
                         <tr key={c.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{c.name}</td>
                            <td className="p-3">{c.batchId}</td>
                            <td className="p-3">
                               {c.resume ? (
                                  <div className="flex items-center gap-2">
                                     <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded truncate max-w-[150px]">{c.resumeName}</span>
                                     <button onClick={() => handleViewResume(c)} className="text-blue-600 hover:underline text-xs">View</button>
                                  </div>
                               ) : <span className="text-gray-400 italic">Missing</span>}
                            </td>
                            <td className="p-3 text-center flex justify-center gap-2">
                               <label className="cursor-pointer text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
                                  Upload
                                  <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => handleResumeUpload(e, c.id)} />
                               </label>
                               <button onClick={() => { setScheduleForm({ candidateId: c.id }); setIsModalOpen(true); }} className="text-xs bg-spr-600 text-white px-2 py-1 rounded hover:bg-spr-700">Book Interview</button>
                            </td>
                         </tr>
                      ))}
                      {readyCandidates.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No candidates currently marked as 'Ready for Interview'.</td></tr>}
                   </tbody>
                </table>
             </div>
          </Card>
       )}

       {activeTab === 'DailyView' && (
          <div className="space-y-4">
             {/* Group by Date */}
             {Object.entries(interviews.reduce((acc, curr) => {
                const list = acc[curr.date] || [];
                list.push(curr);
                acc[curr.date] = list;
                return acc;
             }, {} as Record<string, InterviewSchedule[]>)).sort().map(([date, items]) => (
                <Card key={date} title={new Date(date).toDateString()}>
                   <div className="space-y-2">
                      {(items as InterviewSchedule[]).map(i => {
                         const c = candidates.find(x => x.id === i.candidateId);
                         return (
                            <div key={i.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                               <div>
                                  <p className="font-bold text-gray-900">{i.time} - {c?.name} <span className="text-gray-400 font-normal">({c?.batchId})</span></p>
                                  <p className="text-sm text-indigo-700 font-medium">{i.companyName} ({i.round}) - {i.interviewType}</p>
                                  {i.supportPerson && <p className="text-xs text-amber-700 mt-1">Support: {i.supportPerson}</p>}
                               </div>
                               <div className="text-right">
                                  <span className="text-xs px-2 py-1 rounded bg-white border border-gray-200 block mb-1">{i.status}</span>
                                  <button onClick={() => { setScheduleForm(i); setIsModalOpen(true); }} className="text-blue-600 text-xs hover:underline">Edit</button>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </Card>
             ))}
             {interviews.length === 0 && <p className="text-center text-gray-500">No interviews scheduled.</p>}
          </div>
       )}

       {/* Schedule Modal */}
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Interview">
          <form onSubmit={handleBookInterview} className="space-y-4">
             <div>
                <label className="block text-sm font-medium mb-1">Candidate</label>
                <select className="w-full border rounded px-3 py-2" value={scheduleForm.candidateId || ''} onChange={e => setScheduleForm({...scheduleForm, candidateId: e.target.value})} required>
                   <option value="">Select Candidate</option>
                   {readyCandidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Date" value={scheduleForm.date || ''} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} required />
                <Input type="time" label="Time" value={scheduleForm.time || ''} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} required />
             </div>
             <Input label="Company Name" value={scheduleForm.companyName || ''} onChange={e => setScheduleForm({...scheduleForm, companyName: e.target.value})} required />
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Type</label>
                   <select className="w-full border rounded px-3 py-2" value={scheduleForm.interviewType || 'Zoom'} onChange={e => setScheduleForm({...scheduleForm, interviewType: e.target.value as any})}>
                      <option>Zoom</option><option>Teams</option><option>F2F</option><option>Telephonic</option>
                   </select>
                </div>
                <Input label="Round" value={scheduleForm.round || ''} onChange={e => setScheduleForm({...scheduleForm, round: e.target.value})} placeholder="e.g. L1, Managerial" />
             </div>
             <Input label="Support Person (if any)" value={scheduleForm.supportPerson || ''} onChange={e => setScheduleForm({...scheduleForm, supportPerson: e.target.value})} />
             <div className="flex justify-end pt-4">
                <Button type="submit">Save Schedule</Button>
             </div>
          </form>
       </Modal>

       {/* Resume Viewer */}
       <Modal isOpen={!!viewResume} onClose={() => setViewResume(null)} title={`View Resume: ${viewResume?.name}`}>
          <div className="h-[80vh] flex flex-col">
             <div className="flex justify-end mb-2">
                <a href={viewResume?.data} download={viewResume?.name} className="text-blue-600 font-bold hover:underline">Download</a>
             </div>
             <div className="flex-1 bg-gray-100 rounded">
                {viewResume?.type === 'pdf' ? (
                   <object data={viewResume.data} type="application/pdf" className="w-full h-full"><p>Preview not supported.</p></object>
                ) : (
                   <div className="flex items-center justify-center h-full text-gray-500">Preview only available for PDF. Please download.</div>
                )}
             </div>
          </div>
       </Modal>
    </div>
  );
};