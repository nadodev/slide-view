import type { RefObject } from "react";
import { useState } from "react";
import { useSlideNavigation } from "@/hooks/useSlideNavigation";
import SlideSidebar from "./SlideSidebar";
import SlideStage from "./SlideStage";
import SidebarStyles from "./SidebarStyles";
import type { Slide as SlideType } from "@/types";

export type Slide = SlideType;

type SlidesWithThumbsProps = {
  slides: Slide[];
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  focusMode: boolean;
  presenterMode: boolean;
  thumbsRailRef: RefObject<HTMLElement | null>;
  transitionKey: number;
  setTransitionKey: (updater: number | ((prev: number) => number)) => void;
  slideTransition: string;
  slideContainerRef: RefObject<HTMLElement | null>;
  slideContentRef: RefObject<HTMLElement | null>;
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  loading?: boolean;
};

export default function SlidesWithThumbs({
  slides,
  currentSlide,
  setCurrentSlide,
  focusMode,
  presenterMode,
  thumbsRailRef,
  transitionKey,
  setTransitionKey,
  slideTransition,
  slideContainerRef,
  slideContentRef,
  onRemove,
  onReorder,
  loading = false,
}: SlidesWithThumbsProps) {
  const { selectSlide } = useSlideNavigation(setCurrentSlide, setTransitionKey);
  const showSidebar = !focusMode && !presenterMode;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {showSidebar && (
        <SlideSidebar
          slides={slides}
          currentSlide={currentSlide}
          thumbsRailRef={thumbsRailRef}
          onSelect={selectSlide}
          onRemove={onRemove}
          onReorder={onReorder}
          loading={loading}
        />
      )}

      <SlideStage
        slides={slides}
        currentSlide={currentSlide}
        transitionKey={transitionKey}
        slideTransition={slideTransition}
        slideContainerRef={slideContainerRef}
        slideContentRef={slideContentRef}
      />

      <SidebarStyles />
    </div>
  );
}