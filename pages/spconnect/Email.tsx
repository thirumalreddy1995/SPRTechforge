import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, Input, Modal, SearchInput } from '../../components/Components';
import { EmailAttachment, EmailMessage } from '../../types';
import { emailService } from '../../services/emailService';
import { cloudService } from '../../services/cloud';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const parseSender = (raw: string): { name: string; address: string } => {
  const m = raw.match(/^(.*?)<(.+?)>$/);
  if (m) return { name: m[1].trim().replace(/^"|"$/g, '') || m[2].trim(), address: m[2].trim() };
  return { name: raw, address: raw };
};

const ComposeModal: React.FC<{ isOpen: boolean; onClose: () => void; defaultTo?: string; replyTo?: EmailMessage | null }> = ({ isOpen, onClose, defaultTo, replyTo }) => {
  const { sendEmail, showToast } = useApp();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<EmailAttachment[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (replyTo) {
      const sender = parseSender(replyTo.from);
      setTo(sender.address);
      setSubject(replyTo.subject.toLowerCase().startsWith('re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
      setBody(`\n\n--- On ${new Date(replyTo.date).toLocaleString()}, ${replyTo.from} wrote ---\n${replyTo.snippet || replyTo.body.slice(0, 500)}`);
    } else {
      setTo(defaultTo || '');
      setSubject('');
      setBody('');
    }
    setFiles([]);
    setUploadedAttachments([]);
  }, [isOpen, replyTo, defaultTo]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      showToast('To, subject, and body are required', 'error');
      return;
    }
    setSending(true);
    try {
      const attachments: EmailAttachment[] = [...uploadedAttachments];
      for (const f of files) {
        const path = `emails/outbound/${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;
        const up = await cloudService.uploadFile(path, f);
        attachments.push({ url: up.url, name: up.name, mimeType: up.type || 'application/octet-stream', size: up.size });
      }

      await sendEmail({
        to: to.split(',').map(s => s.trim()).filter(Boolean),
        subject,
        body,
        attachments: attachments.length ? attachments : undefined,
      });

      setUploadedAttachments(attachments);
      showToast('Email sent', 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Send failed', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={replyTo ? 'Reply' : 'New email'} size="lg">
      <div className="space-y-3">
        <Input label="To" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com (comma-separated for multiple)" />
        <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write your message..."
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Attachments ({files.length})</label>
            <label className="text-xs text-blue-600 hover:underline cursor-pointer">
              <input type="file" multiple className="hidden" onChange={handleFilePick} />
              + Add file
            </label>
          </div>
          {files.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="text-slate-400">{formatFileSize(f.size)}</span>
                  <button
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Files upload to Firebase Storage and are fetched by the server before sending. Max 24MB each (Gmail's limit).</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button variant="primary" onClick={handleSend} disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
        </div>
      </div>
    </Modal>
  );
};

const MessageReader: React.FC<{ message: EmailMessage; onReply: () => void; onClose: () => void }> = ({ message, onReply, onClose }) => {
  const sender = parseSender(message.from);
  return (
    <Modal isOpen={!!message} onClose={onClose} title={message.subject || '(no subject)'} size="lg">
      <div className="space-y-3">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              {sender.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">{sender.name}</div>
              <div className="text-xs text-slate-500 truncate">{sender.address}</div>
            </div>
            <div className="text-xs text-slate-500 shrink-0">{new Date(message.date).toLocaleString()}</div>
          </div>
          <div className="text-xs text-slate-500">
            To: {message.to.join(', ')}
            {message.cc && message.cc.length > 0 && <> · Cc: {message.cc.join(', ')}</>}
          </div>
        </div>
        <div className="text-sm text-slate-800 whitespace-pre-wrap break-words max-h-[50vh] overflow-y-auto">
          {message.body}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={onReply}>Reply</Button>
        </div>
      </div>
    </Modal>
  );
};

export const EmailPage: React.FC = () => {
  const { isEmailConfigured, showToast } = useApp();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<EmailMessage | null>(null);

  const refresh = async () => {
    if (!isEmailConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const inbox = await emailService.listInbox();
      setMessages(inbox);
    } catch (e: any) {
      setError(e.message || 'Failed to refresh inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    if (!isEmailConfigured) return;
    const id = window.setInterval(refresh, 30000);
    return () => window.clearInterval(id);
  }, [isEmailConfigured]);

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    if (!lower) return messages;
    return messages.filter(m =>
      m.from.toLowerCase().includes(lower) ||
      m.subject.toLowerCase().includes(lower) ||
      (m.snippet && m.snippet.toLowerCase().includes(lower))
    );
  }, [messages, q]);

  if (!isEmailConfigured) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Email isn't configured yet</h2>
        <p className="text-sm text-slate-600 mb-1">Set up the Google Apps Script email bridge to enable sending and receiving.</p>
        <p className="text-xs text-slate-500 mt-2">See SETUP-EMAIL.md in the repo for step-by-step instructions.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] min-h-[500px]">
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/60">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
              <h2 className="font-bold text-slate-800">Inbox</h2>
              <div className="flex gap-1">
                <button
                  onClick={refresh}
                  disabled={loading}
                  title="Refresh"
                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => { setReplyTo(null); setComposeOpen(true); }}
                  title="Compose"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-3 py-2 border-b border-slate-200">
              <SearchInput value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search inbox…" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="p-3 text-xs text-red-700 bg-red-50 border-b border-red-100">
                  {error}
                </div>
              )}
              {loading && messages.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Loading inbox…</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8 px-3">
                  {messages.length === 0 ? 'No messages in your inbox yet.' : 'No messages match your search.'}
                </p>
              ) : filtered.map(m => {
                const sender = parseSender(m.from);
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={`w-full text-left px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors flex gap-3 ${selected?.id === m.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {sender.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-sm truncate ${m.isRead ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{sender.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatTime(m.date)}</span>
                      </div>
                      <div className={`text-xs truncate ${m.isRead ? 'text-slate-600' : 'font-medium text-slate-800'}`}>{m.subject || '(no subject)'}</div>
                      <div className="text-xs text-slate-500 truncate">{m.snippet}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center px-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium">Select a message</p>
              <p className="text-xs mt-1">Inbox refreshes every 30 seconds.</p>
            </div>
          </section>
        </div>
      </Card>

      <ComposeModal isOpen={composeOpen} onClose={() => { setComposeOpen(false); setReplyTo(null); }} replyTo={replyTo} />
      {selected && (
        <MessageReader
          message={selected}
          onClose={() => setSelected(null)}
          onReply={() => { setReplyTo(selected); setSelected(null); setComposeOpen(true); }}
        />
      )}
    </div>
  );
};
