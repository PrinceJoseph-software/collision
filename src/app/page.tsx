"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MixerBoard } from "@/features/mixer/MixerBoard";
import { audioEngine } from "@/lib/audioEngine";
import { Disc } from "lucide-react";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = async () => {
    await audioEngine.initialize();
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-zinc-950)', color: 'var(--color-text)' }}>
        <h1 style={{ fontSize: '72px', fontWeight: 300, marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Collision
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '48px', fontWeight: 300, letterSpacing: '0.01em' }}>
          Hear what happens when your songs collide.
        </p>
        <button 
          className="btn btn-primary" 
          style={{ fontSize: '16px', padding: '16px 32px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }} 
          onClick={handleStart}
        >
          <Disc size={20} />
          Start Mixing
        </button>
      </div>
    );
  }

  return (
    <MainLayout>
      <MixerBoard />
    </MainLayout>
  );
}
