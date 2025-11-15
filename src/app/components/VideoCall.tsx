// src/app/components/VideoCall.tsx
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

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: [
            "turn:relay.metered.ca:80",
            "turn:relay.metered.ca:443",
            "turns:relay.metered.ca:443",
          ],
          username: "openai",
          credential: "openai",
        },
      ],

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
        if (!remoteVideo.current.srcObject) {
          remoteVideo.current.srcObject = e.streams[0];
        } else {
          const vStream = remoteVideo.current.srcObject as MediaStream;
          if (!vStream.getTracks().length) {
            remoteVideo.current.srcObject = e.streams[0];
          }
        }
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("WebRTC connection state:", state);
      if (state === "disconnected" || state === "failed" || state === "closed") {
        setIsInCall(false);
      }
    };

    const handleOffer = async (msg: any) => {
      if (msg.to !== userId) return;

      setStatus("Incoming call…");

      await pcRef.current!.setRemoteDescription(msg.offer);

      const stream = await getUserMediaWithMeter();
      stream.getTracks().forEach((t) => pcRef.current!.addTrack(t, stream));

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      const answer = await pcRef.current!.createAnswer();
      await pcRef.current!.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        from: userId,
        to: msg.from,
        answer,
      });

      setStatus("Connected");
      setIsInCall(true);
    };

    const handleAnswer = async (msg: any) => {
      if (msg.to !== userId) return;

      await pcRef.current!.setRemoteDescription(msg.answer);
      setStatus("Connected");
      setIsInCall(true);
    };

    const handleIce = async (msg: any) => {
      if (msg.to !== userId) return;
      try {
        await pcRef.current!.addIceCandidate(msg.candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice", handleIce);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice", handleIce);
      cleanupAudio();
      stopLocalMedia();
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [userId, remoteId, socket]);

  const startCall = async () => {
    setStatus("Calling…");

    const stream = await getUserMediaWithMeter();
    localStream.current = stream;

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    stream.getTracks().forEach((t) => pcRef.current!.addTrack(t, stream));

    const offer = await pcRef.current!.createOffer();
    await pcRef.current!.setLocalDescription(offer);

    socket.emit("webrtc-offer", {
      from: userId,
      to: remoteId,
      offer,
    });
  };

  const endCall = () => {
    stopLocalMedia();
    cleanupAudio();
    pcRef.current?.getSenders().forEach((s) => {
      try {
        s.replaceTrack(null);
      } catch {
        // ignore
      }
    });
    pcRef.current?.close();
    pcRef.current = null;

    setIsInCall(false);
    setStatus("Call Ended");
  };

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

    const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    const data = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;

    const loop = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(data);

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
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
      }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setInputLevel(0);
  };

  const stopLocalMedia = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }
  };

  const Meter = ({ level }: { level: number }) => {
    const segments = 32;
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

  return (
      <div className="flex flex-col items-center bg-white dark:bg-[var(--color-darkcard)] rounded-2xl shadow-lg p-6 w-[900px] max-w-full gap-4">
        <div className="w-full flex items-center justify-between">
          <h3 className="font-semibold text-lg">Video Call</h3>
          <p className="text-sm opacity-70">{status}</p>
        </div>

        <div className="flex w-full justify-between gap-4">
          <div className="w-1/2">
            <video
                ref={localVideo}
                autoPlay
                muted
                playsInline
                className="w-full rounded-lg shadow"
            />
            <div className="mt-2">
              <Meter level={inputLevel} />
              <p className="text-xs text-center opacity-60 mt-1">Mic level</p>
            </div>
          </div>

          <div className="w-1/2">
            <video
                ref={remoteVideo}
                autoPlay
                playsInline
                className="w-full rounded-lg shadow"
            />
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
