import { useEffect } from "react";
import hljs from "highlight.js";
import { Slide } from "@/shared/components/slides/types";

type RenderingEffectOptions = {
  slides: Slide[];
  currentSlide: number;
  slideContentRef: React.RefObject<HTMLElement | null>;
  slideContainerRef: React.RefObject<HTMLElement | null>;
  thumbsRailRef: React.RefObject<HTMLElement | null>;
};

export function useSlideRenderingEffects({
  slides,
  currentSlide,
  slideContentRef,
  slideContainerRef,
  thumbsRailRef,
}: RenderingEffectOptions) {
  useEffect(() => {
    if (slideContentRef.current && slides.length > 0) {
      const blocks = slideContentRef.current.querySelectorAll("pre code");
      blocks.forEach((block) => hljs.highlightElement(block as HTMLElement));
    }
  }, [currentSlide, slides, slideContentRef]);

  useEffect(() => {
    if (slideContainerRef.current && slides.length > 0) {
      slideContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSlide, slides.length, slideContainerRef]);

  // Resetar scroll do conteúdo do slide quando muda
  useEffect(() => {
    if (slideContentRef.current && slides.length > 0) {
      slideContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSlide, slides.length, slideContentRef]);

  useEffect(() => {
    if (thumbsRailRef.current && slides.length > 0) {
      const activeThumb =
        thumbsRailRef.current.querySelector(".thumb-item.active");
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentSlide, slides.length, thumbsRailRef]);
}

