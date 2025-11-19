import { Upload, Zap, Plus } from 'lucide-react';

interface ModeSelectorProps {
    mode: 'upload' | 'ai';
    onModeChange: (mode: 'upload' | 'ai') => void;
    onCreateSlide?: () => void;
}

export function ModeSelector({ mode, onModeChange, onCreateSlide }: ModeSelectorProps) {
    return (
        <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-800/50 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-700/50 shadow-2xl">
                <button
                    onClick={() => onModeChange('upload')}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${mode === 'upload' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    {mode === 'upload' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl shadow-lg"></div>
                    )}
                    <Upload size={20} className="relative z-10" />
                    <span className="relative z-10">Upload</span>
                </button>
                <button
                    onClick={() => onModeChange('ai')}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${mode === 'ai' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    {mode === 'ai' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl shadow-lg"></div>
                    )}
                    <Zap size={20} className="relative z-10" />
                    <span className="relative z-10">IA Generativa</span>
                </button>
                {onCreateSlide && (
                    <button
                        onClick={onCreateSlide}
                        className="relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    >
                        <Plus size={20} />
                        <span>Criar Slide</span>
                    </button>
                )}
            </div>
        </div>
    );
}
