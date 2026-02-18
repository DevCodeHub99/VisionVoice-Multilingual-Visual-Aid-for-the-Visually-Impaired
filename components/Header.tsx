
import { memo } from 'react';
import { Task, LanguageOption } from '../types';
import { LANGUAGES } from '../constants';

interface HeaderProps {
    language: string;
    onLanguageChange: (language: string) => void;
    onSettingsClick: () => void;
}

const Header = memo(({ language, onLanguageChange, onSettingsClick }: HeaderProps) => {
    return (
        <div className="pt-6 px-6 flex justify-between items-start">
            {/* Language Selector (Floating Pill) */}
            <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center border border-white/10 shadow-lg">
                <i className="fa-solid fa-globe text-slate-300 mr-2 text-sm"></i>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-transparent text-white font-medium text-sm outline-none appearance-none cursor-pointer"
                >
                    {LANGUAGES.map((lang: LanguageOption) => (
                        <option key={lang.code} value={lang.code} className="bg-slate-900">{lang.name}</option>
                    ))}
                </select>
                <i className="fa-solid fa-chevron-down text-slate-400 ml-2 text-xs"></i>
            </div>

            <button
                onClick={onSettingsClick}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 opacity-0 pointer-events-none"
            >
            </button>
        </div>
    );
});

export default Header;
