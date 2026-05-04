import { create } from 'zustand';

interface DeckState {
  trackUrl: string | null;
  fileName: string | null;
  volume: number;
  isLoaded: boolean;
  eq: { high: number; mid: number; low: number };
  playbackRate: number;
}

interface MixerState {
  isPlaying: boolean;
  isRecording: boolean;
  crossfaderValue: number;
  deckA: DeckState;
  deckB: DeckState;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCrossfaderValue: (value: number) => void;
  setDeckTrack: (deck: 'A' | 'B', url: string, fileName: string) => void;
  setDeckVolume: (deck: 'A' | 'B', volume: number) => void;
  setDeckLoaded: (deck: 'A' | 'B', isLoaded: boolean) => void;
  setDeckEq: (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', value: number) => void;
  setDeckPlaybackRate: (deck: 'A' | 'B', rate: number) => void;
  removeDeckTrack: (deck: 'A' | 'B') => void;
  resetStore: () => void;
}

const defaultDeckState: DeckState = {
  trackUrl: null,
  fileName: null,
  volume: 1,
  isLoaded: false,
  eq: { high: 0, mid: 0, low: 0 },
  playbackRate: 1,
};

export const useMixerStore = create<MixerState>((set) => ({
  isPlaying: false,
  isRecording: false,
  crossfaderValue: 0.5,
  deckA: { ...defaultDeckState },
  deckB: { ...defaultDeckState },
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setCrossfaderValue: (value) => set({ crossfaderValue: value }),
  
  setDeckTrack: (deck, trackUrl, fileName) =>
    set((state) => ({
      ...state,
      [`deck${deck}`]: { ...state[`deck${deck}` as 'deckA' | 'deckB'], trackUrl, fileName, isLoaded: false },
    })),
    
  setDeckVolume: (deck, volume) =>
    set((state) => ({
      ...state,
      [`deck${deck}`]: { ...state[`deck${deck}` as 'deckA' | 'deckB'], volume },
    })),
    
  setDeckLoaded: (deck, isLoaded) =>
    set((state) => ({
      ...state,
      [`deck${deck}`]: { ...state[`deck${deck}` as 'deckA' | 'deckB'], isLoaded },
    })),

  setDeckEq: (deck, band, value) =>
    set((state) => {
      const d = state[`deck${deck}` as 'deckA' | 'deckB'];
      return {
        ...state,
        [`deck${deck}`]: { ...d, eq: { ...d.eq, [band]: value } }
      };
    }),

  setDeckPlaybackRate: (deck, rate) =>
    set((state) => ({
      ...state,
      [`deck${deck}`]: { ...state[`deck${deck}` as 'deckA' | 'deckB'], playbackRate: rate },
    })),

  removeDeckTrack: (deck) =>
    set((state) => ({
      ...state,
      [`deck${deck}`]: { ...defaultDeckState },
    })),

  resetStore: () =>
    set((state) => ({
      ...state,
      crossfaderValue: 0.5,
      deckA: { ...state.deckA, volume: 1, eq: { high: 0, mid: 0, low: 0 }, playbackRate: 1 },
      deckB: { ...state.deckB, volume: 1, eq: { high: 0, mid: 0, low: 0 }, playbackRate: 1 },
    })),
}));
