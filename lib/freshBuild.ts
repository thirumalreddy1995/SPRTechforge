// Keeps a long-lived tab working across deploys.
//
// Every deploy renames the hashed JS chunks and deletes the old ones, while
// GitHub Pages lets browsers keep index.html for 10 minutes. A phone that still
// has the previous build open then asks for a chunk that no longer exists, the
// lazy route throws, and the visitor sees a blank screen until several manual
// refreshes finally pick up the new index.html. Two defences:
//
//  1. loadChunk(): when a lazy import fails, force the HTML out of the HTTP
//     cache and reload once. The flag lives in sessionStorage so a genuinely
//     broken build cannot loop.
//  2. useFreshBuild(): when the tab comes back to the foreground or the route
//     changes, compare the running build id with /version.json (no-store). If a
//     newer build is live, reload on the next route change — the visitor is
//     already navigating, so the reload is barely noticeable and never
//     interrupts a half-filled form.

import { useEffect } from 'react';

declare const __BUILD_ID__: string;
export const BUILD_ID: string = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'dev';

const RELOAD_FLAG = 'spr:chunk-reload';
const CHECK_INTERVAL_MS = 2 * 60 * 1000;

/** Re-fetch the HTML from the network (updating the HTTP cache) and reload. */
export const hardReload = async (): Promise<void> => {
  try { await fetch(window.location.pathname || '/', { cache: 'reload', credentials: 'same-origin' }); } catch { /* offline — plain reload below */ }
  window.location.reload();
};

/** Wraps a dynamic import so a missing chunk (stale build) heals itself. */
export const loadChunk = async <T,>(loader: () => Promise<T>): Promise<T> => {
  try {
    const mod = await loader();
    try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* storage may be unavailable */ }
    return mod;
  } catch (err) {
    let already = false;
    try { already = sessionStorage.getItem(RELOAD_FLAG) === BUILD_ID; sessionStorage.setItem(RELOAD_FLAG, BUILD_ID); } catch { /* ignore */ }
    if (!already) {
      await hardReload();
      // The page is unloading; keep React waiting instead of showing an error.
      return new Promise<T>(() => {});
    }
    throw err;
  }
};

let lastCheck = 0;
let newerBuildSeen = false;

const checkForNewBuild = async (): Promise<void> => {
  if (BUILD_ID === 'dev') return;
  const now = Date.now();
  if (now - lastCheck < CHECK_INTERVAL_MS) return;
  lastCheck = now;
  try {
    const r = await fetch(`./version.json?t=${now}`, { cache: 'no-store' });
    if (!r.ok) return;
    const v = await r.json() as { id?: string };
    if (v.id && v.id !== BUILD_ID) newerBuildSeen = true;
  } catch { /* best-effort */ }
};

/** Mount once near the root. */
export const useFreshBuild = (): void => {
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') void checkForNewBuild(); };
    const onRoute = () => {
      if (newerBuildSeen) { void hardReload(); return; }
      void checkForNewBuild();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('hashchange', onRoute);
    void checkForNewBuild();
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('hashchange', onRoute);
    };
  }, []);
};
