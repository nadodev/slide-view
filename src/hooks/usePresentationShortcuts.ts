import { useEffect } from "react";
import { Slide } from "@/shared/components/slides/types";

type ShortcutOptions = {
  editing: boolean;
  presenterMode: boolean;
  slides: Slide[];
  currentSlide: number;
  setCurrentSlide: (updater: number | ((prev: number) => number)) => void;
  setTransitionKey: (updater: number | ((prev: number) => number)) => void;
  setFocusMode: (updater: (prev: boolean) => boolean) => void;
  setShowHelp: (updater: (prev: boolean) => boolean) => void;
  setDraftContent: (value: string) => void;
  setEditing: (value: boolean) => void;
  duplicateSlide: () => void;
  toggleFullscreen: () => void;
  setPresenterMode: (updater: (prev: boolean) => boolean) => void;
};

export function usePresentationShortcuts({
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
}: ShortcutOptions) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        editing ||
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (event.key === "?" || (event.shiftKey && key === "/")) {
        setShowHelp((prev) => !prev);
        return;
      }
      if (key === "h" && !presenterMode) {
        setFocusMode((prev) => !prev);
        return;
      }
      if (key === "e" && !presenterMode && slides.length > 0) {
        setDraftContent(slides[currentSlide]?.content || "");
        setEditing(true);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "d") {
        event.preventDefault();
        if (!presenterMode && slides.length > 0) {
          duplicateSlide();
        }
        return;
      }
      if (key === "f") {
        toggleFullscreen();
        return;
      }
      if (key === "p") {
        setPresenterMode((prev) => !prev);
        return;
      }
      if (event.key === "ArrowRight" || event.key === " ") {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide((prev) => prev + 1);
          setTransitionKey((prev) => prev + 1);
        }
        return;
      }
      if (event.key === "ArrowLeft") {
        if (currentSlide > 0) {
          setCurrentSlide((prev) => prev - 1);
          setTransitionKey((prev) => prev + 1);
        }
        return;
      }
      if (event.key === "Home") {
        setCurrentSlide(0);
        setTransitionKey((prev) => prev + 1);
        return;
      }
      if (event.key === "End") {
        setCurrentSlide(slides.length - 1);
        setTransitionKey((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress as EventListener);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
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
  ]);
}

