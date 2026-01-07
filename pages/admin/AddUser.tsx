import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select } from '../../components/Components';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from '../../types';
import * as utils from '../../utils';

export const AddUser: React.FC = () => {
  const { users, addUser, updateUser, showToast } = useApp();
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

    if (id) { updateUser(userData); showToast('User updated'); } 
    else { addUser(userData); showToast('User added'); }
    navigate('/admin/users');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit User' : 'Add New User'}</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
      <Card>
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Login ID" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          <div className="mb-4">
             <label className="block text-sm font-medium mb-1">Default Password</label>
             <div className="text-gray-500 text-sm font-mono">{id ? '********' : (form.name || 'Same as name')}</div>
          </div>
          <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value as any})}>
             <option value="staff">Staff</option>
             <option value="admin">Admin</option>
             <option value="candidate">Candidate</option>
          </Select>
          <div className="flex justify-end gap-3 mt-6">
             <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>Cancel</Button>
             <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};