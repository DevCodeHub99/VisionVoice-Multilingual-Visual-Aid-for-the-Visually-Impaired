import { useState, useEffect, memo } from 'react';
import { UserSettings, AIProvider } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: UserSettings;
    onSaveSettings: (settings: UserSettings) => void;
}

const OPENROUTER_MODELS = [
    { id: 'openrouter/free', name: 'OpenRouter Auto Free (Recommended)' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'NVIDIA Nemotron Nano 12B VL (Free)' },
    { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B Multimodal (Free)' },
    { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'NVIDIA Nemotron Omni 30B (Free)' },
    { id: 'custom', name: 'Custom OpenRouter Model...' }
];

const GEMINI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Fast)' },
    { id: 'custom', name: 'Custom Gemini Model...' }
];

const SettingsModal = memo(({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) => {
    const [provider, setProvider] = useState<AIProvider>(settings.provider || 'openrouter');
    const [openRouterKey, setOpenRouterKey] = useState<string>(settings.openRouterKey || '');
    const [geminiKey, setGeminiKey] = useState<string>(settings.geminiKey || '');
    const [showKey, setShowKey] = useState<boolean>(false);

    const activePresetModels = provider === 'gemini' ? GEMINI_MODELS : OPENROUTER_MODELS;
    const defaultModelId = provider === 'gemini' ? 'gemini-2.5-flash' : 'openrouter/free';

    const [selectedModel, setSelectedModel] = useState<string>(settings.model || defaultModelId);
    const [customModel, setCustomModel] = useState<string>('');

    const [rememberKey, setRememberKey] = useState<boolean>(settings.rememberKey ?? true);

    useEffect(() => {
        setProvider(settings.provider || 'openrouter');
        setOpenRouterKey(settings.openRouterKey || '');
        setGeminiKey(settings.geminiKey || '');
        setRememberKey(settings.rememberKey ?? true);

        const currentModels = (settings.provider === 'gemini' ? GEMINI_MODELS : OPENROUTER_MODELS);
        const isPreset = currentModels.some(m => m.id === settings.model);
        if (settings.model && !isPreset) {
            setSelectedModel('custom');
            setCustomModel(settings.model);
        } else {
            setSelectedModel(settings.model || (settings.provider === 'gemini' ? 'gemini-2.5-flash' : 'openrouter/free'));
            setCustomModel('');
        }
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleProviderChange = (newProvider: AIProvider) => {
        setProvider(newProvider);
        const newDefaultModel = newProvider === 'gemini' ? 'gemini-2.5-flash' : 'openrouter/free';
        setSelectedModel(newDefaultModel);
        setCustomModel('');
    };

    const handleSave = () => {
        const finalModel = selectedModel === 'custom' ? customModel.trim() : selectedModel;
        onSaveSettings({
            provider,
            openRouterKey: openRouterKey.trim(),
            geminiKey: geminiKey.trim(),
            model: finalModel || defaultModelId,
            rememberKey
        });
        onClose();
    };

    const handleClear = () => {
        setOpenRouterKey('');
        setGeminiKey('');
        setSelectedModel(defaultModelId);
        setCustomModel('');
        setRememberKey(true);
        onSaveSettings({
            provider: 'openrouter',
            openRouterKey: '',
            geminiKey: '',
            model: 'openrouter/free',
            rememberKey: true
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-200">
            <div className="bg-slate-950/90 border border-violet-500/20 rounded-3xl shadow-2xl w-[92vw] sm:max-w-lg max-h-[90dvh] overflow-y-auto p-6 space-y-5 text-slate-100 relative">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400">
                            <i className="fa-solid fa-sliders text-xl"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Settings</h2>
                            <p className="text-xs text-slate-400">Multi-Provider BYOK & Model Selection</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        aria-label="Close settings"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Privacy & Security Disclaimer */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-emerald-200">
                    <i className="fa-solid fa-shield-halved text-emerald-400 text-base mt-0.5 flex-shrink-0"></i>
                    <div className="space-y-1">
                        <p className="font-semibold text-emerald-300">Privacy & Local Device Guarantee</p>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                            VisionVoice has <strong>no servers, databases, or user accounts</strong>. Your API keys are stored strictly on your device (<code className="bg-emerald-900/60 text-emerald-200 px-1 py-0.5 rounded font-mono">localStorage</code>). Requests go directly over encrypted HTTPS to official AI endpoints and are never logged or stored elsewhere.
                        </p>
                    </div>
                </div>

                {/* Provider Selector Tabs */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Select AI Provider
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-2xl border border-slate-700">
                        <button
                            type="button"
                            onClick={() => handleProviderChange('openrouter')}
                            className={`py-2 px-3 rounded-xl font-medium text-xs transition-all flex items-center justify-center space-x-2 ${
                                provider === 'openrouter'
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <i className="fa-solid fa-globe text-sm"></i>
                            <span>OpenRouter</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProviderChange('gemini')}
                            className={`py-2 px-3 rounded-xl font-medium text-xs transition-all flex items-center justify-center space-x-2 ${
                                provider === 'gemini'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <i className="fa-brands fa-google text-sm"></i>
                            <span>Google Gemini</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic API Key Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        {provider === 'gemini' ? 'Google Gemini API Key (AI Studio)' : 'OpenRouter API Key'}
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={provider === 'gemini' ? geminiKey : openRouterKey}
                            onChange={(e) => provider === 'gemini' ? setGeminiKey(e.target.value) : setOpenRouterKey(e.target.value)}
                            placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-or-v1-...'}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors pr-12 font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 text-slate-400 hover:text-slate-200 p-1"
                            aria-label="Toggle API Key visibility"
                        >
                            <i className={`fa-solid ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                        {provider === 'gemini' ? (
                            <>
                                Stored locally in your browser. Get a key at{' '}
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline hover:text-blue-300"
                                >
                                    aistudio.google.com
                                </a>.
                            </>
                        ) : (
                            <>
                                Stored locally in your browser. Get a key at{' '}
                                <a
                                    href="https://openrouter.ai/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-violet-400 underline hover:text-violet-300"
                                >
                                    openrouter.ai/keys
                                </a>.
                            </>
                        )}
                    </p>
                    {/* Remember Key Checkbox Option */}
                    <div className="flex items-center space-x-2.5 pt-1">
                        <input
                            type="checkbox"
                            id="rememberKey"
                            checked={rememberKey}
                            onChange={(e) => setRememberKey(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                        />
                        <label htmlFor="rememberKey" className="text-xs text-slate-300 cursor-pointer select-none">
                            Save key in browser storage
                        </label>
                    </div>
                </div>

                {/* Model Selection Section */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Model Preference ({provider === 'gemini' ? 'Gemini' : 'OpenRouter'})
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
                    >
                        {activePresetModels.map((m) => (
                            <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                                {m.name}
                            </option>
                        ))}
                    </select>

                    {selectedModel === 'custom' && (
                        <input
                            type="text"
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder={provider === 'gemini' ? 'e.g. gemini-2.5-flash' : 'e.g. nvidia/nemotron-nano-12b-v2-vl:free'}
                            className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 font-bold text-white rounded-xl shadow-lg shadow-violet-900/40 transition-colors text-sm"
                    >
                        Save Settings
                    </button>
                    {(openRouterKey || geminiKey) && (
                        <button
                            onClick={handleClear}
                            className="py-3 px-4 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 active:bg-slate-700 font-medium text-slate-400 rounded-xl border border-slate-700 transition-colors text-sm"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

export default SettingsModal;
