import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * Renders a full-screen "incoming call" overlay whenever the current user has
 * a ringing CallInvitation. Listens for it via useApp().incomingCall.
 *
 * Hidden while the user is already inside a /call/:roomId route, so we don't
 * overlay a call with another call.
 */
export const IncomingCallOverlay: React.FC = () => {
  const { user, incomingCall, acceptCall, declineCall, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const ringingTone = useRef<HTMLAudioElement | null>(null);

  const onCallPage = location.pathname.startsWith('/call/');
  const show = !!incomingCall && !onCallPage && !!user;

  useEffect(() => {
    if (!show) {
      if (ringingTone.current) {
        ringingTone.current.pause();
        ringingTone.current = null;
      }
      return;
    }
    // Soft "ring" via a synthesized beep loop. Avoids needing a bundled audio file.
    try {
      const AudioCtor = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 480;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
      };
      playBeep();
      const id = window.setInterval(playBeep, 1500);
      return () => {
        window.clearInterval(id);
        try { ctx.close(); } catch {}
      };
    } catch {
      // Audio failed silently; visual ring still works
    }
  }, [show, incomingCall?.id]);

  if (!show || !incomingCall) return null;

  const handleAccept = async () => {
    try {
      const updated = await acceptCall(incomingCall.id);
      if (updated) {
        navigate(`/call/${encodeURIComponent(updated.roomId)}?title=${encodeURIComponent(`Call with ${updated.callerName}`)}&returnTo=${encodeURIComponent('/chat')}&invitationId=${encodeURIComponent(updated.id)}`);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to answer', 'error');
    }
  };

  const handleDecline = async () => {
    try {
      await declineCall(incomingCall.id);
    } catch (e: any) {
      showToast(e.message || 'Failed to decline', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 animate-pulse">Incoming call</div>
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold mb-4 ring-4 ring-blue-500/20 animate-pulse">
          {incomingCall.callerName.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-white text-xl font-semibold mb-1">{incomingCall.callerName}</h2>
        <p className="text-slate-400 text-sm mb-6">is calling you…</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDecline}
            title="Decline"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <svg className="w-7 h-7 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>
          <button
            onClick={handleAccept}
            title="Accept"
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>
        </div>
        <div className="flex justify-center gap-8 mt-3">
          <span className="text-xs text-slate-500 w-16">Decline</span>
          <span className="text-xs text-slate-500 w-16">Accept</span>
        </div>
      </div>
    </div>
  );
};
