<div align="center">

# 👓 VisionVoice

## 🚀 [**Try VisionVoice Live**](https://visionvoiceai.vercel.app/)

_A modern, multilingual visual aid for the visually impaired, powered by Google Gemini AI._

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 📖 Overview

**VisionVoice** is an accessibility-first web application designed to help visually impaired users interact with their environment. By combining real-time camera processing with Google's state-of-the-art **Gemini 2.5 Flash** model, it provides descriptive narration and text extraction in multiple languages.

---

## ✨ Key Features

### 🎯 Dual Analysis Modes
-   **Environmental Description**: Detailed, vivid narrations of scenes, objects, and people to improve spatial awareness.
-   **Text Reading (OCR)**: Accurate extraction and reading of text from documents, labels, signs, and menus.

### 🌍 Multilingual Intelligence
-   Supports **8 major languages**: English, हिन्दी (Hindi), Español, Français, Deutsch, 日本語 (Japanese), Italiano, and Português.
-   AI prompts and responses are dynamically localized based on user selection.

### ♿ Accessibility & UX
-   **Automated Speech (TTS)**: Instant audio playback of AI analysis using the Web Speech API.
-   **Haptic Feedback**: Subtle vibrations provide tactile confirmation for captures, success, and errors.
-   **Mobile-First Design**: Optimized for one-handed use with large tap targets and a "Camera-as-Background" UI.
-   **Hybrid Input**: Use the live camera or upload existing images from your gallery.

---

## 🛠️ Architecture & Tech Stack

### Frontend
-   **Framework**: React 19.1.1 with Functional Components.
-   **Logic**: Custom hooks for modular state management (Speech, Haptics, Camera, AI Logic).
-   **Styling**: Tailwind CSS for high-contrast, modern glassmorphism UI.
-   **Icons**: Font Awesome (Solid/Regular).

### AI & Services
-   **Processing**: Google Generative AI (Gemini 2.5 Flash).
-   **Encoding**: Base64 image conversion for serverless AI transmission.

### Code Structure
```text
├── components/
│   ├── CameraCapture.tsx    # Live WebRTC video stream & frame capture
│   ├── BottomNav.tsx        # Mode switching & primary action triggers
│   ├── ResultSheet.tsx      # Slide-up modal for AI output & audio controls
│   └── Header.tsx           # Language & settings interface
├── hooks/
│   ├── useSpeech.ts         # Web Speech API wrapper for announcements & results
│   ├── useHaptics.ts        # Tactile feedback via Navigator.vibrate
│   ├── useCamera.ts         # Imperative camera handle & capture orchestration
│   └── useImageProcessing.ts# AI state machine (Loading -> Success -> Error)
├── services/
│   └── geminiService.ts     # Core API integration with Google GenAI
├── constants.ts             # Multilingual prompt templates & config
└── types.ts                 # Centralized TypeScript interfaces & Enums
```

---

## 🚀 Getting Started

### Prerequisites
-   **Node.js**: v18.0.0 or higher.
-   **API Key**: A valid [Google Gemini API Key](https://aistudio.google.com/).

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/vikasmukhiya1999/VisionVoice---Multilingual-Visual-Aid-for-the-Visually-Impaired.git
    cd VisionVoice---Multilingual-Visual-Aid-for-the-Visually-Impaired
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Launch**
    ```bash
    npm run dev
    ```

---

## � Internal API Documentation

### Gemini Service (`generateDescription`)
-   **Inputs**: `base64Data`, `mimeType`, `task` (Task Enum), `languageName`.
-   **Logic**: Combines image data with specific prompts:
    -   *Describe*: "Describe this image in detail for a visually impaired person..."
    -   *Read*: "Extract all text from this image, reading it from top to bottom..."

### Haptics Hook (`useHaptics`)
-   Triggers standard browser vibration patterns.
-   **Standard Pattern**: `50ms` pulse for simple confirmations.

---

## 🌐 Browser Requirements
-   **Camera Access**: Requires HTTPS or localhost for `navigator.mediaDevices`.
-   **Web Speech API**: Supported on all modern Chrome, Safari, and Edge versions.
-   **Vibration API**: Primarily supported on Android/Mobile Chrome.

---

## 🤝 Contributing
Contributions are welcome! Please ensure:
1.  ♿ **Accessibility** (ARIA labels, screen reader support) is preserved.
2.  🌍 **Language strings** are accurately translated in `constants.ts`.
3.  🛡️ **Error Boundaries** are handled to prevent app crashes on camera failure.

---

<div align="center">

Built with ❤️ for an accessible world.

</div>

## 📖 Code Documentation

### 1. Gemini AI Service (`services/geminiService.ts`)

**Purpose**: Acts as the interface between the client application and Google's Gemini AI API. It handles payload construction and response parsing.

- **Inputs**:
  - `base64Data`: The visual data in base64 format.
  - `mimeType`: Image format (e.g., `image/jpeg`).
  - `task`: Operation mode (`Task.DESCRIBE` or `Task.READ`).
  - `languageName`: Target response language.
- **Outputs**: Returns a `Promise<string>` containing the AI's textual description or extracted text.
- **Example Usage**:
  ```typescript
  const description = await generateDescription(base64, "image/jpeg", Task.DESCRIBE, "Hindi");
  ```

### 2. Image Processing Hook (`hooks/useImageProcessing.ts`)

**Purpose**: Manages the lifecycle of an image analysis request (loading states, errors, and success callbacks).

- **Inputs**: Current language, and callbacks for `onStart`, `onSuccess`, and `onError`.
- **Outputs**: An object containing `image` (preview), `output` (AI result), `isLoading`, and the `processImage` function.
- **Example Usage**:
  ```typescript
  const { processImage, output, isLoading } = useImageProcessing({ 
    language: 'en-US',
    onSuccess: (res) => console.log("AI says:", res)
  });
  ```

### 3. Speech Hook (`hooks/useSpeech.ts`)

**Purpose**: Provides Text-to-Speech (TTS) capabilities for app accessibility.

- **Purpose**: Reads back AI results and provides situational announcements for visually impaired users.
- **Example Usage**:
  ```typescript
  const { speak } = useSpeech({ language: 'en-US' });
  speak("The camera is ready.");
  ```

---

<div align="center">
Built with ❤️ for an accessible world.
</div>
