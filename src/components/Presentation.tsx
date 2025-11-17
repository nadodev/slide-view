import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SlideList from "./SlideList";
import PresenterView from "./PresenterView";
import EditPanel from "./EditPanel";
import useAnchorNavigation from "../hooks/useAnchorNavigation";
import ScrollTopButton from "./ScrollTopButton";
import parseMarkdownSafe from "../utils/markdown";
import { Slide } from "./slides/types";
import { useSlidesManager } from "../hooks/useSlidesManager";
import { usePresentationShortcuts } from "../hooks/usePresentationShortcuts";
import { useSlidesPersistence } from "../hooks/useSlidesPersistence";
import { useSlideRenderingEffects } from "../hooks/useSlideRenderingEffects";
import PresentationEmptyState from "./presentation/PresentationEmptyState";
import SlidesWorkspace from "./presentation/SlidesWorkspace";
import { useSocket } from "../hooks/useSocket";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { RemoteControlModal } from "./RemoteControlModal";
import { toast } from "sonner";

const Presentation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    slides,
    setSlides,
    currentSlide,
    setCurrentSlide,
    showSlideList,
    setShowSlideList,
    loading,
    error,
    setError,
    warning,
    setWarning,
    handleFileUpload,
    handleAIGeneration,
    duplicateSlide,
    saveSlideToFile,
    saveAllSlidesToFile,
    resetSlidesState,
    reorderSlides,
  } = useSlidesManager();
  const slideContentRef = useRef<HTMLElement | null>(null);
  const slideContainerRef = useRef<HTMLElement | null>(null);
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
  const thumbsRailRef = useRef<HTMLElement | null>(null);
  const [transitionKey, setTransitionKey] = useState<number>(0);

  // Remote control states
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
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

  // Setup remote control command handling
  useEffect(() => {
    onRemoteCommand((command) => {
      console.log('Presentation - Comando recebido:', command);
      
      if (command.command === 'next') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (command.command === 'previous') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (command.command === 'goto' && command.slideIndex !== undefined) {
        setCurrentSlide(Math.max(0, Math.min(command.slideIndex, slides.length - 1)));
      } else if (command.command === 'scroll' && command.scrollDirection) {
        console.log('Executando scroll:', command.scrollDirection);
        // Scroll da apresentação
        const scrollAmount = 150; // pixels
        const direction = command.scrollDirection === 'up' ? -scrollAmount : scrollAmount;
        
        console.log('Scrolling by:', direction, 'pixels');
        window.scrollBy({
          top: direction,
          behavior: 'smooth'
        });
      } else if (command.command === 'scroll-sync' && command.scrollPosition !== undefined) {
        console.log('Sincronizando scroll para posição:', command.scrollPosition);
        window.scrollTo({
          top: command.scrollPosition,
          behavior: 'smooth'
        });
      } else if (command.command === 'presenter') {
        console.log('Ativando modo apresentação');
        setPresenterMode(true);
        toast.success('Modo Apresentação', {
          description: 'Ativado via controle remoto'
        });
      } else if (command.command === 'focus') {
        console.log('Ativando modo foco');
        setFocusMode(true);
        toast.success('Modo Foco', {
          description: 'Ativado via controle remoto'
        });
      }
      
      // Update transition for smooth slide change (except for scroll)
      if (command.command !== 'scroll' && command.command !== 'scroll-sync') {
        setTransitionKey(prev => prev + 1);
      }
    });
  }, [onRemoteCommand, slides.length, setCurrentSlide, setTransitionKey]);

  // Update remote clients when slide changes
  useEffect(() => {
    if (session && slides.length > 0) {
      console.log('📡 Presentation - Enviando updateSlide:', { currentSlide, totalSlides: slides.length });
      updateSlide(currentSlide, slides.length);
    }
  }, [session, currentSlide, slides.length, updateSlide]);

  // Share presentation content with remote clients
  useEffect(() => {
    if (session && slides.length > 0) {
      // Aguardar um momento para garantir que o DOM foi atualizado
      setTimeout(() => {
        // Tentar múltiplas formas de capturar o conteúdo
        let presentationElement = slideContentRef.current?.parentElement;
        
        if (!presentationElement) {
          presentationElement = document.querySelector('.slide-content') as HTMLElement;
        }
        
        if (!presentationElement) {
          presentationElement = document.querySelector('[data-slide-content]') as HTMLElement;
        }
        
        if (!presentationElement) {
          presentationElement = document.querySelector('main') as HTMLElement;
        }
        
        if (!presentationElement) {
          presentationElement = document.body;
        }
        
        if (presentationElement) {
          const contentHtml = presentationElement.innerHTML;
          const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
          
          // Extrair também o conteúdo markdown dos slides para o controle remoto
          const slidesContent = slides.map(slide => slide.content).join('\n\n---\n\n');
          
          console.log('📤 Compartilhando conteúdo da apresentação...', {
            elementFound: !!presentationElement,
            elementTag: presentationElement.tagName,
            contentLength: contentHtml.length,
            currentSlide,
            totalSlides: slides.length
          });
          
          shareContent(JSON.stringify({
            html: contentHtml,
            markdown: slidesContent,
            currentSlide,
            totalSlides: slides.length,
            scrollPosition
          }));
        } else {
          console.warn('❌ Não foi possível encontrar elemento da apresentação para compartilhar');
        }
      }, 500); // Aumentar delay para 500ms
    }
  }, [session, slides, currentSlide, shareContent]);

  const handleRestart = () => {
    resetSlidesState();
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
    } catch {
      /* ignore */
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

  usePresentationShortcuts({
    editing,
    presenterMode,
    slides,
    currentSlide,
    setCurrentSlide,
    setTransitionKey,
    setFocusMode,
    setShowHelp,
    setDraftContent,
    setEditing,
    duplicateSlide,
    toggleFullscreen,
    setPresenterMode,
  });

  useAnchorNavigation({
    location,
    slides,
    showSlideList,
    slideContainerRef,
    setCurrentSlide,
    setTransitionKey,
    navigate,
  });

  const handleRemoveSlide = (idx: number) => {
    setSlides((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const copy = prev.slice();
      copy.splice(idx, 1);
      const nextLength = copy.length;
      setCurrentSlide((current) =>
        Math.min(current, Math.max(0, nextLength - 1)),
      );
      if (nextLength === 0) {
        setPresenterMode(false);
        setShowSlideList(false);
      }
      return copy;
    });
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
          onToggleHighContrast={() => setHighContrast((v) => !v)}
          onFilesChange={handleFileUpload}
          onAIGenerate={handleAIGeneration}
          loading={loading}
          error={error}
          warning={warning}
        />
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
              onRemove={(idx: number) => handleRemoveSlide(idx)}
              highContrast={highContrast}
              onToggleContrast={() => setHighContrast((v) => !v)}
            />
          ) : presenterMode ? (
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
            <SlidesWorkspace
              slides={slides}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              transitionKey={transitionKey}
              setTransitionKey={setTransitionKey}
              slideTransition={slideTransition}
              setSlideTransition={setSlideTransition}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
              presenterMode={presenterMode}
              setPresenterMode={setPresenterMode}
              thumbsRailRef={thumbsRailRef}
              slideContainerRef={slideContainerRef}
              slideContentRef={slideContentRef}
              onRemove={(idx: number) => handleRemoveSlide(idx)}
              onReorder={reorderSlides}
              setShowSlideList={setShowSlideList}
              setEditing={setEditing}
              setDraftContent={setDraftContent}
              duplicateSlide={duplicateSlide}
              onSaveAllSlides={saveAllSlidesToFile}
              onRestart={handleRestart}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              loading={loading}
              onShowRemoteControl={() => {
                console.log('QR Code clicado - Platform:', platform, 'Supported:', isSupported);
                
                if (!isSupported) {
                  // Em plataformas não suportadas, apenas mostrar aviso
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
