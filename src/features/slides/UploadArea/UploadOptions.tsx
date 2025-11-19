import { Settings } from 'lucide-react';
import type { UploadOptionsProps } from './types';

export function UploadOptions({
    splitSingle,
    delimiter,
    onSplitChange,
    onDelimiterChange,
}: UploadOptionsProps) {
    return (
        <div className="bg-slate-950/50 backdrop-blur-sm p-6 md:p-8 border-t border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-500/10 rounded-xl">
                    <Settings size={20} className="text-violet-400" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-100">Opções Avançadas</h3>
            </div>

            <div className="space-y-5">
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-xl hover:bg-slate-800/50 transition-colors">
                    <div className="relative flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={splitSingle}
                            onChange={(e) => onSplitChange(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-cyan-600 transition-all shadow-inner"></div>
                        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-lg"></div>
                    </div>
                    <span className="text-slate-200 font-medium group-hover:text-white transition-colors text-sm md:text-base">
                        Dividir arquivo único em slides
                    </span>
                </label>

                {splitSingle && (
                    <div className="pl-0 md:pl-20 space-y-2 animate-in fade-in duration-300">
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-400 mb-3 block">
                                Marcador de separação:
                            </span>
                            <input
                                type="text"
                                value={delimiter}
                                onChange={(e) => onDelimiterChange(e.target.value)}
                                placeholder="----'----"
                                aria-label="Marcador de separação de slides"
                                className="w-full px-4 md:px-5 py-2 md:py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-mono text-sm md:text-base"
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
