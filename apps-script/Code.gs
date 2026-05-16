/**
 * SPRTechforge Email Bridge — Google Apps Script
 * --------------------------------------------------
 * Runs as the Gmail account that owns this script. Two HTTP endpoints:
 *
 *   GET  ?action=list&secret=...&limit=50
 *        Returns recent inbox messages as JSON.
 *
 *   POST ?secret=...
 *        Body: { to, cc, subject, body, isHtml, attachments: [{url,name,mimeType}] }
 *        Sends the email via MailApp (counts against Gmail's 100/day free quota).
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
 * POST — send an email.
 * Query: secret
 * Body (JSON): { to, cc?, subject, body, isHtml?, attachments?: [{url,name,mimeType}] }
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

    if (data.attachments && data.attachments.length) {
      const blobs = [];
      for (var i = 0; i < data.attachments.length; i++) {
        const att = data.attachments[i];
        if (!att.url) continue;
        try {
          const resp = UrlFetchApp.fetch(att.url, { muteHttpExceptions: true });
          if (resp.getResponseCode() >= 400) continue;
          const blob = resp.getBlob();
          if (blob.getBytes().length > MAX_ATTACHMENT_BYTES) {
            return jsonResponse_({ ok: false, error: 'Attachment ' + att.name + ' exceeds 24MB' });
          }
          blob.setName(att.name || ('attachment-' + (i + 1)));
          if (att.mimeType) blob.setContentType(att.mimeType);
          blobs.push(blob);
        } catch (downloadErr) {
          return jsonResponse_({ ok: false, error: 'Failed to fetch attachment: ' + att.name });
        }
      }
      if (blobs.length) options.attachments = blobs;
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
