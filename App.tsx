import React from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { ToastOverlay } from './components/Components';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CandidateList } from './pages/candidates/CandidateList';
import { CandidateInfo } from './pages/candidates/CandidateInfo';
import { AddCandidate } from './pages/candidates/AddCandidate';
import { CandidateAgreement } from './pages/candidates/CandidateAgreement';
import { TransactionList } from './pages/finance/TransactionList';
import { AddTransaction } from './pages/finance/AddTransaction';
import { AccountList } from './pages/finance/AccountList';
import { AddAccount } from './pages/finance/AddAccount';
import { AccountStatement } from './pages/finance/AccountStatement';
import { FinancialStatements } from './pages/finance/FinancialStatements';
import { Payroll } from './pages/finance/Payroll';
import { Reports } from './pages/Reports';
import { AddressBook } from './pages/AddressBook';
import { UserList } from './pages/admin/UserList';
import { AddUser } from './pages/admin/AddUser';
import { ActivityLogs } from './pages/admin/ActivityLogs';
import { TestRunner } from './pages/admin/TestRunner';
import { CloudSetup } from './pages/admin/CloudSetup';
import { PortalAgreement } from './pages/public/PortalAgreement';
import { Curriculum } from './pages/training/Curriculum';
import { CandidateDashboard } from './pages/training/CandidateDashboard';
import { ProgressMonitor } from './pages/training/ProgressMonitor';
import { AttendanceSheet } from './pages/training/AttendanceSheet';
import { InterviewQuestions } from './pages/training/InterviewQuestions';
import { Interviews } from './pages/training/Interviews';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useApp();
  if (!isInitialized) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
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
  // Secure master check based on the specific master username
  if (user.username !== 'thirumalreddy@sprtechforge.com') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
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
      
      <Route path="/address-book" element={<ProtectedRoute><Layout><AddressBook /></Layout></ProtectedRoute>} />

      {/* Finance Section - Strictly Protected via MasterRoute */}
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

      {/* Master Section */}
      <Route path="/admin/logs" element={<MasterRoute><Layout><ActivityLogs /></Layout></MasterRoute>} />
      <Route path="/admin/test-runner" element={<MasterRoute><Layout><TestRunner /></Layout></MasterRoute>} />
      <Route path="/admin/cloud" element={<MasterRoute><Layout><CloudSetup /></Layout></MasterRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ToastOverlay />
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}