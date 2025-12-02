
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal } from '../../components/Components';
import * as utils from '../../utils';
import { TrainingModule, TrainingTopic } from '../../types';

export const Curriculum: React.FC = () => {
  const { trainingModules, addTrainingModule, trainingTopics, addTrainingTopic, showToast } = useApp();
  
  // State for Module Modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  // State for Topic Modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState(1);

  const sortedModules = [...trainingModules].sort((a, b) => a.order - b.order);

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    addTrainingModule({
      id: utils.generateId(),
      title: newModuleTitle,
      description: newModuleDesc,
      order: trainingModules.length + 1
    });
    showToast('Module created successfully');
    setShowModuleModal(false);
    setNewModuleTitle('');
    setNewModuleDesc('');
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !activeModuleId) return;
    addTrainingTopic({
      id: utils.generateId(),
      moduleId: activeModuleId,
      title: newTopicTitle,
      estimatedHours: newTopicHours
    });
    showToast('Topic added successfully');
    setShowTopicModal(false);
    setNewTopicTitle('');
    setNewTopicHours(1);
  };

  const openTopicModal = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setShowTopicModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Curriculum Manager</h1>
           <p className="text-gray-500">Define training modules, topics, and syllabus structure.</p>
        </div>
        <Button onClick={() => setShowModuleModal(true)}>+ New Module</Button>
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
                <Button variant="secondary" className="text-xs" onClick={() => openTopicModal(module.id)}>+ Add Topic</Button>
             </div>

             <div className="space-y-2">
                {trainingTopics.filter(t => t.moduleId === module.id).map((topic, idx) => (
                   <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                         <span className="text-gray-400 font-mono text-xs">{idx + 1}.</span>
                         <span className="text-gray-800 font-medium">{topic.title}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{topic.estimatedHours} hrs</span>
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
      <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title="Add Training Module">
         <form onSubmit={handleAddModule}>
            <Input label="Module Title" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} required placeholder="e.g. Automation Testing" />
            <Input label="Description" value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} placeholder="Short summary..." />
            <div className="flex justify-end gap-2 mt-4">
               <Button type="button" variant="secondary" onClick={() => setShowModuleModal(false)}>Cancel</Button>
               <Button type="submit">Create Module</Button>
            </div>
         </form>
      </Modal>

      {/* Topic Modal */}
      <Modal isOpen={showTopicModal} onClose={() => setShowTopicModal(false)} title="Add Topic">
         <form onSubmit={handleAddTopic}>
            <Input label="Topic Title" value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} required placeholder="e.g. Writing Test Scripts" />
            <Input type="number" label="Estimated Hours" value={newTopicHours} onChange={e => setNewTopicHours(parseInt(e.target.value))} required />
            <div className="flex justify-end gap-2 mt-4">
               <Button type="button" variant="secondary" onClick={() => setShowTopicModal(false)}>Cancel</Button>
               <Button type="submit">Add Topic</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};