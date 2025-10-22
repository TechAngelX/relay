// src/app/testcall/page.tsx
'use client';

import VideoCall from '../components/VideoCall';

export default function TestCallPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-[var(--color-darkbg)]">
      <h1 className="text-2xl font-bold mb-6">Peer-to-Peer Video Call Test</h1>

      {/* 👇 Change these manually to simulate two users */}
        <VideoCall userId="userA" remoteId="userB" mode="audio" />
    </div>
  );
}

