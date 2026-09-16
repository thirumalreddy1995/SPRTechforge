// Auto-playing photo carousel for the Community home. Everyone sees the
// slides; staff/admins manage them (add several at once, caption, reorder,
// remove) through a small modal. Pauses while hovered or while a finger is
// on it; supports swipe on phones and arrow keys when focused.

import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal } from '../../components/Components';
import { GalleryImage } from '../types';

const AUTOPLAY_MS = 5000;

interface Props {
  images: GalleryImage[];
  canManage: boolean;
  uploading: boolean;
  onAdd: (files: File[]) => Promise<void>;
  onCaption: (id: string, caption: string) => Promise<void>;
  onMove: (id: string, direction: -1 | 1) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export const PhotoCarousel: React.FC<Props> = ({ images, canManage, uploading, onAdd, onCaption, onMove, onRemove }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);

  useEffect(() => {
    if (paused || manageOpen || count < 2) return;
    const t = setInterval(() => setIndex(i => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, manageOpen, count]);

  const go = (delta: number) => { if (count) setIndex(i => (i + delta + count) % count); };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current; touchStartX.current = null; setPaused(false);
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  if (count === 0 && !canManage) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="font-black text-gray-900">📸 Moments at SPR Techforge</h2>
        {canManage && (
          <button onClick={() => setManageOpen(true)} className="text-xs font-bold text-blue-600 hover:underline">
            {count === 0 ? '+ Add photos' : 'Manage photos'}
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="m-5 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="font-bold text-gray-700">No photos yet</p>
          <p className="text-sm text-gray-500 mt-1">Upload pictures from classes, seminars and celebrations. They slide here for every user.</p>
          <Button className="mt-4 mx-auto" onClick={() => setManageOpen(true)}>+ Add photos</Button>
        </div>
      ) : (
        <div
          className="relative m-4 mt-3 rounded-xl overflow-hidden bg-slate-900 select-none outline-none"
          style={{ aspectRatio: '16 / 9' }}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Photo carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((img, i) => (
            <img
              key={img.id}
              src={img.imageUrl}
              alt={img.caption || `Photo ${i + 1}`}
              loading={i === index ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
              draggable={false}
            />
          ))}
          {images[index]?.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-8 pt-10">
              <p className="text-white font-semibold text-sm sm:text-base drop-shadow">{images[index].caption}</p>
            </div>
          )}
          {count > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 font-black shadow">‹</button>
              <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 font-black shadow">›</button>
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setIndex(i)} aria-label={`Go to photo ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Manage modal */}
      <Modal isOpen={manageOpen} onClose={() => setManageOpen(false)} title="Photos on the home page" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Pictures slide automatically every 5 seconds for every user. JPG, PNG or WebP; several can be selected at once.</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { const files = Array.from(e.target.files || []); if (files.length) onAdd(files).finally(() => { if (fileRef.current) fileRef.current.value = ''; }); }} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : '+ Add photos'}</Button>
          {images.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No photos yet.</p>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {images.map((img, i) => (
                <div key={img.id} className="flex gap-3 items-start border border-gray-200 rounded-xl p-3">
                  <img src={img.imageUrl} alt="" className="w-28 h-20 object-cover rounded-lg shrink-0 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <Input
                      label={`Caption (photo ${i + 1})`}
                      value={captions[img.id] ?? img.caption}
                      onChange={e => setCaptions(c => ({ ...c, [img.id]: e.target.value }))}
                      onBlur={e => { const v = e.currentTarget.value.trim(); if (v !== img.caption) onCaption(img.id, v); }}
                      onKeyDown={e => { if (e.key === 'Enter') { const v = e.currentTarget.value.trim(); if (v !== img.caption) onCaption(img.id, v); e.currentTarget.blur(); } }}
                      placeholder="e.g. Batch 12 — Selenium demo day"
                      maxLength={120}
                    />
                    <div className="flex gap-2 text-xs -mt-2">
                      <button onClick={() => onMove(img.id, -1)} disabled={i === 0} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40">↑ Earlier</button>
                      <button onClick={() => onMove(img.id, 1)} disabled={i === images.length - 1} className="px-2 py-1 rounded-lg bg-gray-100 disabled:opacity-40">↓ Later</button>
                      <button onClick={() => { if (window.confirm('Remove this photo?')) onRemove(img.id); }} className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 ml-auto">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end border-t border-gray-100 pt-3">
            <Button variant="secondary" onClick={async () => {
              // Flush any caption edited but not yet saved (e.g. typed, then Done clicked straight away).
              for (const img of images) {
                const v = captions[img.id];
                if (v !== undefined && v.trim() !== img.caption) await onCaption(img.id, v.trim());
              }
              setCaptions({});
              setManageOpen(false);
            }}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
