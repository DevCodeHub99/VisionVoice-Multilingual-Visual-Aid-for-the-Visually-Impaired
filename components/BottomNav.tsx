
import { RefObject, ChangeEvent, memo } from 'react';
import { Task } from '../types';

interface BottomNavProps {
    task: Task;
    activeTab: 'camera' | 'upload';
    onTaskChange: (task: Task) => void;
    onTabChange: (tab: 'camera' | 'upload') => void;
    onCaptureClick: () => void;
    onUploadClick: () => void;
    fileInputRef: RefObject<HTMLInputElement>;
    handleImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

const BottomNav = memo(({ task, activeTab, onTaskChange, onTabChange, onCaptureClick, onUploadClick, fileInputRef, handleImageUpload }: BottomNavProps) => {
    return (
        <div className="flex flex-col items-center bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-6 pt-12 space-y-8">

            {/* Capture Button */}
            <button
                onClick={onCaptureClick}
                className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 touch-manipulation shadow-2xl"
                aria-label="Capture Image"
                style={{ display: activeTab === 'upload' ? 'none' : 'flex' }}
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-200"></div>
            </button>

            {/* Upload Placeholder if tab active */}
            <button
                onClick={onUploadClick}
                className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 touch-manipulation shadow-2xl bg-white/10 backdrop-blur-md border border-white/30"
                style={{ display: activeTab === 'upload' ? 'flex' : 'none' }}
            >
                <i className="fa-solid fa-image text-3xl text-white"></i>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />


            {/* Bottom Navigation Bar */}
            <div className="flex items-center justify-around w-full px-6 max-w-sm mx-auto">

                {/* Describe Mode */}
                <button
                    onClick={() => { onTaskChange(Task.DESCRIBE); onTabChange('camera'); }}
                    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${task === Task.DESCRIBE && activeTab === 'camera' ? 'text-white scale-110' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <div className={`w-12 h-8 rounded-full flex items-center justify-center mb-1 ${task === Task.DESCRIBE && activeTab === 'camera' ? 'bg-violet-600/30' : ''}`}>
                        <i className="fa-solid fa-eye text-xl"></i>
                    </div>
                    <span className="text-[10px] font-medium tracking-wide uppercase">Describe</span>
                </button>

                {/* Read Text Mode */}
                <button
                    onClick={() => { onTaskChange(Task.READ); onTabChange('camera'); }}
                    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${task === Task.READ && activeTab === 'camera' ? 'text-white scale-110' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <div className={`w-12 h-8 rounded-full flex items-center justify-center mb-1 ${task === Task.READ && activeTab === 'camera' ? 'bg-cyan-600/30' : ''}`}>
                        <i className="fa-solid fa-align-left text-xl"></i>
                    </div>
                    <span className="text-[10px] font-medium tracking-wide uppercase">Read Text</span>
                </button>

                {/* Upload Mode */}
                <button
                    onClick={() => { onTabChange('upload'); }}
                    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === 'upload' ? 'text-white scale-110' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <div className={`w-12 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === 'upload' ? 'bg-fuchsia-600/30' : ''}`}>
                        <i className="fa-solid fa-upload text-xl"></i>
                    </div>
                    <span className="text-[10px] font-medium tracking-wide uppercase">Upload</span>
                </button>
            </div>
        </div>
    );
});

export default BottomNav;
