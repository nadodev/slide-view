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
    <main className="flex flex-1 items-center justify-center overflow-hidden p-6 lg:p-12">
      <div
        key={transitionKey}
        className={`slide-transition slide-transition-${slideTransition} h-full w-full max-w-7xl`}
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

