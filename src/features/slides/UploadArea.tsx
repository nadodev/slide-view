import { useState, useRef } from "react";
import InteractiveSplitModal from "./InteractiveSplitModal";
import { Upload, FileText, Settings, Sparkles, Bot, Wand2, Zap, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Carregando } from "@/shared/components/ui/Carregando";
import { toast } from "sonner";

type UploadAreaProps = {
  onFilesChange?: (
    e: React.ChangeEvent<HTMLInputElement> | null,
    options?: any,
  ) => void;
  onAIGenerate?: (prompt: string, slideCount: number, baseText?: string) => void;
  onCreateSlide?: () => void;
  loading?: boolean;
};

export default function UploadArea({
  onFilesChange,
  onAIGenerate,
  onCreateSlide,
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [showSplitModal, setShowSplitModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");
  const [modalFilename, setModalFilename] = useState<string>("");

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target.files || []) as File[]);
    const invalid = files.find((f: File) => !/\.md$/i.test(f.name));
    if (invalid) {
      const msg = `Arquivo inválido: ${invalid.name}. Apenas .md é permitido.`;
      setLocalError(msg);
      toast.error("Arquivo inválido", {
        description: `${invalid.name} não é um arquivo Markdown válido.`
      });
      if (typeof onFilesChange === "function")
        onFilesChange(null, { error: msg });
      return;
    }
    
    // Simular progress de upload
    setUploadProgress(0);
    toast.success("Upload iniciado", {
      description: `${files.length} arquivo(s) sendo processado(s)...`,
      position: "top-right",
    });
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 20;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          toast.success("Upload concluído!", {
            description: "Arquivos processados com sucesso."
          });
          setTimeout(() => setUploadProgress(0), 1000); 
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    setLocalError("");
    if (typeof onFilesChange === "function") {
      // If single large file, show interactive split modal first
      if (files.length === 1) {
        try {
          const file = files[0];
          const txt = await file.text();
          const LARGE_THRESHOLD = 5000; // characters
          if (txt && txt.length > LARGE_THRESHOLD) {
            setModalFilename(file.name);
            setModalContent(txt);
            setShowSplitModal(true);
            return; // wait for modal confirm
          }
        } catch (err) {
          // fallback to normal behavior
        }
      }

      onFilesChange(e, { splitSingle, delimiter });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Só remove o estado de dragging se realmente sair da área
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    setIsDragging(false);
    }
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
      toast.error("Prompt necessário", {
        description: "Descreva o tema da sua apresentação para continuar."
      });
      return;
    }
    setLocalError("");
    toast.success("IA ativada!", {
      description: `Gerando ${slideCount} slides sobre: ${aiPrompt.slice(0, 50)}...`
    });
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
                  className={`relative transition-all duration-300 ease-out ${
                    isDragging
                      ? "bg-violet-500/10 border-4 border-dashed border-violet-400 rounded-2xl m-4 scale-[1.01] shadow-2xl shadow-violet-500/20"
                      : "bg-gradient-to-br from-slate-800/40 to-slate-900/40"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Drag overlay with pattern */}
                  {isDragging && (
                    <div 
                      className="absolute inset-4 rounded-2xl bg-violet-500/5 border-2 border-dashed border-violet-300/50 flex items-center justify-center z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, rgba(139, 92, 246, 0.1) 25%, transparent 25%), 
                          linear-gradient(-45deg, rgba(139, 92, 246, 0.1) 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, rgba(139, 92, 246, 0.1) 75%), 
                          linear-gradient(-45deg, transparent 75%, rgba(139, 92, 246, 0.1) 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    >
                      <div className="text-center space-y-4 bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-violet-400/30">
                        <div className="text-5xl animate-bounce">📁</div>
                        <p className="text-violet-300 font-bold text-xl">
                          ✨ Solte seus arquivos .md aqui
                        </p>
                        <p className="text-violet-400/80 text-sm max-w-xs">
                          Arquivos Markdown serão processados automaticamente e convertidos em slides
                        </p>
                        <div className="flex items-center justify-center gap-2 text-violet-400/60 text-xs">
                          <span>🔄</span>
                          <span>Suporta múltiplos arquivos</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <label className={`block p-12 md:p-16 cursor-pointer ${isDragging ? 'opacity-30' : ''}`}>
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
                      <Button
                        type="button"
                        onClick={openFilePicker}
                        disabled={loading}
                        size="lg"
                        className="group relative px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-cyan-600 hover:via-fuchsia-600 hover:to-violet-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-violet-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden border-0"
                      >
                          <FileText size={22} />
                          {loading ? "Processando..." : "Selecionar Arquivos"}
                      </Button>

                      {/* Progress Bar */}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full max-w-md space-y-2">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-xs text-slate-400 text-center">
                            Processando arquivos... {uploadProgress}%
                          </p>
                        </div>
                      )}

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
                      onClick={handleAIGenerate}
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

      {/* Loading Overlay */}
      {loading && (
        <Carregando 
          message={mode === 'ai' ? "Gerando slides com IA..." : "Processando arquivos..."} 
          showProgress={true}
        />
      )}

      {showSplitModal && (
        <InteractiveSplitModal
          filename={modalFilename}
          content={modalContent}
          onCancel={() => {
            setShowSplitModal(false);
            setModalContent("");
            setModalFilename("");
          }}
          onConfirm={(parts) => {
            // convert parts to File[] and call onFilesChange
            const files = parts.map((p) => new File([p.content], `${p.name}.md`, { type: 'text/markdown' }));
            if (typeof onFilesChange === 'function') {
              (onFilesChange as any)({ target: { files } }, { splitSingle: false, delimiter });
            }
            setShowSplitModal(false);
            setModalContent("");
            setModalFilename("");
          }}
        />
      )}

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }

        .markdown-preview {
          color: #e2e8f0;
          line-height: 1.75;
        }

        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          font-weight: 700;
          color: #ffffff;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          line-height: 1.25;
        }

        .markdown-preview h1 {
          font-size: 2.5rem;
          background: linear-gradient(to right, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding-bottom: 0.5em;
          border-bottom: 2px solid rgba(100, 116, 139, 0.3);
        }

        .markdown-preview h2 {
          font-size: 2rem;
          color: #f1f5f9;
          padding-bottom: 0.3em;
          border-bottom: 1px solid rgba(100, 116, 139, 0.3);
        }

        .markdown-preview h3 {
          font-size: 1.5rem;
          color: #e2e8f0;
        }

        .markdown-preview p {
          margin-top: 1em;
          margin-bottom: 1em;
          color: #cbd5e1;
        }

        .markdown-preview ul,
        .markdown-preview ol {
          margin-top: 1em;
          margin-bottom: 1em;
          padding-left: 1.5em;
          color: #cbd5e1;
        }

        .markdown-preview li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .markdown-preview code {
          background: #1e293b;
          color: #c084fc;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.875em;
          border: 1px solid rgba(100, 116, 139, 0.3);
        }

        .markdown-preview pre {
          background: #0f172a;
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 0.75rem;
          padding: 1.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
        }

        .markdown-preview pre code {
          background: transparent;
          padding: 0;
          border: none;
          color: #e2e8f0;
        }

        .markdown-preview strong {
          font-weight: 700;
          color: #ffffff;
        }

        .markdown-preview em {
          font-style: italic;
          color: #e2e8f0;
        }

        .markdown-preview a {
          color: #60a5fa;
          text-decoration: none;
        }

        .markdown-preview a:hover {
          color: #93c5fd;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
