<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

## 🚀 [**Try VisionVoice Live**](https://visionvoice-1073180550844.us-west1.run.app/)

_A modern, multilingual visual aid for the visually impaired, powered by AI._

</div>

VisionVoice is a React-based web application that uses Google's Gemini AI to help visually impaired users understand their surroundings through camera capture and AI-powered image analysis.

## ✨ Features

<div align="center">

|             📸 **Camera Integration**             |                     🤖 **AI-Powered Analysis**                      |                                          🌍 **Multilingual Support**                                          |
| :-----------------------------------------------: | :-----------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: |
| Capture images directly from your device's camera | Uses Google Gemini 2.5 Flash model for intelligent image processing | Available in 8 languages including English, Hindi, Spanish, French, German, Japanese, Italian, and Portuguese |

</div>

### 🎯 Dual Functionality

- **Describe**: Get detailed descriptions of images for environmental awareness
- **Read**: Extract and read text from images (OCR functionality)

### ♿ Accessibility-First Design

Built specifically for visually impaired users with screen reader compatibility

## 🛠️ Tech Stack

<div align="center">

|         Frontend          |           Styling           |    AI Service    | Build Tool |
| :-----------------------: | :-------------------------: | :--------------: | :--------: |
| React 19.1.1 + TypeScript | Tailwind CSS + Font Awesome | Google Gemini AI |    Vite    |

</div>

## Project Structure

```
├── components/
│   ├── CameraCapture.tsx    # Camera interface and image capture
│   └── Header.tsx           # App header with branding
├── services/
│   └── geminiService.ts     # Gemini AI integration
├── App.tsx                  # Main application component
├── index.tsx               # Application entry point
├── types.ts                # TypeScript type definitions
├── constants.ts            # Language options and prompt templates
├── vite.config.ts          # Vite configuration
└── metadata.json           # App metadata and permissions
```

## Setup and Installation

### Prerequisites

- Node.js (latest LTS version recommended)
- A Google Gemini API key

### Installation Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/vikasmukhiya1999/VisionVoice---Multilingual-Visual-Aid-for-the-Visually-Impaired.git

   cd VisionVoice---Multilingual-Visual-Aid-for-the-Visually-Impaired
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure API Key**:
   Create a `.env.local` file in the root directory and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🚀 Usage

<div align="center">

### How to Use VisionVoice

| Step |       Action        | Description                                                            |
| :--: | :-----------------: | :--------------------------------------------------------------------- |
|  1️⃣  | **Select Language** | Choose your preferred language from the dropdown                       |
|  2️⃣  |   **Choose Task**   | Select "Describe" for image descriptions or "Read" for text extraction |
|  3️⃣  |  **Capture Image**  | Use the camera interface to take a photo                               |
|  4️⃣  | **Get AI Response** | Receive audio/text feedback in your selected language                  |

</div>

## 🌍 Supported Languages

<div align="center">

| Language   | Code  | Native Name |
| :--------- | :---: | :---------: |
| English    | en-US |   English   |
| Hindi      | hi-IN |   हिन्दी    |
| Spanish    | es-ES |   Español   |
| French     | fr-FR |  Français   |
| German     | de-DE |   Deutsch   |
| Japanese   | ja-JP |   日本語    |
| Italian    | it-IT |  Italiano   |
| Portuguese | pt-BR |  Português  |

</div>

## API Integration

The app integrates with Google's Gemini 2.5 Flash model through the `geminiService.ts` file, which handles:

- Image processing with base64 encoding
- Multilingual prompt generation
- Error handling and user feedback
- Response formatting

## 🔧 Development

<div align="center">

### Available Scripts

| Command           | Description              |
| :---------------- | :----------------------- |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

</div>

## 🌐 Browser Compatibility

The app requires camera permissions and modern browser support for:

- **Camera API** access
- **ES6+** JavaScript features
- **WebRTC** for camera functionality

## 🤝 Contributing

<div align="center">

_This project is designed to be accessible and inclusive._

</div>

When contributing, please ensure:

- ♿ **Accessibility standards** are maintained
- 🌍 **New language support** follows the existing pattern in `constants.ts`
- 🛡️ **Error handling** provides clear user feedback
- 📝 **Code follows** TypeScript best practices
