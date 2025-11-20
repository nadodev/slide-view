import { useCallback } from "react";
import { useSlidesStore, usePresentationStore } from "@/store";
import { parseMarkdownFiles, saveToFile, exportSlidesAsMarkdown, updateSlideFileHandle } from "@/services/slides/slideService";
import { generateSlides } from "@/services/ai/aiService";

type FileChange =
  | React.ChangeEvent<HTMLInputElement>
  | { target?: { files?: FileList | File[] } }
  | null;

type UploadOptions = {
  splitSingle?: boolean;
  delimiter?: string;
  error?: string;
};

/**
 * Hook que fornece funções utilitárias para gerenciar slides
 * Usa Zustand store para estado global e serviços para lógica de negócio
 */
export function useSlidesManager() {
  const setSlides = useSlidesStore((state) => state.setSlides);
  const setLoading = useSlidesStore((state) => state.setLoading);
  const setError = useSlidesStore((state) => state.setError);
  const setWarning = useSlidesStore((state) => state.setWarning);
  const slides = useSlidesStore((state) => state.slides);
  const setShowSlideList = usePresentationStore((state) => state.setShowSlideList);

  const handleFileUpload = useCallback(
    async (event: FileChange, options: UploadOptions = {}) => {
      if (options?.error) {
        setError(options.error);
        return;
      }

      const inputFiles = event?.target?.files;
      const files = inputFiles ? Array.from(inputFiles as FileList) : [];
      if (files.length === 0) return;

      setLoading(true);
      setError("");

      try {
        const loadedSlides = await parseMarkdownFiles(files, {
          splitSingle: options.splitSingle,
          delimiter: options.delimiter,
        });

        setSlides(loadedSlides);
        setShowSlideList(true);
        setWarning("");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err ?? "Erro desconhecido");
        setError("Erro ao carregar arquivos: " + message);
      } finally {
        setLoading(false);
      }
    },
    [setSlides, setLoading, setError, setWarning],
  );

  const handleAIGeneration = useCallback(
    async (prompt: string, slideCount = 6, baseText?: string) => {
      setLoading(true);
      setError("");
      setWarning("");

      try {
        const generatedSlides = await generateSlides(prompt, slideCount, baseText);
        setSlides(generatedSlides);
        setShowSlideList(true);
        setWarning(
          `✨ ${generatedSlides.length} slides gerados com sucesso usando IA Gemini!`,
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Problema na conexão com a IA";
        setError(`Erro ao gerar slides: ${message}`);
      } finally {
        setLoading(false);
      }
    },
    [setSlides, setLoading, setError, setWarning],
  );

  const saveSlideToFile = useCallback(
    async (index: number, content: string) => {
      try {
        const slide = slides[index];
        if (!slide) return;

        const handle = await updateSlideFileHandle(slide, content);

        // Update file handle in store
        if (handle) {
          const updatedSlides = [...slides];
          if (updatedSlides[index]) {
            updatedSlides[index]._fileHandle = handle;
            setSlides(updatedSlides);
          }
        }
      } catch (err) {
        if ((err as Error).message === "File System Access API not supported") {
          // Fallback to download
          const slide = slides[index];
          const fileName = slide.name?.endsWith(".md")
            ? slide.name
            : `${slide.name || "slide"}.md`;

          await saveToFile(content, fileName, "markdown");
        } else if ((err as Error).name !== "AbortError") {
          console.warn("Falha ao salvar arquivo:", err);
          setWarning(
            "Não foi possível salvar diretamente no arquivo. Seu navegador pode não suportar, ou a permissão foi negada.",
          );
          setTimeout(() => setWarning(""), 4000);
        }
      }
    },
    [slides, setSlides, setWarning],
  );

  const saveAllSlidesToFile = useCallback(async () => {
    if (slides.length === 0) return;

    try {
      const combined = exportSlidesAsMarkdown(slides);
      await saveToFile(combined, "apresentacao-completa.md", "markdown");
      setWarning(
        `✨ Apresentação completa salva com ${slides.length} slides!`,
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled
        return;
      }
      const message =
        err instanceof Error ? err.message : String(err ?? "Erro ao salvar");
      setError("Erro ao salvar o arquivo: " + message);
    }
  }, [slides, setWarning, setError]);

  return {
    handleFileUpload,
    handleAIGeneration,
    saveSlideToFile,
    saveAllSlidesToFile,
  };
}
