import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastOverlay } from './components/Components';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { SeminarProvider } from './seminar/context/SeminarContext';
import { isMasterUser } from './utils';

// Public, no-login pages stay in the main bundle — the shared registration
// link must paint as fast as possible for someone opening it on a phone.
import { PublicEventsList } from './events/pages/PublicEventsList';
import { PublicEventPage } from './events/pages/PublicEventPage';

// Everything behind a login is code-split: a public visitor never downloads
// finance, chat, training or admin screens. `named` adapts the project's
// named exports to React.lazy's default-export contract.
const named = <T extends Record<string, any>>(loader: () => Promise<T>, key: keyof T) =>
  lazy(async () => ({ default: (await loader())[key] as React.ComponentType<any> }));

// The staff shell (sidebar, notification bell, call overlay) is only needed after login.
const Layout = named(() => import('./components/Layout'), 'Layout');
const IncomingCallOverlay = named(() => import('./pages/spconnect/IncomingCallOverlay'), 'IncomingCallOverlay');

const Dashboard = named(() => import('./pages/Dashboard'), 'Dashboard');
const CandidateList = named(() => import('./pages/candidates/CandidateList'), 'CandidateList');
const CandidateInfo = named(() => import('./pages/candidates/CandidateInfo'), 'CandidateInfo');
const AddCandidate = named(() => import('./pages/candidates/AddCandidate'), 'AddCandidate');
const CandidateAgreement = named(() => import('./pages/candidates/CandidateAgreement'), 'CandidateAgreement');
const EnquiryPage = named(() => import('./pages/candidates/Enquiry'), 'EnquiryPage');
const TransactionList = named(() => import('./pages/finance/TransactionList'), 'TransactionList');
const AddTransaction = named(() => import('./pages/finance/AddTransaction'), 'AddTransaction');
const AccountList = named(() => import('./pages/finance/AccountList'), 'AccountList');
const AddAccount = named(() => import('./pages/finance/AddAccount'), 'AddAccount');
const AccountStatement = named(() => import('./pages/finance/AccountStatement'), 'AccountStatement');
const FinancialStatements = named(() => import('./pages/finance/FinancialStatements'), 'FinancialStatements');
const Payroll = named(() => import('./pages/finance/Payroll'), 'Payroll');
const FinanceDashboard = named(() => import('./pages/finance/FinanceDashboard'), 'FinanceDashboard');
const Reports = named(() => import('./pages/Reports'), 'Reports');
const AddressBook = named(() => import('./pages/AddressBook'), 'AddressBook');
const UserList = named(() => import('./pages/admin/UserList'), 'UserList');
const AddUser = named(() => import('./pages/admin/AddUser'), 'AddUser');
const ActivityLogs = named(() => import('./pages/admin/ActivityLogs'), 'ActivityLogs');
const TestRunner = named(() => import('./pages/admin/TestRunner'), 'TestRunner');
const CloudSetup = named(() => import('./pages/admin/CloudSetup'), 'CloudSetup');
const CommSettings = named(() => import('./pages/admin/CommSettings'), 'CommSettings');
const PortalAgreement = named(() => import('./pages/public/PortalAgreement'), 'PortalAgreement');
const Curriculum = named(() => import('./pages/training/Curriculum'), 'Curriculum');
const CandidateDashboard = named(() => import('./pages/training/CandidateDashboard'), 'CandidateDashboard');
const ProgressMonitor = named(() => import('./pages/training/ProgressMonitor'), 'ProgressMonitor');
const AttendanceSheet = named(() => import('./pages/training/AttendanceSheet'), 'AttendanceSheet');
const InterviewQuestions = named(() => import('./pages/training/InterviewQuestions'), 'InterviewQuestions');
const Interviews = named(() => import('./pages/training/Interviews'), 'Interviews');
const InterviewPrepModule = named(() => import('./pages/training/InterviewPrepModule'), 'InterviewPrepModule');
const WebLeadsPage = named(() => import('./pages/WebLeads'), 'WebLeadsPage');
const ChatPage = named(() => import('./pages/chat/Chat'), 'ChatPage');
const MeetingsPage = named(() => import('./pages/meetings/Meetings'), 'MeetingsPage');
const EmailPage = named(() => import('./pages/spconnect/Email'), 'EmailPage');
const CallRoom = named(() => import('./pages/spconnect/CallRoom'), 'CallRoom');

