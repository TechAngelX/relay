"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";

interface VideoCallProps {
  userId: string;
  remoteId: string;
  mode: "video" | "audio";
}

export default function VideoCall({ userId, remoteId, mode }: VideoCallProps) {
  const socket = getSocket();

  const [status, setStatus] = useState("Idle");
  const [isInCall, setIsInCall] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);

  // audio meter
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);


  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-ice", {
          from: userId,
          to: remoteId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = e.streams[0];
      }
    };

    socket.on("webrtc-offer", async (msg) => {
      if (msg.to !== userId) return;

      setStatus("Incoming call…");

      await pcRef.current!.setRemoteDescription(msg.offer);

      const stream = await getUserMediaWithMeter();
      stream.getTracks().forEach((t) => pcRef.current!.addTrack(t, stream));

      localVideo.current!.srcObject = stream;

      const answer = await pcRef.current!.createAnswer();
      await pcRef.current!.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        from: userId,
        to: msg.from,
        answer,
      });

      setStatus("Connected");
      setIsInCall(true);
    });

    socket.on("webrtc-answer", async (msg) => {
      if (msg.to !== userId) return;

      await pcRef.current!.setRemoteDescription(msg.answer);
      setStatus("Connected");
      setIsInCall(true);
    });

    socket.on("webrtc-ice", async (msg) => {
      if (msg.to !== userId) return;

      try {
        await pcRef.current!.addIceCandidate(msg.candidate);
      } catch {}
    });

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
      cleanupAudio();
      stopLocalMedia();
      pcRef.current?.close();
    };
  }, [userId, remoteId]);


  // Start Call
  const startCall = async () => {
    setStatus("Calling…");

    const stream = await getUserMediaWithMeter();
    localStream.current = stream;
    localVideo.current!.srcObject = stream;

    stream.getTracks().forEach((t) => pcRef.current!.addTrack(t, stream));

    const offer = await pcRef.current!.createOffer();
    await pcRef.current!.setLocalDescription(offer);

    socket.emit("webrtc-offer", {
      from: userId,
      to: remoteId,
      offer,
    });
  };

  
  // End Call
  const endCall = () => {
    stopLocalMedia();
    cleanupAudio();
    pcRef.current?.close();

    setIsInCall(false);
    setStatus("Call Ended");
  };

  // Audio Meter
  const getUserMediaWithMeter = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: mode === "video",
      audio: true,
    });

    localStream.current = stream;
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

    const loop = () => {
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }

      const rms = Math.sqrt(sum / data.length);
      const lvl = Math.max(0, Math.min(1, rms * 5));
      setInputLevel(lvl);

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const cleanupAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close?.();
    analyserRef.current = null;
  };

  const stopLocalMedia = () => {
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
  };

  // Audio Meter UI
  const Meter = ({ level }: { level: number }) => {
    const segments = 32; // smoother animation
    const activeCount = Math.round(level * segments);

    return (
        <div className="audio-meter-modern">
          {Array.from({ length: segments }).map((_, i) => (
              <div
                  key={i}
                  className={`meter-segment ${i < activeCount ? "active" : ""}`}
              />
          ))}
        </div>
    );
  };

  // UI OUTPUT
    return (
      <div className="flex flex-col items-center bg-white dark:bg-[var(--color-darkcard)] rounded-2xl shadow-lg p-6 w-[900px] max-w-full gap-4">
        <div className="w-full flex items-center justify-between">
          <h3 className="font-semibold text-lg">Video Call</h3>
          <p className="text-sm opacity-70">{status}</p>
        </div>

        <div className="flex w-full justify-between gap-4">
          {/* Local */}
          <div className="w-1/2">
            <video ref={localVideo} autoPlay muted playsInline className="w-full rounded-lg shadow" />
            <div className="mt-2">
              <Meter level={inputLevel} />
              <p className="text-xs text-center opacity-60 mt-1">Mic level</p>
            </div>
          </div>

          {/* Remote */}
          <div className="w-1/2">
            <video ref={remoteVideo} autoPlay playsInline className="w-full rounded-lg shadow" />
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
              onClick={startCall}
              disabled={isInCall}
              className="px-4 py-2 rounded-lg bg-[var(--color-darkaccent)] text-white disabled:opacity-40"
          >
            Start Call
          </button>

          <button
              onClick={endCall}
              disabled={!isInCall}
              className="px-4 py-2 rounded-lg bg-red-500 text-white disabled:opacity-40"
          >
            End Call
          </button>
        </div>
      </div>
  );
}
