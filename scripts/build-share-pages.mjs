// Generates one static "share page" per published event: dist/e/<slug>/index.html
// plus dist/e/<slug>/banner.jpg.
//
// Why: WhatsApp, LinkedIn and Facebook build link previews from the page's
// <meta property="og:*"> tags without running JavaScript, and nothing after
// the '#' in a URL ever reaches the server. A HashRouter app therefore shows the
// same site-wide poster for every link. These tiny pages carry the event's own
// title, date and banner; a real visitor is redirected to /#/events/<slug>
// instantly, while the crawler just reads the tags.
//
// Runs after `vite build` (see package.json). Needs VITE_FIREBASE_PROJECT_ID and
// VITE_FIREBASE_API_KEY (same env the app is built with) and VITE_SITE_ORIGIN
// (https://sprtechforge.com or https://sprtechforge-qa.web.app) for absolute
// image URLs. Without them it skips quietly so a plain local build still works.

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
// The production GitHub Actions job has no Firebase secrets: the app itself falls
// back to this project (services/cloud.ts), so the share pages must do the same.
const PROD_FALLBACK = { projectId: 'sprtechforge', apiKey: 'AIzaSyDWiI7gQ-sCLiMfoNPAmbqrT_XNAH2SxL8' };
const origin = (process.env.VITE_SITE_ORIGIN || '').replace(/\/$/, '');
if (!origin) {
  console.log('[share-pages] skipped — set VITE_SITE_ORIGIN (CI does) to generate per-event link-preview pages.');
  process.exit(0);
}
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || PROD_FALLBACK.projectId;
const apiKey = process.env.VITE_FIREBASE_API_KEY || PROD_FALLBACK.apiKey;
if (!process.env.VITE_FIREBASE_PROJECT_ID) console.log('[share-pages] no VITE_FIREBASE_PROJECT_ID — using the production project, like the app does.');

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- IST formatting (mirrors events/lib/datetime.ts; fixed names so CI locale cannot change them) ---
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ist = iso => new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000); // shift, then read UTC fields
const fmtDate = iso => { const d = ist(iso); return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtTime = iso => { const d = ist(iso); let h = d.getUTCHours(); const m = String(d.getUTCMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${m} ${ap}`; };
const fmtRange = (s, e) => {
  if (!s || isNaN(Date.parse(s))) return '';
  if (!e || isNaN(Date.parse(e))) return `${fmtDate(s)} · ${fmtTime(s)} IST`;
  return fmtDate(s) === fmtDate(e) ? `${fmtDate(s)} · ${fmtTime(s)} – ${fmtTime(e)} IST` : `${fmtDate(s)} ${fmtTime(s)} → ${fmtDate(e)} ${fmtTime(e)} IST`;
};

// --- Firestore REST: published + cancelled events (same filter the public list uses) ---
const decode = v => {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decode(x)]));
  return undefined;
};

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
const body = { structuredQuery: { from: [{ collectionId: 'events_events' }], where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'IN', value: { arrayValue: { values: [{ stringValue: 'published' }, { stringValue: 'cancelled' }] } } } } } };
const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
if (!res.ok) { console.error(`[share-pages] Firestore query failed: ${res.status} ${await res.text()}`); process.exit(1); }
const rows = await res.json();
const events = rows.filter(r => r.document).map(r => Object.fromEntries(Object.entries(r.document.fields).map(([k, v]) => [k, decode(v)])));

// --- Optional image conversion. WhatsApp does not render WebP previews and the
// app stores banners as WebP data: URLs, so convert to JPEG when sharp is present.
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.log('[share-pages] sharp not available — banners are written as-is.'); }

const MAX_W = 1200;
async function writeBanner(dir, bannerUrl) {
  if (!bannerUrl) return null;
  if (/^https?:\/\//i.test(bannerUrl)) return { src: bannerUrl };
  const m = bannerUrl.match(/^data:(image\/[a-z+]+);base64,(.*)$/i);
  if (!m) return null;
  let buf = Buffer.from(m[2], 'base64');
  let ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg';
  let width, height;
  if (sharp) {
    try {
      const img = sharp(buf);
      const meta = await img.metadata();
      const out = await img.resize({ width: Math.min(MAX_W, meta.width || MAX_W), withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true });
      buf = out.data; width = out.info.width; height = out.info.height; ext = 'jpg';
    } catch (e) { console.warn(`[share-pages] banner conversion failed (${e.message}); writing original bytes.`); }
  }
  const file = `banner.${ext}`;
  await writeFile(path.join(dir, file), buf);
  return { src: null, file, width, height, bytes: buf.length };
}

const siteDesc = 'QA services, software testing training (manual, automation, API) and placement support from Hyderabad, India.';
let made = 0;
for (const ev of events) {
  if (!ev.slug || !/^[a-z0-9-]+$/i.test(ev.slug)) continue;
  const dir = path.join(DIST, 'e', ev.slug);
  await mkdir(dir, { recursive: true });
  const banner = await writeBanner(dir, ev.bannerUrl);
  const pageUrl = `${origin}/e/${ev.slug}/`;
  const appUrl = `/#/events/${ev.slug}`;
  const image = banner ? (banner.src || `${pageUrl}${banner.file}`) : `${origin}/og-image.png`;
  const when = fmtRange(ev.startAt, ev.endAt);
  const cancelled = ev.status === 'cancelled';
  const title = `${cancelled ? '[Cancelled] ' : ''}${ev.title || 'SPR TechForge event'}`;
  const where = ev.mode === 'offline' ? (ev.venueName || 'In person') : `Online${ev.platform ? ` on ${ev.platform}` : ''}`;
  const desc = [when, where, ev.shortDescription || 'Free event by SPR TechForge — register now.'].filter(Boolean).join(' · ').slice(0, 300);
  const imgDims = banner && banner.width ? `\n    <meta property="og:image:width" content="${banner.width}" />\n    <meta property="og:image:height" content="${banner.height}" />` : '';
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)} · SPR TechForge</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SPR TechForge" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:alt" content="${esc(ev.title || 'Event banner')}" />${imgDims}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    <!-- Humans go straight to the app; crawlers only read the tags above. -->
    <script>location.replace(${JSON.stringify(appUrl)});</script>
    <meta http-equiv="refresh" content="0; url=${appUrl}" />
    <style>body{font-family:Inter,Arial,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}a{color:#93c5fd}</style>
  </head>
  <body>
    <p>Opening <strong>${esc(ev.title || 'the event')}</strong>… <a href="${appUrl}">Continue</a></p>
  </body>
</html>
`;
  await writeFile(path.join(dir, 'index.html'), html);
  made++;
  console.log(`[share-pages] /e/${ev.slug}/  ${banner?.file ? `${banner.file} ${Math.round(banner.bytes / 1024)} KB${banner.width ? ` ${banner.width}x${banner.height}` : ''}` : (banner?.src ? 'hosted banner' : 'site poster')}`);
}
console.log(`[share-pages] ${made} page(s) written for ${origin}`);

// Keep the site's own OG image untouched — the company poster is correct for the home page.
await readFile(path.join(DIST, 'og-image.png')).catch(() => console.warn('[share-pages] og-image.png missing from dist'));
