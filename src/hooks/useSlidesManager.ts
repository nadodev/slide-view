import { useCallback } from "react";
import { useSlidesStore } from "@/store";
import { Slide } from "@/types";
import parseMarkdownSafe from "@/utils/markdown";
import {
  createSlideFromMarkdown,
  generateSlidesWithGemini,
} from "@/utils/gemini";

type FileChange =
  | React.ChangeEvent<HTMLInputElement>
  | { target?: { files?: FileList | File[] } }
  | null;

type UploadOptions = {
  splitSingle?: boolean;
  delimiter?: string;
  error?: string;
};

const DELIMITER_FALLBACK = "----'----";

/**
 * Hook que fornece funções utilitárias para gerenciar slides
 * Usa Zustand store para estado global
 */
export function useSlidesManager() {
  const setSlides = useSlidesStore((state) => state.setSlides);
  const setLoading = useSlidesStore((state) => state.setLoading);
  const setError = useSlidesStore((state) => state.setError);
  const setWarning = useSlidesStore((state) => state.setWarning);
  const slides = useSlidesStore((state) => state.slides);

  const extractNotes = useCallback((text: string) => {
    const notes: string[] = [];
    if (!text) return { clean: "", notes };
    const cleaned = text.replace(
      /<!--\s*note:\s*([\s\S]*?)-->/gi,
      (_match, note) => {
        if (note && note.trim()) notes.push(note.trim());
        return "";
      },
    );
    return { clean: cleaned.trim(), notes };
  }, []);

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
        if (files.length === 1 && options.splitSingle) {
          const file = files[0];
          const raw = await file.text();
          const marker = (options.delimiter || DELIMITER_FALLBACK).trim();
          const esc = (value: string) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const lineRegex = new RegExp("^\\s*" + esc(marker) + "\\s*$", "gm");
          let slidesParts = raw
            .split(lineRegex)
            .map((part) => part.trim())
            .filter(Boolean);

          if (slidesParts.length <= 1) {
            const altRegex = new RegExp(
              "\\r?\\n\\s*" + esc(marker) + "\\s*\\r?\\n",
            );
            slidesParts = raw
              .split(altRegex)
              .map((part) => part.trim())
              .filter(Boolean);
          }

          if (slidesParts.length <= 1) {
            setError(
              "Marcador não encontrado — nenhum slide foi carregado. Verifique o marcador ou desmarque a opção de dividir.",
            );
            setLoading(false);
            return;
          }

          setWarning("");
          const loadedSlides = slidesParts.map((content, index) => {
            const { clean, notes } = extractNotes(content);
            return {
              name: `${file.name.replace(".md", "")}-${index + 1}`,
              content: clean,
              notes,
              html: parseMarkdownSafe(clean),
            } as Slide;
          });

          setSlides(loadedSlides);
          return;
        }

        const sortedFiles = files.sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        const loadedSlides = await Promise.all(
          sortedFiles.map(async (file) => {
            const raw = await file.text();
            const { clean, notes } = extractNotes(raw);
            return {
              name: file.name.replace(".md", ""),
              content: clean,
              notes,
              html: parseMarkdownSafe(clean),
            } as Slide;
          }),
        );

        setSlides(loadedSlides);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err ?? "Erro desconhecido");
        setError("Erro ao carregar arquivos: " + message);
      } finally {
        setLoading(false);
      }
    },
    [extractNotes, setSlides, setLoading, setError, setWarning],
  );

  const handleAIGeneration = useCallback(
    async (prompt: string, slideCount = 6, baseText?: string) => {
      setLoading(true);
      setError("");
      setWarning("");

      try {
        const generatedSlides = await generateSlidesWithGemini(
          prompt,
          slideCount,
          baseText,
        );

        const newSlides = generatedSlides.map((markdown, index) =>
          createSlideFromMarkdown(markdown, index),
        );

        const processedSlides = newSlides.map((slide) => ({
          ...slide,
          html: parseMarkdownSafe(slide.content || ""),
        }));

        setSlides(processedSlides);
        setWarning(
          `✨ ${processedSlides.length} slides gerados com sucesso usando IA Gemini!`,
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
        const supportsFS =
          typeof window !== "undefined" &&
          "showSaveFilePicker" in (window as any);

        if (supportsFS) {
          let handle = slide._fileHandle;
          if (!handle) {
            handle = await (window as any).showSaveFilePicker({
              suggestedName: slide.name?.endsWith(".md")
                ? slide.name
                : `${slide.name || "slide"}.md`,
              types: [
                { description: "Markdown", accept: { "text/markdown": [".md"] } },
                { description: "Text", accept: { "text/plain": [".txt"] } },
              ],
            });
            // Update file handle in store
            const updatedSlides = [...slides];
            if (updatedSlides[index]) {
              updatedSlides[index]._fileHandle = handle;
              setSlides(updatedSlides);
            }
          }
          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();
        } else {
          const blob = new Blob([content], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = slide.name?.endsWith(".md")
            ? slide.name
            : `${slide.name || "slide"}.md`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.warn("Falha ao salvar arquivo:", err);
        setWarning(
          "Não foi possível salvar diretamente no arquivo. Seu navegador pode não suportar, ou a permissão foi negada.",
        );
        setTimeout(() => setWarning(""), 4000);
      }
    },
    [slides, setSlides, setWarning],
  );

  const saveAllSlidesToFile = useCallback(async () => {
    if (slides.length === 0) return;
    const combined = slides
      .map((slide) => slide.content || "")
      .join(`\n\n${DELIMITER_FALLBACK}\n\n`);

    try {
      const supportsFS =
        typeof window !== "undefined" &&
        "showSaveFilePicker" in (window as any);

      if (supportsFS) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: "apresentacao-completa.md",
          types: [
            { description: "Markdown", accept: { "text/markdown": [".md"] } },
            { description: "Text", accept: { "text/plain": [".txt"] } },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(combined);
        await writable.close();
        setWarning(
          `✨ Apresentação completa salva com ${slides.length} slides!`,
        );
      } else {
        const blob = new Blob([combined], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "apresentacao-completa.md";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        setWarning(
          `✨ Download iniciado! Apresentação com ${slides.length} slides.`,
        );
      }
    } catch (err) {
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
