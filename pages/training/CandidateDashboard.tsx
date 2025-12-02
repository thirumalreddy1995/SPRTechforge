
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Components';

export const CandidateDashboard: React.FC = () => {
  const { user, candidates, trainingModules, trainingTopics, trainingLogs } = useApp();
  
  // Find linked candidate profile
  const candidate = candidates.find(c => c.id === user?.linkedCandidateId);

  // Stats
  const myLogs = trainingLogs.filter(l => l.candidateId === candidate?.id);
  const totalHours = myLogs.reduce((acc, curr) => acc + (curr.timeSpentMinutes / 60), 0);
  const topicsCovered = new Set(myLogs.map(l => l.topicId)).size;
  const totalTopics = trainingTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((topicsCovered / totalTopics) * 100) : 0;

  if (!candidate) {
    return <div className="p-8 text-center text-red-600">No candidate profile linked to this user account. Please contact admin.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {candidate.name}</h1>
            <p className="text-gray-500">Batch: {candidate.batchId}</p>
         </div>
         <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex gap-6">
            <div className="text-center">
               <p className="text-xs text-gray-500 uppercase font-bold">Total Hours</p>
               <p className="text-xl font-bold text-indigo-600">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-500 uppercase font-bold">Progress</p>
               <p className="text-xl font-bold text-emerald-600">{progressPercent}%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* History View */}
         <div className="lg:col-span-2 space-y-6">
            <Card title="My Attendance & Progress History">
               <div className="space-y-3">
                  {myLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
                     const topicName = trainingTopics.find(t => t.id === log.topicId)?.title || 'Unknown Topic';
                     return (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                           <div>
                              <p className="font-bold text-gray-900 text-sm">{topicName}</p>
                              <p className="text-xs text-gray-500">{new Date(log.date).toDateString()} • {log.timeSpentMinutes} min</p>
                           </div>
                           <div className="text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${log.attendanceStatus === 'Present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : log.attendanceStatus === 'Absent' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                 {log.attendanceStatus}
                              </span>
                           </div>
                        </div>
                     );
                  })}
                  {myLogs.length === 0 && <p className="text-gray-400 text-center italic py-8">No attendance records found.</p>}
               </div>
            </Card>
         </div>

         {/* Syllabus View */}
         <div className="lg:col-span-1">
            <Card title="Your Syllabus" className="h-full max-h-[80vh] overflow-y-auto">
               <div className="space-y-4">
                  {trainingModules.sort((a,b) => a.order - b.order).map(mod => (
                     <div key={mod.id}>
                        <h3 className="font-bold text-gray-800 text-sm mb-2">{mod.title}</h3>
                        <div className="space-y-1 ml-2 border-l-2 border-gray-200 pl-3">
                           {trainingTopics.filter(t => t.moduleId === mod.id).map(topic => {
                              const isCompleted = myLogs.some(l => l.topicId === topic.id);
                              return (
                                 <div key={topic.id} className="flex items-center gap-2 text-xs">
                                    {isCompleted ? (
                                       <span className="text-emerald-500 font-bold">✓</span>
                                    ) : (
                                       <span className="text-gray-300">○</span>
                                    )}
                                    <span className={isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}>{topic.title}</span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ))}
                  {trainingModules.length === 0 && <p className="text-xs text-gray-400 italic">Syllabus not yet defined by admin.</p>}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};
