import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const DAILY_API_KEY = defineSecret('DAILY_API_KEY');

const DAILY_API = 'https://api.daily.co/v1';
const DEFAULT_EXPIRY_MINUTES = 90;

interface CreateCallRoomData {
  roomName?: string;
  expiryMinutes?: number;
}

export const createCallRoom = onCall(
  { secrets: [DAILY_API_KEY] },
  async (request) => {
    const apiKey = DAILY_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'DAILY_API_KEY is not configured for this Firebase project.');
    }

    const data = (request.data ?? {}) as CreateCallRoomData;

    const expiryMinutes = Math.min(Math.max(data.expiryMinutes ?? DEFAULT_EXPIRY_MINUTES, 5), 60 * 12);
    const exp = Math.floor(Date.now() / 1000) + expiryMinutes * 60;
    const safeName = (data.roomName || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    const fallback = `spr-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

    const body = {
      name: safeName || fallback,
      privacy: 'public' as const,
      properties: {
        exp,
        enable_screenshare: true,
        enable_chat: true,
        enable_knocking: false,
        start_video_off: false,
        start_audio_off: false,
        max_participants: 25,
        eject_at_room_exp: true,
      },
    };

    const res = await fetch(`${DAILY_API}/rooms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // 409 = room already exists — happens if the client retries. Fetch it instead.
      if (res.status === 409 && body.name) {
        const existing = await fetch(`${DAILY_API}/rooms/${body.name}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (existing.ok) {
          const room = (await existing.json()) as { name: string; url: string };
          return { name: room.name, url: room.url, reused: true };
        }
      }
      console.error('Daily room creation failed', res.status, text);
      throw new HttpsError('internal', `Daily.co returned ${res.status}`);
    }

    const room = (await res.json()) as { name: string; url: string };
    return { name: room.name, url: room.url, reused: false };
  }
);
