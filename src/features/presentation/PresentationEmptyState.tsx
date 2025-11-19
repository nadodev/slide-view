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
      <div className="absolute right-4 top-4">
        <button
          className="reload-btn"
          onClick={onToggleHighContrast}
          aria-pressed={highContrast}
          aria-label="Alternar alto contraste"
        >
          {highContrast ? "Contraste Padrão" : "Alto Contraste"}
        </button>
      </div>

      <UploadArea
        onFilesChange={onFilesChange}
        onAIGenerate={onAIGenerate}
        onCreateSlide={onCreateSlide}
        loading={loading}
      />

      {loading && (
        <>
          <Carregando
            message={"Processando arquivos..."}
            showProgress={true}
          />
        </>
      )}

      {error && (
        <div className="message error">
          <AlertCircle /> {error}
        </div>
      )}

      {warning && (
        <div
          className="message"
          style={{
            color: "#a16207",
            background: "#fff7ed",
            padding: 8,
            borderRadius: 6,
          }}
        >
          {warning}
        </div>
      )}
    </div>
  );
}