const EventsAdminList = named(() => import('./events/pages/EventsAdminList'), 'EventsAdminList');
const EventEditor = named(() => import('./events/pages/EventEditor'), 'EventEditor');
const EventAdminDetail = named(() => import('./events/pages/EventAdminDetail'), 'EventAdminDetail');

const SeminarDashboard = named(() => import('./seminar/pages/SeminarDashboard'), 'SeminarDashboard');
const SeminarImport = named(() => import('./seminar/pages/SeminarImport'), 'SeminarImport');
const SeminarSettingsPage = named(() => import('./seminar/pages/SeminarSettings'), 'SeminarSettingsPage');
const SeminarCampaign = named(() => import('./seminar/pages/SeminarCampaign'), 'SeminarCampaign');
const SeminarQuestions = named(() => import('./seminar/pages/SeminarQuestions'), 'SeminarQuestions');
const SeminarCandidates = named(() => import('./seminar/pages/SeminarCandidates'), 'SeminarCandidates');
const SeminarRegistrationPage = named(() => import('./seminar/pages/SeminarRegistrationPage'), 'SeminarRegistrationPage');

const PageLoading = () => <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useApp();
  if (!isInitialized) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useApp();
  if (!isInitialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  const hasAccess = user.role === 'admin' || user.modules.includes('users');
  if (!hasAccess) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const MasterRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useApp();
  if (!isInitialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  // G-06: master gate now reads the isMaster flag on the user record. Server-side
  // enforcement of the same predicate lands with G-02 Firestore rules.
  if (!isMasterUser(user)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal/agreement/:id" element={<PortalAgreement />} />

        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

        {/* Candidate Section */}
        <Route path="/candidates" element={<ProtectedRoute><Layout><CandidateList /></Layout></ProtectedRoute>} />
        <Route path="/candidates/info" element={<ProtectedRoute><Layout><CandidateInfo /></Layout></ProtectedRoute>} />
        <Route path="/candidates/new" element={<ProtectedRoute><Layout><AddCandidate /></Layout></ProtectedRoute>} />
        <Route path="/candidates/edit/:id" element={<ProtectedRoute><Layout><AddCandidate /></Layout></ProtectedRoute>} />
        <Route path="/candidates/agreement/:id" element={<ProtectedRoute><CandidateAgreement /></ProtectedRoute>} />
        <Route path="/candidates/enquiry" element={<ProtectedRoute><Layout><EnquiryPage /></Layout></ProtectedRoute>} />

        <Route path="/address-book" element={<ProtectedRoute><Layout><AddressBook /></Layout></ProtectedRoute>} />

        {/* Finance Section - Strictly Protected via MasterRoute */}
        <Route path="/finance/dashboard" element={<MasterRoute><Layout><FinanceDashboard /></Layout></MasterRoute>} />
        <Route path="/finance/transactions" element={<MasterRoute><Layout><TransactionList /></Layout></MasterRoute>} />
        <Route path="/finance/transactions/new" element={<MasterRoute><Layout><AddTransaction /></Layout></MasterRoute>} />
        <Route path="/finance/transactions/edit/:id" element={<MasterRoute><Layout><AddTransaction /></Layout></MasterRoute>} />
        <Route path="/finance/accounts" element={<MasterRoute><Layout><AccountList /></Layout></MasterRoute>} />
        <Route path="/finance/accounts/new" element={<MasterRoute><Layout><AddAccount /></Layout></MasterRoute>} />
        <Route path="/finance/accounts/edit/:id" element={<MasterRoute><Layout><AddAccount /></Layout></MasterRoute>} />
        <Route path="/finance/statement/:type/:id" element={<MasterRoute><Layout><AccountStatement /></Layout></MasterRoute>} />
        <Route path="/finance/financial-statements" element={<MasterRoute><Layout><FinancialStatements /></Layout></MasterRoute>} />
        <Route path="/finance/payroll" element={<MasterRoute><Layout><Payroll /></Layout></MasterRoute>} />
        <Route path="/finance/reports" element={<MasterRoute><Layout><Reports /></Layout></MasterRoute>} />

        {/* Admin Section */}
        <Route path="/admin/users" element={<AdminRoute><Layout><UserList /></Layout></AdminRoute>} />
        <Route path="/admin/users/new" element={<AdminRoute><Layout><AddUser /></Layout></AdminRoute>} />
        <Route path="/admin/users/edit/:id" element={<AdminRoute><Layout><AddUser /></Layout></AdminRoute>} />

        {/* Training Section */}
        <Route path="/training/curriculum" element={<ProtectedRoute><Layout><Curriculum /></Layout></ProtectedRoute>} />
        <Route path="/training/monitor" element={<ProtectedRoute><Layout><ProgressMonitor /></Layout></ProtectedRoute>} />
        <Route path="/training/dashboard" element={<ProtectedRoute><Layout><CandidateDashboard /></Layout></ProtectedRoute>} />
        <Route path="/training/attendance" element={<ProtectedRoute><Layout><AttendanceSheet /></Layout></ProtectedRoute>} />
        <Route path="/training/interview-questions" element={<ProtectedRoute><Layout><InterviewQuestions /></Layout></ProtectedRoute>} />
        <Route path="/training/interviews" element={<ProtectedRoute><Layout><Interviews /></Layout></ProtectedRoute>} />
        <Route path="/training/interview-prep" element={<ProtectedRoute><Layout><InterviewPrepModule /></Layout></ProtectedRoute>} />

        <Route path="/web-leads" element={<AdminRoute><Layout><WebLeadsPage /></Layout></AdminRoute>} />

        {/* Seminar module (self-contained in seminar/). Public token page + admin pages. */}
        <Route path="/seminar/s/:token" element={<SeminarRegistrationPage />} />
        <Route path="/seminar/dashboard" element={<AdminRoute><Layout><SeminarProvider><SeminarDashboard /></SeminarProvider></Layout></AdminRoute>} />
        <Route path="/seminar/import" element={<AdminRoute><Layout><SeminarProvider><SeminarImport /></SeminarProvider></Layout></AdminRoute>} />
        <Route path="/seminar/candidates" element={<AdminRoute><Layout><SeminarProvider><SeminarCandidates /></SeminarProvider></Layout></AdminRoute>} />
        <Route path="/seminar/campaign" element={<AdminRoute><Layout><SeminarProvider><SeminarCampaign /></SeminarProvider></Layout></AdminRoute>} />
        <Route path="/seminar/questions" element={<AdminRoute><Layout><SeminarProvider><SeminarQuestions /></SeminarProvider></Layout></AdminRoute>} />
        <Route path="/seminar/settings" element={<AdminRoute><Layout><SeminarProvider><SeminarSettingsPage /></SeminarProvider></Layout></AdminRoute>} />

        {/* Events module (self-contained in events/). Admin management + public pages. */}
        <Route path="/events/manage" element={<AdminRoute><Layout><EventsAdminList /></Layout></AdminRoute>} />
        <Route path="/events/manage/new" element={<AdminRoute><Layout><EventEditor /></Layout></AdminRoute>} />
        <Route path="/events/manage/edit/:id" element={<AdminRoute><Layout><EventEditor /></Layout></AdminRoute>} />
        <Route path="/events/manage/view/:id" element={<AdminRoute><Layout><EventAdminDetail /></Layout></AdminRoute>} />
        {/* Public — anyone with the link, no login */}
        <Route path="/events" element={<PublicEventsList />} />
        <Route path="/events/:slug" element={<PublicEventPage />} />

        {/* Chat */}
        <Route path="/chat" element={<ProtectedRoute><Layout><ChatPage /></Layout></ProtectedRoute>} />

        {/* Meetings */}
        <Route path="/meetings" element={<ProtectedRoute><Layout><MeetingsPage /></Layout></ProtectedRoute>} />

        {/* Email */}
        <Route path="/email" element={<ProtectedRoute><Layout><EmailPage /></Layout></ProtectedRoute>} />

        {/* Video/audio call (Jitsi) - intentionally no Layout, full-screen */}
        <Route path="/call/:roomId" element={<ProtectedRoute><CallRoom /></ProtectedRoute>} />

        {/* Master Section */}
        <Route path="/admin/logs" element={<MasterRoute><Layout><ActivityLogs /></Layout></MasterRoute>} />
        <Route path="/admin/test-runner" element={<MasterRoute><Layout><TestRunner /></Layout></MasterRoute>} />
        <Route path="/admin/cloud" element={<MasterRoute><Layout><CloudSetup /></Layout></MasterRoute>} />
        <Route path="/admin/communication" element={<MasterRoute><Layout><CommSettings /></Layout></MasterRoute>} />
      </Routes>
    </Suspense>
  );
};

/** Loads the call overlay only once someone is logged in — public visitors never need it. */
const StaffOverlays: React.FC = () => {
  const { user } = useApp();
  if (!user) return null;
  return (
    <Suspense fallback={null}>
      <IncomingCallOverlay />
    </Suspense>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ToastOverlay />
        <StaffOverlays />
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
