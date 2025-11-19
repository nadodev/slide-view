import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Carregando } from "@/shared/components/ui/Carregando";
import InteractiveSplitModal from "./InteractiveSplitModal";
import { FileUploader } from "./UploadArea/FileUploader";
import { AIGenerator } from "./UploadArea/AIGenerator";
import { UploadOptions } from "./UploadArea/UploadOptions";
import { ModeSelector } from "./UploadArea/ModeSelector";
import type { UploadAreaProps } from "./UploadArea/types";

export default function UploadArea({
  onFilesChange,
  onAIGenerate,
  onCreateSlide,
  loading,
}: UploadAreaProps) {
  // State
  const [splitSingle, setSplitSingle] = useState<boolean>(false);
  const [delimiter, setDelimiter] = useState<string>("----'----");
  const [localError, setLocalError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'ai'>('upload');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Modal state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");
  const [modalFilename, setModalFilename] = useState<string>("");

  // File handling
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((e.target.files || []) as File[]);
    const invalid = files.find((f: File) => !/\.md$/i.test(f.name));

    if (invalid) {
      const msg = `Arquivo inválido: ${invalid.name}. Apenas .md é permitido.`;
      setLocalError(msg);
      toast.error("Arquivo inválido", {
        description: `${invalid.name} não é um arquivo Markdown válido.`,
        position: "top-right",
      });
      if (typeof onFilesChange === "function") {
        onFilesChange(null, { error: msg });
      }
      return;
    }

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
            description: "Arquivos processados com sucesso.",
            position: "top-right",
          });
          setTimeout(() => setUploadProgress(0), 1000);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    setLocalError("");

    if (typeof onFilesChange === "function") {
      if (files.length === 1) {
        try {
          const file = files[0];
          const txt = await file.text();
          const LARGE_THRESHOLD = 5000;

          if (txt && txt.length > LARGE_THRESHOLD) {
            setModalFilename(file.name);
            setModalContent(txt);
            setShowSplitModal(true);
            return;
          }
        } catch (err) {
          // fallback to normal behavior
        }
      }

      onFilesChange(e, { splitSingle, delimiter });
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));

    const fakeEvent = {
      target: { files: dataTransfer.files }
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(fakeEvent);
  };

  // AI generation handler
  const handleAIGenerate = (prompt: string, slideCount: number, baseText?: string) => {
    if (!prompt.trim()) {
      setLocalError("Por favor, descreva o que você gostaria de apresentar.");
      toast.error("Prompt necessário", {
        description: "Descreva o tema da sua apresentação para continuar.",
        position: "top-right"
      });
      return;
    }

    setLocalError("");
    toast.success("IA ativada!", {
      description: `Gerando ${slideCount} slides sobre: ${prompt.slice(0, 50)}...`,
      position: "top-right"
    });

    if (onAIGenerate) {
      onAIGenerate(prompt, slideCount, baseText);
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
              SlideView
            </h1>
          </div>
          <p className="text-slate-400 text-base md:text-xl font-light max-w-2xl mx-auto">
            Crie apresentações profissionais em segundos com IA ou importe seus arquivos Markdown
          </p>
        </div>

        {/* Mode Selector */}
        <ModeSelector
          mode={mode}
          onModeChange={setMode}
          onCreateSlide={onCreateSlide}
        />

        {/* Main Content */}
        <div className="relative">
          <div className={`absolute -inset-1 rounded-3xl blur-2xl opacity-20 transition-all duration-500 ${mode === 'ai'
              ? 'bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600'
              : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600'
            }`}></div>

          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
            {mode === 'upload' ? (
              <>
                <FileUploader
                  onFilesChange={handleChange}
                  loading={loading}
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  uploadProgress={uploadProgress}
                />
                <UploadOptions
                  splitSingle={splitSingle}
                  delimiter={delimiter}
                  onSplitChange={setSplitSingle}
                  onDelimiterChange={setDelimiter}
                />
              </>
            ) : (
              <AIGenerator
                onGenerate={handleAIGenerate}
                loading={loading}
              />
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

      {/* Split Modal */}
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
            const files = parts.map((p) =>
              new File([p.content], `${p.name}.md`, { type: 'text/markdown' })
            );

            if (typeof onFilesChange === 'function') {
              (onFilesChange as any)(
                { target: { files } },
                { splitSingle: false, delimiter }
              );
            }

            setShowSplitModal(false);
            setModalContent("");
            setModalFilename("");
          }}
        />
      )}
    </div>
  );
}
