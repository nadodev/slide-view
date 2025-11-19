import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SlideList from "@/features/slides/SlideList";
import PresenterView from "./PresenterView";
import EditPanel from "@/features/editor/EditPanel";
import useAnchorNavigation from "@/hooks/useAnchorNavigation";
import ScrollTopButton from "@/shared/components/layout/ScrollTopButton";
import parseMarkdownSafe from "@/utils/markdown";
import { useSlidesManager } from "@/hooks/useSlidesManager";
import { usePresentationShortcuts } from "@/hooks/usePresentationShortcuts";
import { useSlidesPersistence } from "@/hooks/useSlidesPersistence";
import { useSlideRenderingEffects } from "@/hooks/useSlideRenderingEffects";
import PresentationEmptyState from "./PresentationEmptyState";
import SlidesWorkspace from "./SlidesWorkspace";
import { useSocket } from "@/hooks/useSocket";
import { QRCodeDisplay } from "@/features/remote-control/QRCodeDisplay";
import { RemoteControlModal } from "@/features/remote-control/RemoteControlModal";
import { toast } from "sonner";

import { useSlidesStore, usePresentationStore, useUIStore } from "@/store";

function extractNotes(text: string) {
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
}

const Presentation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const slides = useSlidesStore((state) => state.slides);
  const setSlides = useSlidesStore((state) => state.setSlides);
  const loading = useSlidesStore((state) => state.loading);
  const error = useSlidesStore((state) => state.error);
  const setError = useSlidesStore((state) => state.setError);
  const warning = useSlidesStore((state) => state.warning);
  const setWarning = useSlidesStore((state) => state.setWarning);
  const duplicateSlide = useSlidesStore((state) => state.duplicateSlide);
  const reorderSlides = useSlidesStore((state) => state.reorderSlides);
  const resetSlides = useSlidesStore((state) => state.resetSlides);

  const currentSlide = usePresentationStore((state) => state.currentSlide);
  const setCurrentSlide = usePresentationStore((state) => state.setCurrentSlide);
  const showSlideList = usePresentationStore((state) => state.showSlideList);
  const setShowSlideList = usePresentationStore((state) => state.setShowSlideList);
  const presenterMode = usePresentationStore((state) => state.presenterMode);
  const setPresenterMode = usePresentationStore((state) => state.setPresenterMode);
  const focusMode = usePresentationStore((state) => state.focusMode);
  const setFocusMode = usePresentationStore((state) => state.setFocusMode);
  const highContrast = usePresentationStore((state) => state.highContrast);
  const setHighContrast = usePresentationStore((state) => state.setHighContrast);
  const slideTransition = usePresentationStore((state) => state.slideTransition);
  const setSlideTransition = usePresentationStore((state) => state.setSlideTransition);
  const editing = usePresentationStore((state) => state.editing);
  const setEditing = usePresentationStore((state) => state.setEditing);
  const draftContent = usePresentationStore((state) => state.draftContent);
  const setDraftContent = usePresentationStore((state) => state.setDraftContent);
  const editorFocus = usePresentationStore((state) => state.editorFocus);
  const toggleEditorFocus = usePresentationStore((state) => state.toggleEditorFocus);
  const showHelp = usePresentationStore((state) => state.showHelp);
  const setShowHelp = usePresentationStore((state) => state.setShowHelp);

  const showQRCode = useUIStore((state) => state.showQRCode);
  const setShowQRCode = useUIStore((state) => state.setShowQRCode);
  const transitionKey = useUIStore((state) => state.transitionKey);
  const incrementTransitionKey = useUIStore((state) => state.incrementTransitionKey);

  const {
    handleFileUpload,
    handleAIGeneration,
    saveSlideToFile,
    saveAllSlidesToFile,
  } = useSlidesManager();

  const slideContentRef = useRef<HTMLElement | null>(null);
  const slideContainerRef = useRef<HTMLElement | null>(null);
  const presenterScrollRef = useRef<HTMLDivElement | null>(null);
  const thumbsRailRef = useRef<HTMLElement | null>(null);

  const {
    session,
    isConnecting,
    error: socketError,
    createPresentation,
    updateSlide,
    shareContent,
    disconnect,
    onRemoteCommand,
    isSupported,
    platform,
  } = useSocket();

  useEffect(() => {
    onRemoteCommand((command) => {
      if (command.command === 'next') {
        setCurrentSlide(Math.min(currentSlide + 1, slides.length - 1));
      } else if (command.command === 'previous') {
        setCurrentSlide(Math.max(currentSlide - 1, 0));
      } else if (command.command === 'goto' && command.slideIndex !== undefined) {
        setCurrentSlide(Math.max(0, Math.min(command.slideIndex, slides.length - 1)));
      } else if (command.command === 'scroll' && command.scrollDirection) {
        const scrollContainer = presenterMode
          ? presenterScrollRef.current
          : slideContentRef.current;

        if (!scrollContainer) return;

        const scrollAmount = 200;
        const direction = command.scrollDirection === 'up' ? -scrollAmount : scrollAmount;
        const currentPosition = scrollContainer.scrollTop;
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const newPosition = Math.max(0, Math.min(currentPosition + direction, maxScroll));

        scrollContainer.scrollTo({
          top: newPosition,
          behavior: 'smooth'
        });
      } else if (command.command === 'scroll-sync' && command.scrollPosition !== undefined) {
        const scrollContainer = presenterMode
          ? presenterScrollRef.current
          : slideContentRef.current;

        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: command.scrollPosition,
            behavior: 'smooth'
          });
        }
      } else if (command.command === 'presenter') {
        const toggleValue = (command as any).toggle;
        const shouldActivate = toggleValue !== undefined ? toggleValue : !presenterMode;
        setPresenterMode(shouldActivate);
        toast.success('Modo Apresentação', {
          description: shouldActivate ? 'Ativado via controle remoto' : 'Desativado via controle remoto'
        });
      } else if (command.command === 'focus') {
        const toggleValue = (command as any).toggle;
        const shouldActivate = toggleValue !== undefined ? toggleValue : !focusMode;
        setFocusMode(shouldActivate);
        toast.success('Modo Foco', {
          description: shouldActivate ? 'Ativado via controle remoto' : 'Desativado via controle remoto'
        });
      }

      if (command.command !== 'scroll' && command.command !== 'scroll-sync') {
        incrementTransitionKey();
      }
    });
  }, [onRemoteCommand, slides.length, currentSlide, presenterMode, focusMode, setCurrentSlide, setPresenterMode, setFocusMode, incrementTransitionKey]);

  useEffect(() => {
    if (session && slides.length > 0) {
      updateSlide(currentSlide, slides.length);
    }
  }, [session, currentSlide, slides.length, updateSlide]);

  useEffect(() => {
    if (session && slides.length > 0) {
      setTimeout(() => {
        let presentationElement = slideContentRef.current?.parentElement;

        if (!presentationElement) {
          presentationElement = document.querySelector('.slide-content') as HTMLElement;
        }

        if (presentationElement) {
          const contentHtml = presentationElement.innerHTML;
          const slidesContent = slides.map(slide => slide.content).join('\n\n---\n\n');

          shareContent(JSON.stringify({
            html: contentHtml,
            markdown: slidesContent,
            currentSlide,
            totalSlides: slides.length,
            scrollPosition: window.pageYOffset || document.documentElement.scrollTop
          }));
        }
      }, 500);
    }
  }, [session, slides, currentSlide, shareContent]);

  const handleRestart = () => {
    resetSlides();
    setShowSlideList(false);
    setPresenterMode(false);
    setEditing(false);
    setFocusMode(false);
    setDraftContent("");
    setShowQRCode(false);
    disconnect();
  };

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

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useSlidesPersistence(slides, setSlides, setShowSlideList);

  useSlideRenderingEffects({
    slides,
    currentSlide,
    slideContentRef,
    slideContainerRef,
    thumbsRailRef,
  });

  useEffect(() => {
    if (presenterMode && presenterScrollRef.current && slides.length > 0) {
      presenterScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSlide, presenterMode, slides.length]);

  usePresentationShortcuts({
    editing,
    presenterMode,
    slides,
    currentSlide,
    setCurrentSlide,
    setTransitionKey: incrementTransitionKey,
    setFocusMode,
    setShowHelp,
    setDraftContent,
    setEditing,
    duplicateSlide: () => duplicateSlide(currentSlide),
    toggleFullscreen,
    setPresenterMode,
  });

  useAnchorNavigation({
    location,
    slides,
    showSlideList,
    slideContainerRef,
    setCurrentSlide,
    setTransitionKey: incrementTransitionKey,
    navigate,
  });

  const handleRemoveSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
    setCurrentSlide(Math.min(currentSlide, Math.max(0, slides.length - 2)));

    if (slides.length <= 1) {
      setPresenterMode(false);
      setShowSlideList(false);
    }
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
        <PresentationEmptyState
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          onFilesChange={handleFileUpload}
          onAIGenerate={handleAIGeneration}
          onCreateSlide={() => {
            setDraftContent("");
            setEditing(true);
          }}
          loading={loading}
          error={error}
          warning={warning}
        />
      ) : (
        <>
          {showSlideList ? (
            <SlideList
              slides={slides}
              onReorder={(newSlides) => {
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
              onRemove={handleRemoveSlide}
              highContrast={highContrast}
              onToggleContrast={() => setHighContrast(!highContrast)}
            />
          ) : presenterMode ? (
            <PresenterView
              currentHtml={slides[currentSlide].html}
              currentIndex={currentSlide}
              slidesLength={slides.length}
              onNext={() =>
                setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
              }
              onPrev={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              onExit={() => setPresenterMode(false)}
              scrollContainerRef={presenterScrollRef}
            />
          ) : (
            <SlidesWorkspace
              slides={slides}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              transitionKey={transitionKey}
              setTransitionKey={incrementTransitionKey}
              slideTransition={slideTransition}
              setSlideTransition={setSlideTransition}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              presenterMode={presenterMode}
              setPresenterMode={setPresenterMode}
              thumbsRailRef={thumbsRailRef}
              slideContainerRef={slideContainerRef}
              slideContentRef={slideContentRef}
              onRemove={handleRemoveSlide}
              onReorder={(fromIdx, toIdx) => reorderSlides(fromIdx, toIdx)}
              setShowSlideList={setShowSlideList}
              setEditing={setEditing}
              setDraftContent={setDraftContent}
              duplicateSlide={() => duplicateSlide(currentSlide)}
              onSaveAllSlides={saveAllSlidesToFile}
              onRestart={handleRestart}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              loading={loading}
              onShowRemoteControl={() => {
                if (!isSupported) {
                  setShowQRCode(true);
                  return;
                }

                if (!session) {
                  createPresentation();
                }
                setShowQRCode(true);
              }}
              remoteSession={session ? {
                isConnected: session.isConnected,
                remoteClients: session.remoteClients
              } : null}
            />
          )}
          {!showSlideList && slides.length > 0 && (
            <ScrollTopButton slideContainerRef={slideContainerRef} />
          )}
        </>
      )}
      <EditPanel
        open={editing}
        value={draftContent}
        onChange={setDraftContent}
        onCancel={() => {
          setEditing(false);
          setDraftContent("");
        }}
        onSave={() => {
          if (slides.length > 0 && currentSlide < slides.length) {
            const updatedSlides = [...slides];
            const item = updatedSlides[currentSlide];
            if (item) {
              item.content = draftContent;
              item.html = parseMarkdownSafe(draftContent);
            }
            setSlides(updatedSlides);
            setEditing(false);
            saveSlideToFile(currentSlide, draftContent);
          }
        }}
        mode={slides.length === 0 ? 'create' : 'edit'}
        onCreateFiles={(files) => {
          const newSlides = files.map((file) => {
            const { clean, notes } = extractNotes(file.content);
            return {
              name: file.name.replace('.md', ''),
              content: clean,
              notes,
              html: parseMarkdownSafe(clean),
            };
          });
          setSlides(newSlides);
          setCurrentSlide(0);
          setShowSlideList(true);
          setEditing(false);
        }}
        editorFocus={editorFocus}
        onToggleEditorFocus={toggleEditorFocus}
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
              className="mt-6 w-full bg-linear-to-br from-primary-1 to-primary-2 text-white py-3 rounded-md font-semibold"
              onClick={() => setShowHelp(false)}
            >
              Fechar (Esc ou clique fora)
            </button>
          </div>
        </div>
      )}

      {/* QR Code / Remote Control Modal */}
      {showQRCode && (
        <>
          {isSupported && session ? (
            <QRCodeDisplay
              qrUrl={session.qrUrl}
              sessionId={session.sessionId}
              remoteClients={session.remoteClients}
              isConnected={session.isConnected}
              onClose={() => setShowQRCode(false)}
            />
          ) : (
            <RemoteControlModal
              qrUrl={session?.qrUrl}
              sessionId={session?.sessionId}
              remoteClients={session?.remoteClients}
              isConnected={session?.isConnected}
              isSupported={isSupported}
              platform={platform}
              onClose={() => setShowQRCode(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Presentation;
