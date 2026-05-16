import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

const JITSI_DOMAIN = 'meet.jit.si';
const SCRIPT_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

const loadJitsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Jitsi')));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Jitsi'));
    document.body.appendChild(script);
  });
};

export const CallRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, callInvitations, endCall, showToast } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const title = searchParams.get('title') || '';
  const returnTo = searchParams.get('returnTo') || '/chat';
  const invitationId = searchParams.get('invitationId');
  const invitation = invitationId ? callInvitations.find(i => i.id === invitationId) : null;
  const isCaller = !!invitation && !!user && invitation.callerId === user.id;
  const handledDeclineRef = useRef(false);

  // Caller-side: if callee declines, exit the empty room with a toast.
  useEffect(() => {
    if (!invitation || !isCaller || handledDeclineRef.current) return;
    if (invitation.status === 'declined') {
      handledDeclineRef.current = true;
      showToast(`${invitation.calleeName || 'They'} declined the call`, 'info');
      navigate(returnTo, { replace: true });
    }
  }, [invitation?.status, isCaller, navigate, returnTo, showToast]);

  const handleLeave = () => {
    if (invitation && invitation.status !== 'ended' && invitation.status !== 'declined') {
      endCall(invitation.id).catch(() => {});
    }
    navigate(returnTo, { replace: true });
  };

  useEffect(() => {
    if (!roomId || !user) return;
    let cancelled = false;

    const init = async () => {
      try {
        await loadJitsiScript();
        if (cancelled) return;
        if (!containerRef.current) return;
        if (!window.JitsiMeetExternalAPI) throw new Error('Jitsi API not available');

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: roomId,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user.name,
            email: user.username,
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            disableDeepLinking: true,
            enableLobbyChat: false,
            enableInsecureRoomNameWarning: false,
            requireDisplayName: false,
            disableModeratorIndicator: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            DISABLE_VIDEO_BACKGROUND: false,
            HIDE_INVITE_MORE_HEADER: true,
          },
        });

        api.addEventListener('readyToClose', () => {
          handleLeave();
        });

        apiRef.current = api;
        setStatus('ready');
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message || 'Could not start the call');
        setStatus('error');
      }
    };

    init();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [roomId, user?.id]);

  if (!user) return null;
  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-700">
        <p>Missing call ID.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-100 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{title || 'Video call'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Powered by Jitsi Meet</p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
        >
          Leave
        </button>
      </div>
      <div className="flex-1 relative">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Joining call…</p>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md text-center">
              <p className="text-slate-100 font-semibold mb-1">Couldn't start the call</p>
              <p className="text-slate-400 text-sm mb-4">{errorMsg}</p>
              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
              >
                Go back
              </button>
            </div>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
};
