import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import SlidesWorkspace from "./SlidesWorkspace";
import { useSocket } from "@/hooks/useSocket";
import { QRCodeDisplay } from "@/features/remote-control/QRCodeDisplay";
import { RemoteControlModal } from "@/features/remote-control/RemoteControlModal";
import { toast } from "sonner";

import { useSlidesStore, usePresentationStore, useUIStore } from "@/store";
import { usePresentationsStore } from "@/store/presentationsStore";
import { RemoteCommand } from "@/types/remote";
import { PresentationShowHelp } from "./PresentationShowHelp";

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

const EditorPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
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
        saveSlideToFile,
        saveAllSlidesToFile,
    } = useSlidesManager();

    const slideContentRef = useRef<HTMLElement | null>(null);
    const slideContainerRef = useRef<HTMLElement | null>(null);
    const presenterScrollRef = useRef<HTMLDivElement | null>(null);
    const thumbsRailRef = useRef<HTMLElement | null>(null);

    const {
        session,
        createPresentation,
        updateSlide,
        shareContent,
        disconnect,
        onRemoteCommand,
        isSupported,
        platform,
    } = useSocket();

    const { addPresentation, updatePresentation, getPresentation, setCurrentPresentation } = usePresentationsStore();

    // Carregar apresentação baseada no ID
    useEffect(() => {
        if (id && id !== 'draft') {
            const presentation = getPresentation(id);
            if (presentation) {
                setSlides(presentation.slides);
                setCurrentPresentation(id);
                // Se vier do dashboard, provavelmente queremos ver a lista primeiro
                setShowSlideList(true);
            } else {
                toast.error("Apresentação não encontrada");
                navigate("/dashboard");
            }
        } else if (id === 'draft') {
            // Se for draft, verifica se tem slides. Se não tiver, e não estiver criando, volta pro new
            if (slides.length === 0 && !searchParams.get('create')) {
                // Talvez o usuário deu refresh no /draft e perdeu o estado (se não persistido)
                // Mas o slidesStore é persistido.
                // Se estiver vazio mesmo assim:
                navigate("/presentation/new");
            }
            setCurrentPresentation(null);
        }
    }, [id, getPresentation, setSlides, setCurrentPresentation, setShowSlideList, navigate, slides.length, searchParams]);

    // Abrir editor se query param create=true
    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setEditing(true);
            setDraftContent("");
            // Limpar query param
            navigate(location.pathname, { replace: true });
        }
    }, [searchParams, setEditing, setDraftContent, navigate, location.pathname]);

    useEffect(() => {
        const scrollContainer = () =>
            presenterMode ? presenterScrollRef.current : slideContentRef.current;

        const handlers: Record<string, (cmd: RemoteCommand) => void> = {
            next: () => {
                setCurrentSlide((s) => Math.min(s + 1, slides.length - 1));
            },

            previous: () => {
                setCurrentSlide((s) => Math.max(s - 1, 0));
            },

            goto: (cmd) => {
                if (cmd.slideIndex !== undefined) {
                    setCurrentSlide(
                        Math.max(0, Math.min(cmd.slideIndex, slides.length - 1))
                    );
                }
            },

            scroll: (cmd) => {
                const container = scrollContainer();
                if (!container || !cmd.scrollDirection) return;

                const scrollAmount = 200;
                const direction =
                    cmd.scrollDirection === "up" ? -scrollAmount : scrollAmount;

                const newPosition = Math.max(
                    0,
                    Math.min(
                        container.scrollTop + direction,
                        container.scrollHeight - container.clientHeight
                    )
                );

                container.scrollTo({ top: newPosition, behavior: "smooth" });
            },

            "scroll-sync": (cmd) => {
                const container = scrollContainer();
                if (container && cmd.scrollPosition !== undefined) {
                    container.scrollTo({
                        top: cmd.scrollPosition,
                        behavior: "smooth",
                    });
                }
            },

            presenter: (cmd) => {
                const toggleValue = (cmd as any).toggle;
                const shouldActivate =
                    toggleValue !== undefined ? toggleValue : !presenterMode;

                setPresenterMode(shouldActivate);

                toast.success("Modo Apresentação", {
                    description: shouldActivate
                        ? "Ativado via controle remoto"
                        : "Desativado via controle remoto",
                });
            },

            focus: (cmd) => {
                const toggleValue = (cmd as any).toggle;
                const shouldActivate =
                    toggleValue !== undefined ? toggleValue : !focusMode;

                setFocusMode(shouldActivate);

                toast.success("Modo Foco", {
                    description: shouldActivate
                        ? "Ativado via controle remoto"
                        : "Desativado via controle remoto",
                });
            },
        };

        onRemoteCommand((cmd) => {
            const handler = handlers[cmd.command];
            if (handler) handler(cmd);

            if (cmd.command !== "scroll" && cmd.command !== "scroll-sync") {
                incrementTransitionKey();
            }
        });
    }, [
        onRemoteCommand,
        presenterMode,
        focusMode,
        slides.length,
        incrementTransitionKey,
        setCurrentSlide,
        setPresenterMode,
        setFocusMode,
    ]);

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

    const handleSavePresentation = () => {
        if (slides.length === 0) {
            toast.error('Nenhum slide para salvar');
            return;
        }

        const title = prompt('Nome da apresentação:', 'Minha Apresentação');
        if (!title) return;

        const description = prompt('Descrição (opcional):');

        if (id && id !== 'draft') {
            // Update existing
            updatePresentation(id, {
                title,
                description: description || undefined,
                slides,
            });
            toast.success('Apresentação atualizada!');
        } else {
            // Create new
            addPresentation({
                title,
                description: description || undefined,
                slides,
            });
            toast.success('Apresentação salva!');
        }

        navigate('/dashboard');
    };

    const handleRestart = () => {
        resetSlides();
        setShowSlideList(false);
        setPresenterMode(false);
        setEditing(false);
        setFocusMode(false);
        setDraftContent("");
        setShowQRCode(false);
        disconnect();
        navigate('/presentation/new');
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

    if (slides.length === 0 && id !== 'draft') {
        // Se não tem slides e não é draft, provavelmente está carregando ou deu erro
        // Mas como o useEffect de load é rápido, pode ser só um flash.
        // Podemos mostrar um loading ou nada.
        return <div className="flex items-center justify-center h-screen text-slate-500">Carregando...</div>;
    }

    if (slides.length === 0 && id === 'draft' && !searchParams.get('create')) {
        return null;
    }

    return (
        <div className={containerClasses}>
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
                        onSave={handleSavePresentation}
                        highContrast={highContrast}
                        onToggleContrast={() => setHighContrast(!highContrast)}
                    />
                ) : presenterMode ? (
                    <PresenterView
                        currentHtml={slides[currentSlide]?.html || ""}
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
                        onSavePresentation={handleSavePresentation}
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
                <PresentationShowHelp
                    setShowHelp={setShowHelp}
                />
            )}

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

export default EditorPage;
