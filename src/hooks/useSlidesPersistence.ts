import { useEffect } from "react";
import parseMarkdownSafe from "@/utils/markdown";
import { Slide } from "@/shared/components/slides/types";

export function useSlidesPersistence(
  slides: Slide[],
  setSlides: (slides: Slide[]) => void,
  setShowSlideList: (value: boolean) => void,
) {
  useEffect(() => {
    try {
      if (slides.length > 0) {
        const payload = slides.map((slide) => ({
          name: slide.name,
          content: slide.content,
          notes: slide.notes || [],
        }));
        localStorage.setItem("presentation-slides", JSON.stringify(payload));
      } else {
        localStorage.removeItem("presentation-slides");
      }
    } catch {
      /* ignore persistence errors */
    }
  }, [slides]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("presentation-slides");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loaded = parsed.map((item: Slide) => ({
            name: item.name,
            content: item.content,
            notes: item.notes || [],
            html: parseMarkdownSafe(item.content || ""),
          }));
          setSlides(loaded);
          setShowSlideList(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, [setSlides, setShowSlideList]);
}

