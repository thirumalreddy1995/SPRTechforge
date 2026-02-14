import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, BackButton, SearchInput } from '../../components/Components';

export const ProgressMonitor: React.FC = () => {
  const { candidates, trainingLogs, trainingTopics } = useApp();
  const [filter, setFilter] = useState('');

  // Show ALL candidates for admin monitoring
  const allCandidates = candidates.filter(c => c.isActive && c.name.toLowerCase().includes(filter.toLowerCase()));
  const totalTopics = trainingTopics.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <BackButton />
           <h1 className="text-3xl font-bold text-gray-900">Progress Monitor</h1>
        </div>
      </div>

      <Card>
         <div className="mb-4">
            <SearchInput 
              placeholder="Search candidate..." 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              onClear={() => setFilter('')}
              containerClassName="max-w-md"
            />
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 border-b">
                  <tr>
                     <th className="p-3">Candidate</th>
                     <th className="p-3">Status</th>
                     <th className="p-3 text-center">Topics %</th>
                     <th className="p-3 text-center">Attendance (Present/Total)</th>
                     <th className="p-3 text-center">Last Active</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {allCandidates.map(c => {
                     const logs = trainingLogs.filter(l => l.candidateId === c.id);
                     const present = logs.filter(l => l.attendanceStatus === 'Present').length;
                     const totalDays = logs.length; // Or unique dates
                     const uniqueTopics = new Set(logs.map(l => l.topicId)).size;
                     const progress = totalTopics > 0 ? Math.round((uniqueTopics / totalTopics) * 100) : 0;
                     const lastLog = logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                     return (
                        <tr key={c.id} className="hover:bg-gray-50">
                           <td className="p-3 font-medium text-gray-900">{c.name} <span className="text-gray-400 text-xs">({c.batchId})</span></td>
                           <td className="p-3">{c.status}</td>
                           <td className="p-3 text-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px] mx-auto">
                                 <div className="bg-spr-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-xs">{progress}% ({uniqueTopics}/{totalTopics})</span>
                           </td>
                           <td className="p-3 text-center">
                              <span className="text-emerald-600 font-bold">{present}</span> / {totalDays}
                           </td>
                           <td className="p-3 text-center text-xs">
                              {lastLog ? new Date(lastLog.date).toLocaleDateString() : '-'}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};