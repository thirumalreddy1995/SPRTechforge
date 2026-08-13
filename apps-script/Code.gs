/**
 * SPRTechforge Email Bridge — Google Apps Script
 * --------------------------------------------------
 * Runs as the Gmail account that owns this script. Two HTTP endpoints:
 *
 *   GET  ?action=list&secret=...&limit=50
 *        Returns recent inbox messages as JSON.
 *
 *   GET  ?action=ping&secret=...
 *        Health check: returns { ok: true, quotaRemaining } without touching
 *        the inbox. Used by the app's Communication Settings diagnostics.
 *
 *   POST ?secret=...
 *        Body: { to, cc, subject, body, isHtml, attachments: [{url|data,name,mimeType}],
 *                inlineImages: [{key,url|data,name,mimeType}] }
 *        Sends the email via MailApp (counts against Gmail's 100/day free quota).
 *        Attachments and inline images may carry either a fetchable `url` or a
 *        base64 `data` payload (the app's inline-upload fallback for when
 *        Firebase Storage is unavailable).
 *        inlineImages (optional, used by the seminar module): each entry is
 *        embedded as a CID attachment; reference it in the HTML body as
 *        <img src="cid:KEY">. Requires isHtml: true.
 *
 * Shared-secret check is the only auth — store the secret in Script Properties
 * (File > Project Settings > Script Properties) under the key SHARED_SECRET.
 *
 * Deploy:
 *   Deploy > New deployment > Type: Web app
 *   Execute as: Me (your Gmail account)
 *   Who has access: Anyone
 *   Copy the deployment URL into the frontend env var VITE_EMAIL_ENDPOINT.
 *
 * Re-deploy after edits (the URL stays the same if you "Manage deployments"
 * and edit-in-place; if you create a new deployment, you get a new URL).
 */

const MAX_LIST = 50;
const MAX_ATTACHMENT_BYTES = 24 * 1024 * 1024; // 24 MB — well under Gmail's 25 MB cap

function getSharedSecret_() {
  return PropertiesService.getScriptProperties().getProperty('SHARED_SECRET') || '';
}

function jsonResponse_(obj, status) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function checkSecret_(provided) {
  const expected = getSharedSecret_();
  if (!expected) return { ok: false, msg: 'SHARED_SECRET not configured on the server' };
  if (provided !== expected) return { ok: false, msg: 'Bad secret' };
  return { ok: true };
}

/**
 * GET — list inbox.
 * Query params: secret, limit (optional, default 50).
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const auth = checkSecret_(params.secret);
    if (!auth.ok) return jsonResponse_({ ok: false, error: auth.msg });

    const action = params.action || 'list';
    if (action === 'ping') {
      return jsonResponse_({ ok: true, quotaRemaining: MailApp.getRemainingDailyQuota() });
    }
    if (action !== 'list') return jsonResponse_({ ok: false, error: 'Unknown action' });

    const limit = Math.min(parseInt(params.limit, 10) || MAX_LIST, MAX_LIST);
    const threads = GmailApp.getInboxThreads(0, limit);

    const messages = [];
    threads.forEach(function (thread) {
      const threadMsgs = thread.getMessages();
      // include only the most recent message of each thread to keep payload small;
      // the UI can request a full thread via action=thread later if needed.
      const last = threadMsgs[threadMsgs.length - 1];
      if (!last) return;

      messages.push({
        id: last.getId(),
        threadId: thread.getId(),
        from: last.getFrom(),
        to: last.getTo().split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        cc: last.getCc() ? last.getCc().split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
        subject: last.getSubject(),
        snippet: last.getPlainBody().slice(0, 200),
        body: last.getPlainBody(),
        bodyHtml: last.getBody(),
        date: last.getDate().toISOString(),
        isRead: !last.isUnread(),
        hasAttachments: last.getAttachments().length > 0,
        attachmentNames: last.getAttachments().map(function (a) { return a.getName(); }),
      });
    });

    return jsonResponse_({ ok: true, messages: messages });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message || err) });
  }
}

/**
 * Build a Blob from an attachment/inline-image reference that carries either
 * a fetchable `url` or a base64 `data` payload. Returns null when the ref is
 * unusable (missing source, fetch failed).
 */
