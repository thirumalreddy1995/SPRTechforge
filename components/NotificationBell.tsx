import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppNotification, NotificationType } from '../types';

const typeIcon: Record<NotificationType, string> = {
  chat: '💬',
  announcement: '📢',
  meeting: '📅',
  email: '✉️',
  system: '⚙️',
};

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

/**
 * Header bell with unread badge + dropdown panel. Notification data flows
 * from the `notifications` Firestore subscription in AppContext; clicking an
 * item marks it read and navigates to its link.
 */
export const NotificationBell: React.FC = () => {
  const { user, notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const visible = useMemo(() => {
    if (!user) return [] as AppNotification[];
    return notifications
      .filter(n => (n.recipientId === user.id || n.recipientId === 'all') && n.actorId !== user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);
  }, [notifications, user]);

  if (!user) return null;

  const handleItemClick = (n: AppNotification) => {
    markNotificationRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed z-50 top-16 left-3 right-3 sm:left-auto sm:right-auto sm:w-[380px] md:left-72 md:top-4 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[70vh]">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              {unreadNotificationCount > 0 && (
                <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                  Mark all read
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {visible.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10">No notifications yet</p>
              ) : visible.map(n => {
                const unread = !n.readBy.includes(user.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 flex gap-3 items-start transition-colors ${unread ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <span className="text-lg leading-none mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm truncate ${unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{n.title}</span>
                      {n.body && <span className="block text-xs text-slate-500 truncate mt-0.5">{n.body}</span>}
                      <span className="block text-[10px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </span>
                    {unread && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
