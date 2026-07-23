
import { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Task, UserSettings } from './types';
import { LANGUAGES } from './constants';
import { obfuscateKey, deobfuscateKey } from './utils/security';
import CameraCapture from './components/CameraCapture';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ResultSheet from './components/ResultSheet';
import SettingsModal from './components/SettingsModal';

import { useSpeech } from './hooks/useSpeech';
import { useImageProcessing } from './hooks/useImageProcessing';
import { useHaptics } from './hooks/useHaptics';
import { useCamera } from './hooks/useCamera';


// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
            resolve({ data, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * visionvoice Main Component
 * 
 * Orchestrates the overall application flow:
 *- Language and task (Describe/Read) selection
 *- Camera capture and image upload management
 *- AI processing lifecycle management
 *- Speech-to-text (TTS), Haptics, and UI feedback
 */
const App: FC = () => {
    const [task, setTask] = useState<Task>(Task.DESCRIBE);
    const [language, setLanguage] = useState<string>(LANGUAGES[0].code);
    const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [userSettings, setUserSettings] = useState<UserSettings>(() => {
        try {
            const saved = localStorage.getItem('visionvoice_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                const rawOpenRouter = parsed.openRouterKeyEnc ? deobfuscateKey(parsed.openRouterKeyEnc) : (parsed.openRouterKey || parsed.apiKey || '');
                const rawGemini = parsed.geminiKeyEnc ? deobfuscateKey(parsed.geminiKeyEnc) : (parsed.geminiKey || '');
                return {
                    provider: parsed.provider || 'openrouter',
                    openRouterKey: rawOpenRouter,
                    geminiKey: rawGemini,
                    model: parsed.model || 'openrouter/free',
                    rememberKey: parsed.rememberKey ?? true
                };
            }
        } catch {
            // fallback
        }
        return { provider: 'openrouter', openRouterKey: '', geminiKey: '', model: 'openrouter/free', rememberKey: true };
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Custom Hooks
    const { isSpeaking, speak, speakAnnouncement, toggleSpeech, stopSpeech } = useSpeech({ language });
    const { triggerHaptic } = useHaptics();
    const { cameraRef, onCaptureClick } = useCamera();

    const {
        image,
        output,
        isLoading,
        error,
        processImage,
        reset
    } = useImageProcessing({
        language,
        userSettings,
        onStartProcessing: useCallback(() => {
            triggerHaptic();
            stopSpeech();
            speakAnnouncement("Processing image.");
        }, [triggerHaptic, stopSpeech, speakAnnouncement]),
        onSuccess: useCallback((result) => {
            triggerHaptic(); // Success vibration
            speak(result, language);
        }, [triggerHaptic, speak, language]),
        onError: useCallback((err) => {
            triggerHaptic([100, 50, 100]);
            speakAnnouncement("An error occurred. Please try again.");
        }, [triggerHaptic, speakAnnouncement])
    });

    // Initial Voice Hint
    useEffect(() => {
        setTimeout(() => {
            const activeKey = userSettings.provider === 'gemini' ? userSettings.geminiKey : userSettings.openRouterKey;
            if (!activeKey?.trim()) {
                speakAnnouncement("Welcome to VisionVoice. Please tap the Setup Key icon at top right to enter your API key.");
            } else {
                speakAnnouncement("Camera ready. Select mode at bottom or tap center to capture.");
            }
        }, 1000);
    }, []);

    // Handlers
    /**
     * Handles image file uploads from the device gallery.
     * Converts the file to base-64 and triggers AI processing.
     */
    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            triggerHaptic();
            try {
                const { data, mimeType } = await fileToBase64(file);
                processImage(`data:${mimeType};base64,${data}`, mimeType, task);
            } catch (err) {
                speakAnnouncement("Failed to upload image.");
            }
        }
    }, [triggerHaptic, processImage, task, speakAnnouncement]);

    // Called by Camera component when it captures a frame
    /**
     * Handles image capture from the live camera stream.
     */
    const handleCameraCapture = useCallback((imageDataUrl: string) => {
        const [header, data] = imageDataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        processImage(imageDataUrl, mimeType, task);
    }, [processImage, task]);

    const handleReset = useCallback(() => {
        reset();
        stopSpeech();
        speakAnnouncement("Camera ready.");
    }, [reset, stopSpeech, speakAnnouncement]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output);
        speakAnnouncement("Copied");
    }, [output, speakAnnouncement]);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleCaptureClick = useCallback(() => {
        triggerHaptic();
        onCaptureClick();
    }, [triggerHaptic, onCaptureClick]);

    /**
     * Updates the current application language and provides voice feedback.
     */
    const handleLanguageChange = useCallback((lang: string) => {
        setLanguage(lang);
        speakAnnouncement(`Language changed to ${LANGUAGES.find(l => l.code === lang)?.name}`);
    }, [speakAnnouncement]);

    const handleTaskChange = useCallback((t: Task) => {
        setTask(t);
        speakAnnouncement(`${t === Task.DESCRIBE ? 'Describe' : 'Read Text'} mode`);
    }, [speakAnnouncement]);

    const handleToggleSpeech = useCallback(() => {
        toggleSpeech(output);
    }, [toggleSpeech, output]);

    const handleSaveSettings = useCallback((newSettings: UserSettings) => {
        setUserSettings(newSettings);
        try {
            if (newSettings.rememberKey) {
                const toStore = {
                    provider: newSettings.provider,
                    openRouterKeyEnc: obfuscateKey(newSettings.openRouterKey),
                    geminiKeyEnc: obfuscateKey(newSettings.geminiKey),
                    model: newSettings.model,
                    rememberKey: true
                };
                localStorage.setItem('visionvoice_settings', JSON.stringify(toStore));
            } else {
                const toStore = {
                    provider: newSettings.provider,
                    openRouterKeyEnc: '',
                    geminiKeyEnc: '',
                    model: newSettings.model,
                    rememberKey: false
                };
                localStorage.setItem('visionvoice_settings', JSON.stringify(toStore));
            }
        } catch {
            console.warn("Could not save settings to localStorage");
        }
        speakAnnouncement("Settings saved");
    }, [speakAnnouncement]);

    const handleOpenSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

    return (
        <div className="fixed inset-0 h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">

            {/* 1. FULL SCREEN CAMERA BACKGROUND */}
            <CameraCapture
                ref={cameraRef}
                onCapture={handleCameraCapture}
                isActive={!image}
            />

            {/* 2. MAIN UI OVERLAY */}
            <div className={`relative z-10 flex flex-col justify-between h-full transition-opacity duration-300 ${image ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                <Header
                    language={language}
                    userSettings={userSettings}
                    onLanguageChange={handleLanguageChange}
                    onSettingsClick={handleOpenSettings}
                />

                {/* Center Content Area */}
                <div className="flex-grow">
                    {/* Center Message (Optional Aid) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-60">
                        <i className="fa-solid fa-expand text-white/20 text-6xl"></i>
                    </div>
                </div>

                <BottomNav
                    task={task}
                    activeTab={activeTab}
                    onTaskChange={handleTaskChange}
                    onTabChange={setActiveTab}
                    onCaptureClick={handleCaptureClick}
                    onUploadClick={handleUploadClick}
                    fileInputRef={fileInputRef}
                    handleImageUpload={handleImageUpload}
                />
            </div>

            {/* 3. RESULTS SHEET (Slide Up) */}
            <ResultSheet
                image={image}
                isLoading={isLoading}
                error={error}
                output={output}
                task={task}
                isSpeaking={isSpeaking}
                onReset={handleReset}
                onToggleSpeech={handleToggleSpeech}
                onCopy={handleCopy}
                onOpenSettings={handleOpenSettings}
            />

            {/* 4. SETTINGS MODAL (BYOK & Model Selection) */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={handleCloseSettings}
                settings={userSettings}
                onSaveSettings={handleSaveSettings}
            />

        </div>
    );
};

export default App;