import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, Button } from './Components';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavItem: React.FC<{ to: string; icon?: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (location.pathname.startsWith(to) && to !== '/' && to !== '/candidates');
  // Specific fix for candidates list vs info: Info is /candidates/info, List is /candidates. 
  // If to is /candidates, strictly check equality or ensure it doesn't match /candidates/info if that's separate.
  const isReallyActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors mb-1 font-medium text-sm ${isReallyActive ? 'bg-spr-accent text-white shadow-md' : 'text-gray-600 hover:bg-spr-50 hover:text-spr-900'}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

const CollapsibleGroup: React.FC<{ title: string; icon: React.ReactNode; initialOpen: boolean; children: React.ReactNode }> = ({ title, icon, initialOpen, children }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-spr-50 rounded-lg transition-colors group ${isOpen ? 'bg-spr-50' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`text-gray-500 group-hover:text-spr-600 ${isOpen ? 'text-spr-600' : ''}`}>{icon}</div>
          <span className={`text-sm ${isOpen ? 'font-bold text-gray-900' : 'font-medium'}`}>{title}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        <div className="pl-4 border-l-2 border-spr-100 ml-6 space-y-1">{children}</div>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  const closeMobile = () => setMobileMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-20">
         <Logo size="sm" />
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
         </button>
      </div>

      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex-shrink-0 fixed md:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-100 hidden md:block">
          <Logo />
        </div>
        <nav className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
          {user.role !== 'candidate' ? (
            <>
              {/* Overview - Collapsed by default */}
              <CollapsibleGroup title="Overview" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} initialOpen={false}>
                <NavItem to="/dashboard" label="Dashboard" onClick={closeMobile} />
                <NavItem to="/address-book" label="Address Book" onClick={closeMobile} />
              </CollapsibleGroup>

              {/* Candidates Section - Collapsed by default */}
              <CollapsibleGroup title="Candidates" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} initialOpen={false}>
                <NavItem to="/candidates" label="Candidate List" onClick={closeMobile} />
                <NavItem to="/candidates/info" label="Candidate Info (Profile)" onClick={closeMobile} />
              </CollapsibleGroup>

              {/* Training & Placement - Collapsed by default */}
              <CollapsibleGroup title="Training & Placement" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} initialOpen={false}>
                <NavItem to="/training/interviews" label="Interviews & Resumes" onClick={closeMobile} />
                <NavItem to="/training/monitor" label="Progress Monitor" onClick={closeMobile} />
                <NavItem to="/training/attendance" label="Class Attendance" onClick={closeMobile} />
                <NavItem to="/training/curriculum" label="Curriculum" onClick={closeMobile} />
                <NavItem to="/training/interview-questions" label="Interview Prep" onClick={closeMobile} />
              </CollapsibleGroup>

              {/* Finance - Collapsed by default */}
              <CollapsibleGroup title="Finance" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} initialOpen={false}>
                <NavItem to="/finance/transactions" label="Transactions" onClick={closeMobile} />
                <NavItem to="/finance/accounts" label="Ledger Accounts" onClick={closeMobile} />
                <NavItem to="/finance/payroll" label="Payroll" onClick={closeMobile} />
                <NavItem to="/finance/financial-statements" label="Reports" onClick={closeMobile} />
              </CollapsibleGroup>

              {/* Administration - Collapsed by default */}
              <CollapsibleGroup title="Administration" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} initialOpen={false}>
                <NavItem to="/admin/users" label="User Management" onClick={closeMobile} />
                <NavItem to="/admin/logs" label="System Logs" onClick={closeMobile} />
                <NavItem to="/admin/cloud" label="Cloud Setup" onClick={closeMobile} />
              </CollapsibleGroup>
            </>
          ) : (
            <>
              {/* Candidate Menu */}
              <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase">Student Portal</div>
              <NavItem to="/candidates/info" label="My Profile" onClick={closeMobile} />
              <NavItem to="/training/dashboard" label="Training Dashboard" onClick={closeMobile} />
              <NavItem to="/training/interview-questions" label="Interview Prep" onClick={closeMobile} />
              <NavItem to="/training/curriculum" label="Curriculum" onClick={closeMobile} />
            </>
          )}

          <div className="mt-8 px-4 pb-4">
             <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
               <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
               <p className="text-xs text-gray-500 capitalize">{user.role}</p>
             </div>
             <Button variant="danger" className="w-full text-sm" onClick={handleLogout}>Sign Out</Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen w-full">
         <div className="max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
};