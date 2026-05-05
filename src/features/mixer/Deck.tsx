"use client";

import { ChangeEvent, useRef, useEffect, useState } from "react";
import { UploadCloud, Music, Trash2, Link2, Globe } from "lucide-react";
import { useMixerStore } from "@/store/useMixerStore";
import { audioEngine } from "@/lib/audioEngine";

interface DeckProps {
  deck: "A" | "B";
}

export function Deck({ deck }: DeckProps) {
  const store = useMixerStore();
  const deckState = deck === "A" ? store.deckA : store.deckB;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inputMode, setInputMode] = useState<'upload' | 'link'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (deckState.isLoaded && canvasRef.current) {
      const buffer = deck === "A" ? audioEngine.getBufferA() : audioEngine.getBufferB();
      if (!buffer) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const channelData = buffer.getChannelData(0);
      const width = canvas.width;
      const height = canvas.height;
      const step = Math.ceil(channelData.length / width);
      const amp = height / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(146, 64, 14, 0.6)"; // Muted bronze with transparency

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = channelData[i * step + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
      }
    }
  }, [deckState.isLoaded, deck]);

  // Progress tracking loop
  useEffect(() => {
    let frameId: number;
    
    const updateProgress = () => {
      if (store.isPlaying) {
        const time = deck === "A" ? audioEngine.getCurrentTimeA() : audioEngine.getCurrentTimeB();
        setCurrentTime(time);
      }
      frameId = requestAnimationFrame(updateProgress);
    };

    frameId = requestAnimationFrame(updateProgress);

    const buffer = deck === "A" ? audioEngine.getBufferA() : audioEngine.getBufferB();
    if (buffer) {
      setDuration(buffer.duration);
    }

    return () => cancelAnimationFrame(frameId);
  }, [store.isPlaying, deck, deckState.isLoaded]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    store.setDeckTrack(deck, url, file.name);

    if (deck === "A") {
      await audioEngine.loadTrackA(url, () => {
        store.setDeckLoaded(deck, true);
      });
    } else {
      await audioEngine.loadTrackB(url, () => {
        store.setDeckLoaded(deck, true);
      });
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (deck === "A") {
      audioEngine.seekA(time);
    } else {
      audioEngine.seekB(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch metadata');
      
      const data = await response.json();
      
      // 2. Search for the best audio match
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${data.name} ${data.artist}` }),
      });
      
      if (!searchResponse.ok) throw new Error('Failed to find audio match');
      const searchData = await searchResponse.json();
      
      // 3. Load the audio into the engine
      // We use a redundant bridge URL for better stability
      const bridgeUrl = `https://api.v-mp3.com/@api/button/mp3/${searchData.videoId}`;
      
      // We inform the user we are buffering
      store.setDeckTrack(deck, "streaming", `Buffering: ${data.name}...`);
      
      if (deck === "A") {
        await audioEngine.loadTrackA(bridgeUrl, () => {
          store.setDeckLoaded(deck, true);
        });
      } else {
        await audioEngine.loadTrackB(bridgeUrl, () => {
          store.setDeckLoaded(deck, true);
        });
      }
      
      store.setDeckTrack(deck, bridgeUrl, `${data.name} - ${data.artist}`);
      setIsSearching(false);
    } catch (error) {
      console.error(error);
      setIsSearching(false);
      alert("Error finding or loading track. Some streaming sources may be restricted.");
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    store.setDeckVolume(deck, volume);
    if (deck === "A") {
      audioEngine.setVolumeA(volume);
    } else {
      audioEngine.setVolumeB(volume);
    }
  };
  
  const handleRemoveTrack = () => {
    store.removeDeckTrack(deck);
    if (deck === "A") {
      audioEngine.seekA(0);
      audioEngine.setVolumeA(1);
    } else {
      audioEngine.seekB(0);
      audioEngine.setVolumeB(1);
    }

    // If the other deck is also empty, stop the global playback
    const otherDeck = deck === "A" ? store.deckB : store.deckA;
    if (!otherDeck.trackUrl) {
      audioEngine.pause();
      store.setIsPlaying(false);
    }
  };

  const handleEqChange = (band: 'high' | 'mid' | 'low') => (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    store.setDeckEq(deck, band, val);
    if (deck === "A") {
      audioEngine.setEqA(band, val);
    } else {
      audioEngine.setEqB(band, val);
    }
  };

  const handlePitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    store.setDeckPlaybackRate(deck, rate);
    if (deck === "A") {
      audioEngine.setPlaybackRateA(rate);
    } else {
      audioEngine.setPlaybackRateB(rate);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--color-text)', fontWeight: 300, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Deck {deck}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {deckState.isLoaded && (
            <>
              <button 
                onClick={handleRemoveTrack}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--color-text-muted)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title="Remove Track"
              >
                <Trash2 size={16} />
              </button>
              <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--color-success)', color: 'white' }}>Ready</span>
            </>
          )}
        </div>
      </div>

      {!deckState.trackUrl ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: 'var(--color-zinc-950)', borderRadius: '6px' }}>
            <button 
              onClick={() => setInputMode('upload')}
              style={{ 
                flex: 1, 
                padding: '6px', 
                borderRadius: '4px', 
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'upload' ? 'var(--color-surface-hover)' : 'transparent',
                color: inputMode === 'upload' ? 'var(--color-text)' : 'var(--color-text-muted)'
              }}
            >
              Upload
            </button>
            <button 
              onClick={() => setInputMode('link')}
              style={{ 
                flex: 1, 
                padding: '6px', 
                borderRadius: '4px', 
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'link' ? 'var(--color-surface-hover)' : 'transparent',
                color: inputMode === 'link' ? 'var(--color-text)' : 'var(--color-text-muted)'
              }}
            >
              Link
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {inputMode === 'upload' ? (
              <label className="upload-label" style={{ width: '100%', height: '100%' }}>
                <UploadCloud size={32} color="var(--color-bronze)" strokeWidth={1.5} />
                <span style={{ marginTop: '16px', fontWeight: 400, fontSize: '14px' }}>Click to upload track</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>MP3, WAV, AAC</span>
                <input 
                  type="file" 
                  accept="audio/*" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                border: '1px dashed var(--color-surface-hover)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(146, 64, 14, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Link2 size={24} color="var(--color-bronze)" strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '14px', marginBottom: '16px', fontWeight: 400 }}>Paste Spotify or Apple Music link</p>
                <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="https://open.spotify.com/track/..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{ 
                      flex: 1, 
                      backgroundColor: 'var(--color-zinc-950)', 
                      border: '1px solid var(--color-surface-hover)', 
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: 'var(--color-text)',
                      outline: 'none'
                    }}
                  />
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                    onClick={handleUrlLoad}
                    disabled={isSearching}
                  >
                    {isSearching ? '...' : 'Load'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', opacity: 0.5 }}>
                  <Globe size={14} />
                  <span style={{ fontSize: '10px', letterSpacing: '0.05em' }}>SPOTIFY & APPLE MUSIC SUPPORTED</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            flex: 1, 
            backgroundColor: 'var(--color-zinc-950)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Waveform Canvas */}
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={100} 
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.8 }} 
            />
            
            {!deckState.isLoaded && (
              <div style={{ position: 'absolute', opacity: 0.1 }}>
                <Music size={120} color="var(--color-text)" strokeWidth={1} />
              </div>
            )}
            
            <div style={{ zIndex: 1, textAlign: 'center', pointerEvents: 'none' }}>
              <p style={{ fontWeight: 600 }}>{deckState.fileName}</p>
              {!deckState.isLoaded && <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Loading audio buffer...</p>}
            </div>
          </div>

          {/* Seek Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              step="0.1" 
              value={currentTime} 
              onChange={handleSeek}
              className="range-sm"
              style={{ 
                accentColor: 'var(--color-bronze)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', width: '32px' }}>Vol</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={deckState.volume}
                onChange={handleVolumeChange}
                style={{ flex: 1 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* EQ Controls */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>EQ</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['high', 'mid', 'low'].map((band) => (
                    <div key={band} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', width: '12px', textAlign: 'center' }}>{band[0].toUpperCase()}</span>
                      <input 
                        className="range-sm"
                        type="range" 
                        min="-20" 
                        max="10" 
                        step="1" 
                        value={deckState.eq[band as keyof typeof deckState.eq]}
                        onChange={handleEqChange(band as any)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitch Control */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Pitch ({deckState.playbackRate.toFixed(2)}x)</span>
                <input 
                  className="range-sm"
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.01" 
                  value={deckState.playbackRate}
                  onChange={handlePitchChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
