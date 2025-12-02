
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Components';

export const AddressBook: React.FC = () => {
  const { users, candidates } = useApp();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Candidate' | 'Staff'>('All');

  // Combine data
  const allContacts = [
    ...users.map(u => ({
      id: u.id,
      name: u.name || u.username,
      role: u.role === 'admin' ? 'Administrator' : 'Staff',
      email: u.email || u.username, // Fallback to username if it looks like email
      phone: '', // Users don't currently have phone in schema, leaving blank
      type: 'Staff'
    })),
    ...candidates.filter(c => c.isActive).map(c => ({
      id: c.id,
      name: c.name,
      role: `Candidate (${c.batchId})`,
      email: c.email,
      phone: c.phone,
      type: 'Candidate'
    }))
  ];

  const filtered = allContacts.filter(c => {
    const matchesText = 
      c.name.toLowerCase().includes(filter.toLowerCase()) || 
      c.email.toLowerCase().includes(filter.toLowerCase()) ||
      c.role.toLowerCase().includes(filter.toLowerCase());
    
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    return matchesText && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Address Book</h1>
        <div className="flex gap-4 w-full md:w-auto">
            <input 
                placeholder="Search contacts..." 
                className="bg-white border border-spr-700 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none flex-1"
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />
            <select 
                className="bg-white border border-spr-700 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
            >
                <option value="All">All Contacts</option>
                <option value="Candidate">Candidates</option>
                <option value="Staff">Staff</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(contact => (
            <div key={contact.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${contact.type === 'Staff' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                        {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{contact.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${contact.type === 'Staff' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            {contact.role}
                        </span>
                    </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 flex-1">
                    {contact.phone && (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>{contact.phone}</span>
                        </div>
                    )}
                    {contact.email && (
                        <div className="flex items-center gap-2 break-all">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>{contact.email}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex-1 py-2 text-center rounded-lg bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors text-sm">
                            Call
                        </a>
                    )}
                    {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex-1 py-2 text-center rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors text-sm">
                            Mail
                        </a>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
