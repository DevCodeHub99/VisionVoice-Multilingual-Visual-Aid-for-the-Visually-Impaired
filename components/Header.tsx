
import { memo } from 'react';
import { Task, LanguageOption, UserSettings } from '../types';
import { LANGUAGES } from '../constants';

interface HeaderProps {
    language: string;
    userSettings?: UserSettings;
    onLanguageChange: (language: string) => void;
    onSettingsClick?: () => void;
}

const Header = memo(({ language, userSettings, onLanguageChange, onSettingsClick }: HeaderProps) => {
    const provider = userSettings?.provider || 'openrouter';
    const activeKey = provider === 'gemini' ? userSettings?.geminiKey : userSettings?.openRouterKey;
    const hasKey = Boolean(activeKey?.trim());

    return (
        <div className="safe-top pt-4 px-4 sm:px-6 flex justify-between items-start">
            {/* Language Selector (Floating Pill) */}
            <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center border border-white/10 shadow-lg">
                <i className="fa-solid fa-globe text-slate-300 mr-2 text-sm"></i>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-transparent text-white font-medium text-sm outline-none appearance-none cursor-pointer"
                    aria-label="Select Language"
                >
                    {LANGUAGES.map((lang: LanguageOption) => (
                        <option key={lang.code} value={lang.code} className="bg-slate-900">{lang.name}</option>
                    ))}
                </select>
                <i className="fa-solid fa-chevron-down text-slate-400 ml-2 text-xs"></i>
            </div>

            {/* Right Controls: Status Pill & Settings Button */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={onSettingsClick}
                    className={`bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center border transition-all active:scale-95 shadow-lg ${
                        hasKey
                            ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40'
                            : 'border-amber-500/40 text-amber-300 hover:bg-amber-950/40 animate-pulse'
                    }`}
                    aria-label={hasKey ? `Provider: ${provider}` : 'API key required. Click to setup'}
                >
                    <span className={`w-2 h-2 rounded-full mr-2 ${hasKey ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`}></span>
                    <span className="text-xs font-semibold tracking-wide">
                        {hasKey ? (provider === 'gemini' ? 'Gemini' : 'OpenRouter') : 'Setup Key'}
                    </span>
                </button>

                <button
                    onClick={onSettingsClick}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 shadow-lg hover:bg-black/60 transition-all"
                    aria-label="AI Settings"
                >
                    <i className="fa-solid fa-gear text-slate-200 text-lg"></i>
                </button>
            </div>
        </div>
    );
});

export default Header;
