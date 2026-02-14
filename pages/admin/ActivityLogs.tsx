import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Pagination, SearchInput } from '../../components/Components';
import * as utils from '../../utils';

export const ActivityLogs: React.FC = () => {
  const { activityLogs, user, clearActivityLogs } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');

  const ITEMS_PER_PAGE = 15;
  const isSuperUser = user?.username === 'thirumalreddy@sprtechforge.com';

  const filtered = activityLogs.filter(log => 
    log.description.toLowerCase().includes(filterText.toLowerCase()) ||
    log.actorName.toLowerCase().includes(filterText.toLowerCase())
  );

  const paginatedLogs = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleExportCSV = () => {
     utils.downloadCSV(activityLogs, 'system_logs.csv');
  };

  const handleClear = () => {
     if (window.confirm("Clear all logs? This cannot be undone.")) {
        clearActivityLogs();
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <div className="flex gap-2">
           {isSuperUser && <Button variant="danger" onClick={handleClear}>Clear Logs</Button>}
           <Button variant="secondary" onClick={handleExportCSV}>Export CSV</Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
           <SearchInput 
             placeholder="Search logs..." 
             value={filterText} 
             onChange={e => setFilterText(e.target.value)}
             onClear={() => setFilterText('')}
           />
        </div>
        <table className="w-full text-left text-sm">
           <thead className="bg-gray-50 border-b">
              <tr>
                 <th className="p-3">Time</th>
                 <th className="p-3">User</th>
                 <th className="p-3">Action</th>
                 <th className="p-3">Entity</th>
                 <th className="p-3">Description</th>
              </tr>
           </thead>
           <tbody>
              {paginatedLogs.map(log => (
                 <tr key={log.id} className="border-b">
                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold">{log.actorName}</td>
                    <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{log.action}</span></td>
                    <td className="p-3">{log.entityType}</td>
                    <td className="p-3 text-gray-600">{log.description}</td>
                 </tr>
              ))}
           </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
};