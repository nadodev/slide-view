import type { ChangeEvent } from "react";
import { UploadArea } from "@/features/slides";
import { AlertCircle } from "lucide-react";
import { Carregando } from "@/shared/components/ui";

type PresentationEmptyStateProps = {
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onFilesChange?: (
    e: ChangeEvent<HTMLInputElement> | null,
    options?: any,
  ) => void;
  onAIGenerate?: (prompt: string, slideCount: number, baseText?: string) => void;
  onCreateSlide?: () => void;
  loading: boolean;
  error: string;
  warning: string;
};

export default function PresentationEmptyState({
  highContrast,
  onToggleHighContrast,
  onFilesChange,
  onAIGenerate,
  onCreateSlide,
  loading,
  error,
  warning,
}: PresentationEmptyStateProps) {
  return (
    <div className="relative flex w-full flex-col items-center gap-6">
      <UploadArea
        onFilesChange={onFilesChange}
        onAIGenerate={onAIGenerate}
        onCreateSlide={onCreateSlide}
        loading={loading}
      />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Carregando
            message={"Processando arquivos..."}
            showProgress={true}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {warning && (
        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{warning}</span>
        </div>
      )}
    </div>
  );
}
