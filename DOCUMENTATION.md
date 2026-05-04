# Collision Technical & User Documentation

Collision is a high-performance, browser-based music mixer designed for minimal latency and professional-grade audio manipulation. It is built as a **Static Export** Next.js application, ensuring total privacy and backend-less operation.

---

## 1. Technical Architecture

### Core Stack
- **Framework**: Next.js 16 (Static Export mode)
- **Audio Engine**: Tone.js (Web Audio API wrapper)
- **State Management**: Zustand (Global mixer state)
- **Icons**: Lucide React
- **Design System**: Vanilla CSS with Zinc & Bronze palette

### Audio Processing Pipeline
1. **Input**: User uploads MP3/WAV files.
2. **Decoding**: Audio files are decoded into `AudioBuffers` using the Web Audio API.
3. **Engine**: `AudioEngine.ts` manages two independent Player nodes connected to a master Crossfader.
4. **Effects**: Each deck has a 3-band EQ and Pitch shift capability.
5. **Output**: The master stream is routed to both the speakers and a `MediaRecorder` for capturing live mixes.

---

## 2. Security & Privacy Analysis

Collision is designed with a **Privacy-First** architecture:

- **Zero-Server Processing**: 100% of audio decoding, mixing, and exporting happens in your browser's RAM. No audio data ever touches a server.
- **Content Security Policy (CSP)**: Implemented strict headers to prevent XSS and data exfiltration in `vercel.json`.
- **No Tracking**: No analytics or cookies are used in the core mixing experience.
- **Local Isolation**: Audio Blobs are managed via temporary Object URLs that expire when the tab is closed, ensuring no residual data is left on the system.

---

## 3. User Flow & Features

### Quick Start
1. **Initialize**: Click "Start Mixing" on the landing page to enable the Audio Context.
2. **Upload**: Drag or click the upload zones on Deck A and Deck B to load your tracks.
3. **Sync**: Use the independent **Seek Bars** to find the perfect start point for each song.
4. **Mix**: Use the **Crossfader** to transition between decks.
5. **Refine**: Adjust **EQ** (High/Mid/Low) and **Pitch** to match beats and frequencies.
6. **Record**: Hit "Record" to capture your session. Once stopped, you can export as **MP3** (128kbps) or **WAV** (lossless).

### Keyboard Shortcuts (Planned)
- `Space`: Global Play/Pause
- `R`: Start/Stop Recording
- `Backspace`: Universal Reset

---

## 4. Maintenance & Deployment

### Build Command
```bash
npm run build
```
This generates a `out/` directory containing the static site, ready for deployment to Vercel, Netlify, or any static host.

### Troubleshooting
- **Audio not loading**: Ensure the file format is supported (MP3, WAV, AAC).
- **Export Error**: Ensure the browser has enough memory (RAM) for long recordings, as they are stored as Blobs.
