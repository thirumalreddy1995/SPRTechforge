
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmationModal, BackButton } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';

export const UserList: React.FC = () => {
  const { users, deleteUser, user: currentUser, passwordResetRequests, resolvePasswordResetRequest } = useApp();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Per-row password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  
  const navigate = useNavigate();

  const isSuperUser = currentUser?.id === 'admin-01' || currentUser?.username === 'thirumalreddy@sprtechforge.com';
  const isAdmin = currentUser?.role === 'admin';

  const handleDeleteClick = (id: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete yourself.");
      return;
    }
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteUser(deleteId);
      setDeleteId(null);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
      setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleResolveRequest = (reqId: string, userId: string) => {
     resolvePasswordResetRequest(reqId);
     if (userId) {
       navigate(`/admin/users/edit/${userId}`);
     } else {
       alert("User not found.");
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        {isAdmin && (
            <Link to="/admin/users/new">
                <Button>+ Add User</Button>
            </Link>
        )}
      </div>

      {/* Pending Requests */}
      {isAdmin && passwordResetRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
           <h3 className="text-lg font-bold text-amber-800 mb-3">Pending Password Reset Requests</h3>
           <div className="grid grid-cols-1 gap-4">
             {passwordResetRequests.map(req => {
               const u = users.find(x => x.username === req.username);
               return (
                 <div key={req.id} className="flex justify-between bg-white p-4 rounded border border-amber-200 shadow-sm">
                    <div>
                        <p className="font-bold">{req.username}</p>
                        <p className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="secondary" onClick={() => resolvePasswordResetRequest(req.id)} className="text-xs">Dismiss</Button>
                       <Button onClick={() => handleResolveRequest(req.id, u?.id || '')} className="text-xs" disabled={!u}>Reset</Button>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {users.map(u => {
          const isMasterRow = u.username === 'thirumalreddy@sprtechforge.com';
          return (
            <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">{u.name}
                    {isMasterRow && <span className="ml-2 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">Director</span>}
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{u.username}</p>
                </div>
                <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">{u.role}</span>
              </div>
              {(u.phone || u.email) && (
                <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                  {u.phone && <p>{u.phone}</p>}
                  {u.email && <p>{u.email}</p>}
                </div>
              )}
              {isAdmin && (
                <div className="flex items-center gap-2 mb-3 text-xs font-mono text-gray-600">
                  {isMasterRow && !isSuperUser ? (
                    <span className="text-gray-400 italic flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Protected
                    </span>
                  ) : (
                    <>
                      {visiblePasswords[u.id] ? u.password : '••••••••'}
                      <button onClick={() => togglePasswordVisibility(u.id)} className="text-gray-400 hover:text-indigo-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Link to={`/admin/users/edit/${u.id}`} className="text-blue-600 text-sm font-semibold hover:underline">Edit</Link>
                {isSuperUser && u.id !== currentUser?.id && (
                  <button onClick={() => handleDeleteClick(u.id)} className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Login ID</th>
                <th className="py-3 px-4">Contact</th>
                {isAdmin && <th className="py-3 px-4">Password</th>}
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const isMasterRow = u.username === 'thirumalreddy@sprtechforge.com';
                return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {u.name}
                    {isMasterRow && <span className="ml-2 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">Director</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">{u.username}</td>
                  <td className="py-3 px-4 text-sm">
                    {u.phone && <p className="text-gray-700 font-medium">{u.phone}</p>}
                    {u.email && <p className="text-gray-400 text-xs">{u.email}</p>}
                    {!u.phone && !u.email && <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-sm font-mono">
                      {isMasterRow && !isSuperUser ? (
                        <span className="flex items-center gap-1.5 text-gray-400 italic text-xs">
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Protected
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {visiblePasswords[u.id] ? u.password : '••••••••'}
                          <button onClick={() => togglePasswordVisibility(u.id)} className="text-gray-400 hover:text-indigo-600 focus:outline-none">
                            {visiblePasswords[u.id] ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4 capitalize">{u.role}</td>
                  <td className="py-3 px-4 text-center">
                     <div className="flex justify-center gap-2">
                       <Link to={`/admin/users/edit/${u.id}`} className="text-blue-600 hover:underline text-sm">Edit</Link>
                       {isSuperUser && u.id !== currentUser?.id && (
                          <button onClick={() => handleDeleteClick(u.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                       )}
                     </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure? This cannot be undone."
      />
    </div>
  );
};
