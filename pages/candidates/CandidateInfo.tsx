
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, BackButton } from '../../components/Components';
import { CandidateProfile } from '../../types';

export const CandidateInfo: React.FC = () => {
  const { user, candidates, candidateProfiles, updateCandidateProfile, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'Personal' | 'Education' | 'Experience'>('Personal');
  
  // Identify the candidate ID (either self or selected by admin)
  // For simplicity, assuming this page is mostly for the logged-in candidate or admin viewing self-linked profile
  // If admin wants to view others, we'd need a route param :id. Let's support both.
  
  // Simplified for now: Uses linked ID of logged in user
  const candidateId = user?.linkedCandidateId;
  const candidate = candidates.find(c => c.id === candidateId);
  
  const [profile, setProfile] = useState<CandidateProfile>({ candidateId: candidateId || '' });

  useEffect(() => {
    if (candidateId) {
       const existing = candidateProfiles.find(p => p.candidateId === candidateId);
       if (existing) setProfile(existing);
       else setProfile({ candidateId });
    }
  }, [candidateId, candidateProfiles]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) return;
    updateCandidateProfile(profile);
    showToast('Profile updated successfully');
  };

  if (!candidate || !candidateId) {
     return <div className="p-8 text-center text-gray-500">No candidate profile linked to this account.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
          <BackButton />
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
             <p className="text-gray-500">{candidate.name} ({candidate.batchId})</p>
          </div>
       </div>

       <div className="flex gap-2 border-b border-gray-200">
          {['Personal', 'Education', 'Experience'].map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500 hover:text-gray-800'}`}
             >
                {tab} Details
             </button>
          ))}
       </div>

       <Card>
          <form onSubmit={handleSave}>
             {activeTab === 'Personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                   <Input label="Date of Birth" type="date" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} />
                   <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select className="w-full border rounded-lg px-4 py-2" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})}>
                         <option value="">Select</option>
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                      </select>
                   </div>
                   <Input label="Nationality" value={profile.nationality || ''} onChange={e => setProfile({...profile, nationality: e.target.value})} />
                   <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                      <textarea className="w-full border rounded-lg p-2" rows={2} value={profile.permanentAddress || ''} onChange={e => setProfile({...profile, permanentAddress: e.target.value})} />
                   </div>
                   <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                      <textarea className="w-full border rounded-lg p-2" rows={2} value={profile.currentAddress || ''} onChange={e => setProfile({...profile, currentAddress: e.target.value})} />
                   </div>
                </div>
             )}

             {activeTab === 'Education' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                   <Input label="Highest Degree" value={profile.degree || ''} onChange={e => setProfile({...profile, degree: e.target.value})} placeholder="e.g. B.Tech CSE" />
                   <Input label="University / College" value={profile.university || ''} onChange={e => setProfile({...profile, university: e.target.value})} />
                   <Input label="Passing Year" value={profile.passingYear || ''} onChange={e => setProfile({...profile, passingYear: e.target.value})} />
                   <Input label="Percentage / CGPA" value={profile.percentage || ''} onChange={e => setProfile({...profile, percentage: e.target.value})} />
                </div>
             )}

             {activeTab === 'Experience' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                   <div className="col-span-2 flex items-center gap-2 mb-4">
                      <input type="checkbox" checked={profile.hasExperience || false} onChange={e => setProfile({...profile, hasExperience: e.target.checked})} id="exp" />
                      <label htmlFor="exp" className="text-sm font-medium">I have previous work experience</label>
                   </div>
                   {profile.hasExperience && (
                      <>
                        <Input label="Last Company" value={profile.lastCompany || ''} onChange={e => setProfile({...profile, lastCompany: e.target.value})} />
                        <Input label="Designation" value={profile.designation || ''} onChange={e => setProfile({...profile, designation: e.target.value})} />
                        <Input label="Years of Experience" type="number" value={profile.yearsOfExperience || 0} onChange={e => setProfile({...profile, yearsOfExperience: parseFloat(e.target.value)})} />
                      </>
                   )}
                   <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills</label>
                      <textarea className="w-full border rounded-lg p-2" rows={3} value={profile.skills || ''} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="Java, Selenium, SQL..." />
                   </div>
                </div>
             )}

             <div className="mt-6 flex justify-end">
                <Button type="submit">Save Changes</Button>
             </div>
          </form>
       </Card>
    </div>
  );
};
