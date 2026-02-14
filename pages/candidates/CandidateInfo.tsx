import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, BackButton, SearchInput } from '../../components/Components';
import { CandidateProfile } from '../../types';

export const CandidateInfo: React.FC = () => {
  const { user, candidates, candidateProfiles, updateCandidateProfile, trainingModules, trainingTopics, trainingLogs, interviews, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'Personal' | 'Education' | 'Experience' | 'Training' | 'Interviews'>('Personal');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

  // Identify the target candidate ID
  // If candidate is logged in, target is their own ID. 
  // If admin/staff is logged in, target is the selected one.
  const targetCandidateId = isAdminOrStaff ? selectedCandidateId : user?.linkedCandidateId;
  const targetCandidate = candidates.find(c => c.id === targetCandidateId);
  
  const [profile, setProfile] = useState<CandidateProfile>({ candidateId: targetCandidateId || '' });

  useEffect(() => {
    if (targetCandidateId) {
       const existing = candidateProfiles.find(p => p.candidateId === targetCandidateId);
       if (existing) setProfile(existing);
       else setProfile({ candidateId: targetCandidateId });
    }
  }, [targetCandidateId, candidateProfiles]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCandidateId) return;
    updateCandidateProfile(profile);
    showToast('Profile updated successfully');
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If Admin/Staff hasn't selected a candidate yet, show the list
  if (isAdminOrStaff && !selectedCandidateId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-3xl font-bold text-gray-900">Candidate Information</h1>
           </div>
        </div>

        <Card title="Select a Candidate to View Self-Filled Info">
           <div className="mb-6">
              <SearchInput 
                placeholder="Search candidates by name or batch..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map(c => (
                 <div key={c.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow flex items-center justify-between bg-white group">
                    <div>
                       <p className="font-bold text-gray-900">{c.name}</p>
                       <p className="text-xs text-gray-500 font-mono">{c.batchId}</p>
                    </div>
                    <Button variant="secondary" onClick={() => setSelectedCandidateId(c.id)} className="text-xs">
                        View Info
                    </Button>
                 </div>
              ))}
              {filteredCandidates.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-400 italic">
                    No candidates found.
                </div>
              )}
           </div>
        </Card>
      </div>
    );
  }

  // If candidate is logged in but no profile linked, or somehow ID is missing
  if (!targetCandidate) {
     return <div className="p-8 text-center text-gray-500">No candidate profile linked to this account or selected.</div>;
  }

  const myLogs = trainingLogs.filter(l => l.candidateId === targetCandidateId);
  const myInterviews = interviews.filter(i => i.candidateId === targetCandidateId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             {isAdminOrStaff ? (
               <button onClick={() => setSelectedCandidateId(null)} className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                 </svg>
                 <span className="font-medium">Back to List</span>
               </button>
             ) : <BackButton />}
             <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Details</h1>
                <p className="text-gray-500">{targetCandidate.name} ({targetCandidate.batchId})</p>
             </div>
          </div>
          {isAdminOrStaff && (
            <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-widest">
              Admin View Mode
            </div>
          )}
       </div>

       <div className="flex gap-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {['Personal', 'Education', 'Experience', 'Training', 'Interviews'].map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500 hover:text-gray-800'}`}
             >
                {tab === 'Interviews' ? 'Interview History' : tab === 'Training' ? 'Training Progress' : `${tab} Details`}
             </button>
          ))}
       </div>

       <Card>
          {['Personal', 'Education', 'Experience'].includes(activeTab) ? (
              <form onSubmit={handleSave}>
                 {activeTab === 'Personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                       <Input label="Date of Birth" type="date" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} disabled={isAdminOrStaff} />
                       <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                          <select className="w-full border rounded-lg px-4 py-2" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} disabled={isAdminOrStaff}>
                             <option value="">Select</option>
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                       <Input label="Nationality" value={profile.nationality || ''} onChange={e => setProfile({...profile, nationality: e.target.value})} disabled={isAdminOrStaff} />
                       <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                          <textarea className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-spr-accent outline-none" rows={2} value={profile.permanentAddress || ''} onChange={e => setProfile({...profile, permanentAddress: e.target.value})} disabled={isAdminOrStaff} />
                       </div>
                       <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                          <textarea className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-spr-accent outline-none" rows={2} value={profile.currentAddress || ''} onChange={e => setProfile({...profile, currentAddress: e.target.value})} disabled={isAdminOrStaff} />
                       </div>
                    </div>
                 )}

                 {activeTab === 'Education' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                       <Input label="Highest Degree" value={profile.degree || ''} onChange={e => setProfile({...profile, degree: e.target.value})} placeholder="e.g. B.Tech CSE" disabled={isAdminOrStaff} />
                       <Input label="University / College" value={profile.university || ''} onChange={e => setProfile({...profile, university: e.target.value})} disabled={isAdminOrStaff} />
                       <Input label="Passing Year" value={profile.passingYear || ''} onChange={e => setProfile({...profile, passingYear: e.target.value})} disabled={isAdminOrStaff} />
                       <Input label="Percentage / CGPA" value={profile.percentage || ''} onChange={e => setProfile({...profile, percentage: e.target.value})} disabled={isAdminOrStaff} />
                    </div>
                 )}

                 {activeTab === 'Experience' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                       <div className="col-span-2 flex items-center gap-2 mb-4">
                          <input type="checkbox" checked={profile.hasExperience || false} onChange={e => setProfile({...profile, hasExperience: e.target.checked})} id="exp" disabled={isAdminOrStaff} />
                          <label htmlFor="exp" className="text-sm font-medium">Candidate has previous work experience</label>
                       </div>
                       {profile.hasExperience && (
                          <>
                            <Input label="Last Company" value={profile.lastCompany || ''} onChange={e => setProfile({...profile, lastCompany: e.target.value})} disabled={isAdminOrStaff} />
                            <Input label="Designation" value={profile.designation || ''} onChange={e => setProfile({...profile, designation: e.target.value})} disabled={isAdminOrStaff} />
                            <Input label="Years of Experience" type="number" value={profile.yearsOfExperience || 0} onChange={e => setProfile({...profile, yearsOfExperience: parseFloat(e.target.value)})} disabled={isAdminOrStaff} />
                          </>
                       )}
                       <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills</label>
                          <textarea className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-spr-accent outline-none" rows={3} value={profile.skills || ''} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="Java, Selenium, SQL..." disabled={isAdminOrStaff} />
                       </div>
                    </div>
                 )}

                 {!isAdminOrStaff && (
                    <div className="mt-6 flex justify-end">
                       <Button type="submit">Update My Profile</Button>
                    </div>
                 )}
              </form>
          ) : activeTab === 'Training' ? (
              <div className="space-y-4 animate-fade-in">
                  {trainingModules.sort((a,b) => a.order - b.order).map(mod => (
                     <div key={mod.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 font-bold text-gray-800 border-b border-gray-200">{mod.title}</div>
                        <div className="divide-y divide-gray-100">
                           {trainingTopics.filter(t => t.moduleId === mod.id).map(topic => {
                              const log = myLogs.find(l => l.topicId === topic.id);
                              return (
                                 <div key={topic.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                    <div className="flex items-center gap-3 text-sm">
                                       <span className={log ? 'text-emerald-500 font-bold' : 'text-gray-300'}>{log ? '✓' : '○'}</span>
                                       <span className={log ? 'text-gray-900 font-medium' : 'text-gray-500'}>{topic.title}</span>
                                    </div>
                                    {log && <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">{log.attendanceStatus}</span>}
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ))}
                  {trainingModules.length === 0 && <p className="text-gray-500 text-center py-4 italic">No curriculum modules defined.</p>}
              </div>
          ) : (
              <div className="space-y-4 animate-fade-in">
                  {myInterviews.length > 0 ? myInterviews.map(inv => (
                      <div key={inv.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div>
                             <h4 className="font-bold text-gray-900">{inv.companyName}</h4>
                             <p className="text-sm text-gray-600">{inv.round} • {inv.interviewType}</p>
                             <p className="text-xs text-gray-500 mt-1">{new Date(inv.date).toDateString()} at {inv.time}</p>
                          </div>
                          <div className="text-right">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                               inv.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                               inv.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                               'bg-gray-100 text-gray-700 border-gray-200'
                             }`}>
                                {inv.status}
                             </span>
                          </div>
                      </div>
                  )) : <p className="text-gray-500 text-center py-8 italic border border-dashed border-gray-200 rounded-xl">No interview history recorded.</p>}
              </div>
          )}
       </Card>
    </div>
  );
};