// src/app/components/VideoCall.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { getSocket } from '../services/socket';

interface VideoCallProps {
  userId: string;
  remoteId?: string;
}

export default function VideoCall({ userId, remoteId }: VideoCallProps) {
  const [peerId, setPeerId] = useState<string>('');
  const [connectedId, setConnectedId] = useState<string>('');
  const [status, setStatus] = useState<string>('Idle');
  const [isInCall, setIsInCall] = useState(false);
  const [inputLevel, setInputLevel] = useState(0); // mic level 0..1

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer>();
  const currentCall = useRef<MediaConnection>();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const socket = getSocket();

  useEffect(() => {
    const peer = new Peer(userId);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('Ready');
    });

    // Incoming call
    peer.on('call', async (call) => {
      setStatus(`Incoming call from ${call.peer}`);
      const stream = await getUserMediaWithMeter();
      localVideo.current!.srcObject = stream;
      call.answer(stream);
      currentCall.current = call;

      call.on('stream', (remoteStream) => {
        remoteVideo.current!.srcObject = remoteStream;
        setIsInCall(true);
        setConnectedId(call.peer);
      });

      call.on('close', () => handleEndCall());
      call.on('error', () => handleEndCall());
    });

    return () => {
      try { peer.destroy(); } catch {}
      cleanupAudio();
      stopLocalStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const startCall = async () => {
    if (!remoteId) return alert('Missing remote peer ID');
    setStatus(`Calling ${remoteId}...`);
    const stream = await getUserMediaWithMeter();
    localVideo.current!.srcObject = stream;

    const call = peerRef.current!.call(remoteId, stream);
    currentCall.current = call;

    call.on('stream', (remoteStream) => {
      remoteVideo.current!.srcObject = remoteStream;
      setIsInCall(true);
      setConnectedId(remoteId);
      setStatus('In call');
    });

    call.on('close', () => handleEndCall());
    call.on('error', () => handleEndCall());
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setConnectedId('');
    setStatus('Call ended');
    cleanupAudio();
    stopLocalStream();
  };

  const endCall = () => {
    try { currentCall.current?.close(); } catch {}
    handleEndCall();
  };

  const getUserMediaWithMeter = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    startAudioMeter(stream);
    return stream;
  };

  const startAudioMeter = (stream: MediaStream) => {
    cleanupAudio();

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    const data = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      const level = Math.max(0, Math.min(1, (rms - 0.02) / 0.6));
      setInputLevel(level);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const cleanupAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setInputLevel(0);
  };

  const stopLocalStream = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
  };

  const Meter = ({ level }: { level: number }) => {
    const segments = 20;
    const activeCount = Math.round(level * segments);

    return (
        <div className="audio-meter w-full">
          {Array.from({ length: segments }).map((_, i) => (
              <div
                  key={i}
                  className={`bar ${i < activeCount ? 'active' : ''}`}
              />
          ))}
        </div>
    );
  };


  return (
      <div className="flex flex-col items-center bg-white dark:bg-[var(--color-darkcard)] p-6 rounded-2xl shadow-lg w-full max-w-3xl gap-4">
        <div className="w-full flex items-center justify-between">
          <h3 className="font-semibold text-lg">Video Call</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
        </div>

        <div className="flex gap-4 w-full justify-between">
          <div className="w-1/2">
            <video ref={localVideo} autoPlay muted playsInline className="w-full rounded-lg shadow" />
            <div className="mt-2">
              <Meter level={inputLevel} />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                Mic level
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <video ref={remoteVideo} autoPlay playsInline className="w-full rounded-lg shadow" />
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
              onClick={startCall}
              disabled={isInCall || !remoteId}
              className="bg-[var(--color-darkaccent)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            Start Call
          </button>
          <button
              onClick={endCall}
              disabled={!isInCall}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            End Call
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Your Peer ID: {peerId || '—'} · Connected to: {connectedId || '—'}
        </div>
      </div>
  );
}
