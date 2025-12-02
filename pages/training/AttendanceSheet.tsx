
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select } from '../../components/Components';
import * as utils from '../../utils';
import { CandidateStatus, TrainingLog } from '../../types';

interface AttendanceState {
  [candidateId: string]: 'Present' | 'Absent' | 'Excused';
}

export const AttendanceSheet: React.FC = () => {
  const { candidates, trainingModules, trainingTopics, trainingLogs, batchUpdateTrainingLogs, showToast } = useApp();
  
  // UI State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({});
  
  // Filter active, non-placed candidates
  const activeStudents = candidates.filter(c => 
    c.isActive && 
    c.status !== CandidateStatus.Placed && 
    c.status !== CandidateStatus.Discontinued
  );

  // Initialize or Fetch Existing Attendance for selected Date
  useEffect(() => {
    const newState: AttendanceState = {};
    
    activeStudents.forEach(student => {
      // Check if a log exists for this student on this date
      const existingLog = trainingLogs.find(l => l.date === date && l.candidateId === student.id);
      
      if (existingLog) {
        newState[student.id] = (existingLog.attendanceStatus === 'No Class' ? 'Excused' : existingLog.attendanceStatus) as any;
        // Also try to auto-select topic if not selected yet and exists in log
        if (!selectedTopicId && existingLog.topicId) {
            setSelectedTopicId(existingLog.topicId);
        }
      } else {
        newState[student.id] = 'Present'; // Default to Present
      }
    });
    
    setAttendanceState(newState);
  }, [date, activeStudents.length, trainingLogs.length]); // Re-run when date changes or logs loaded

  const handleAttendanceChange = (id: string, status: 'Present' | 'Absent' | 'Excused') => {
    setAttendanceState(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = () => {
    if (!selectedTopicId) {
        showToast("Please select the Topic covered today before saving.", 'error');
        return;
    }

    const topic = trainingTopics.find(t => t.id === selectedTopicId);
    const estimatedTime = topic ? topic.estimatedHours * 60 : 60; // Default to estimated time or 60 mins

    const logsToSave: TrainingLog[] = [];

    activeStudents.forEach(student => {
        const status = attendanceState[student.id];
        
        // Find existing log to update OR create new
        const existingLog = trainingLogs.find(l => l.date === date && l.candidateId === student.id);
        
        const logEntry: TrainingLog = {
            id: existingLog ? existingLog.id : utils.generateId(),
            candidateId: student.id,
            date: date,
            topicId: selectedTopicId,
            timeSpentMinutes: status === 'Present' ? estimatedTime : 0,
            assignmentStatus: existingLog ? existingLog.assignmentStatus : 'N/A', // Preserve assignment status
            attendanceStatus: status === 'Excused' ? 'No Class' : status,
            notes: existingLog ? existingLog.notes : ''
        };
        
        logsToSave.push(logEntry);
    });

    batchUpdateTrainingLogs(logsToSave);
    showToast("Attendance saved successfully for " + logsToSave.length + " candidates.");
  };

  const handleExport = () => {
    const data = activeStudents.map(s => {
        // Get history for this student
        const sLogs = trainingLogs.filter(l => l.candidateId === s.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Basic Stats
        const totalPresent = sLogs.filter(l => l.attendanceStatus === 'Present').length;
        const totalAbsent = sLogs.filter(l => l.attendanceStatus === 'Absent').length;
        
        // We can't easily export a dynamic matrix of dates in simple CSV row format without making it very wide.
        // Instead, let's export a "Detailed Attendance Log" (One row per log) or a "Summary".
        // Let's do Summary + Current State.
        
        return {
            'Candidate Name': s.name,
            'Batch': s.batchId,
            'Status': s.status,
            'Total Present': totalPresent,
            'Total Absent': totalAbsent,
            [`Status on ${date}`]: attendanceState[s.id] || 'N/A'
        };
    });
    
    utils.downloadCSV(data, `Attendance_Summary_${date}.csv`);
    showToast('Attendance Summary Exported');
  };
  
  const handleExportDetailed = () => {
     // Exports every log entry for active students
     const data: any[] = [];
     activeStudents.forEach(s => {
        const sLogs = trainingLogs.filter(l => l.candidateId === s.id);
        sLogs.forEach(log => {
            const topic = trainingTopics.find(t => t.id === log.topicId)?.title || 'Unknown';
            data.push({
                'Date': log.date,
                'Candidate Name': s.name,
                'Batch': s.batchId,
                'Topic': topic,
                'Attendance': log.attendanceStatus,
                'Time Spent (Mins)': log.timeSpentMinutes
            });
        });
     });
     
     if(data.length === 0) { showToast("No attendance records found to export.", 'info'); return; }
     
     // Sort by date
     data.sort((a,b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
     utils.downloadCSV(data, 'Detailed_Attendance_Logs.csv');
     showToast('Full History Exported');
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Class Attendance</h1>
           <p className="text-gray-500">Mark daily attendance and topics for active candidates.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportDetailed}>Export Full History</Button>
            <Button variant="secondary" onClick={handleExport}>Export Today's Summary</Button>
        </div>
      </div>

      <Card>
         {/* Controls */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Topic Covered Today</label>
                <select 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
                    value={selectedTopicId}
                    onChange={e => setSelectedTopicId(e.target.value)}
                >
                    <option value="">-- Select Topic from Curriculum --</option>
                    {trainingModules.sort((a,b) => a.order - b.order).map(mod => (
                        <optgroup key={mod.id} label={mod.title}>
                            {trainingTopics.filter(t => t.moduleId === mod.id).map(topic => (
                                <option key={topic.id} value={topic.id}>{topic.title} ({topic.estimatedHours}h)</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                {trainingModules.length === 0 && <p className="text-xs text-red-500 mt-1">No curriculum found. Please add Modules & Topics in Curriculum Manager first.</p>}
            </div>
         </div>

         {/* List */}
         <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-600">
               <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 bg-gray-100">
                     <th className="py-3 px-4">Candidate Name</th>
                     <th className="py-3 px-4">Batch</th>
                     <th className="py-3 px-4 text-center">Attendance Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {activeStudents.length > 0 ? activeStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                          <td className="py-3 px-4">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">{student.batchId}</span>
                          </td>
                          <td className="py-3 px-4">
                              <div className="flex justify-center gap-2">
                                  <label className={`cursor-pointer px-3 py-1.5 rounded border text-sm font-medium transition-colors ${attendanceState[student.id] === 'Present' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                                      <input 
                                        type="radio" 
                                        className="sr-only" 
                                        checked={attendanceState[student.id] === 'Present'} 
                                        onChange={() => handleAttendanceChange(student.id, 'Present')} 
                                      />
                                      Present
                                  </label>
                                  
                                  <label className={`cursor-pointer px-3 py-1.5 rounded border text-sm font-medium transition-colors ${attendanceState[student.id] === 'Absent' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                                      <input 
                                        type="radio" 
                                        className="sr-only" 
                                        checked={attendanceState[student.id] === 'Absent'} 
                                        onChange={() => handleAttendanceChange(student.id, 'Absent')} 
                                      />
                                      Absent
                                  </label>
                                  
                                  <label className={`cursor-pointer px-3 py-1.5 rounded border text-sm font-medium transition-colors ${attendanceState[student.id] === 'Excused' ? 'bg-amber-400 text-white border-amber-500' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                                      <input 
                                        type="radio" 
                                        className="sr-only" 
                                        checked={attendanceState[student.id] === 'Excused'} 
                                        onChange={() => handleAttendanceChange(student.id, 'Excused')} 
                                      />
                                      Excused
                                  </label>
                              </div>
                          </td>
                      </tr>
                  )) : (
                      <tr><td colSpan={3} className="py-8 text-center text-gray-500">No active candidates found for training.</td></tr>
                  )}
               </tbody>
            </table>
         </div>

         <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
             <Button onClick={handleSave} className="w-full md:w-auto px-8">Save Attendance</Button>
         </div>
      </Card>
    </div>
  );
};