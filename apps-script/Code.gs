/**
 * SPRTechforge Email Bridge — Google Apps Script
 * --------------------------------------------------
 * A tiny HTTPS endpoint the static app calls to send (and list) mail. It can
 * deliver through TWO providers, picked by Script Properties:
 *
 *   gmail  (default) — MailApp/GmailApp of the Google account that owns this
 *                      script. Free Gmail: 100 sends/day.
 *   graph            — Microsoft 365 / Outlook via Microsoft Graph, sending AS
 *                      a mailbox in your tenant (e.g. admin@sprtechforge.com).
 *                      Needs an Entra app registration with the Mail.Send
 *                      APPLICATION permission (see SETUP-EMAIL.md, "Outlook").
 *
 * Script Properties (File > Project Settings > Script Properties):
 *   SHARED_SECRET     required — the only auth; must match the app's setting
 *   MAIL_PROVIDER     optional — "gmail" | "graph". When omitted, "graph" is
 *                      used automatically if the three MS_* values below exist.
 *   MS_TENANT_ID      graph — Entra Directory (tenant) ID
 *   MS_CLIENT_ID      graph — Application (client) ID
 *   MS_CLIENT_SECRET  graph — client secret VALUE (not its ID)
 *   MS_SENDER         graph — default mailbox to send from, e.g. admin@sprtechforge.com
 *
 * Endpoints:
 *   GET  ?action=ping&secret=...
 *        Health check: { ok, provider, sender, quotaRemaining? }. For graph it
 *        also proves a Microsoft token can be obtained.
 *   GET  ?action=list&secret=...&limit=50
 *        Recent inbox messages (Gmail inbox, or the graph sender's Outlook inbox).
 *   POST ?secret=...
 *        Body: { to, cc?, subject, body, isHtml?, from?, fromName?,
 *                attachments?: [{url|data,name,mimeType}],
 *                inlineImages?: [{key,url|data,name,mimeType}] }
 *        `from` picks the sending mailbox (graph) or a "Send mail as" alias
 *        (gmail). Attachments/inline images carry a fetchable `url` or a
 *        base64 `data` payload. inlineImages are CID attachments referenced in
 *        the HTML body as <img src="cid:KEY">.
 *
 * Deploy: Deploy > New deployment > Web app; Execute as: Me; Who has access:
 * Anyone. Re-deploy after edits via Manage deployments > Edit > New version so
 * the URL stays the same.
 */

const MAX_LIST = 50;
const MAX_ATTACHMENT_BYTES = 24 * 1024 * 1024; // Gmail cap (25 MB) with headroom
const MAX_GRAPH_TOTAL_BYTES = 3 * 1024 * 1024;  // Graph sendMail accepts ~3 MB of inline attachments per request
const GRAPH_TOKEN_CACHE_KEY = 'MS_GRAPH_TOKEN';

function props_() {
  return PropertiesService.getScriptProperties();
}

function getSharedSecret_() {
  return props_().getProperty('SHARED_SECRET') || '';
}

