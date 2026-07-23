
import { memo } from 'react';
import { Task } from '../types';

interface ResultSheetProps {
    image: string | null;
    isLoading: boolean;
    error: string | null;
    output: string;
    task: Task;
    isSpeaking: boolean;
    onReset: () => void;
    onToggleSpeech: () => void;
    onCopy: () => void;
    onOpenSettings?: () => void;
}

const ResultSheet = memo(({
    image,
    isLoading,
    error,
    output,
    task,
    isSpeaking,
    onReset,
    onToggleSpeech,
    onCopy,
    onOpenSettings
}: ResultSheetProps) => {
    const isKeyError = Boolean(
        error && (
            error.toLowerCase().includes('key') ||
            error.toLowerCase().includes('settings') ||
            error.toLowerCase().includes('quota')
        )
    );

    return (
        <div className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-500 ease-out flex flex-col max-h-[85vh] ${image ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Drag Handle Area */}
            <div className="h-6 w-full flex justify-center items-center cursor-pointer">
                <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
            </div>

            {/* Content Container */}
            <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col flex-grow overflow-hidden pb-8">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {task === Task.DESCRIBE ? 'Scene Description' : 'Text Content'}
                        </span>
                        <h2 className="text-xl font-bold text-white">
                            {isLoading ? 'Analyzing...' : error ? 'Configuration Required' : 'Result'}
                        </h2>
                    </div>
                    <button
                        onClick={onReset}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 active:bg-white/20"
                        aria-label="Close"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto px-6 py-4" aria-live="polite" role="status">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-8 opacity-80">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                            </div>
                            <p className="text-slate-400 font-light">Processing visual data...</p>
                        </div>
                    ) : error ? (
                        <div className="space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 flex items-start space-x-3">
                                <i className="fa-solid fa-key text-amber-400 text-xl mt-0.5 flex-shrink-0"></i>
                                <div className="space-y-1">
                                    <p className="font-semibold text-amber-300">API Key Required</p>
                                    <p className="text-sm leading-relaxed text-slate-300">{error}</p>
                                </div>
                            </div>

                            {isKeyError && onOpenSettings && (
                                <button
                                    onClick={() => {
                                        onReset();
                                        onOpenSettings();
                                    }}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] font-bold text-white rounded-2xl shadow-xl shadow-violet-950/50 flex items-center justify-center space-x-3 text-base transition-all"
                                >
                                    <i className="fa-solid fa-gear text-lg"></i>
                                    <span>Open AI Settings & Add Key</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Animated Equalizer Waveform when speaking */}
                            {isSpeaking && (
                                <div className="flex items-center space-x-1.5 py-1.5 px-3 bg-violet-950/60 border border-violet-500/30 rounded-xl w-fit shadow-inner">
                                    <span className="w-1 h-4 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
                                    <span className="w-1 h-6 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                                    <span className="w-1 h-3 bg-fuchsia-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                                    <span className="text-xs font-semibold text-violet-200 ml-1.5">Reading Aloud...</span>
                                </div>
                            )}

                            {/* Text Output */}
                            <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100 whitespace-pre-wrap select-text">
                                {output}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Actions */}
                {!isLoading && output && !error && (
                    <div className="p-6 pt-2 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onToggleSpeech}
                                className={`h-14 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-colors ${isSpeaking ? 'bg-white text-black' : 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'}`}
                            >
                                <i className={`fa-solid ${isSpeaking ? 'fa-pause' : 'fa-play'}`}></i>
                                <span>{isSpeaking ? 'Pause' : 'Play Audio'}</span>
                            </button>

                            <button
                                onClick={onCopy}
                                className="h-14 rounded-2xl font-bold text-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center space-x-3 active:bg-slate-700"
                            >
                                <i className="fa-regular fa-copy"></i>
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default ResultSheet;
