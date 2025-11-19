import type { RefObject } from "react";
import SlideViewer from "./SlideViewer";
import type { Slide } from "@/types";

type SlideStageProps = {
  slides: Slide[];
  currentSlide: number;
  transitionKey: number;
  slideTransition: string;
  slideContainerRef: RefObject<HTMLElement | null>;
  slideContentRef: RefObject<HTMLElement | null>;
};

export default function SlideStage({
  slides,
  currentSlide,
  transitionKey,
  slideTransition,
  slideContainerRef,
  slideContentRef,
}: SlideStageProps) {
  return (
    <main className="flex flex-1 items-center justify-center overflow-hidden">
      <div
        key={transitionKey}
        className={`slide-transition slide-transition-${slideTransition} h-full w-full`}
      >
        <SlideViewer
          html={slides[currentSlide]?.html || ""}
          slideContainerRef={slideContainerRef}
          slideContentRef={slideContentRef}
        />
      </div>
    </main>
  );
}