function jsonResponse_(obj) {
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

// ---------------------------------------------------------------------------
// Provider selection
// ---------------------------------------------------------------------------

function graphConfigured_() {
  const p = props_();
  return !!(p.getProperty('MS_TENANT_ID') && p.getProperty('MS_CLIENT_ID') && p.getProperty('MS_CLIENT_SECRET'));
}

/** 'gmail' | 'graph' */
function mailProvider_() {
  const explicit = String(props_().getProperty('MAIL_PROVIDER') || '').trim().toLowerCase();
  if (explicit === 'gmail') return 'gmail';
  if (explicit === 'graph') return 'graph';
  return graphConfigured_() ? 'graph' : 'gmail';
}

/** The address mail goes out from when the request carries no `from`. */
function defaultSender_() {
  if (mailProvider_() === 'graph') return String(props_().getProperty('MS_SENDER') || '').trim();
  return Session.getEffectiveUser().getEmail();
}

// ---------------------------------------------------------------------------
// GET — ping / list
// ---------------------------------------------------------------------------

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const auth = checkSecret_(params.secret);
    if (!auth.ok) return jsonResponse_({ ok: false, error: auth.msg });

    const action = params.action || 'list';
    const provider = mailProvider_();

    if (action === 'ping') {
      if (provider === 'graph') {
        if (!graphConfigured_()) return jsonResponse_({ ok: false, error: 'MAIL_PROVIDER is graph but MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET are not all set' });
        graphToken_(); // throws with a clear message when the Entra app is misconfigured
        return jsonResponse_({ ok: true, provider: provider, sender: defaultSender_() });
      }
      return jsonResponse_({ ok: true, provider: provider, sender: defaultSender_(), quotaRemaining: MailApp.getRemainingDailyQuota() });
    }
    if (action !== 'list') return jsonResponse_({ ok: false, error: 'Unknown action' });

    const limit = Math.min(parseInt(params.limit, 10) || MAX_LIST, MAX_LIST);
    const messages = provider === 'graph' ? listInboxGraph_(limit) : listInboxGmail_(limit);
    return jsonResponse_({ ok: true, provider: provider, messages: messages });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message || err) });
  }
}

