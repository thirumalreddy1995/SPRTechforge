
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Pagination, BackButton, ConfirmationModal } from '../../components/Components';
import * as utils from '../../utils';

export const ActivityLogs: React.FC = () => {
  const { activityLogs, clearActivityLogs, user } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const ITEMS_PER_PAGE = 15;
  const isSuperUser = user?.id === 'admin-01';

  const filtered = activityLogs.filter(log => 
    log.description.toLowerCase().includes(filterText.toLowerCase()) ||
    log.actorName.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedLogs = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportCSV = () => {
      const csvData = activityLogs.map(l => ({
          Timestamp: new Date(l.timestamp).toISOString(),
          User: l.actorName,
          Action: l.action,
          Entity: l.entityType,
          ID: l.entityId || '',
          Description: l.description
      }));
      utils.downloadCSV(csvData, 'System_Logs.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportCSV}>Export CSV</Button>
            {isSuperUser && (
                <Button variant="danger" onClick={() => setShowClearConfirm(true)}>Clear Logs</Button>
            )}
        </div>
      </div>

      <Card>
        <div className="mb-4">
            <input 
                placeholder="Search logs..." 
                className="w-full border rounded px-4 py-2"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
            />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600 text-sm">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Description</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {paginatedLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-medium">{log.actorName}</td>
                        <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{log.action}</span></td>
                        <td className="p-3">{log.description}</td>
                    </tr>
                ))}
                {paginatedLogs.length === 0 && <tr><td colSpan={4} className="text-center p-8 text-gray-400">No logs found.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      <ConfirmationModal 
        isOpen={showClearConfirm} 
        onClose={() => setShowClearConfirm(false)} 
        onConfirm={() => { clearActivityLogs(); setShowClearConfirm(false); }} 
        title="Clear All Logs" 
        message="Are you sure you want to permanently delete all system logs? This action cannot be undone." 
      />
    </div>
  );
};
