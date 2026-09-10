// YouTube link handling for the optional event intro video. Pure functions —
// covered by events/tests. Accepts every common share format and turns it
// into a privacy-enhanced embed URL (youtube-nocookie.com).

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extracts the 11-char video ID from any of:
 *   https://www.youtube.com/watch?v=ID[&...]
 *   https://youtu.be/ID[?...]
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/live/ID
 *   a bare ID
 * Returns '' when nothing usable is found.
 */
export const youtubeVideoId = (input: string): string => {
  const raw = (input || '').trim();
  if (!raw) return '';
  if (YT_ID.test(raw)) return raw;
  let url: URL;
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return '';
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] || '';
    return YT_ID.test(id) ? id : '';
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v');
    if (v && YT_ID.test(v)) return v;
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex(p => p === 'embed' || p === 'shorts' || p === 'live' || p === 'v');
    const id = idx >= 0 ? parts[idx + 1] || '' : '';
    return YT_ID.test(id) ? id : '';
  }
  return '';
};

/** Embed URL for an <iframe>, or '' when the link is not a YouTube video. */
export const youtubeEmbedUrl = (input: string): string => {
  const id = youtubeVideoId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : '';
};

/** Static thumbnail (used for previews in the editor). */
export const youtubeThumbnailUrl = (input: string): string => {
  const id = youtubeVideoId(input);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
};
