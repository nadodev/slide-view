import { useState, useRef } from "react";
import { Upload, FileText, Settings, Sparkles, Bot, Wand2, Zap } from "lucide-react";

type UploadAreaProps = {
  onFilesChange?: (
    e: React.ChangeEvent<HTMLInputElement> | null,
    options?: any,
  ) => void;
  onAIGenerate?: (prompt: string, slideCount: number, baseText?: string) => void;
  loading?: boolean;
};

export default function UploadArea({
  onFilesChange,
  onAIGenerate,
  loading,
}: UploadAreaProps) {
  const [splitSingle, setSplitSingle] = useState<boolean>(false);
  const [delimiter, setDelimiter] = useState<string>("----'----");
  const [localError, setLocalError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [slideCount, setSlideCount] = useState<number>(6);
  const [preserveText, setPreserveText] = useState<boolean>(false);
  const [baseText, setBaseText] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target.files || []) as File[]);
    const invalid = files.find((f: File) => !/\.md$/i.test(f.name));
    if (invalid) {
      const msg = `Arquivo inválido: ${invalid.name}. Apenas .md é permitido.`;
      setLocalError(msg);
      if (typeof onFilesChange === "function")
        onFilesChange(null, { error: msg });
      return;
    }
    setLocalError("");
    if (typeof onFilesChange === "function")
      onFilesChange(e, { splitSingle, delimiter });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const input = inputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      handleChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const inputRef = useRef<HTMLInputElement | null>(null);
  const openFilePicker = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) {
      setLocalError("Por favor, descreva o que você gostaria de apresentar.");
      return;
    }
    setLocalError("");
    if (onAIGenerate) {
      onAIGenerate(aiPrompt.trim(), slideCount, preserveText ? baseText : undefined);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-2xl">
                <Sparkles className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              SlideCraft AI
            </h1>
          </div>
          <p className="text-slate-400 text-base md:text-xl font-light max-w-2xl mx-auto">
            Crie apresentações profissionais em segundos com IA ou importe seus arquivos Markdown
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-800/50 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-700/50 shadow-2xl">
            <button
              onClick={() => setMode('upload')}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === 'upload'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'upload' && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl shadow-lg"></div>
              )}
              <Upload size={20} className="relative z-10" />
              <span className="relative z-10">Upload</span>
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === 'ai'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'ai' && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl shadow-lg"></div>
              )}
              <Zap size={20} className="relative z-10" />
              <span className="relative z-10">IA Generativa</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative">
          {/* Animated Glow */}
          <div className={`absolute -inset-1 rounded-3xl blur-2xl opacity-20 transition-all duration-500 ${
            mode === 'ai' 
              ? 'bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600'
              : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600'
          }`}></div>
          
          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
            {mode === 'upload' ? (
              /* Upload Area */
              <>
                <div
                  className={`relative transition-all duration-300 ${
                    isDragging
                      ? "bg-violet-500/10"
                      : "bg-gradient-to-br from-slate-800/40 to-slate-900/40"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label className="block p-12 md:p-16 cursor-pointer">
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept=".md"
                      onChange={handleChange}
                      aria-label="Selecionar arquivos markdown"
                      className="hidden"
                      disabled={loading}
                    />

                    <div className="flex flex-col items-center justify-center space-y-6">
                      {/* Icon with animation */}
                      <div
                        className={`transition-all duration-500 ${isDragging ? "scale-110 rotate-6" : "scale-100 rotate-0"}`}
                      >
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 p-7 md:p-8 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                            <Upload size={44} className="text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="text-center space-y-3">
                        <p className="text-xl md:text-2xl font-bold text-slate-100">
                          {isDragging
                            ? "✨ Solte os arquivos aqui"
                            : "Arraste seus arquivos .md"}
                        </p>
                        <div className="flex items-center gap-3 max-w-xs mx-auto">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                          <p className="text-slate-500 font-medium text-sm">ou</p>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                        </div>
                      </div>

                      {/* Button */}
                      <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={loading}
                        className="group relative px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-violet-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-3 text-base md:text-lg">
                          <FileText size={22} />
                          {loading ? "Processando..." : "Selecionar Arquivos"}
                        </span>
                      </button>

                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <p className="text-xs md:text-sm text-emerald-300 font-medium">
                          Suporta múltiplos arquivos .md
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Options Section */}
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
                          onChange={(e) => setSplitSingle(e.target.checked)}
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
                            onChange={(e) => setDelimiter(e.target.value)}
                            placeholder="----'----"
                            aria-label="Marcador de separação de slides"
                            className="w-full px-4 md:px-5 py-2 md:py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-mono text-sm md:text-base"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* AI Generation Area */
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
                        📊 Número exato de slides:
                      </label>
                      <div className="flex items-center gap-3 ml-auto">
                        <button
                          onClick={() => setSlideCount(Math.max(3, slideCount - 1))}
                          disabled={slideCount <= 3 || loading}
                          className="w-9 h-9 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-slate-200 font-bold transition-all hover:scale-105"
                        >
                          −
                        </button>
                        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2 rounded-lg shadow-lg border border-emerald-400/30">
                          <span className="text-white font-bold text-lg">{slideCount}</span>
                        </div>
                        <button
                          onClick={() => setSlideCount(Math.min(12, slideCount + 1))}
                          disabled={slideCount >= 12 || loading}
                          className="w-9 h-9 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-slate-200 font-bold transition-all hover:scale-105"
                        >
                          +
                        </button>
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
                            ✨ Preservar e expandir conteúdo existente
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            A IA irá manter TODO o seu conteúdo original e apenas adicionar mais detalhes, exemplos e explicações
                          </p>
                        </div>
                      </label>

                      {preserveText && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                          <label className="block">
                            <span className="text-sm font-semibold text-slate-300 mb-2 block">
                              📝 Conteúdo que será preservado 100% (a IA só adiciona, nunca remove):
                            </span>
                            <textarea
                              value={baseText}
                              onChange={(e) => setBaseText(e.target.value)}
                              placeholder="Cole aqui seu conteúdo existente (títulos, textos, códigos). A IA vai manter TUDO exatamente como está e apenas adicionar mais detalhes e exemplos..."
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
                    
                    <button
                      onClick={handleAIGenerate}
                      disabled={loading || !aiPrompt.trim()}
                      className="group relative w-full px-10 py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-3 text-base md:text-lg">
                        <Wand2 size={22} className={loading ? "animate-spin" : ""} />
                        {loading ? "Gerando slides mágicos..." : "✨ Gerar Apresentação"}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <Bot size={16} className="text-emerald-400" />
                    <p className="text-xs md:text-sm text-emerald-300 font-medium">
                      Powered by Google Gemini AI
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {localError && (
              <div
                role="alert"
                aria-live="polite"
                className="mx-6 md:mx-8 mb-6 md:mb-8 p-4 md:p-5 bg-red-500/10 border-2 border-red-500/50 rounded-2xl backdrop-blur-sm animate-in fade-in duration-300"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5 shadow-lg">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <p className="text-red-200 font-medium flex-1 text-sm md:text-base">{localError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-slate-500 text-xs md:text-sm flex items-center justify-center gap-2 flex-wrap">
            <span className={mode === 'ai' ? 'text-emerald-400' : 'text-violet-400'}>✨</span>
            {mode === 'upload' 
              ? 'Arquivos ordenados alfabeticamente • Suporte para múltiplos .md'
              : 'IA generativa • Slides profissionais em segundos'
            }
          </p>
        </div>
      </div>
    </div>
  );
}