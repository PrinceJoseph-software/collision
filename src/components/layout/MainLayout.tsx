"use client";

import { ReactNode, useState } from "react";
import { useMixerStore } from "@/store/useMixerStore";
import { HelpCircle, X, Trash2 } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const store = useMixerStore();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--color-text)', fontWeight: 300, letterSpacing: '-0.02em' }}>
            Collision
          </h1>
          <p style={{ marginLeft: '12px', color: 'var(--color-bronze)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>BETA</p>
        </div>
        
        <button 
          className="btn btn-secondary" 
          style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px' }}
          onClick={() => setShowHelp(true)}
          title="Help & Info"
        >
          <HelpCircle size={20} />
        </button>
      </header>
      
      <main className="grid" style={{ flex: 1, paddingBottom: '48px', justifyContent: 'center' }}>
        {/* Core Mixer */}
        <div className="col-span-12" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(11, 11, 15, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              onClick={() => setShowHelp(false)}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-bronze)', fontWeight: 300 }}>How to Mix</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', lineHeight: '1.6', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              <li><strong>Upload Tracks:</strong> Use the upload zones in Deck A and B. You can clear a track by clicking the <Trash2 size={14} style={{ verticalAlign: 'middle' }} /> icon.</li>
              <li><strong>Independent Seeking:</strong> Each deck has its own progress bar. Drag the slider to jump to a specific part of that song without affecting the other.</li>
              <li><strong>Crossfader:</strong> Use the master slider at the bottom to transition audio between Deck A and Deck B.</li>
              <li><strong>EQ & Pitch:</strong> Use the EQ to blend frequencies (dropping the bass on one while raising it on the other is a classic move). Use Pitch to match track speeds.</li>
              <li><strong>Record & Export:</strong> Capture your master mix live. When you stop recording, you can export it as a high-quality <strong>MP3</strong> or a lossless <strong>WAV</strong>.</li>
              <li><strong>Universal Reset:</strong> Hit Reset to instantly zero out all settings, EQs, and playback positions for a fresh start.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
