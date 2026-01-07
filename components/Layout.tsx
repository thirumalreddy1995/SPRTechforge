import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, Button } from './Components';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavItem: React.FC<{ 
  to: string; 
  icon?: React.ReactNode; 
  label: string; 
  onClick?: () => void; 
  isSidebarCollapsed?: boolean;
  setIsSidebarCollapsed?: (val: boolean) => void;
}> = ({ to, icon, label, onClick, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const location = useLocation();
  let isActive = location.pathname === to;
  
  if (!isActive && location.pathname.startsWith(to) && to !== '/') {
      if (to === '/candidates' && location.pathname.startsWith('/candidates/info')) {
          isActive = false;
      } else {
          isActive = true;
      }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isSidebarCollapsed && setIsSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
    if (onClick) onClick();
  };

  return (
    <Link 
      to={to} 
      onClick={handleClick}
      title={isSidebarCollapsed ? label : ""}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 mb-1 font-medium text-sm overflow-hidden whitespace-nowrap ${isActive ? 'bg-spr-accent text-white shadow-md' : 'text-gray-600 hover:bg-spr-50 hover:text-spr-900'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
    >
      {icon && (
        <span className={`shrink-0 flex items-center justify-center transition-transform duration-200 ${isSidebarCollapsed ? 'w-10 h-10 bg-gray-50/50 rounded-lg group-hover:scale-110' : 'w-5'}`}>
          <div className={isActive && isSidebarCollapsed ? 'text-white' : ''}>{icon}</div>
        </span>
      )}
      {!isSidebarCollapsed && <span className="transition-opacity duration-200">{label}</span>}
    </Link>
  );
};

interface CollapsibleGroupProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  openGroupId: string | null;
  setOpenGroupId: (id: string | null) => void;
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({ id, title, icon, children, isSidebarCollapsed, setIsSidebarCollapsed, openGroupId, setOpenGroupId }) => {
  const location = useLocation();
  
  const childrenArray = React.Children.toArray(children);
  const hasActiveChild = childrenArray.some((child: any) => {
    if (child.props?.to) {
        return location.pathname === child.props.to || (child.props.to !== '/' && location.pathname.startsWith(child.props.to));
    }
    return false;
  });

  const isOpen = openGroupId === id;

  useEffect(() => {
    if (hasActiveChild && !isSidebarCollapsed && openGroupId === null) {
      setOpenGroupId(id);
    }
  }, [location.pathname, hasActiveChild, isSidebarCollapsed]);

  const handleToggle = () => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setOpenGroupId(id);
      return;
    }
    setOpenGroupId(isOpen ? null : id);
  };

  return (
    <div className="mb-1">
      <button 
        onClick={handleToggle} 
        title={isSidebarCollapsed ? title : ""}
        className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-spr-50 rounded-lg transition-all duration-200 group ${isOpen && !isSidebarCollapsed ? 'bg-spr-50' : ''} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
      >
        <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'w-full justify-center' : ''}`}>
          <div className={`flex items-center justify-center transition-colors ${isOpen && !isSidebarCollapsed ? 'text-spr-600' : 'text-gray-500'} group-hover:text-spr-600 ${isSidebarCollapsed ? 'w-10 h-10 bg-gray-50 rounded-lg scale-110 shadow-sm border border-gray-100' : 'w-5'}`}>
            {icon}
          </div>
          {!isSidebarCollapsed && <span className={`text-sm whitespace-nowrap ${isOpen ? 'font-bold text-gray-900' : 'font-medium'}`}>{title}</span>}
        </div>
        {!isSidebarCollapsed && (
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !isSidebarCollapsed ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        {!isSidebarCollapsed && <div className="pl-4 border-l-2 border-spr-100 ml-6 space-y-1">{children}</div>}
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  const closeMobile = () => setMobileMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); };

  const isMaster = user.username === 'thirumalreddy@sprtechforge.com';

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row text-slate-900 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-40">
         <Logo size="sm" />
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
         </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={closeMobile}></div>
      )}

      <aside className={`bg-white border-r border-gray-200 flex-shrink-0 fixed md:static inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-24' : 'w-64'} ${mobileMenuOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100 hidden md:flex items-center justify-between overflow-hidden relative">
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <Logo size="sm" />
          </div>
          {isSidebarCollapsed && (
             <div className="mx-auto bg-spr-900 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100">SPR</div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-spr-600 hover:bg-spr-50 transition-colors ${isSidebarCollapsed ? 'hidden' : 'block'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          {isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="absolute top-5 right-1 p-1 bg-white border border-gray-200 rounded-full shadow-md text-gray-400 hover:text-spr-600 z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        <nav className="p-3 overflow-y-auto h-[calc(100vh-80px)] scrollbar-hide">
          {user.role !== 'candidate' ? (
            <>
              <CollapsibleGroup 
                id="overview"
                isSidebarCollapsed={isSidebarCollapsed} 
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                openGroupId={openGroupId}
                setOpenGroupId={setOpenGroupId}
                title="Overview" 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
              >
                <NavItem to="/dashboard" label="Dashboard" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                <NavItem to="/address-book" label="Address Book" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
              </CollapsibleGroup>

              <CollapsibleGroup 
                id="candidates"
                isSidebarCollapsed={isSidebarCollapsed} 
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                openGroupId={openGroupId}
                setOpenGroupId={setOpenGroupId}
                title="Candidates" 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              >
                <NavItem to="/candidates" label="Candidate List" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                <NavItem to="/candidates/info" label="Candidate Info (Profile)" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
              </CollapsibleGroup>

              <CollapsibleGroup 
                id="training"
                isSidebarCollapsed={isSidebarCollapsed} 
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                openGroupId={openGroupId}
                setOpenGroupId={setOpenGroupId}
                title="Training" 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              >
                <NavItem to="/training/interviews" label="Interviews & Resumes" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                <NavItem to="/training/monitor" label="Progress Monitor" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                <NavItem to="/training/attendance" label="Class Attendance" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                <NavItem to="/training/curriculum" label="Curriculum" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                <NavItem to="/training/interview-questions" label="Interview Prep" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
              </CollapsibleGroup>

              {isMaster && (
                <CollapsibleGroup 
                  id="finance"
                  isSidebarCollapsed={isSidebarCollapsed} 
                  setIsSidebarCollapsed={setIsSidebarCollapsed}
                  openGroupId={openGroupId}
                  setOpenGroupId={setOpenGroupId}
                  title="Finance" 
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                >
                  <NavItem to="/finance/transactions" label="Transactions" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                  <NavItem to="/finance/accounts" label="Ledger Accounts" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                  <NavItem to="/finance/payroll" label="Payroll" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                  <NavItem to="/finance/financial-statements" label="Reports" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                </CollapsibleGroup>
              )}

              <CollapsibleGroup 
                id="admin"
                isSidebarCollapsed={isSidebarCollapsed} 
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                openGroupId={openGroupId}
                setOpenGroupId={setOpenGroupId}
                title="Admin" 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              >
                <NavItem to="/admin/users" label="Users" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
                {isMaster && <NavItem to="/admin/logs" label="System Logs" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />}
                {isMaster && <NavItem to="/admin/cloud" label="Cloud Setup" onClick={closeMobile} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />}
              </CollapsibleGroup>
            </>
          ) : (
            <>
              {!isSidebarCollapsed && <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase">Student Portal</div>}
              <NavItem isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} to="/candidates/info" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} label="My Profile" onClick={closeMobile} />
              <NavItem isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} to="/training/dashboard" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} label="Training Stats" onClick={closeMobile} />
              <NavItem isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} to="/training/interview-questions" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Interview Prep" onClick={closeMobile} />
              <NavItem isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} to="/training/curriculum" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} label="Curriculum" onClick={closeMobile} />
            </>
          )}

          <div className="mt-8 px-2 pb-4">
             {!isSidebarCollapsed ? (
               <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 overflow-hidden shadow-sm">
                 <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{user.role}</p>
               </div>
             ) : (
               <div className="h-px bg-gray-200 mb-4 mx-2"></div>
             )}
             <button 
                onClick={handleLogout} 
                title="Sign Out"
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors font-bold text-sm text-red-600 hover:bg-red-50 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             >
                <div className={`shrink-0 flex items-center justify-center ${isSidebarCollapsed ? 'w-10 h-10 bg-red-50 rounded-lg shadow-sm border border-red-100' : 'w-5'}`}>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                {!isSidebarCollapsed && <span>Sign Out</span>}
             </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen w-full transition-all duration-300">
         <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};