function listInboxGmail_(limit) {
  const threads = GmailApp.getInboxThreads(0, limit);
  const messages = [];
  threads.forEach(function (thread) {
    const threadMsgs = thread.getMessages();
    // Only the most recent message of each thread keeps the payload small.
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
  return messages;
}

function listInboxGraph_(limit) {
  const mailbox = defaultSender_();
  if (!mailbox) throw new Error('MS_SENDER is not set — the bridge does not know which Outlook mailbox to read');
  const url = 'https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(mailbox) +
    '/mailFolders/inbox/messages?$top=' + limit +
    '&$orderby=receivedDateTime%20desc' +
    '&$select=id,conversationId,from,toRecipients,ccRecipients,subject,bodyPreview,body,receivedDateTime,isRead,hasAttachments';
  const json = graphRequest_('get', url, null);
  const addr = function (r) { return r && r.emailAddress ? (r.emailAddress.name ? r.emailAddress.name + ' <' + r.emailAddress.address + '>' : r.emailAddress.address) : ''; };
  return (json.value || []).map(function (m) {
    const isHtml = m.body && String(m.body.contentType).toLowerCase() === 'html';
    return {
      id: m.id,
      threadId: m.conversationId || m.id,
      from: addr(m.from),
      to: (m.toRecipients || []).map(function (r) { return r.emailAddress.address; }),
      cc: (m.ccRecipients || []).map(function (r) { return r.emailAddress.address; }),
      subject: m.subject || '',
      snippet: (m.bodyPreview || '').slice(0, 200),
      body: isHtml ? htmlToText_(m.body.content) : (m.body ? m.body.content : ''),
      bodyHtml: isHtml ? m.body.content : '',
      date: m.receivedDateTime,
      isRead: !!m.isRead,
      hasAttachments: !!m.hasAttachments,
      attachmentNames: [],
    };
  });
}

function htmlToText_(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

/**
 * Blob from an attachment/inline-image ref carrying either a fetchable `url`
 * or a base64 `data` payload. Null when unusable.
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

/** Resolves request refs into { attachments: Blob[], inline: {key: Blob}, error? }. */
function collectBlobs_(data) {
  const out = { attachments: [], inline: {}, inlineCount: 0 };
  if (data.attachments && data.attachments.length) {
    for (var i = 0; i < data.attachments.length; i++) {
      const att = data.attachments[i];
      if (!att.url && !att.data) continue;
      try {
        const blob = blobFromRef_(att, 'attachment-' + (i + 1));
        if (!blob) continue;
        if (blob.getBytes().length > MAX_ATTACHMENT_BYTES) return { error: 'Attachment ' + att.name + ' exceeds 24MB' };
        out.attachments.push(blob);
      } catch (downloadErr) {
        return { error: 'Failed to fetch attachment: ' + att.name };
      }
    }
  }
  if (data.inlineImages && data.inlineImages.length && data.isHtml) {
    for (var j = 0; j < data.inlineImages.length; j++) {
      const img = data.inlineImages[j];
      if ((!img.url && !img.data) || !img.key) continue;
      try {
        const blob2 = blobFromRef_(img, img.key);
        if (!blob2) continue;
        if (blob2.getBytes().length > MAX_ATTACHMENT_BYTES) continue;
        out.inline[img.key] = blob2;
        out.inlineCount++;
      } catch (inlineErr) {
        // Non-fatal: the email still sends, the cid image just won't render.
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// POST — send
// ---------------------------------------------------------------------------

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

    const blobs = collectBlobs_(data);
    if (blobs.error) return jsonResponse_({ ok: false, error: blobs.error });

    const provider = mailProvider_();
    if (provider === 'graph') {
      const sentFrom = sendViaGraph_(data, blobs);
      return jsonResponse_({ ok: true, provider: provider, sentTo: joinList_(data.to), sentFrom: sentFrom });
    }
    const sentFromGmail = sendViaGmail_(data, blobs);
    return jsonResponse_({ ok: true, provider: provider, sentTo: joinList_(data.to), sentFrom: sentFromGmail, quotaRemaining: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message || err) });
  }
}

function joinList_(v) {
  return Array.isArray(v) ? v.join(',') : String(v);
}

function splitList_(v) {
  return (Array.isArray(v) ? v : String(v).split(',')).map(function (s) { return String(s).trim(); }).filter(Boolean);
}

// ----- Gmail -----

function sendViaGmail_(data, blobs) {
  const options = {};
  if (data.isHtml) options.htmlBody = data.body;
  if (data.cc) options.cc = joinList_(data.cc);
  if (data.fromName) options.name = String(data.fromName);
  if (blobs.attachments.length) options.attachments = blobs.attachments;
  if (blobs.inlineCount > 0) options.inlineImages = blobs.inline;

  const to = joinList_(data.to);
  const me = Session.getEffectiveUser().getEmail();
  const requestedFrom = String(data.from || '').trim().toLowerCase();

  // A different From address only works when it is a configured "Send mail
  // as" alias of this Gmail account; otherwise fall back to the account itself.
  if (requestedFrom && requestedFrom !== me.toLowerCase()) {
    const aliases = GmailApp.getAliases().map(function (a) { return a.toLowerCase(); });
    if (aliases.indexOf(requestedFrom) >= 0) {
      options.from = requestedFrom;
      GmailApp.sendEmail(to, String(data.subject), data.isHtml ? '' : String(data.body), options);
      return requestedFrom;
    }
  }
  MailApp.sendEmail(to, String(data.subject), data.isHtml ? '' : String(data.body), options);
  return me;
}

// ----- Microsoft Graph (Outlook / Microsoft 365) -----

/** App-only access token (client credentials), cached for its lifetime minus a margin. */
function graphToken_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(GRAPH_TOKEN_CACHE_KEY);
  if (cached) return cached;

  const p = props_();
  const tenant = p.getProperty('MS_TENANT_ID');
  const clientId = p.getProperty('MS_CLIENT_ID');
  const secret = p.getProperty('MS_CLIENT_SECRET');
  if (!tenant || !clientId || !secret) throw new Error('Outlook provider is not configured: set MS_TENANT_ID, MS_CLIENT_ID and MS_CLIENT_SECRET in Script Properties');

  const resp = UrlFetchApp.fetch('https://login.microsoftonline.com/' + encodeURIComponent(tenant) + '/oauth2/v2.0/token', {
    method: 'post',
    payload: {
      client_id: clientId,
      client_secret: secret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    },
    muteHttpExceptions: true,
  });
  var json = {};
  try { json = JSON.parse(resp.getContentText()); } catch (parseErr) { /* handled below */ }
  if (resp.getResponseCode() >= 400 || !json.access_token) {
    throw new Error('Microsoft sign-in failed: ' + (json.error_description || json.error || resp.getContentText()));
  }
  // CacheService caps entries at 6 hours; tokens last ~1 hour.
  const ttl = Math.max(60, Math.min((parseInt(json.expires_in, 10) || 3600) - 300, 21600));
  cache.put(GRAPH_TOKEN_CACHE_KEY, json.access_token, ttl);
  return json.access_token;
}

function graphRequest_(method, url, payloadObj) {
  const opts = {
    method: method,
    headers: { Authorization: 'Bearer ' + graphToken_() },
    muteHttpExceptions: true,
  };
  if (payloadObj) {
    opts.contentType = 'application/json';
    opts.payload = JSON.stringify(payloadObj);
  }
  var resp = UrlFetchApp.fetch(url, opts);
  if (resp.getResponseCode() === 401) {
    // Token revoked/expired early — drop the cache and retry once.
    CacheService.getScriptCache().remove(GRAPH_TOKEN_CACHE_KEY);
    opts.headers.Authorization = 'Bearer ' + graphToken_();
    resp = UrlFetchApp.fetch(url, opts);
  }
  const code = resp.getResponseCode();
  const text = resp.getContentText();
  if (code >= 400) {
    var msg = text;
    try { const j = JSON.parse(text); msg = (j.error && (j.error.code + ': ' + j.error.message)) || text; } catch (ignore) { /* keep raw */ }
    throw new Error('Outlook (Microsoft Graph) returned HTTP ' + code + ' — ' + msg);
  }
  if (!text) return {};
  try { return JSON.parse(text); } catch (ignore2) { return {}; }
}

/** Sends through Graph as `data.from` (or MS_SENDER). Returns the mailbox used. */
function sendViaGraph_(data, blobs) {
  const from = String(data.from || props_().getProperty('MS_SENDER') || '').trim();
  if (!from) throw new Error('No sender mailbox: set MS_SENDER in Script Properties or a default sender in the app (Admin → Communication Settings)');

  const recips = function (list) { return splitList_(list).map(function (a) { return { emailAddress: { address: a } }; }); };
  const message = {
    subject: String(data.subject),
    body: { contentType: data.isHtml ? 'HTML' : 'Text', content: String(data.body) },
    toRecipients: recips(data.to),
  };
  if (data.cc) message.ccRecipients = recips(data.cc);
  if (data.fromName) message.from = { emailAddress: { address: from, name: String(data.fromName) } };

  const attachments = [];
  var total = 0;
  blobs.attachments.forEach(function (b) {
    const bytes = b.getBytes();
    total += bytes.length;
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: b.getName(),
      contentType: b.getContentType() || 'application/octet-stream',
      contentBytes: Utilities.base64Encode(bytes),
    });
  });
  Object.keys(blobs.inline).forEach(function (key) {
    const b = blobs.inline[key];
    const bytes = b.getBytes();
    total += bytes.length;
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: b.getName() || key,
      contentType: b.getContentType() || 'image/jpeg',
      contentBytes: Utilities.base64Encode(bytes),
      isInline: true,
      contentId: key,
    });
  });
  if (total > MAX_GRAPH_TOTAL_BYTES) {
    throw new Error('Attachments total ' + Math.round(total / 1024 / 1024 * 10) / 10 + ' MB — Outlook accepts up to 3 MB per message through this bridge. Use a hosted link instead.');
  }
  if (attachments.length) message.attachments = attachments;

  graphRequest_('post', 'https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(from) + '/sendMail', {
    message: message,
    saveToSentItems: true,
  });
  return from;
}
