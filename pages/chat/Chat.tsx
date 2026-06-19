import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Card, Input, Modal, SearchInput } from '../../components/Components';
import { Chat, ChatMessage, User } from '../../types';
import { NewOrEditMeetingModal } from '../meetings/Meetings';
import { isMasterUser } from '../../utils';

const ANNOUNCEMENT_CHAT_ID = 'announcements-global';

const formatTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString();
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const chatDisplayName = (chat: Chat, currentUserId: string, users: User[]) => {
  if (chat.type === 'announcement') return chat.name || 'Announcements';
  const otherId = chat.participants.find(p => p !== currentUserId);
  const other = users.find(u => u.id === otherId);
  return other?.name || 'Unknown user';
};

const ChatListItem: React.FC<{
  chat: Chat;
  active: boolean;
  unreadCount: number;
  onClick: () => void;
  currentUserId: string;
  users: User[];
}> = ({ chat, active, unreadCount, onClick, currentUserId, users }) => {
  const name = chatDisplayName(chat, currentUserId, users);
  const isAnn = chat.type === 'announcement';
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex gap-3 items-center ${active ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isAnn ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
        {isAnn ? '📢' : name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <span className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>{name}</span>
          <span className="text-[10px] text-slate-400 shrink-0">{formatTime(chat.lastMessageAt)}</span>
        </div>
        <div className="flex justify-between items-center gap-2 mt-0.5">
          <span className={`text-xs truncate ${unreadCount > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
            {chat.lastMessageText || <span className="italic">No messages yet</span>}
          </span>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const MessageBubble: React.FC<{ msg: ChatMessage; isOwn: boolean; showSender: boolean; onJoinCall: (roomId: string) => void }> = ({ msg, isOwn, showSender, onJoinCall }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && !isOwn && (
          <span className="text-[11px] font-semibold text-slate-500 mb-0.5 px-1">{msg.senderName}</span>
        )}
        <div className={`px-3 py-2 rounded-2xl ${isOwn ? 'bg-blue-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-900 rounded-bl-md'}`}>
          {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
          {msg.callRoomId && (
            <button
              onClick={() => onJoinCall(msg.callRoomId!)}
              className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${isOwn ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Join call
            </button>
          )}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className={`mt-1.5 space-y-1 ${msg.text ? '' : '-my-1'}`}>
              {msg.attachments.map((a, i) => {
                const isImage = a.type.startsWith('image/');
                if (isImage) {
                  return (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={a.url} alt={a.name} className="rounded-lg max-h-48 max-w-full" />
                    </a>
                  );
                }
                return (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${isOwn ? 'bg-blue-700/40 hover:bg-blue-700/60' : 'bg-white hover:bg-slate-200 border border-slate-200'}`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{a.name}</div>
                      <div className={`text-[10px] ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>{formatFileSize(a.size)}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-0.5 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
};

const NewDmModal: React.FC<{ isOpen: boolean; onClose: () => void; onPicked: (userId: string) => void }> = ({ isOpen, onClose, onPicked }) => {
  const { users, user } = useApp();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const me = user?.id;
    const lower = q.trim().toLowerCase();
    return users
      .filter(u => u.id !== me)
      .filter(u => !lower || u.name.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, user?.id, q]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start new conversation" size="sm">
      <div className="space-y-3">
        <SearchInput value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search by name or username..." />
        <div className="max-h-72 overflow-y-auto -mx-2 px-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No users found</p>
          ) : filtered.map(u => (
            <button
              key={u.id}
              onClick={() => { onPicked(u.id); onClose(); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{u.name}</div>
                <div className="text-xs text-slate-500 truncate">{u.username} · {u.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, users, chats, chatMessages, createOrGetDmChat, getOrCreateAnnouncementChat, sendChatMessage, markChatRead, callUser, showToast } = useApp();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [showNewDm, setShowNewDm] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chats.length > 0 || !user) return;
    getOrCreateAnnouncementChat().catch(console.error);
  }, [user, chats.length]);

  const visibleChats = useMemo(() => {
    if (!user) return [];
    return chats
      .filter(c => c.type === 'announcement' || c.participants.includes(user.id))
      .sort((a, b) => {
        if (a.type === 'announcement' && b.type !== 'announcement') return -1;
        if (b.type === 'announcement' && a.type !== 'announcement') return 1;
        const at = a.lastMessageAt || a.createdAt;
        const bt = b.lastMessageAt || b.createdAt;
        return bt.localeCompare(at);
      });
  }, [chats, user]);

  const activeChat = useMemo(() => visibleChats.find(c => c.id === activeChatId) || null, [visibleChats, activeChatId]);

  const activeMessages = useMemo(() => {
    if (!activeChat) return [];
    return chatMessages
      .filter(m => m.chatId === activeChat.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [chatMessages, activeChat]);

  const unreadByChat = useMemo(() => {
    if (!user) return {} as Record<string, number>;
    const out: Record<string, number> = {};
    for (const m of chatMessages) {
      if (m.senderId === user.id) continue;
      if (m.readBy.includes(user.id)) continue;
      out[m.chatId] = (out[m.chatId] || 0) + 1;
    }
    return out;
  }, [chatMessages, user]);

  useEffect(() => {
    if (activeChat && user) markChatRead(activeChat.id);
  }, [activeChat?.id, activeMessages.length, user?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeMessages.length, activeChat?.id]);

  if (!user) return null;

  const canPostInActive = activeChat
    ? activeChat.type === 'announcement'
      ? user.role === 'admin' || isMasterUser(user)
      : activeChat.participants.includes(user.id)
    : false;

  const handlePickDm = async (otherUserId: string) => {
    try {
      const chat = await createOrGetDmChat(otherUserId);
      setActiveChatId(chat.id);
    } catch (e: any) {
      showToast(e.message || 'Failed to start conversation', 'error');
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (!activeChat) return;
    if (!text.trim() && files.length === 0) return;
    setSending(true);
    try {
      await sendChatMessage(activeChat.id, text, files);
      setText('');
      setFiles([]);
    } catch (e: any) {
      showToast(e.message || 'Failed to send', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleJoinCall = (roomId: string) => {
    if (!activeChat) return;
    const otherName = chatDisplayName(activeChat, user.id, users);
    navigate(`/call/${encodeURIComponent(roomId)}?title=${encodeURIComponent(`Call with ${otherName}`)}&returnTo=${encodeURIComponent('/chat')}`);
  };

  const handleStartCall = async () => {
    if (!activeChat || activeChat.type !== 'dm') return;
    const otherId = activeChat.participants.find(id => id !== user.id);
    if (!otherId) return;
    try {
      const invitation = await callUser(otherId, activeChat.id);
      const otherName = chatDisplayName(activeChat, user.id, users);
      navigate(`/call/${encodeURIComponent(invitation.roomId)}?title=${encodeURIComponent(`Calling ${otherName}…`)}&returnTo=${encodeURIComponent('/chat')}&invitationId=${encodeURIComponent(invitation.id)}`);
    } catch (e: any) {
      showToast(e.message || 'Failed to start call', 'error');
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex h-[calc(100vh-180px)] min-h-[500px]">
        <aside className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/60">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Chats</h2>
            <button
              onClick={() => setShowNewDm(true)}
              title="Start new conversation"
              className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {visibleChats.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8 px-3">No conversations yet. Click + to start one.</p>
            ) : visibleChats.map(c => (
              <ChatListItem
                key={c.id}
                chat={c}
                active={activeChatId === c.id}
                unreadCount={unreadByChat[c.id] || 0}
                onClick={() => setActiveChatId(c.id)}
                currentUserId={user.id}
                users={users}
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white">
          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="font-medium">Select a conversation</p>
                <p className="text-xs mt-1">Or click + to start a new one</p>
              </div>
            </div>
          ) : (
            <>
              <header className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${activeChat.type === 'announcement' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {activeChat.type === 'announcement' ? '📢' : chatDisplayName(activeChat, user.id, users).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{chatDisplayName(activeChat, user.id, users)}</h3>
                  <p className="text-xs text-slate-500">
                    {activeChat.type === 'announcement'
                      ? `Broadcast to all users · ${user.role === 'admin' ? 'You can post' : 'Read-only'}`
                      : 'Direct message'}
                  </p>
                </div>
                {activeChat.type === 'dm' && (
                  <>
                    <button
                      onClick={handleStartCall}
                      title="Start an instant video call"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Call
                    </button>
                    <button
                      onClick={() => setShowScheduleMeeting(true)}
                      title="Schedule a meeting with this person"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Schedule
                    </button>
                  </>
                )}
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50/40">
                {activeMessages.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No messages yet. Say hello 👋</p>
                ) : activeMessages.map((m, i) => {
                  const prev = activeMessages[i - 1];
                  const showSender = !prev || prev.senderId !== m.senderId;
                  return <MessageBubble key={m.id} msg={m} isOwn={m.senderId === user.id} showSender={showSender} onJoinCall={handleJoinCall} />;
                })}
              </div>

              {canPostInActive ? (
                <div className="border-t border-slate-200 p-3 bg-white">
                  {files.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-xs">
                          <span className="truncate max-w-[200px]">{f.name}</span>
                          <span className="text-slate-400">({formatFileSize(f.size)})</span>
                          <button
                            onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-red-500"
                            aria-label="Remove"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      title="Attach files"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilePick} />
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={activeChat.type === 'announcement' ? 'Post an announcement...' : 'Type a message...'}
                      rows={1}
                      disabled={sending}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
                      style={{ minHeight: '40px' }}
                    />
                    <Button onClick={handleSend} disabled={sending || (!text.trim() && files.length === 0)} variant="primary">
                      {sending ? '...' : 'Send'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-200 p-3 bg-slate-50 text-center">
                  <p className="text-xs text-slate-500">Only admins can post to Announcements</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      <NewDmModal isOpen={showNewDm} onClose={() => setShowNewDm(false)} onPicked={handlePickDm} />
      <NewOrEditMeetingModal
        isOpen={showScheduleMeeting}
        onClose={() => setShowScheduleMeeting(false)}
        defaultParticipantIds={
          activeChat?.type === 'dm'
            ? activeChat.participants.filter(id => id !== user.id)
            : undefined
        }
      />
    </Card>
  );
};
