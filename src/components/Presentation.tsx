import { useState, useEffect, useRef, useMemo } from "react";
import hljs from "highlight.js";
import { useLocation, useNavigate } from "react-router-dom";
import UploadArea from "./UploadArea";
import SlidesWithThumbs from "./SlidesWithThumbs";
import Navigation from "./Navigation";
import SlideList from "./SlideList";
import PresenterView from "./PresenterView";
import EditPanel from "./EditPanel";
import { Sparkles, AlertCircle } from "lucide-react";
import useAnchorNavigation from "../hooks/useAnchorNavigation";
import ScrollTopButton from "./ScrollTopButton";
import { generateSlidesWithGemini, createSlideFromMarkdown } from "../utils/gemini";

import parseMarkdownSafe from "../utils/markdown";

export type Slide = {
  name?: string;
  content?: string;
  notes?: string[];
  html?: string;
  _fileHandle?: any;
};

const Presentation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [showSlideList, setShowSlideList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const slideContentRef = useRef<any>(null);
  const slideContainerRef = useRef<any>(null);
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem("presentation-high-contrast") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "presentation-high-contrast",
        highContrast ? "1" : "0",
      );
    } catch {}
  }, [highContrast]);

  const [presenterMode, setPresenterMode] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [draftContent, setDraftContent] = useState<string>("");
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [editorFocus, setEditorFocus] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [slideTransition, setSlideTransition] = useState<string>("fade");
  const thumbsRailRef = useRef<any>(null);
  const [transitionKey, setTransitionKey] = useState<number>(0);

  useEffect(() => {
    if (focusMode) {
      const prevX = document.body.style.overflowX;
      const prevY = document.body.style.overflowY;
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "auto";
      return () => {
        document.body.style.overflowX = prevX || "";
        document.body.style.overflowY = prevY || "";
      };
    }
    return undefined;
  }, [focusMode]);

  const saveSlideToFile = async (index: number, content: string) => {
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
          setSlides((prev) => {
            const cp = prev.slice();
            if (cp[index]) cp[index]._fileHandle = handle;
            return cp;
          });
        }
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = slide.name?.endsWith(".md")
          ? slide.name
          : `${slide.name || "slide"}.md`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.warn("Falha ao salvar arquivo:", err);
      setWarning(
        "Não foi possível salvar diretamente no arquivo. Seu navegador pode não suportar, ou a permissão foi negada.",
      );
      setTimeout(() => setWarning(""), 4000);
    }
  };

  const saveAllSlidesToFile = async () => {
    if (slides.length === 0) return;
    
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
        
        // Combinar todos os slides em um único arquivo
        const allSlidesContent = slides
          .map((slide) => {
            const content = slide.content || "";
            return content;
          })
          .join("\n\n----'----\n\n");
        
        const writable = await handle.createWritable();
        await writable.write(allSlidesContent);
        await writable.close();
        
        setWarning(
          `✨ Apresentação completa salva com ${slides.length} slides!`
        );
      } else {
        // Fallback para browsers que não suportam File System API
        const allSlidesContent = slides
          .map((slide) => {
            const content = slide.content || "";
            return content;
          })
          .join("\n\n----'----\n\n");
        
        const blob = new Blob([allSlidesContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "apresentacao-completa.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setWarning(
          `✨ Download iniciado! Apresentação com ${slides.length} slides.`
        );
      }
    } catch (err: any) {
      console.error("Erro ao salvar arquivo:", err);
      setError("Erro ao salvar o arquivo: " + (err?.message || String(err)));
    }
  };

  const handleRestart = () => {
    if (slides.length > 0) {
      const confirm = window.confirm(
        "Tem certeza que deseja recomeçar? Todos os slides atuais serão perdidos."
      );
      if (!confirm) return;
    }
    
    // Resetar todos os estados para voltar à tela inicial
    setSlides([]);
    setCurrentSlide(0);
    setError("");
    setWarning("");
    setLoading(false);
    setShowSlideList(false);
    setPresenterMode(false);
    setEditing(false);
    setFocusMode(false);
    setDraftContent("");
  };

  const extractNotes = (text: string) => {
    const notes: string[] = [];
    if (!text) return { clean: text || "", notes };
    const cleaned = text.replace(
      /<!--\s*note:\s*([\s\S]*?)-->/gi,
      (_m: string, p1: string) => {
        if (p1 && p1.trim()) notes.push(p1.trim());
        return "";
      },
    );
    return { clean: cleaned.trim(), notes };
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | any,
    options: any = {},
  ) => {
    if (options?.error) {
      setError(options.error);
      return;
    }
    const files = Array.from((e?.target?.files || []) as File[]);
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      if (files.length === 1 && options.splitSingle) {
        const file = files[0];
        const raw = await file.text();
        const marker = (options.delimiter || "---").trim();
        const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const lineRegex = new RegExp("^\\s*" + esc(marker) + "\\s*$", "gm");
        let slidesParts = raw
          .split(lineRegex)
          .map((p: string) => p.trim())
          .filter(Boolean);
        if (slidesParts.length <= 1) {
          const altRegex = new RegExp(
            "\\r?\\n\\s*" + esc(marker) + "\\s*\\r?\\n",
          );
          slidesParts = raw
            .split(altRegex)
            .map((p: string) => p.trim())
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
        const loadedSlides = slidesParts.map((content: string, i: number) => {
          const { clean, notes } = extractNotes(content);
          return {
            name: `${file.name.replace(".md", "")}-${i + 1}`,
            content: clean,
            notes,
            html: parseMarkdownSafe(clean),
          } as Slide;
        });
        setSlides(loadedSlides);
        setCurrentSlide(0);
        setShowSlideList(true);
        return;
      }

      const sortedFiles = files.sort((a: File, b: File) =>
        a.name.localeCompare(b.name),
      );
      const loadedSlides = await Promise.all(
        sortedFiles.map(async (file: File) => {
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
      setCurrentSlide(0);
      setShowSlideList(true);
    } catch (err) {
      const errorAny: any = err;
      setError(
        "Erro ao carregar arquivos: " + (errorAny?.message || String(errorAny)),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAIGeneration = async (prompt: string, slideCount: number = 6, baseText?: string) => {
    setLoading(true);
    setError("");
    setWarning("");
    
    try {
      const generatedSlides = await generateSlidesWithGemini(prompt, slideCount, baseText);
      
      const newSlides = generatedSlides.map((markdown, index) => 
        createSlideFromMarkdown(markdown, index)
      );

      // Processar markdown para HTML
      const processedSlides = newSlides.map((slide) => ({
        ...slide,
        html: parseMarkdownSafe(slide.content || ""),
      }));

      setSlides(processedSlides);
      setCurrentSlide(0);
      setWarning(
        `✨ ${processedSlides.length} slides gerados com sucesso usando IA Gemini!`
      );
    } catch (err: any) {
      console.error("Erro ao gerar slides com IA:", err);
      setError(
        `Erro ao gerar slides: ${
          err.message || "Problema na conexão com a IA"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        editing ||
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      )
        return;
      const k = (e as KeyboardEvent & { key: string }).key.toLowerCase();
      if (e.key === "?" || (e.shiftKey && k === "/")) {
        setShowHelp((v) => !v);
        return;
      }
      if (k === "h") {
        if (!presenterMode) setFocusMode((v) => !v);
        return;
      }
      if (k === "e") {
        if (!presenterMode && slides.length > 0) {
          setDraftContent(slides[currentSlide].content || "");
          setEditing(true);
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && k === "d") {
        e.preventDefault();
        if (!presenterMode && slides.length > 0) {
          duplicateSlide();
          return;
        }
      }
      if (k === "f") {
        toggleFullscreen();
      }
      if (k === "p") {
        setPresenterMode((v) => !v);
      }
      if (e.key === "ArrowRight" || e.key === " ") {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
          setTransitionKey((prev) => prev + 1);
        }
      }
      if (e.key === "ArrowLeft") {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
          setTransitionKey((prev) => prev + 1);
        }
      }
      if (e.key === "Home") {
        setCurrentSlide(0);
        setTransitionKey((prev) => prev + 1);
      }
      if (e.key === "End") {
        setCurrentSlide(slides.length - 1);
        setTransitionKey((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyPress as EventListener);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, slides.length, editing, presenterMode]);

  useEffect(() => {
    if (slideContentRef.current && slides.length > 0) {
      const blocks = slideContentRef.current.querySelectorAll("pre code");
      blocks.forEach((block: Element) =>
        hljs.highlightElement(block as HTMLElement),
      );
    }
  }, [currentSlide, slides]);

  useEffect(() => {
    if (slideContainerRef.current && slides.length > 0)
      slideContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (thumbsRailRef.current && slides.length > 0) {
      const activeThumb =
        thumbsRailRef.current.querySelector(".thumb-item.active");
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentSlide, slides.length]);

  useEffect(() => {
    try {
      if (slides && slides.length > 0) {
        const payload = slides.map((s) => ({
          name: s.name,
          content: s.content,
          notes: s.notes || [],
        }));
        localStorage.setItem("presentation-slides", JSON.stringify(payload));
      } else {
        localStorage.removeItem("presentation-slides");
      }
    } catch (err) {}
  }, [slides]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("presentation-slides");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loaded = parsed.map((p) => ({
            name: p.name,
            content: p.content,
            notes: p.notes || [],
            html: parseMarkdownSafe(p.content),
          }));
          setSlides(loaded);
          setShowSlideList(true);
        }
      }
    } catch (err) {}
  }, []);

  useAnchorNavigation({
    location,
    slides,
    showSlideList,
    slideContainerRef,
    setCurrentSlide,
    setTransitionKey,
    navigate,
  });

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // ignore
    }
  };

  const exportCombinedMarkdown = () => {
    const delimiter = "----'----";
    const combined = slides.map((s) => s.content).join(`\n\n${delimiter}\n\n`);
    const blob = new Blob([combined], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apresentacao-combinada.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSlideAsPdf = (index: number) => {
    try {
      const slide = slides[index];
      if (!slide) return;
      const slideHtml = slide.html || "";

      // Open a new window and copy all same-origin stylesheets + inline styles
      const w = window.open("", "_blank");
      if (!w) {
        setWarning(
          "Não foi possível abrir nova janela para exportar. Bloqueador de pop-ups?",
        );
        setTimeout(() => setWarning(""), 4000);
        return;
      }

      const doc = w.document;
      doc.open();
      doc.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>Slide - ' +
          (slide.name || index + 1) +
          "</title>",
      );

      Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style'),
      ).forEach((node) => {
        if (node.tagName.toLowerCase() === "link") {
          const href = (node as HTMLLinkElement).href;
          try {
            const u = new URL(href, window.location.href);
            if (u.origin === window.location.origin) {
              doc.write('<link rel="stylesheet" href="' + u.href + '">');
            }
          } catch (e) {
            // ignore
          }
        } else if (node.tagName.toLowerCase() === "style") {
          doc.write("<style>" + (node.textContent || "") + "</style>");
        }
      });

      doc.write(
        "<style>html,body{height:100%;margin:0;padding:0;background:#fff;}@page{size:auto;margin:12mm;}body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; } .slide-container{box-shadow:none !important;} .navigation, .thumbs-rail, .editor-overlay, .editor-panel, .presenter-bar { display: none !important; } .presentation-main{display:block;} </style>",
      );
      doc.write("</head><body>");

      doc.write('<div class="presentation-container">');
      doc.write('<div class="presentation-with-thumbs">');
      doc.write('<div class="presentation-main">');
      doc.write('<div class="slide-container">');
      doc.write('<div class="slide-content">');
      doc.write(slideHtml);
      doc.write("</div>");
      doc.write("</div>");
      doc.write("</div>");
      doc.write("</div>");
      doc.write("</div>");
      doc.write("</body></html>");
      doc.close();

      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch (err) {
          console.warn("Erro ao imprimir slide:", err);
        }
      }, 900);
    } catch (err) {
      console.warn("Erro ao exportar slide para PDF", err);
      setWarning("Erro ao exportar slide como PDF.");
      setTimeout(() => setWarning(""), 4000);
    }
  };

  const duplicateSlide = () => {
    if (slides.length === 0) return;
    const current = slides[currentSlide];
    const duplicate = {
      name: `${current.name}-copia`,
      content: current.content,
      notes: current.notes ? [...current.notes] : [],
      html: current.html,
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, duplicate);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
  };

  const containerClasses = [
    "w-screen",
    "h-screen",
    "flex",
    "items-start",
    "justify-center",
    "relative",
    highContrast ? "high-contrast" : "",
    presenterMode ? "presenter-full" : "",
    focusMode ? "focus-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {slides.length === 0 ? (
        <div className="w-full flex flex-col items-center gap-6 relative">
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <button
              className="reload-btn"
              onClick={() => setHighContrast((v) => !v)}
              aria-pressed={highContrast}
              aria-label="Toggle alto contraste"
            >
              {highContrast ? "Contraste Padrão" : "Alto Contraste"}
            </button>
          </div>
          <UploadArea 
            onFilesChange={handleFileUpload} 
            onAIGenerate={handleAIGeneration}
            loading={loading} 
          />
          {loading && (
 <>
 <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
  bg-black/70 text-white px-4 py-2 rounded-full 
  flex items-center gap-2 shadow-lg z-50">
  <Sparkles className="w-4 h-4" />
  Carregando...
</div>

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
      ) : (
        <>
          {showSlideList ? (
            <SlideList
              slides={slides}
              onReorder={(newSlides: Slide[]) => {
                setSlides(newSlides);
                setError("");
                setWarning("");
              }}
              onStart={() => {
                setShowSlideList(false);
                setCurrentSlide(0);
                setWarning("");
                setError("");
              }}
              onRemove={(idx: number) => {
                const copy = slides.slice();
                copy.splice(idx, 1);
                setSlides(copy);
                setCurrentSlide((c) =>
                  Math.min(c, Math.max(0, copy.length - 1)),
                );
                if (copy.length === 0) setPresenterMode(false);
              }}
              highContrast={highContrast}
              onToggleContrast={() => setHighContrast((v) => !v)}
            />
          ) : (
            <>
              {presenterMode ? (
                <PresenterView
                  currentHtml={slides[currentSlide].html}
                  currentIndex={currentSlide}
                  slidesLength={slides.length}
                  onNext={() =>
                    setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))
                  }
                  onPrev={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                  onExit={() => setPresenterMode(false)}
                />
              ) : (
                <div className="flex flex-col w-full">
                  {/* Slides com miniaturas */}
                  <div className="flex-1">
                    <SlidesWithThumbs
                      slides={slides}
                      currentSlide={currentSlide}
                      setCurrentSlide={(n: number) => {
                        setCurrentSlide(n);
                      }}
                      transitionKey={transitionKey}
                      setTransitionKey={setTransitionKey}
                      slideTransition={slideTransition}
                      focusMode={focusMode}
                      presenterMode={presenterMode}
                      thumbsRailRef={thumbsRailRef}
                      slideContainerRef={slideContainerRef}
                      slideContentRef={slideContentRef}
                      onRemove={(idx: number) => {
                        const copy = slides.slice();
                        copy.splice(idx, 1);
                        setSlides(copy);
                        setCurrentSlide((c) =>
                          Math.min(c, Math.max(0, copy.length - 1)),
                        );
                        if (copy.length === 0) setPresenterMode(false);
                      }}
                    />
                  </div>

                  {/* Navegação - sempre visível */}
                  <div className="w-full border-t">
                    <Navigation
                      currentSlide={currentSlide}
                      totalSlides={slides.length}
                      setCurrentSlide={setCurrentSlide}
                      setTransitionKey={setTransitionKey}
                      setSlideTransition={setSlideTransition}
                      slideTransition={slideTransition}
                      focusMode={focusMode}
                      setFocusMode={setFocusMode}
                      presenterMode={presenterMode}
                      setPresenterMode={setPresenterMode}
                      setShowSlideList={setShowSlideList}
                      setEditing={setEditing}
                      onStartEditing={() => {
                        setDraftContent(slides[currentSlide]?.content || "");
                        setEditing(true);
                      }}
                      duplicateSlide={duplicateSlide}
                      onSaveAllSlides={saveAllSlidesToFile}
                      onRestart={handleRestart}
                      highContrast={highContrast}
                      setHighContrast={setHighContrast}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {/* Botão flutuante: voltar ao topo do conteúdo do slide */}
          {!showSlideList && slides.length > 0 && (
            <ScrollTopButton slideContainerRef={slideContainerRef} />
          )}
        </>
      )}
      <EditPanel
        open={editing}
        value={draftContent}
        onChange={setDraftContent}
        onCancel={() => setEditing(false)}
        onSave={() => {
          setSlides((prev) => {
            const copy = prev.slice();
            const item = copy[currentSlide];
            if (item) {
              item.content = draftContent;
              item.html = parseMarkdownSafe(draftContent);
            }
            return copy;
          });
          setEditing(false);
          saveSlideToFile(currentSlide, draftContent);
        }}
        editorFocus={editorFocus}
        onToggleEditorFocus={() => setEditorFocus((v) => !v)}
      />
      {focusMode && (
        <div
          className="fixed top-3 right-3 bg-black bg-opacity-85 text-white px-3 py-1 rounded-full text-xs border border-white/10 z-50"
          aria-live="polite"
        >
          Focus Mode ON (H para sair)
        </div>
      )}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-lg w-11/12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-primary-1 text-xl font-semibold">
              Atalhos de Teclado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border rounded">→</kbd>{" "}
                  <kbd className="px-2 py-1 bg-white border rounded">Space</kbd>
                </div>
                <span className="text-sm text-gray-600">Próximo slide</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">←</kbd>
                <span className="text-sm text-gray-600">Slide anterior</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">Home</kbd>
                <span className="text-sm text-gray-600">Primeiro slide</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">End</kbd>
                <span className="text-sm text-gray-600">Último slide</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">E</kbd>
                <span className="text-sm text-gray-600">
                  Editar slide atual
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border rounded">Ctrl</kbd>+
                  <kbd className="px-2 py-1 bg-white border rounded">D</kbd>
                </div>
                <span className="text-sm text-gray-600">Duplicar slide</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">H</kbd>
                <span className="text-sm text-gray-600">
                  Modo foco (sem chrome)
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">P</kbd>
                <span className="text-sm text-gray-600">Modo apresentador</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">F</kbd>
                <span className="text-sm text-gray-600">Tela cheia</span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">?</kbd>
                <span className="text-sm text-gray-600">
                  Mostrar/ocultar ajuda
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd>
                <span className="text-sm text-gray-600">Fechar painéis</span>
              </div>
            </div>
            <button
              className="mt-6 w-full bg-gradient-to-br from-primary-1 to-primary-2 text-white py-3 rounded-md font-semibold"
              onClick={() => setShowHelp(false)}
            >
              Fechar (Esc ou clique fora)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presentation;
