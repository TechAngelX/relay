// src/app/components/CameraTest.tsx
"use client";
import { useEffect, useRef } from "react";

export default function CameraTest() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        async function startCam() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Camera error:", err);
            }
        }
        startCam();
    }, []);

    return (
        <div className="flex flex-col items-center">
            <h2>Camera Test</h2>
            <video ref={videoRef} autoPlay playsInline className="rounded-xl mt-4 w-1/2" />
        </div>
    );
}
