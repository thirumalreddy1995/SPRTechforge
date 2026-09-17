// Small shared UI pieces for the events module — badges, textarea, copy
// button, share links. Visual language matches components/Components.tsx.

import React, { useState } from 'react';
import { EventLifecycle, EventStatus, EventType, SprEvent } from '../types';
import { EVENT_TYPE_LABELS } from '../lib/slug';
import { lifecycleOf } from '../lib/validate';
import { formatISTRange } from '../lib/datetime';

export const TYPE_BADGE_STYLES: Record<EventType, string> = {
  webinar: 'bg-blue-100 text-blue-700',
  demo_class: 'bg-purple-100 text-purple-700',
  seminar: 'bg-emerald-100 text-emerald-700',
  workshop: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

export const TypeBadge: React.FC<{ type: EventType }> = ({ type }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${TYPE_BADGE_STYLES[type]}`}>
    {EVENT_TYPE_LABELS[type]}
  </span>
);

/** Combined stored-status + computed-lifecycle badge for admin views. */
export const StatusBadge: React.FC<{ ev: Pick<SprEvent, 'status' | 'startAt' | 'endAt'> }> = ({ ev }) => {
  if (ev.status === 'draft') return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-200 text-gray-700">DRAFT</span>;
  if (ev.status === 'cancelled') return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">CANCELLED</span>;
  const phase: EventLifecycle = lifecycleOf(ev);
  if (phase === 'live') return <LiveBadge />;
  if (phase === 'past') return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600">COMPLETED</span>;
  return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">PUBLISHED</span>;
};

export const LiveBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">
    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    LIVE NOW
  </span>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }> = ({ label, hint, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors shadow-sm text-sm ${className}`}
      {...props}
    />
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

export const CopyButton: React.FC<{ text: string; label?: string; className?: string }> = ({ text, label = 'Copy', className = '' }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // http/permission fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={copy}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} ${className}`}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
};

// ---------- icons (inline SVG, not emoji) ----------
// Emoji were replaced on purpose: the 📅 glyph renders as a calendar showing
// a fixed date (17 on Apple, 31 on Google) and registrants read it as the
// event date. SVGs look the same on every device.

const iconCls = 'w-4 h-4 shrink-0';
export const IconCalendar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`${iconCls} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
export const IconClock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`${iconCls} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const IconVideo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`${iconCls} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
export const IconPin: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`${iconCls} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
export const IconMic: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`${iconCls} ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
);

/** One line of event facts: icon + text, used on the public pages for a consistent look. */
export const DetailRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode; strong?: boolean }> = ({ icon, children, strong }) => (
  <div className={`flex items-start gap-2.5 ${strong ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
    <span className="mt-0.5 text-blue-600">{icon}</span>
    <span className="min-w-0">{children}</span>
  </div>
);

/** Support line shown in public footers. */
export const CONTACT = { adminEmail: 'admin@sprtechforge.com', hrEmail: 'hr@sprtechforge.com', phoneDisplay: '+91 82972 76500', phoneTel: '+918297276500', mapUrl: 'https://maps.app.goo.gl/diXNusi9LLbdN2ZdA', address: '202, Above Union Bank, Near Forum Sujana Mall, KPHB 6th Phase, Kukatpally, Hyderabad 500085' };
export const PublicFooter: React.FC = () => (
  <footer className="text-center text-xs text-gray-400 mt-10 space-y-1.5 pb-4">
    <p>SPR TechForge · Software Testing Training &amp; Careers</p>
    <p>
      Need help? <a className="text-blue-600 font-semibold" href={`mailto:${CONTACT.adminEmail}`}>{CONTACT.adminEmail}</a>
      {' · '}<a className="text-blue-600 font-semibold" href={`mailto:${CONTACT.hrEmail}`}>{CONTACT.hrEmail}</a>
      {' · '}<a className="text-blue-600 font-semibold" href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phoneDisplay}</a>
    </p>
    <p><a className="text-blue-600 font-semibold" href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer">📍 {CONTACT.address}</a></p>
  </footer>
);

/** The public registration URL for an event (HashRouter-aware). */
export const publicEventUrl = (slug: string): string =>
  `${window.location.origin}${window.location.pathname}#/events/${slug}`;

export const whatsAppShareUrl = (text: string): string =>
  `https://wa.me/?text=${encodeURIComponent(text)}`;

/**
 * The message pasted into WhatsApp / copied by admins. Plain text on purpose:
 * emoji were showing up as "?" boxes for recipients whose devices lack the
 * glyphs (and after some copy/paste paths), so the share text uses none.
 */
export const buildShareText = (ev: Pick<SprEvent, 'title' | 'slug' | 'startAt' | 'endAt'>, url = publicEventUrl(ev.slug)): string =>
  [
    ev.title,
    formatISTRange(ev.startAt, ev.endAt),
    'Free registration - limited seats!',
    `Register here: ${url}`,
  ].join('\n');

/** Consistent field-error line under inputs. */
export const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-xs text-red-600 font-semibold -mt-3 mb-3">{msg}</p> : null;

export const EmptyState: React.FC<{ icon: string; title: string; sub?: string; children?: React.ReactNode }> = ({ icon, title, sub, children }) => (
  <div className="text-center py-14 px-4">
    <div className="text-5xl mb-3">{icon}</div>
    <p className="font-bold text-gray-700">{title}</p>
    {sub && <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{sub}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);
