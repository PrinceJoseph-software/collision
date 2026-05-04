# ⚡ Collision

**Collision** is a high-performance, minimalist, and backend-less browser-based music mixer. Designed for creators who value privacy and speed, it allows you to blend your favorite tracks with professional-grade EQ, pitch control, and live recording—all entirely within your browser.

![License](https://img.shields.io/badge/license-MIT-bronze)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tone.js](https://img.shields.io/badge/Tone.js-Audio-amber)

---

## ✨ Key Features

- **Privacy-First**: No servers, no tracking. 100% of audio processing happens locally in your browser.
- **Dual Deck Mixing**: Independent Deck A and Deck B with smooth waveform visualization.
- **Professional Audio Engine**: Powered by Tone.js for ultra-low latency and precise control.
- **Independent Seeking**: Scrub through tracks individually without affecting the other's playback.
- **Live Recording**: Capture your mix in real-time and export to high-quality **MP3** or lossless **WAV**.
- **Mature Minimal Design**: A refined Charcoal and Bronze aesthetic designed for focus.
- **Universal Reset**: Instantly zero out all EQs, volumes, and timers for a fresh start.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 16 (Static Export mode)
- **Audio Logic**: Tone.js (Web Audio API)
- **State Management**: Zustand
- **Export Engine**: lamejs (MP3) & Custom WAV Encoder
- **Styling**: Vanilla CSS with Zinc/Bronze palette
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/PrinceJoseph-software/collision.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security

Collision implements a strict **Content Security Policy (CSP)** and operates entirely client-side. Your music never leaves your computer. 

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

*Hear what happens when your songs collide.*
