// Seminar module — public surface. App.tsx imports ONLY from this file, so
// removing the module = delete seminar/, drop these routes from App.tsx and
// the nav group from Layout.tsx.

export { SeminarProvider } from './context/SeminarContext';
export { SeminarDashboard } from './pages/SeminarDashboard';
export { SeminarImport } from './pages/SeminarImport';
export { SeminarSettingsPage } from './pages/SeminarSettings';
export { SeminarCampaign } from './pages/SeminarCampaign';
export { SeminarQuestions } from './pages/SeminarQuestions';
export { SeminarCandidates } from './pages/SeminarCandidates';
export { SeminarRegistrationPage } from './pages/SeminarRegistrationPage';
