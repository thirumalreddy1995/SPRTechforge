import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Input } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { cloudService } from '../../services/cloud';
import { useSeminar } from '../context/SeminarContext';
import { SeminarSettings as SeminarSettingsType } from '../types';

const MAX_BANNER_BYTES = 2 * 1024 * 1024; // 2 MB
const BANNER_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const RECOMMENDED = { w: 1200, h: 628 };

export const SeminarSettingsPage: React.FC = () => {
  const { showToast } = useApp();
  const { settings, saveSettings, isLoading } = useSeminar();
  const [form, setForm] = useState<SeminarSettingsType>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Sync local form when the Firestore snapshot arrives/changes.
  useEffect(() => { setForm(settings); }, [settings]);

  const set = (patch: Partial<SeminarSettingsType>) => setForm(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(form);
      showToast('Seminar settings saved', 'success');
    } catch (e: any) {
      showToast(`Save failed: ${e.message || e}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const readImageDimensions = (file: File): Promise<{ w: number; h: number }> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Not a readable image')); };
      img.src = url;
    });

  const handleBanner = async (file: File) => {
    if (!BANNER_MIME.includes(file.type)) {
      showToast('Banner must be JPG, PNG or WebP', 'error');
      return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      showToast('Banner exceeds the 2 MB limit', 'error');
      return;
    }
    setIsUploading(true);
    try {
      const dim = await readImageDimensions(file); // also proves it's a real image, not a renamed file
      if (dim.w < 600) {
        showToast(`Image is only ${dim.w}px wide — use at least 600px (recommended ${RECOMMENDED.w}×${RECOMMENDED.h})`, 'error');
        return;
      }
      if (Math.abs(dim.w / dim.h - RECOMMENDED.w / RECOMMENDED.h) > 0.35) {
        showToast(`Uploaded ${dim.w}×${dim.h}. Recommended ratio is ${RECOMMENDED.w}×${RECOMMENDED.h} (~1.91:1) — it will still be used.`, 'info');
      }
      // Replace any previous banner in Storage.
      if (form.bannerPath) await cloudService.deleteFile(form.bannerPath);
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `seminar/banner-${Date.now()}.${ext}`;
      const uploaded = await cloudService.uploadFile(path, file);
      const next = { ...form, bannerPath: path, bannerUrl: uploaded.url };
      setForm(next);
      await saveSettings(next);
      showToast('Banner uploaded', 'success');
    } catch (e: any) {
      showToast(`Banner upload failed: ${e.message || e}`, 'error');
    } finally {
      setIsUploading(false);
      if (bannerRef.current) bannerRef.current.value = '';
    }
  };

  if (isLoading) return <div className="text-gray-500 p-8 text-center">Loading seminar settings…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seminar &middot; Settings</h1>
          <p className="text-gray-600">Event details, banner, and send limits. Campaign copy is edited on the Campaign page.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Settings'}</Button>
      </div>

      <Card title="Banner / Poster">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            {form.bannerUrl ? (
              <img src={form.bannerUrl} alt="Seminar banner" className="w-full max-w-xl rounded-lg border border-gray-200" />
            ) : (
              <div className="w-full max-w-xl h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                No banner uploaded yet
              </div>
            )}
          </div>
          <div className="w-full md:w-72 space-y-3">
            <input
              ref={bannerRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleBanner(f); }}
            />
            <Button onClick={() => bannerRef.current?.click()} disabled={isUploading} className="w-full">
              {isUploading ? 'Uploading…' : form.bannerUrl ? 'Replace Banner' : 'Upload Banner'}
            </Button>
            <p className="text-xs text-gray-500">
              JPG / PNG / WebP, max 2 MB. Recommended <strong>1200×628</strong>.
              Used at the top of invitation emails (embedded inline via CID), as the hero on the registration
              page, and referenced in the WhatsApp flow (attach it manually there — wa.me links can't carry images).
            </p>
          </div>
        </div>
      </Card>

      <Card title="Event Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Seminar Title" value={form.title} onChange={e => set({ title: e.target.value })} />
          <Input label="Date & Time" type="datetime-local" value={form.dateTime} onChange={e => set({ dateTime: e.target.value })} />
          <Input label="Venue (leave empty if online-only)" value={form.venue} onChange={e => set({ venue: e.target.value })} placeholder="e.g. SPR Techforge, Hitech City, Hyderabad" />
          <Input label="Online Link (leave empty if in-person-only)" value={form.onlineLink} onChange={e => set({ onlineLink: e.target.value })} placeholder="e.g. https://meet.jit.si/…" />
          <Input label="Trainer Name" value={form.trainerName} onChange={e => set({ trainerName: e.target.value })} />
          <Input label="Seats Limit (0 = unlimited)" type="number" min={0} value={String(form.seatsLimit)} onChange={e => set({ seatsLimit: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
        </div>
        <label className="flex items-center gap-2 mt-4 text-sm text-gray-700">
          <input type="checkbox" checked={form.showSeatsRemaining} onChange={e => set({ showSeatsRemaining: e.target.checked })} className="w-4 h-4" />
          Show "seats remaining" on the registration page
        </label>
      </Card>

      <Card title="Sending & Links">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Daily Send Limit"
            type="number" min={1}
            value={String(form.dailySendLimit)}
            onChange={e => set({ dailySendLimit: Math.max(1, parseInt(e.target.value, 10) || 1) })}
          />
          <Input
            label="Delay Between Sends (ms)"
            type="number" min={0} step={500}
            value={String(form.sendDelayMs)}
            onChange={e => set({ sendDelayMs: Math.max(0, parseInt(e.target.value, 10) || 0) })}
          />
          <Input
            label="Public Base URL (optional)"
            value={form.publicBaseUrl}
            onChange={e => set({ publicBaseUrl: e.target.value })}
            placeholder="https://sprtechforge.web.app"
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Free Gmail sends max 100 emails/day through the bridge — keep the limit at ~90 to leave room for
          question replies. Invite links use the Public Base URL when set; otherwise the address of the site
          you're sending from. Set it if you ever send from localhost.
        </p>
      </Card>
    </div>
  );
};
