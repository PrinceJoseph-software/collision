"use client";

import { ChangeEvent } from "react";
import { useMixerStore } from "@/store/useMixerStore";
import { audioEngine } from "@/lib/audioEngine";

export function Crossfader() {
  const store = useMixerStore();

  const handleCrossfade = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    store.setCrossfaderValue(value);
    audioEngine.setCrossfade(value);
  };

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-surface-hover)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
        <span>DECK A</span>
        <span style={{ color: 'var(--color-bronze)' }}>CROSSFADER</span>
        <span>DECK B</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={store.crossfaderValue} 
        onChange={handleCrossfade}
        style={{ 
          accentColor: 'var(--color-bronze)',
          height: '4px'
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '8px 16px', fontSize: '12px' }}
          onClick={() => {
            store.setCrossfaderValue(0.5);
            audioEngine.setCrossfade(0.5);
          }}
        >
          Center
        </button>
      </div>
    </div>
  );
}
