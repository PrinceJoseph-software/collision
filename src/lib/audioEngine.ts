import * as Tone from 'tone';

class AudioEngine {
  private playerA: Tone.Player | null = null;
  private playerB: Tone.Player | null = null;
  private eqA: Tone.EQ3 | null = null;
  private eqB: Tone.EQ3 | null = null;
  private crossFade: Tone.CrossFade | null = null;
  private recorder: Tone.Recorder | null = null;
  private isInitialized = false;

  // Track independent play states
  private startTimeA = 0;
  private startTimeB = 0;
  private offsetA = 0;
  private offsetB = 0;
  private isPlaying = false;

  async initialize() {
    if (this.isInitialized) return;
    
    // Explicitly start Tone context on user gesture
    await Tone.start();
    
    this.eqA = new Tone.EQ3(0, 0, 0);
    this.eqB = new Tone.EQ3(0, 0, 0);

    this.crossFade = new Tone.CrossFade().toDestination();
    this.crossFade.fade.value = 0.5;

    this.recorder = new Tone.Recorder();
    Tone.getDestination().connect(this.recorder);
    
    this.isInitialized = true;
    console.log("Audio Engine Initialized & Context Resumed");
  }

  async loadTrackA(url: string, onLoad?: () => void) {
    if (!this.isInitialized) await this.initialize();
    if (this.playerA) this.playerA.dispose();
    
    return new Promise<void>((resolve, reject) => {
      this.playerA = new Tone.Player({
        url,
        onload: () => {
          if (this.eqA && this.crossFade) {
            this.playerA?.chain(this.eqA, this.crossFade.a);
          }
          this.offsetA = 0;
          if (onLoad) onLoad();
          resolve();
        },
        onerror: (err) => {
          console.error("Error loading Track A:", err);
          reject(err);
        }
      });
    });
  }

  async loadTrackB(url: string, onLoad?: () => void) {
    if (!this.isInitialized) await this.initialize();
    if (this.playerB) this.playerB.dispose();
    
    return new Promise<void>((resolve, reject) => {
      this.playerB = new Tone.Player({
        url,
        onload: () => {
          if (this.eqB && this.crossFade) {
            this.playerB?.chain(this.eqB, this.crossFade.b);
          }
          this.offsetB = 0;
          if (onLoad) onLoad();
          resolve();
        },
        onerror: (err) => {
          console.error("Error loading Track B:", err);
          reject(err);
        }
      });
    });
  }

  play() {
    if (!this.isInitialized) return;
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    const now = Tone.now();
    if (this.playerA?.buffer.loaded) {
      this.playerA.start(now, this.offsetA);
      this.startTimeA = now;
    }
    if (this.playerB?.buffer.loaded) {
      this.playerB.start(now, this.offsetB);
      this.startTimeB = now;
    }
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    const now = Tone.now();
    if (this.playerA) {
      this.offsetA = this.getCurrentTimeA();
      this.playerA.stop(now);
    }
    if (this.playerB) {
      this.offsetB = this.getCurrentTimeB();
      this.playerB.stop(now);
    }
  }

  seekA(time: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.offsetA = time;
    if (wasPlaying) this.play();
  }

  seekB(time: number) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.offsetB = time;
    if (wasPlaying) this.play();
  }

  getCurrentTimeA() {
    if (!this.playerA) return 0;
    if (this.isPlaying && this.playerA.state === 'started') {
      return this.offsetA + (Tone.now() - this.startTimeA) * this.playerA.playbackRate;
    }
    return this.offsetA;
  }

  getCurrentTimeB() {
    if (!this.playerB) return 0;
    if (this.isPlaying && this.playerB.state === 'started') {
      return this.offsetB + (Tone.now() - this.startTimeB) * this.playerB.playbackRate;
    }
    return this.offsetB;
  }

  setCrossfade(value: number) {
    if (this.crossFade) this.crossFade.fade.rampTo(value, 0.05);
  }

  setVolumeA(value: number) {
    if (this.playerA) {
      const db = value === 0 ? -Infinity : 20 * Math.log10(value);
      this.playerA.volume.value = db;
    }
  }

  setVolumeB(value: number) {
    if (this.playerB) {
      const db = value === 0 ? -Infinity : 20 * Math.log10(value);
      this.playerB.volume.value = db;
    }
  }

  setEqA(band: 'high' | 'mid' | 'low', value: number) {
    if (this.eqA) this.eqA[band].value = value;
  }

  setEqB(band: 'high' | 'mid' | 'low', value: number) {
    if (this.eqB) this.eqB[band].value = value;
  }

  setPlaybackRateA(rate: number) {
    if (this.playerA) {
      const wasPlaying = this.isPlaying;
      if (wasPlaying) this.pause();
      this.playerA.playbackRate = rate;
      if (wasPlaying) this.play();
    }
  }

  setPlaybackRateB(rate: number) {
    if (this.playerB) {
      const wasPlaying = this.isPlaying;
      if (wasPlaying) this.pause();
      this.playerB.playbackRate = rate;
      if (wasPlaying) this.play();
    }
  }

  startRecording() {
    if (this.recorder && this.recorder.state !== 'started') {
      this.recorder.start();
    }
  }

  async stopRecording(): Promise<Blob | null> {
    if (this.recorder && this.recorder.state === 'started') {
      return await this.recorder.stop();
    }
    return null;
  }

  getBufferA() { return this.playerA?.buffer; }
  getBufferB() { return this.playerB?.buffer; }

  reset() {
    this.pause();
    this.offsetA = 0;
    this.offsetB = 0;
    this.setCrossfade(0.5);
    this.setVolumeA(1);
    this.setVolumeB(1);
    this.setPlaybackRateA(1);
    this.setPlaybackRateB(1);
    ['high', 'mid', 'low'].forEach((band) => {
      this.setEqA(band as any, 0);
      this.setEqB(band as any, 0);
    });
  }

  getState() {
    return this.isPlaying ? 'started' : 'stopped';
  }
}

export const audioEngine = new AudioEngine();
