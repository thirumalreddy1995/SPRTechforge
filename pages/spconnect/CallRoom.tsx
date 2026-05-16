import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { useApp } from '../../context/AppContext';

export const CallRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, callInvitations, endCall, showToast } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<DailyCall | null>(null);
  const handledDeclineRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const title = searchParams.get('title') || 'Video call';
  const returnTo = searchParams.get('returnTo') || '/chat';
  const invitationId = searchParams.get('invitationId');
  const roomUrlParam = searchParams.get('roomUrl');
  const invitation = invitationId ? callInvitations.find(i => i.id === invitationId) : null;
  const isCaller = !!invitation && !!user && invitation.callerId === user.id;
  const roomUrl = roomUrlParam || invitation?.roomUrl || '';

  // Caller-side: bail out if the callee declines.
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
    if (frameRef.current) {
      try { frameRef.current.destroy(); } catch {}
      frameRef.current = null;
    }
    navigate(returnTo, { replace: true });
  };

  useEffect(() => {
    if (!user || !roomUrl || !containerRef.current) return;
    let cancelled = false;

    const frame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: '0',
      },
      showLeaveButton: true,
      showFullscreenButton: true,
      showUserNameChangeUI: false,
    });

    frameRef.current = frame;

    frame
      .join({ url: roomUrl, userName: user.name })
      .then(() => {
        if (cancelled) return;
        setStatus('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('Daily join failed', e);
        setErrorMsg(e?.errorMsg || e?.message || 'Could not join the call');
        setStatus('error');
      });

    frame.on('left-meeting', () => {
      handleLeave();
    });
    frame.on('error', (e: any) => {
      console.error('Daily error', e);
      setErrorMsg(e?.errorMsg || 'Call error');
      setStatus('error');
    });

    return () => {
      cancelled = true;
      try { frame.destroy(); } catch {}
      frameRef.current = null;
    };
  }, [user?.id, roomUrl]);

  if (!user) return null;
  if (!roomId || !roomUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md text-center">
          <p className="font-semibold mb-2">Missing call details</p>
          <p className="text-sm text-slate-400 mb-4">No room URL was provided.</p>
          <button onClick={() => navigate(returnTo, { replace: true })} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-100 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{title}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Powered by Daily.co</p>
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
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 z-10 pointer-events-none">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Joining call…</p>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md text-center">
              <p className="text-slate-100 font-semibold mb-1">Couldn't start the call</p>
              <p className="text-slate-400 text-sm mb-4">{errorMsg}</p>
              <button onClick={handleLeave} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm">Go back</button>
            </div>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
};
