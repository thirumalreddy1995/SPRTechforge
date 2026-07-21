import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  SeminarCandidate,
  SeminarCampaignLog,
  SeminarQuestion,
  SeminarRegistration,
  SeminarSettings,
} from '../types';
import {
  SEMINAR_COLLECTIONS,
  defaultSeminarSettings,
  saveSeminarDoc,
  saveSeminarSettings,
  subscribeSeminarCollection,
  updateSeminarDoc,
  saveSeminarBatch,
} from '../services/seminarDb';

// Admin-side data provider. Subscribes to the seminar_* collections only while
// a seminar admin page is mounted, so the rest of the app never pays for this
// module's data. The public registration page does NOT use this provider — it
// reads via token-scoped point queries instead.

interface SeminarContextType {
  isLoading: boolean;
  candidates: SeminarCandidate[];
  registrations: SeminarRegistration[];
  questions: SeminarQuestion[];
  campaignLog: SeminarCampaignLog[];
  settings: SeminarSettings;

  saveSettings: (s: SeminarSettings) => Promise<void>;
  upsertCandidates: (items: SeminarCandidate[]) => Promise<void>;
  updateCandidate: (id: string, data: Partial<SeminarCandidate>) => Promise<void>;
  updateQuestion: (id: string, data: Partial<SeminarQuestion>) => Promise<void>;
  addCampaignLog: (log: SeminarCampaignLog) => Promise<void>;
}

const SeminarContext = createContext<SeminarContextType | undefined>(undefined);

export const useSeminar = () => {
  const ctx = useContext(SeminarContext);
  if (!ctx) throw new Error('useSeminar must be used within a SeminarProvider');
  return ctx;
};

export const SeminarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<SeminarCandidate[]>([]);
  const [registrations, setRegistrations] = useState<SeminarRegistration[]>([]);
  const [questions, setQuestions] = useState<SeminarQuestion[]>([]);
  const [campaignLog, setCampaignLog] = useState<SeminarCampaignLog[]>([]);
  const [settings, setSettings] = useState<SeminarSettings>(defaultSeminarSettings());
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const markLoaded = (name: string) => setLoaded(prev => (prev[name] ? prev : { ...prev, [name]: true }));
    const unsubs = [
      subscribeSeminarCollection<SeminarCandidate>(SEMINAR_COLLECTIONS.candidates, items => {
        setCandidates(items);
        markLoaded(SEMINAR_COLLECTIONS.candidates);
      }),
      subscribeSeminarCollection<SeminarRegistration>(SEMINAR_COLLECTIONS.registrations, items => {
        setRegistrations(items);
        markLoaded(SEMINAR_COLLECTIONS.registrations);
      }),
      subscribeSeminarCollection<SeminarQuestion>(SEMINAR_COLLECTIONS.questions, items => {
        setQuestions(items);
        markLoaded(SEMINAR_COLLECTIONS.questions);
      }),
      subscribeSeminarCollection<SeminarCampaignLog>(SEMINAR_COLLECTIONS.campaignLog, items => {
        setCampaignLog(items);
        markLoaded(SEMINAR_COLLECTIONS.campaignLog);
      }),
      subscribeSeminarCollection<SeminarSettings>(SEMINAR_COLLECTIONS.settings, items => {
        const cfg = items.find(i => i.id === 'config');
        if (cfg) setSettings({ ...defaultSeminarSettings(), ...cfg });
        markLoaded(SEMINAR_COLLECTIONS.settings);
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const value: SeminarContextType = {
    isLoading: Object.keys(loaded).length < 5,
    candidates,
    registrations,
    questions,
    campaignLog,
    settings,

    saveSettings: async s => {
      setSettings(s); // optimistic — snapshot listener confirms
      await saveSeminarSettings(s);
    },
    upsertCandidates: items => saveSeminarBatch(SEMINAR_COLLECTIONS.candidates, items),
    updateCandidate: (id, data) => updateSeminarDoc(SEMINAR_COLLECTIONS.candidates, id, data),
    updateQuestion: (id, data) => updateSeminarDoc(SEMINAR_COLLECTIONS.questions, id, data),
    addCampaignLog: log => saveSeminarDoc(SEMINAR_COLLECTIONS.campaignLog, log),
  };

  return <SeminarContext.Provider value={value}>{children}</SeminarContext.Provider>;
};