function blobFromRef_(ref, fallbackName) {
  if (ref && ref.data) {
    const bytes = Utilities.base64Decode(String(ref.data));
    return Utilities.newBlob(bytes, ref.mimeType || 'application/octet-stream', ref.name || fallbackName);
  }
  if (ref && ref.url) {
    const resp = UrlFetchApp.fetch(ref.url, { muteHttpExceptions: true });
    if (resp.getResponseCode() >= 400) return null;
    const blob = resp.getBlob();
    blob.setName(ref.name || fallbackName);
    if (ref.mimeType) blob.setContentType(ref.mimeType);
    return blob;
  }
  return null;
}

/**
 * POST — send an email.
 * Query: secret
 * Body (JSON): { to, cc?, subject, body, isHtml?, fromName?,
 *                attachments?: [{url|data,name,mimeType}],
 *                inlineImages?: [{key,url|data,name,mimeType}] }
 */
function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const auth = checkSecret_(params.secret);
    if (!auth.ok) return jsonResponse_({ ok: false, error: auth.msg });

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: 'Missing body' });
    }

    const data = JSON.parse(e.postData.contents);
    if (!data.to || !data.subject || !data.body) {
      return jsonResponse_({ ok: false, error: 'to, subject, and body are required' });
    }

    const options = {};
    if (data.isHtml) options.htmlBody = data.body;
    if (data.cc) options.cc = Array.isArray(data.cc) ? data.cc.join(',') : data.cc;
    // Optional sender display name (the From address stays this script's
    // Gmail account). Additive — older clients simply don't send it.
    if (data.fromName) options.name = String(data.fromName);

    if (data.attachments && data.attachments.length) {
      const blobs = [];
      for (var i = 0; i < data.attachments.length; i++) {
        const att = data.attachments[i];
        if (!att.url && !att.data) continue;
        try {
          const blob = blobFromRef_(att, 'attachment-' + (i + 1));
          if (!blob) continue;
          if (blob.getBytes().length > MAX_ATTACHMENT_BYTES) {
            return jsonResponse_({ ok: false, error: 'Attachment ' + att.name + ' exceeds 24MB' });
          }
          blobs.push(blob);
        } catch (downloadErr) {
          return jsonResponse_({ ok: false, error: 'Failed to fetch attachment: ' + att.name });
        }
      }
      if (blobs.length) options.attachments = blobs;
    }

    // Inline (CID) images — e.g. the seminar banner. Additive: older clients
    // that don't send inlineImages are unaffected.
    if (data.inlineImages && data.inlineImages.length && data.isHtml) {
      const inline = {};
      var inlineCount = 0;
      for (var j = 0; j < data.inlineImages.length; j++) {
        const img = data.inlineImages[j];
        if ((!img.url && !img.data) || !img.key) continue;
        try {
          const blob2 = blobFromRef_(img, img.key);
          if (!blob2) continue;
          if (blob2.getBytes().length > MAX_ATTACHMENT_BYTES) continue;
          inline[img.key] = blob2;
          inlineCount++;
        } catch (inlineErr) {
          // Non-fatal: the email still sends, the cid image just won't render.
        }
      }
      if (inlineCount > 0) options.inlineImages = inline;
    }

    const to = Array.isArray(data.to) ? data.to.join(',') : data.to;
    MailApp.sendEmail(to, String(data.subject), data.isHtml ? '' : String(data.body), options);

    // Daily quota remaining (useful for debugging quota errors)
    const remaining = MailApp.getRemainingDailyQuota();
    return jsonResponse_({ ok: true, sentTo: to, quotaRemaining: remaining });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message || err) });
  }
}
