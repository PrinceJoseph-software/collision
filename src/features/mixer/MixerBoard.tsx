"use client";

import { Play, Pause, Disc, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Deck } from "./Deck";
import { Crossfader } from "./Crossfader";
import { useMixerStore } from "@/store/useMixerStore";
import { audioEngine } from "@/lib/audioEngine";
import { exportToMp3, exportToWav } from "@/lib/exportAudio";

export function MixerBoard() {
  const store = useMixerStore();
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  
  const handlePlayPause = () => {
    if (store.isPlaying) {
      audioEngine.pause();
      store.setIsPlaying(false);
    } else {
      audioEngine.play();
      store.setIsPlaying(true);
    }
  };

  const handleRecordToggle = async () => {
    if (store.isRecording) {
      const blob = await audioEngine.stopRecording();
      setRecordingBlob(blob);
      store.setIsRecording(false);
    } else {
      setRecordingBlob(null);
      audioEngine.startRecording();
      store.setIsRecording(true);
    }
  };

  const isReady = store.deckA.isLoaded || store.deckB.isLoaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Deck deck="A" />
        <Deck deck="B" />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
        <button 
          className="btn btn-primary" 
          style={{ width: '120px', height: '56px', borderRadius: '6px', fontSize: '14px', gap: '8px' }}
          onClick={handlePlayPause}
          disabled={!isReady}
        >
          {store.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          {store.isPlaying ? 'Pause' : 'Play'}
        </button>

        <button 
          className="btn" 
          style={{ 
            width: '120px', 
            height: '56px', 
            borderRadius: '6px', 
            backgroundColor: store.isRecording ? 'var(--color-error)' : 'var(--color-surface-hover)',
            border: '1px solid var(--color-surface-hover)',
            color: 'white',
            display: 'flex',
            gap: '8px',
            fontSize: '14px'
          }}
          onClick={handleRecordToggle}
          disabled={!isReady && !store.isRecording}
        >
          <Disc size={20} className={store.isRecording ? 'spin-animation' : ''} />
          {store.isRecording ? 'Stop' : 'Record'}
        </button>

        <button 
          className="btn btn-secondary" 
          style={{ 
            width: '120px', 
            height: '56px', 
            borderRadius: '6px', 
            display: 'flex', 
            gap: '8px',
            fontSize: '14px'
          }}
          onClick={() => {
            store.resetStore();
            audioEngine.reset();
          }}
          disabled={!isReady}
        >
          <RotateCcw size={20} /> Reset
        </button>
      </div>

      {recordingBlob && (
        <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--color-surface-hover)' }}>
          <span style={{ fontWeight: 600 }}>Mix recorded successfully!</span>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px', gap: '8px' }} onClick={() => exportToMp3(recordingBlob)}>
            <Download size={16} /> MP3
          </button>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', gap: '8px' }} onClick={() => exportToWav(recordingBlob)}>
            <Download size={16} /> WAV
          </button>
        </div>
      )}

      <Crossfader />
    </div>
  );
}
