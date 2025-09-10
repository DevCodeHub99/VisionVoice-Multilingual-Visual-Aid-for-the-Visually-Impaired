import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Task, LanguageOption } from './types';
import { LANGUAGES } from './constants';
import { generateDescription } from './services/geminiService';
import Header from './components/Header';
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { data, mimeType } = await fileToBase64(file);
                setImage(`data:${mimeType};base64,${data}`);
                setImageMimeType(mimeType);
                setOutput('');
                setError(null);
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
    };

    const speak = useCallback((text: string, lang: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utterance;
        
        window.speechSynthesis.speak(utterance);
    }, []);

    useEffect(() => {
      // Cleanup speechSynthesis on component unmount
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }, []);

    const handleSubmit = async () => {
        if (!image || !imageMimeType) {
            setError('Please upload or capture an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutput('');
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }

        const base64Data = image.split(',')[1];
        const selectedLanguage = LANGUAGES.find(l => l.code === language);
        const result = await generateDescription(base64Data, imageMimeType, task, selectedLanguage?.name || 'English');

        setOutput(result);
        if (!result.startsWith('Error:')) {
            speak(result, language);
        } else {
            setError(result);
        }
        setIsLoading(false);
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


    return (
        <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col items-center" aria-busy={isLoading}>
            <Header />
            {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
            <main className="container mx-auto p-4 md:p-8 flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Input & Controls */}
                    <section className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col space-y-6">
                        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 border-b-2 border-slate-600 pb-2">1. Provide an Image</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-lg px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-200 flex items-center justify-center">
                                <i className="fa-solid fa-upload mr-3"></i> Upload Image
                            </button>
                             <button onClick={() => setIsCameraOpen(true)} className="flex-1 text-lg px-6 py-3 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 transition duration-200 flex items-center justify-center">
                                <i className="fa-solid fa-camera-retro mr-3"></i> Use Camera
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                        {image && (
                            <div className="mt-4 border-2 border-slate-700 rounded-lg p-2 bg-slate-900">
                                <img src={image} alt="User-provided for analysis" className="max-h-64 w-full object-contain rounded" />
                            </div>
                        )}

                        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 border-b-2 border-slate-600 pb-2">2. Choose a Task</h2>
                        <div className="flex bg-slate-700/50 rounded-lg p-1">
                            <button onClick={() => setTask(Task.DESCRIBE)} className={`flex-1 p-3 rounded-md font-semibold transition ${task === Task.DESCRIBE ? 'bg-purple-600 text-white' : 'hover:bg-slate-600'}`}>Describe Scene</button>
                            <button onClick={() => setTask(Task.READ)} className={`flex-1 p-3 rounded-md font-semibold transition ${task === Task.READ ? 'bg-purple-600 text-white' : 'hover:bg-slate-600'}`}>Read Text</button>
                        </div>
                        
                        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 border-b-2 border-slate-600 pb-2">3. Select Language</h2>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg">
                            {LANGUAGES.map((lang: LanguageOption) => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                        
                        <button onClick={handleSubmit} disabled={isLoading || !image} className="w-full text-xl px-6 py-4 mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                           {isLoading ? (
                                <i className="fa-solid fa-spinner fa-spin mr-3"></i>
                           ) : (
                               <i className="fa-solid fa-wand-magic-sparkles mr-3"></i>
                           )}
                           {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </button>
                    </section>

                    {/* Right Column: Output */}
                    <section className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col">
                        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 border-b-2 border-slate-600 pb-2 mb-4">AI Generated Response</h2>
                        {error && <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">{error}</div>}
                        <div className="flex-grow bg-slate-900/70 rounded-lg p-4 overflow-y-auto min-h-[200px] ring-1 ring-slate-700" aria-live="polite">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                                    <p className="text-lg">Generating response...</p>
                                </div>
                            ) : (
                                <p className="text-lg whitespace-pre-wrap">{output || "The analysis result will appear here."}</p>
                            )}
                        </div>
                        {output && !error && (
                            <div className="flex justify-center items-center space-x-4 mt-4 pt-4 border-t border-slate-700">
                                <button onClick={toggleSpeech} className="px-6 py-3 text-lg bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center transition-colors">
                                    <i className={`fa-solid ${isSpeaking ? 'fa-pause' : 'fa-play'} mr-2`}></i> {isSpeaking ? 'Pause' : 'Read Aloud'}
                                </button>
                                <button onClick={stopSpeech} className="px-6 py-3 text-lg bg-red-600 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center transition-colors">
                                    <i className="fa-solid fa-stop mr-2"></i> Stop
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default App;