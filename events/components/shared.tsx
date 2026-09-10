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
