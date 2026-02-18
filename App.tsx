import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Task, LanguageOption } from './types';
import { LANGUAGES } from './constants';
import { generateDescription } from './services/geminiService';
import CameraCapture from './components/CameraCapture';

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

const App: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [task, setTask] = useState<Task>(Task.DESCRIBE);
    const [language, setLanguage] = useState<string>(LANGUAGES[0].code);
    const [output, setOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1); // Track abstract steps for UX emphasis

    const fileInputRef = useRef<HTMLInputElement>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const speakAnnouncement = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1; // Slightly faster for UI feedback
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { data, mimeType } = await fileToBase64(file);
                setImage(`data:${mimeType};base64,${data}`);
                setImageMimeType(mimeType);
                setOutput('');
                setError(null);
                setStep(2); // Move UX focus
                speakAnnouncement("Image uploaded. Ready to analyze.");
            } catch (err) {
                setError('Failed to read the image file.');
            }
        }
    };

    const handleCameraCapture = (imageDataUrl: string) => {
        const [header, data] = imageDataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        setImage(imageDataUrl);
        setImageMimeType(mimeType);
        setOutput('');
        setError(null);
        setIsCameraOpen(false);
        setStep(2);
        speakAnnouncement("Photo captured. Ready to analyze.");
    };

    const speak = useCallback((text: string, lang: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);
    }, []);

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSubmit = async () => {
        if (!image || !imageMimeType) {
            setError('Please upload or capture an image first.');
            speakAnnouncement("Please provide an image first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutput('');
        speakAnnouncement("Analyzing image...");

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }

        const base64Data = image.split(',')[1];
        const selectedLanguage = LANGUAGES.find(l => l.code === language);

        try {
            const result = await generateDescription(base64Data, imageMimeType, task, selectedLanguage?.name || 'English');
            setOutput(result);
            if (!result.startsWith('Error:')) {
                speak(result, language);
                // Scroll to result on mobile
                setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                setError(result);
                speakAnnouncement("An error occurred. Please try again.");
            }
        } catch (e) {
            setError("Something went wrong.");
            speakAnnouncement("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSpeech = () => {
        if (!window.speechSynthesis) return;

        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsSpeaking(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                setIsSpeaking(true);
            } else if (output) {
                speak(output, language);
            }
        }
    };

    const stopSpeech = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const copyToClipboard = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            speakAnnouncement("Text copied.");
        }
    };

    return (
        <div className="min-h-screen text-slate-100 flex flex-col items-center pb-20 px-4 md:px-0 scroll-smooth">
            {/* Background Effects */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
            </div>

            {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}

            <div className="w-full max-w-md flex flex-col space-y-4 mt-6 md:mt-10">

                {/* 1. HERO SECTION */}
                <header className="text-center space-y-2 animate-float">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-violet-600 blur-xl opacity-20 rounded-full animate-pulse-glow"></div>
                        <h1 className="relative text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
                            VisionVoice
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">See the world through AI.</p>
                </header>

                {/* 2. STEP-BASED FLOW (Stacked Glass Cards) */}
                <main className="flex flex-col space-y-4 w-full">

                    {/* STEP 1: CAPTURE */}
                    <section className="glass-card rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
                        <div className="flex items-center space-x-3 mb-3 opacity-80">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 font-bold text-xs border border-violet-500/30">1</span>
                            <h2 className="text-base font-semibold text-slate-200">Capture Image</h2>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => setIsCameraOpen(true)}
                                className="group relative w-full h-12 overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                            >
                                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors" />
                                <div className="relative h-full w-full bg-slate-900/50 group-hover:bg-transparent transition-colors flex items-center justify-center space-x-3 rounded-lg">
                                    <i className="fa-solid fa-camera text-lg"></i>
                                    <span className="font-semibold text-base">Take Photo</span>
                                </div>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-12 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-700/50 text-slate-300 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 flex items-center justify-center space-x-3"
                            >
                                <i className="fa-solid fa-image"></i>
                                <span>Upload Image</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>

                        {image && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-slate-700/50 relative group">
                                <img src={image} alt="Preview" className="w-full h-48 object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-2">
                                    <p className="text-xs text-center text-slate-300 font-medium">Image Ready</p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* STEP 2: TASK */}
                    <section className={`glass-card rounded-xl p-4 transition-all duration-300 ${!image ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-lg hover:shadow-cyan-500/10'}`}>
                        <div className="flex items-center space-x-3 mb-3 opacity-80">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">2</span>
                            <h2 className="text-base font-semibold text-slate-200">Choose Task</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50 relative">
                            {/* Animated Background Slider could go here, keeping it simple with conditional formatting for now */}
                            <button
                                onClick={() => setTask(Task.DESCRIBE)}
                                className={`relative z-10 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${task === Task.DESCRIBE ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <i className="fa-solid fa-eye mr-2"></i>Describe
                            </button>
                            <button
                                onClick={() => setTask(Task.READ)}
                                className={`relative z-10 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${task === Task.READ ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <i className="fa-solid fa-file-lines mr-2"></i>Read Text
                            </button>
                        </div>
                    </section>

                    {/* STEP 3: LANGUAGE */}
                    <section className={`glass-card rounded-xl p-4 transition-all duration-300 ${!image ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-lg hover:shadow-violet-500/10'}`}>
                        <div className="flex items-center space-x-3 mb-3 opacity-80">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold text-xs border border-fuchsia-500/30">3</span>
                            <h2 className="text-base font-semibold text-slate-200">Select Language</h2>
                        </div>

                        <div className="relative">
                            <i className="fa-solid fa-globe absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none font-medium text-base"
                            >
                                {LANGUAGES.map((lang: LanguageOption) => (
                                    <option key={lang.code} value={lang.code} className="bg-slate-900">{lang.name}</option>
                                ))}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                        </div>
                    </section>

                    {/* STEP 4: ANALYZE */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !image}
                        className="w-full group relative h-14 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl shadow-violet-900/20"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 transition-transform duration-500 ${isLoading ? 'animate-pulse' : 'group-hover:scale-105'}`}></div>
                        <div className="absolute inset-0 flex items-center justify-center space-x-3 text-white font-bold text-xl tracking-wide z-10">
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    <span>Analyze Image</span>
                                </>
                            )}
                        </div>
                    </button>

                    {/* RESULT SECTION */}
                    {output && (
                        <div ref={resultRef} className="animate-[fade-in_0.5s_ease-out] relative z-20 mt-8">
                            <div className="glass-card rounded-3xl p-6 md:p-8 border-t border-violet-500/30 shadow-2xl shadow-violet-900/20">
                                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-cyan-300">
                                        Analysis Result
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button onClick={copyToClipboard} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors" title="Copy Text">
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                        <button onClick={() => setOutput('')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-300 transition-colors" title="Clear">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none text-slate-200 text-lg leading-relaxed font-light min-h-[100px] mb-6 whitespace-pre-wrap">
                                    {output}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={toggleSpeech}
                                        className={`flex-1 h-14 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all ${isSpeaking ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-violet-600 text-white shadow-lg hover:bg-violet-700'}`}
                                    >
                                        <i className={`fa-solid ${isSpeaking ? 'fa-pause' : 'fa-play'} text-xl`}></i>
                                        <span>{isSpeaking ? 'Pause Reading' : 'Read Aloud'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start space-x-3 animate-pulse">
                            <i className="fa-solid fa-circle-exclamation mt-1"></i>
                            <p>{error}</p>
                        </div>
                    )}
                </main>
            </div>
        </div >
    );
};

export default App;