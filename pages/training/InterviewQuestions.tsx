import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Modal, Input, ConfirmationModal, BackButton, Select } from '../../components/Components';
import * as utils from '../../utils';
import { InterviewModule, InterviewQuestion } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Bulk upload modal — paste text, drop a .txt/.csv, or upload an Excel (.xlsx).
// The xlsx library is dynamic-imported so it only loads when the user opens
// this modal, keeping it out of the main bundle.
// ─────────────────────────────────────────────────────────────────────────────

const parseCsvLine = (line: string): string => {
  // Take the first column. Handles "quoted, with commas" and escaped "" quotes.
  const m = line.match(/^\s*"((?:[^"]|"")*)"\s*(?:,|$)/);
  if (m) return m[1].replace(/""/g, '"').trim();
  const idx = line.indexOf(',');
  return (idx === -1 ? line : line.slice(0, idx)).trim();
};

const stripHeader = (rows: string[]): string[] => {
  if (rows.length > 0 && /^(question|questions|q)\s*$/i.test(rows[0])) return rows.slice(1);
  return rows;
};

const BulkUploadQuestionsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultModuleId?: string;
}> = ({ isOpen, onClose, defaultModuleId }) => {
  const { interviewModules, interviewQuestions, addInterviewQuestionsBulk, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [moduleId, setModuleId] = useState<string>('');
  const [pasteText, setPasteText] = useState('');
  const [parsed, setParsed] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default module on open
  useEffect(() => {
    if (!isOpen) return;
    if (defaultModuleId) setModuleId(defaultModuleId);
    else if (interviewModules.length > 0) setModuleId(interviewModules[0].id);
    setActiveTab('paste');
    setPasteText('');
    setParsed([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen, defaultModuleId]);

  // Re-parse pasted text whenever it changes (only while paste tab is active)
  useEffect(() => {
    if (activeTab !== 'paste') return;
    const lines = pasteText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    setParsed(stripHeader(lines));
  }, [pasteText, activeTab]);

  const handleFile = async (file: File) => {
    const lower = file.name.toLowerCase();
    setFileName(file.name);
    try {
      if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
        const text = await file.text();
        const cells = text
          .split(/\r?\n/)
          .map(parseCsvLine)
          .filter(q => q.length > 0);
        setParsed(stripHeader(cells));
      } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        const xlsx: any = await import('xlsx');
        const data = await file.arrayBuffer();
        const wb = xlsx.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(ws, { header: 1, blankrows: false }) as any[][];
        const cells = rows
          .map(r => String((r && r[0]) ?? '').trim())
          .filter(q => q.length > 0);
        setParsed(stripHeader(cells));
      } else {
        showToast('Unsupported file type. Use .csv, .txt or .xlsx', 'error');
        setParsed([]);
        setFileName('');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Could not read file', 'error');
      setParsed([]);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCommit = async () => {
    if (!moduleId) { showToast('Pick a module first', 'error'); return; }
    if (parsed.length === 0) { showToast('Nothing to import', 'error'); return; }
    setSaving(true);
    try {
      const existing = interviewQuestions.filter(q => q.moduleId === moduleId);
      const startOrder = existing.length > 0 ? Math.max(...existing.map(q => q.order)) : 0;
      const newQs: InterviewQuestion[] = parsed.map((text, i) => ({
        id: utils.generateId(),
        moduleId,
        question: text,
        order: startOrder + i + 1,
      }));
      await addInterviewQuestionsBulk(newQs);
      showToast(`Imported ${newQs.length} question${newQs.length === 1 ? '' : 's'}`, 'success');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Import failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const moduleName = useMemo(
    () => interviewModules.find(m => m.id === moduleId)?.title || '',
    [interviewModules, moduleId]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk upload questions" size="lg">
      <div className="space-y-3">
        {interviewModules.length === 0 ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            You need at least one Interview Module before importing questions. Click "+ Add Module" first.
          </div>
        ) : (
          <>
            <Select
              label="Target module"
              value={moduleId}
              onChange={e => setModuleId(e.target.value)}
            >
              {interviewModules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </Select>

            <div className="flex gap-1 border-b border-slate-200">
              {(['paste', 'file'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'paste' ? 'Paste text' : 'Upload file'}
                </button>
              ))}
            </div>

            {activeTab === 'paste' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Paste questions (one per line)
                </label>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder={`What is JSX?\nExplain the virtual DOM\nDifference between useEffect and useLayoutEffect\n…`}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Empty lines are ignored. If the first line is "Question" (header), it's skipped automatically. Works for Notepad, WordPad, anywhere you have a list of questions.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload a file (.xlsx, .csv, or .txt)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
                  >
                    Choose file…
                  </button>
                  <span className="text-xs text-slate-500 truncate">{fileName || 'No file chosen'}</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFilePick}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  In Excel: put one question per row in the first column. A "Question" header row is optional and will be skipped if present. Other columns are ignored.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Preview ({parsed.length} question{parsed.length === 1 ? '' : 's'})
                </span>
                {moduleName && (
                  <span className="text-[11px] text-slate-500">Target: <strong>{moduleName}</strong></span>
                )}
              </div>
              {parsed.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center">
                  Nothing parsed yet. {activeTab === 'paste' ? 'Paste some questions above.' : 'Pick a file above.'}
                </p>
              ) : (
                <ol className="text-sm text-slate-800 max-h-40 overflow-y-auto space-y-0.5 list-decimal pl-5">
                  {parsed.slice(0, 50).map((q, i) => (
                    <li key={i} className="truncate" title={q}>{q}</li>
                  ))}
                  {parsed.length > 50 && (
                    <li className="list-none text-xs text-slate-500 italic">…and {parsed.length - 50} more</li>
                  )}
                </ol>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleCommit}
                disabled={saving || parsed.length === 0 || !moduleId}
              >
                {saving ? 'Importing…' : `Import ${parsed.length || ''} ${parsed.length === 1 ? 'question' : 'questions'}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

const COLORS = [
  { label: 'Orange', value: 'border-l-orange-500' },
  { label: 'Green', value: 'border-l-green-500' },
  { label: 'Blue', value: 'border-l-blue-500' },
  { label: 'Purple', value: 'border-l-purple-500' },
  { label: 'Red', value: 'border-l-red-500' },
  { label: 'Indigo', value: 'border-l-indigo-500' },
];

export const InterviewQuestions: React.FC = () => {
  const { 
    user, showToast, 
    interviewModules, addInterviewModule, updateInterviewModule, deleteInterviewModule,
    interviewQuestions, addInterviewQuestion, deleteInterviewQuestion 
  } = useApp();

  // --- Module State ---
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleColor, setModuleColor] = useState('border-l-blue-500');

  // --- Question State ---
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');

  // --- Delete Confirmation State ---
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  
  // --- Selection State for Batch Delete ---
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // --- Bulk Upload State ---
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = user?.role === 'admin';

  // --- Logic ---

  const handleAskAI = async (question: string) => {
    const prompt = `${question} Explain this interview question in detail with examples.`;
    try {
        await navigator.clipboard.writeText(prompt);
        showToast('Copied! Please paste (Ctrl+V) in ChatGPT if it does not auto-fill.', 'info');
    } catch (err) { console.error('Copy failed', err); }
    
    const encodedQuery = encodeURIComponent(prompt);
    // Redirect to ChatGPT
    window.open(`https://chatgpt.com/?q=${encodedQuery}&hints=search`, '_blank');
  };

  const saveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    if (editingModuleId) {
       const existing = interviewModules.find(m => m.id === editingModuleId);
       if (existing) {
          updateInterviewModule({ ...existing, title: moduleTitle, color: moduleColor });
          showToast('Module updated successfully');
       }
    } else {
       addInterviewModule({
          id: utils.generateId(),
          title: moduleTitle,
          color: moduleColor,
          order: interviewModules.length + 1
       });
       showToast('Module created successfully');
    }
    setShowModuleModal(false);
    resetModuleForm();
  };

  const handleDeleteModule = () => {
    if (deleteModuleId) {
       deleteInterviewModule(deleteModuleId);
       setDeleteModuleId(null);
       showToast('Module deleted');
    }
  };

  const openAddModule = () => {
    resetModuleForm();
    setShowModuleModal(true);
  };

  const openEditModule = (m: InterviewModule) => {
    setEditingModuleId(m.id);
    setModuleTitle(m.title);
    setModuleColor(m.color);
    setShowModuleModal(true);
  };

  const resetModuleForm = () => {
    setEditingModuleId(null);
    setModuleTitle('');
    setModuleColor('border-l-blue-500');
  };

  const openAddQuestion = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setQuestionText('');
    setShowQuestionModal(true);
  };

  const saveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !activeModuleId) return;
    
    // Find current max order
    const existingQs = interviewQuestions.filter(q => q.moduleId === activeModuleId);
    const maxOrder = existingQs.length > 0 ? Math.max(...existingQs.map(q => q.order)) : 0;

    addInterviewQuestion({
       id: utils.generateId(),
       moduleId: activeModuleId,
       question: questionText,
       order: maxOrder + 1
    });
    showToast('Question added');
    setShowQuestionModal(false);
    setQuestionText('');
  };

  // --- Checkbox Selection Logic ---
  const toggleSelection = (id: string) => {
    setSelectedQuestions(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = (moduleId: string) => {
    if (!window.confirm("Delete selected questions?")) return;
    
    const idsToDelete = selectedQuestions.filter(id => {
        const q = interviewQuestions.find(iq => iq.id === id);
        return q && q.moduleId === moduleId;
    });

    idsToDelete.forEach(id => deleteInterviewQuestion(id));
    
    // Clear deleted items from selection
    setSelectedQuestions(prev => prev.filter(id => !idsToDelete.includes(id)));
    showToast(`${idsToDelete.length} questions deleted`);
  };

  const sortedModules = [...interviewModules].sort((a,b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interview Preparation</h1>
            <p className="text-gray-500">Click on any question to ask ChatGPT AI for a detailed answer.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {isAdmin && (
               <>
                  <Button variant="secondary" onClick={() => setShowBulkUpload(true)} title="Import many questions from Excel, CSV, or pasted text">
                     <span className="inline-flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                        Bulk Upload
                     </span>
                  </Button>
                  <Button onClick={openAddModule}>+ Add Module</Button>
               </>
            )}
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>Powered by ChatGPT 5.1</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedModules.map((mod) => {
           const moduleQuestions = interviewQuestions
              .filter(q => q.moduleId === mod.id)
              .sort((a, b) => a.order - b.order);
           
           // Check if any question in this module is selected
           const hasSelection = moduleQuestions.some(q => selectedQuestions.includes(q.id));

           return (
             <Card key={mod.id} className={`border-l-4 ${mod.color} relative group-card h-full flex flex-col`}>
               <div className="flex justify-between items-start mb-4 pb-2 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">{mod.title}</h3>
                  {isAdmin && (
                     <div className="flex gap-1">
                        <button type="button" onClick={() => openEditModule(mod)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Edit Module">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button type="button" onClick={() => setDeleteModuleId(mod.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Delete Module">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                  )}
               </div>

               <div className="space-y-3 flex-1">
                 {moduleQuestions.map((q) => (
                   <div key={q.id} className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-200">
                     
                     {/* Left: Checkbox for Admin */}
                     {isAdmin && (
                        <div className="pl-3 pr-1 py-3 bg-gray-50 border-r border-gray-100 flex items-center">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 text-spr-600 rounded border-gray-300 focus:ring-spr-500 cursor-pointer"
                                checked={selectedQuestions.includes(q.id)}
                                onChange={() => toggleSelection(q.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                     )}

                     {/* Center: Clickable Question Text (AI Trigger) */}
                     <button 
                       onClick={() => handleAskAI(q.question)}
                       className="flex-1 text-left p-3 flex justify-between items-center group hover:bg-gray-50 transition-colors focus:outline-none"
                       title="Click to ask ChatGPT"
                     >
                       <span className="font-medium text-gray-800 text-sm pr-2 group-hover:text-emerald-700 transition-colors">{q.question}</span>
                       <span className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                           </svg>
                       </span>
                     </button>
                   </div>
                 ))}
                 
                 {moduleQuestions.length === 0 && <p className="text-gray-400 italic text-sm text-center py-4">No questions added yet.</p>}
               </div>

               {/* Footer: Admin Controls (Batch Delete & Add) */}
               {isAdmin && (
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      {/* Batch Delete Button (Trash Can) - Visible only if selection exists */}
                      {hasSelection && (
                          <button 
                             onClick={() => handleDeleteSelected(mod.id)}
                             className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-200 animate-fade-in"
                             title="Delete Selected Questions"
                          >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                          </button>
                      )}

                      {/* Add Question Button (+) */}
                      <button 
                         onClick={() => openAddQuestion(mod.id)}
                         className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-spr-600 hover:text-white transition-all shadow-sm border border-gray-300"
                         title="Add Question"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                         </svg>
                      </button>
                  </div>
               )}
             </Card>
           );
        })}
      </div>

      {/* Module Modal */}
      <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title={editingModuleId ? "Edit Module" : "Add New Module"}>
         <form onSubmit={saveModule}>
            <Input label="Module Title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} required placeholder="e.g. Advanced Python" />
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                <div className="flex gap-3 flex-wrap">
                    {COLORS.map(c => (
                        <button
                           key={c.value}
                           type="button"
                           onClick={() => setModuleColor(c.value)}
                           className={`w-8 h-8 rounded-full border-2 ${c.value.replace('border-l-', 'bg-')} ${moduleColor === c.value ? 'border-gray-800 scale-110 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
                           title={c.label}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
               <Button type="button" variant="secondary" onClick={() => setShowModuleModal(false)}>Cancel</Button>
               <Button type="submit">Save Module</Button>
            </div>
         </form>
      </Modal>

      {/* Question Modal */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title="Add Question">
         <form onSubmit={saveQuestion}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea 
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none h-32"
                   value={questionText}
                   onChange={e => setQuestionText(e.target.value)}
                   placeholder="Type your interview question here..."
                   required
                ></textarea>
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <Button type="button" variant="secondary" onClick={() => setShowQuestionModal(false)}>Cancel</Button>
               <Button type="submit">Add Question</Button>
            </div>
         </form>
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteModuleId}
        onClose={() => setDeleteModuleId(null)}
        onConfirm={handleDeleteModule}
        title="Delete Module"
        message="Are you sure you want to delete this module? All contained questions will be lost."
      />

      <BulkUploadQuestionsModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
      />
    </div>
  );
};