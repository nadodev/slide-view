import { useState } from 'react';
import { Bot, Wand2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { AIGeneratorProps } from './types';

export function AIGenerator({ onGenerate, loading }: AIGeneratorProps) {
    const [aiPrompt, setAiPrompt] = useState<string>("");
    const [slideCount, setSlideCount] = useState<number>(6);
    const [preserveText, setPreserveText] = useState<boolean>(false);
    const [baseText, setBaseText] = useState<string>("");

    const handleGenerate = () => {
        if (!aiPrompt.trim()) return;
        onGenerate(aiPrompt.trim(), slideCount, preserveText ? baseText : undefined);
    };

    return (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-12 md:p-16">
            <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8">
                {/* AI Icon */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 p-7 md:p-8 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                        <Bot size={44} className="text-white" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-3">
                    <p className="text-xl md:text-2xl font-bold text-slate-100">
                        ✨ Geração Inteligente de Slides
                    </p>
                    <p className="text-slate-400 max-w-2xl text-sm md:text-base">
                        Descreva seu tema e deixe nossa IA criar uma apresentação profissional completa
                    </p>
                </div>

                {/* Input Area */}
                <div className="w-full max-w-2xl space-y-4">
                    {/* Slide Count Control */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                        <label className="text-slate-300 font-semibold text-sm md:text-base">
                            Número exato de slides:
                        </label>
                        <div className="flex items-center gap-3 ml-auto">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSlideCount(Math.max(3, slideCount - 1))}
                                disabled={slideCount <= 3 || loading}
                                className="w-9 h-9 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 border-slate-600 text-slate-200 font-bold transition-all hover:scale-105"
                            >
                                −
                            </Button>
                            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2 rounded-lg shadow-lg border border-emerald-400/30">
                                <span className="text-white font-bold text-lg">{slideCount}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSlideCount(Math.min(12, slideCount + 1))}
                                disabled={slideCount >= 12 || loading}
                                className="w-9 h-9 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 border-slate-600 text-slate-200 font-bold transition-all hover:scale-105"
                            >
                                +
                            </Button>
                        </div>
                        <div className="text-xs text-slate-400 ml-auto sm:ml-0 text-center">
                            <div>3-12 slides</div>
                            <div className="text-emerald-400 font-medium">Garantido: {slideCount} slides</div>
                        </div>
                    </div>

                    {/* Preservar Texto */}
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                        <label className="flex items-start gap-3 cursor-pointer mb-4">
                            <div className="relative flex-shrink-0 mt-1">
                                <input
                                    type="checkbox"
                                    checked={preserveText}
                                    onChange={(e) => setPreserveText(e.target.checked)}
                                    className="sr-only peer"
                                    disabled={loading}
                                />
                                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 transition-all shadow-inner"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-lg"></div>
                            </div>
                            <div className="flex-1">
                                <span className="text-slate-200 font-semibold text-sm md:text-base block">
                                    Preservar e expandir conteúdo existente
                                </span>
                                <p className="text-xs text-slate-500 mt-1">
                                    A IA irá distribuir TODO o seu conteúdo pelos slides solicitados, expandindo cada seção com mais detalhes
                                </p>
                            </div>
                        </label>

                        {preserveText && (
                            <div className="space-y-3 animate-in fade-in duration-300">
                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-300 mb-2 block">
                                        Conteúdo que será preservado 100% (a IA só adiciona, nunca remove):
                                    </span>
                                    <textarea
                                        value={baseText}
                                        onChange={(e) => setBaseText(e.target.value)}
                                        placeholder="Cole aqui seu conteúdo existente. A IA vai distribuir TODO este conteúdo pelos slides solicitados, expandindo cada seção com mais detalhes técnicos e exemplos práticos..."
                                        className="w-full h-32 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm"
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ex: Crie uma apresentação sobre os benefícios da energia solar, incluindo estatísticas, tipos de painéis e impacto ambiental..."
                            className="w-full h-36 px-5 md:px-6 py-4 bg-slate-800/80 border-2 border-slate-600 rounded-2xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none text-sm md:text-base shadow-inner"
                            disabled={loading}
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                            {aiPrompt.length}/500
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !aiPrompt.trim()}
                        size="lg"
                        className="group relative w-full px-10 py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden border-0"
                    >
                        <Wand2 size={22} className={loading ? "animate-spin" : ""} />
                        {loading ? "Gerando slides mágicos..." : "✨ Gerar Apresentação"}
                    </Button>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <Bot size={16} className="text-emerald-400" />
                    <p className="text-xs md:text-sm text-emerald-300 font-medium">
                        Powered by Google Gemini AI
                    </p>
                </div>
            </div>
        </div>
    );
}
