import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select } from '../../components/Components';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from '../../types';
import * as utils from '../../utils';

export const AddUser: React.FC = () => {
  const { users, addUser, updateUser, showToast, user: currentUser } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<User>>({
    name: '', username: '', password: '', role: 'staff', modules: ['candidates']
  });

  useEffect(() => {
    if (id) {
      const existing = users.find(u => u.id === id);
      if (existing) setForm(existing);
    }
  }, [id, users]);

  const isEditingMasterAdmin = form.username === 'thirumalreddy@sprtechforge.com';
  const isCurrentUserMasterAdmin = currentUser?.username === 'thirumalreddy@sprtechforge.com';
  
  // Restriction: Only the master admin can change their own password.
  const canChangePassword = !isEditingMasterAdmin || isCurrentUserMasterAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username) { setError('Name and Login ID required'); return; }
    
    const userData: User = {
      id: id || utils.generateId(),
      name: form.name,
      username: form.username,
      password: form.password || form.name,
      role: form.role as any,
      // Default modules for admin no longer include finance
      modules: form.role === 'admin' ? ['candidates', 'users', 'training'] : form.modules || [],
      isPasswordChanged: id ? form.isPasswordChanged : false
    };

    if (id) { 
      updateUser(userData); 
      showToast('User updated'); 
    } 
    else { 
      addUser(userData); 
      showToast('User added'); 
    }
    navigate('/admin/users');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit User' : 'Add New User'}</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
      <Card>
        <form onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
            disabled={isEditingMasterAdmin && !isCurrentUserMasterAdmin}
          />
          <Input 
            label="Login ID" 
            value={form.username} 
            onChange={e => setForm({...form, username: e.target.value})} 
            required 
            disabled={isEditingMasterAdmin} // Username usually shouldn't change, especially for master
          />
          
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEditingMasterAdmin && !isCurrentUserMasterAdmin && <span className="text-red-500 text-xs ml-2">(Protected Account)</span>}
             </label>
             {canChangePassword ? (
               <input 
                 type="password"
                 className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
                 value={form.password || ''}
                 onChange={e => setForm({...form, password: e.target.value})}
                 placeholder={id ? "Enter new password" : "Leave blank for name as default"}
               />
             ) : (
               <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 italic text-sm">
                 Only the Master Admin can change this password.
               </div>
             )}
          </div>

          <Select 
            label="Role" 
            value={form.role} 
            onChange={e => setForm({...form, role: e.target.value as any})}
            disabled={isEditingMasterAdmin && !isCurrentUserMasterAdmin}
          >
             <option value="staff">Staff</option>
             <option value="admin">Admin</option>
             <option value="candidate">Candidate</option>
          </Select>

          <div className="flex justify-end gap-3 mt-6">
             <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>Cancel</Button>
             <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};