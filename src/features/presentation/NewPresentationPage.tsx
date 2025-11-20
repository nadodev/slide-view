import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSlidesStore, usePresentationStore } from "@/store";
import { useSlidesManager } from "@/hooks/useSlidesManager";
import PresentationEmptyState from "./PresentationEmptyState";

export default function NewPresentationPage() {
    const navigate = useNavigate();

    const slides = useSlidesStore((state) => state.slides);
    const resetSlides = useSlidesStore((state) => state.resetSlides);
    const loading = useSlidesStore((state) => state.loading);
    const error = useSlidesStore((state) => state.error);
    const warning = useSlidesStore((state) => state.warning);

    const highContrast = usePresentationStore((state) => state.highContrast);
    const setHighContrast = usePresentationStore((state) => state.setHighContrast);
    const setEditing = usePresentationStore((state) => state.setEditing);
    const setDraftContent = usePresentationStore((state) => state.setDraftContent);

    const { handleFileUpload, handleAIGeneration } = useSlidesManager();

    // Limpar slides ao entrar na página
    useEffect(() => {
        resetSlides();
    }, [resetSlides]);

    // Redirecionar para o editor quando houver slides
    useEffect(() => {
        if (slides.length > 0) {
            navigate("/presentation/edit/draft");
        }
    }, [slides, navigate]);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <PresentationEmptyState
                highContrast={highContrast}
                onToggleHighContrast={() => setHighContrast(!highContrast)}
                onFilesChange={handleFileUpload}
                onAIGenerate={handleAIGeneration}
                onCreateSlide={() => {
                    setDraftContent("");
                    setEditing(true);
                    // Se criar slide manual, também deve ir para o editor
                    navigate("/presentation/edit/draft?create=true");
                }}
                loading={loading}
                error={error}
                warning={warning}
            />
        </div>
    );
}
