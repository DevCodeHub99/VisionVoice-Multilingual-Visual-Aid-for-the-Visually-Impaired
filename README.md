<div align="center">

# 👓 VisionVoice

## 🚀 [**Try VisionVoice Live**](https://visionvoiceai.vercel.app/)

_A modern, privacy-focused, multi-provider visual aid for the visually impaired, powered by OpenRouter & Google Gemini AI._

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Multi_Model-7C3AED?logo=openai&logoColor=white)](https://openrouter.ai/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 📖 Overview

**VisionVoice** is an accessibility-first web application designed to empower visually impaired users to perceive and navigate their environment with confidence. Operating strictly on a **Bring Your Own Key (BYOK)** model with zero backend server storage, VisionVoice delivers rapid, crisp visual descriptions and text extraction in multiple languages.

---

## ✨ Key Features

### 🔐 Multi-Provider BYOK & Hardened Client Security
- **Multi-Provider AI**: Seamlessly choose between **OpenRouter** (`sk-or-v1-...`) and **Google Gemini AI Studio** (`AIzaSy...`).
- **XOR Salt Key Obfuscation**: API keys stored in `localStorage` are encrypted using XOR salt encoding, preventing plain-text inspection.
- **In-Memory Session Option**: Option to keep keys strictly in React memory for the active tab session only.
- **Automated Error Redaction**: Global regex scrubbing masks key signatures (`sk-or-v1-***`, `AIzaSy***`, `key=***`) across all console outputs and UI error sheets.

### ⚡ Crisp, Concise & Fast AI Responses
- **To-The-Point Descriptions**: AI prompts are tuned to deliver **2 to 3 clear, direct sentences max**, eliminating conversational fluff and focusing immediately on primary subjects and safety hazards.
- **Direct Text Reader (OCR)**: Extracts visible text from documents, labels, and signs without intro chatter.
- **Token Capped**: Capped output tokens ensure instant network execution and low-latency audio reading.

### ♿ Accessibility & Modern Glassmorphic UX
- **1-Tap Error Recovery**: Interactive **"Open AI Settings & Add Key"** button embedded directly inside error sheets.
- **Dynamic Header Status Badge**: Real-time status pill indicating missing key (`Setup Key` pulsing amber) vs. active provider (`OpenRouter` / `Gemini` green).
- **Animated Audio Equalizer**: Four-bar bouncing visualizer wave provides clear visual feedback during text-to-speech reading.
- **Universal Mobile Responsiveness (`100dvh`)**: Mobile safe-area insets (`env(safe-area-inset-bottom)`) prevent dynamic URL bar jumpiness on iOS Safari & Android Chrome.
- **Multilingual Support**: Supports 8 major languages (English, हिन्दी, Español, Français, Deutsch, 日本語, Italiano, Português).

---

## 🛠️ Architecture & Tech Stack

```text
VisionVoice/
├── components/
│   ├── CameraCapture.tsx    # Live WebRTC stream & webcam fallback handling
│   ├── BottomNav.tsx        # Mode switching & glowing shutter button
│   ├── ResultSheet.tsx      # Slide-up panel with equalizer wave & 1-tap error recovery
│   ├── Header.tsx           # Language selector & dynamic Key Status Pill
│   └── SettingsModal.tsx    # Multi-provider BYOK & model selection UI
├── hooks/
│   ├── useSpeech.ts         # Web Speech API wrapper for announcements & TTS
│   ├── useHaptics.ts        # Navigator.vibrate tactile feedback
│   ├── useCamera.ts         # Imperative camera handle & frame capture
│   └── useImageProcessing.ts# AI analysis lifecycle state machine
├── services/
│   ├── aiService.ts         # Multi-provider dispatcher
│   ├── openRouterService.ts # OpenRouter REST client with timeout & fallback models
│   └── geminiService.ts     # Zero-dependency Google Gemini REST client
├── utils/
│   └── security.ts          # XOR key obfuscation, input sanitization & error scrubbing
├── constants.ts             # Multilingual prompt templates & language options
└── types.ts                 # TypeScript interfaces & Enums
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher.
- **API Key**: An [OpenRouter API Key](https://openrouter.ai/keys) or [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Installation & Local Run

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vikasmukhiya1999/VisionVoice---Multilingual-Visual-Aid-for-the-Visually-Impaired.git
   cd VisionVoice---Multilingual-Visual-Aid-for-the-Visually-Impaired
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Launch Local Server**
   ```bash
   npm run dev
   ```

4. **Configure Key**
   - Tap the **Settings (gear icon)** at the top right of the application.
   - Enter your OpenRouter or Google Gemini API key and tap **Save Settings**.

---

## 🌐 Browser Compatibility
- **Camera Stream**: Requires HTTPS or localhost for `navigator.mediaDevices.getUserMedia`.
- **Text-To-Speech (TTS)**: Native Web Speech API supported across Chrome, Safari, Edge, and Firefox.
- **Vibration Haptics**: Supported on Android / Mobile Chrome browsers.

---

<div align="center">

Built with ❤️ for an accessible world.

</div>
