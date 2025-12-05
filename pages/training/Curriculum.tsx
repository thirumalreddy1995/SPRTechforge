
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal, ConfirmationModal, BackButton } from '../../components/Components';
import * as utils from '../../utils';
import { TrainingModule, TrainingTopic } from '../../types';

export const Curriculum: React.FC = () => {
  const { 
    user, trainingModules, addTrainingModule, updateTrainingModule, deleteTrainingModule,
    trainingTopics, addTrainingTopic, updateTrainingTopic, deleteTrainingTopic, showToast 
  } = useApp();
  
  // State for Module Modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  // State for Topic Modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState(1);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<{ id: string, type: 'module' | 'topic' } | null>(null);

  const isAdmin = user?.role === 'admin';
  const sortedModules = [...trainingModules].sort((a, b) => a.order - b.order);

  // --- Module Handlers ---
  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    if (editingModuleId) {
        const existing = trainingModules.find(m => m.id === editingModuleId);
        if (existing) updateTrainingModule({ ...existing, title: newModuleTitle, description: newModuleDesc });
        showToast('Module updated');
    } else {
        addTrainingModule({
            id: utils.generateId(),
            title: newModuleTitle,
            description: newModuleDesc,
            order: trainingModules.length + 1
        });
        showToast('Module created');
    }
    closeModuleModal();
  };

  const openAddModule = () => {
      setEditingModuleId(null);
      setNewModuleTitle('');
      setNewModuleDesc('');
      setShowModuleModal(true);
  };

  const openEditModule = (m: TrainingModule) => {
      setEditingModuleId(m.id);
      setNewModuleTitle(m.title);
      setNewModuleDesc(m.description || '');
      setShowModuleModal(true);
  };

  const closeModuleModal = () => { setShowModuleModal(false); };

  // --- Topic Handlers ---
  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    if (editingTopicId) {
       const existing = trainingTopics.find(t => t.id === editingTopicId);
       if (existing) updateTrainingTopic({ ...existing, title: newTopicTitle, estimatedHours: newTopicHours });
       showToast('Topic updated');
    } else {
       if (!activeModuleId) return;
       addTrainingTopic({
          id: utils.generateId(),
          moduleId: activeModuleId,
          title: newTopicTitle,
          estimatedHours: newTopicHours
       });
       showToast('Topic added');
    }
    closeTopicModal();
  };

  const openAddTopic = (moduleId: string) => {
      setEditingTopicId(null);
      setActiveModuleId(moduleId);
      setNewTopicTitle('');
      setNewTopicHours(1);
      setShowTopicModal(true);
  };

  const openEditTopic = (t: TrainingTopic) => {
      setEditingTopicId(t.id);
      setActiveModuleId(t.moduleId);
      setNewTopicTitle(t.title);
      setNewTopicHours(t.estimatedHours);
      setShowTopicModal(true);
  };

  const closeTopicModal = () => { setShowTopicModal(false); };

  // --- Delete Handlers ---
  const confirmDelete = () => {
      if (!deleteItem) return;
      if (deleteItem.type === 'module') {
          deleteTrainingModule(deleteItem.id);
          showToast('Module deleted');
      } else {
          deleteTrainingTopic(deleteItem.id);
          showToast('Topic deleted');
      }
      setDeleteItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <BackButton />
           <div>
             <h1 className="text-3xl font-bold text-gray-900">Curriculum Manager</h1>
             <p className="text-gray-500">Define training modules, topics, and syllabus structure.</p>
           </div>
        </div>
        {isAdmin && <Button onClick={openAddModule}>+ New Module</Button>}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedModules.map(module => (
          <Card key={module.id} className="border-l-4 border-l-spr-600">
             <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
                <div>
                   <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <span className="bg-spr-100 text-spr-800 text-xs px-2 py-1 rounded-full">Module {module.order}</span>
                     {module.title}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <button onClick={() => openEditModule(module)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Edit Module">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => setDeleteItem({ id: module.id, type: 'module' })} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Delete Module">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <Button variant="secondary" className="text-xs ml-2" onClick={() => openAddTopic(module.id)}>+ Add Topic</Button>
                    </div>
                )}
             </div>

             <div className="space-y-2">
                {trainingTopics.filter(t => t.moduleId === module.id).map((topic, idx) => (
                   <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                         <span className="text-gray-400 font-mono text-xs">{idx + 1}.</span>
                         <span className="text-gray-800 font-medium">{topic.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{topic.estimatedHours} hrs</span>
                          {isAdmin && (
                              <div className="hidden group-hover:flex gap-1">
                                  <button onClick={() => openEditTopic(topic)} className="text-blue-500 hover:text-blue-700 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                  <button onClick={() => setDeleteItem({ id: topic.id, type: 'topic' })} className="text-red-500 hover:text-red-700 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                              </div>
                          )}
                      </div>
                   </div>
                ))}
                {trainingTopics.filter(t => t.moduleId === module.id).length === 0 && (
                   <p className="text-sm text-gray-400 italic p-2">No topics defined yet.</p>
                )}
             </div>
          </Card>
        ))}
      </div>

      {/* Module Modal */}
      <Modal isOpen={showModuleModal} onClose={closeModuleModal} title={editingModuleId ? "Edit Training Module" : "Add Training Module"}>
         <form onSubmit={handleSaveModule}>
            <Input label="Module Title" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} required placeholder="e.g. Automation Testing" />
            <Input label="Description" value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} placeholder="Short summary..." />
            <div className="flex justify-end gap-2 mt-4">
               <Button type="button" variant="secondary" onClick={closeModuleModal}>Cancel</Button>
               <Button type="submit">{editingModuleId ? 'Update Module' : 'Create Module'}</Button>
            </div>
         </form>
      </Modal>

      {/* Topic Modal */}
      <Modal isOpen={showTopicModal} onClose={closeTopicModal} title={editingTopicId ? "Edit Topic" : "Add Topic"}>
         <form onSubmit={handleSaveTopic}>
            <Input label="Topic Title" value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} required placeholder="e.g. Writing Test Scripts" />
            <Input type="number" label="Estimated Hours" value={newTopicHours} onChange={e => setNewTopicHours(parseInt(e.target.value))} required />
            <div className="flex justify-end gap-2 mt-4">
               <Button type="button" variant="secondary" onClick={closeTopicModal}>Cancel</Button>
               <Button type="submit">{editingTopicId ? 'Update Topic' : 'Add Topic'}</Button>
            </div>
         </form>
      </Modal>

      <ConfirmationModal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={confirmDelete} 
        title="Confirm Deletion" 
        message={`Are you sure you want to delete this ${deleteItem?.type}?`} 
      />
    </div>
  );
};
