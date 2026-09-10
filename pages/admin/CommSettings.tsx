import React, { useState } from 'react';
import { Button, Card, Input } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { emailService } from '../../services/emailService';
import { uploadService } from '../../services/uploadService';
import {
  clearLocalMessagingOverride,
  getEmailBridgeConfig,
  getMessagingConfigSource,
  saveMessagingConfig,
} from '../../services/messagingConfig';

const sourceLabel: Record<string, string> = {
  'local-override': 'This-browser override (saved on this page)',
  cloud: 'Cloud settings (shared by all users, saved on this page)',
  build: 'Build-time environment variables (GitHub Secrets)',
  none: 'Not configured anywhere',
};

/**
 * Master-only runtime configuration for the email bridge + upload health.
 * Fixes the "email configuration is not proper" class of problems without a
 * rebuild: the config saved here lands in Firestore (system_settings/messaging)
 * and every deployed client picks it up at startup.
 */
export const CommSettings: React.FC = () => {
  const { showToast, isCloudEnabled } = useApp();
  const current = getEmailBridgeConfig();
  const [endpoint, setEndpoint] = useState(current.endpoint);
  const [secret, setSecret] = useState(current.secret);
  const [senderEmail, setSenderEmail] = useState(current.senderEmail || '');
  const [senderName, setSenderName] = useState(current.senderName || '');
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailTest, setEmailTest] = useState<{ running: boolean; result?: { ok: boolean; error?: string; quotaRemaining?: number; provider?: string; sender?: string } }>({ running: false });
  const [storageTest, setStorageTest] = useState<{ running: boolean; result?: { ok: boolean; error?: string } }>({ running: false });
  const [source, setSource] = useState(getMessagingConfigSource());

  const refreshFromResolved = () => {
    const cfg = getEmailBridgeConfig();
    setEndpoint(cfg.endpoint);
    setSecret(cfg.secret);
    setSenderEmail(cfg.senderEmail || '');
    setSenderName(cfg.senderName || '');
    setSource(getMessagingConfigSource());
  };

  const typedConfig = () => ({ endpoint, secret, senderEmail, senderName });

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMessagingConfig(typedConfig(), { toCloud: isCloudEnabled });
      setSource(getMessagingConfigSource());
      showToast(isCloudEnabled
        ? 'Saved — every user of this app now uses this email bridge (no rebuild needed).'
        : 'Saved for this browser. Enable Cloud Sync to share it with all users.', 'success');
    } catch (e: any) {
      showToast(`Save failed: ${e.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearOverride = () => {
    clearLocalMessagingOverride();
    refreshFromResolved();
    showToast('This-browser override removed — reverted to cloud/build config.', 'info');
  };

  const runEmailTest = async () => {
    setEmailTest({ running: true });
    // Test what's currently typed, not what's saved — save first if changed.
    const saved = getEmailBridgeConfig();
    const typedMatchesSaved = endpoint === saved.endpoint && secret === saved.secret
      && senderEmail.trim().toLowerCase() === (saved.senderEmail || '') && senderName.trim() === (saved.senderName || '');
    if (!typedMatchesSaved) {
      try {
        await saveMessagingConfig(typedConfig(), { toCloud: false });
        setSource(getMessagingConfigSource());
      } catch (e: any) {
        setEmailTest({ running: false, result: { ok: false, error: e.message || String(e) } });
        return;
      }
    }
    const result = await emailService.testConnection();
    setEmailTest({ running: false, result });
  };

  const runStorageTest = async () => {
    setStorageTest({ running: true });
    const result = await uploadService.testStorage();
    setStorageTest({ running: false, result });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Communication Settings</h1>
        <p className="text-gray-600">Email bridge configuration and file-upload health. Changes here apply at runtime — no rebuild or redeploy of the site.</p>
      </div>

      <Card title="Email Bridge">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 mb-4">
          <p><strong>Active config source:</strong> {sourceLabel[source]}</p>
          <p className="mt-1">
            The bridge is a free Google Apps Script that relays mail for the app. It can send through <strong>Gmail</strong> (the script owner's
            account) or through <strong>Outlook / Microsoft 365</strong> (e.g. admin@sprtechforge.com) — the provider is chosen in the script's
            properties. See <strong>SETUP-EMAIL.md</strong> for both setups. Paste the Web App URL and shared secret here.
          </p>
        </div>
        <div className="space-y-4">
          <Input
            label="Bridge Web App URL (VITE_EMAIL_ENDPOINT)"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
          />
          <div className="relative">
            <Input
              label="Shared Secret (must match SHARED_SECRET in the Apps Script's Script Properties)"
              type={showSecret ? 'text' : 'password'}
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Paste the shared secret"
            />
            <button
              type="button"
              onClick={() => setShowSecret(s => !s)}
              className="absolute right-3 top-9 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              {showSecret ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default sender email (From address)"
              type="email"
              value={senderEmail}
              onChange={e => setSenderEmail(e.target.value)}
              placeholder="admin@sprtechforge.com"
            />
            <Input
              label="Sender display name"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="SPR Techforge"
            />
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Every confirmation, reminder and bulk email goes out from this address unless the person sending picks a different one.
            With the Outlook provider it must be a mailbox in your Microsoft 365 tenant; with Gmail it must be a "Send mail as" alias of the bridge account (otherwise the bridge's own address is used).
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : isCloudEnabled ? 'Save for All Users' : 'Save (this browser)'}
            </Button>
            <Button variant="secondary" onClick={runEmailTest} disabled={emailTest.running}>
              {emailTest.running ? 'Testing…' : 'Test Email Connection'}
            </Button>
            {source === 'local-override' && (
              <Button variant="secondary" onClick={handleClearOverride}>Remove This-Browser Override</Button>
            )}
          </div>
          {emailTest.result && (
            emailTest.result.ok ? (
              <div className="text-sm font-bold text-emerald-700 space-y-1">
                <p>
                  ✓ Connected — the bridge is reachable and the secret matches.
                  {typeof emailTest.result.quotaRemaining === 'number' && ` ${emailTest.result.quotaRemaining} sends left in today's Gmail quota.`}
                </p>
                {emailTest.result.provider && (
                  <p className="text-xs font-semibold text-emerald-800">
                    Provider: {emailTest.result.provider === 'graph' ? 'Outlook / Microsoft 365' : 'Gmail'}
                    {emailTest.result.sender && <> · bridge default mailbox: {emailTest.result.sender}</>}
                    {emailTest.result.provider === 'graph' && senderEmail.trim() && emailTest.result.sender && senderEmail.trim().toLowerCase() !== emailTest.result.sender.toLowerCase() && (
                      <> · the app will send as <strong>{senderEmail.trim()}</strong></>
                    )}
                  </p>
                )}
                {!emailTest.result.provider && (
                  <p className="text-xs font-semibold text-amber-700">The bridge is running an older Code.gs — redeploy the latest one to enable the Outlook provider and the From-address option.</p>
                )}
              </div>
            ) : (
              <p className="text-sm font-bold text-red-600">✗ {emailTest.result.error}</p>
            )
          )}
        </div>
      </Card>

      <Card title="Sending from Outlook / Microsoft 365 (admin@sprtechforge.com)">
        <p className="text-xs text-gray-600 mb-3">
          The same bridge can deliver through your Microsoft 365 mailbox instead of Gmail, so registrants see mail from
          <strong> admin@sprtechforge.com</strong> and replies land in that Outlook inbox. One-time setup (about 15 minutes, full steps in
          <strong> SETUP-EMAIL.md → "Send from Outlook"</strong>):
        </p>
        <ol className="text-xs text-gray-700 space-y-1.5 list-decimal pl-5">
          <li>In <strong>Microsoft Entra admin center → App registrations → New registration</strong>, create "SPRTechforge Mail Bridge" (single tenant, no redirect URI).</li>
          <li>Copy its <strong>Application (client) ID</strong> and <strong>Directory (tenant) ID</strong>. Under <strong>Certificates &amp; secrets</strong> create a client secret and copy its <strong>Value</strong>.</li>
          <li>Under <strong>API permissions → Add → Microsoft Graph → Application permissions</strong> add <strong>Mail.Send</strong>, then click <strong>Grant admin consent</strong>.</li>
          <li>In the Apps Script project add Script Properties <code>MS_TENANT_ID</code>, <code>MS_CLIENT_ID</code>, <code>MS_CLIENT_SECRET</code>, <code>MS_SENDER = admin@sprtechforge.com</code> and <code>MAIL_PROVIDER = graph</code>; paste the latest <code>apps-script/Code.gs</code> and redeploy (Manage deployments → Edit → New version).</li>
          <li>Back here: set the default sender to <strong>admin@sprtechforge.com</strong>, click <strong>Test Email Connection</strong> (it should report "Provider: Outlook / Microsoft 365"), then <strong>Save for All Users</strong>.</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          Limits on Microsoft 365: 10,000 recipients per mailbox per day and 30 messages per minute — comfortably above the 100/day Gmail cap, and enough to confirm and remind thousands of registrants.
        </p>
      </Card>

      <Card title="File Uploads (banners, chat & email attachments)">
        <p className="text-xs text-gray-600 mb-3">
          Uploads try <strong>Firebase Storage</strong> first. When Storage is unavailable (not provisioned for the
          project, or its security rules reject writes), images are automatically compressed and stored
          <strong> inline</strong> instead — banners, chat photos and emailed banners keep working either way.
          Large non-image files (&gt;~500 KB) do require Storage.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" onClick={runStorageTest} disabled={storageTest.running}>
            {storageTest.running ? 'Testing…' : 'Test Firebase Storage'}
          </Button>
          {storageTest.result && (
            storageTest.result.ok
              ? <span className="text-sm font-bold text-emerald-700">✓ Storage works — uploads use Firebase Storage.</span>
              : <span className="text-sm font-bold text-amber-700">⚠ {storageTest.result.error}. Uploads fall back to compressed inline images. To fix Storage: enable it in the Firebase console and set rules that allow writes (see RUNBOOK.md).</span>
          )}
        </div>
      </Card>

      <Card title="How the pieces fit">
        <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
          <li><strong>Email</strong> (SPRConnect → Email, Seminar campaign, Event confirmations & reminders) goes through the bridge configured above. Free Gmail allows 100 sends/day; Outlook / Microsoft 365 allows 10,000 recipients/day.</li>
          <li><strong>Sender address:</strong> the default above is used everywhere; the event "Send email" dialog lets you override it per send.</li>
          <li><strong>Config precedence:</strong> this-browser override → cloud settings (saved here) → build-time secrets. Saving here wins over the build without redeploying.</li>
          <li><strong>Banner images</strong> stored inline are always embedded into emails as CID attachments (Gmail blocks data: images otherwise). That path needs the updated bridge — redeploy <code>apps-script/Code.gs</code> once (Deploy → Manage deployments → Edit → New version).</li>
          <li><strong>Notifications</strong> (the bell) and <strong>chat</strong> ride on Firestore real-time sync and need no extra configuration.</li>
          <li>The shared secret has always shipped inside the public app bundle; storing it in cloud settings is equivalent. Rotate it in the Apps Script and update it here if it leaks.</li>
        </ul>
      </Card>
    </div>
  );
};
