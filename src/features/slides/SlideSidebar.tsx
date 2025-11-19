import type { RefObject } from "react";
import SlideThumbList from "./SlideThumbList";
import { Slide } from "@/types";

type SlideSidebarProps = {
  slides: Slide[];
  currentSlide: number;
  thumbsRailRef: RefObject<HTMLElement | null>;
  onSelect: (index: number) => void;
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  loading?: boolean;
};

export default function SlideSidebar({
  slides,
  currentSlide,
  thumbsRailRef,
  onSelect,
  onRemove,
  onReorder,
  loading = false,
}: SlideSidebarProps) {
  return (
    <aside
      ref={thumbsRailRef as RefObject<HTMLDivElement>}
      className="flex w-80 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl"
    >
      <SidebarHeader totalSlides={slides.length} />
      <SlideThumbList
        slides={slides}
        currentSlide={currentSlide}
        onSelect={onSelect}
        onRemove={onRemove}
        onReorder={onReorder}
        loading={loading}
      />
      <SidebarFooter currentSlide={currentSlide} totalSlides={slides.length} />
    </aside>
  );
}

const SidebarHeader = ({ totalSlides }: { totalSlides: number }) => (
  <div className="shrink-0 border-b border-white/5 bg-black/30 px-6 py-5">
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
        Slides
      </h2>
      <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
        {totalSlides}
      </span>
    </div>
  </div>
);

const SidebarFooter = ({
  currentSlide,
  totalSlides,
}: {
  currentSlide: number;
  totalSlides: number;
}) => (
  <div className="shrink-0 border-t border-white/5 bg-black/30 px-6 py-4 text-xs text-white/60">
    <div className="flex items-center justify-between">
      <span>Navegação</span>
      <div className="flex items-center gap-2">
        <kbd className="rounded border border-white/10 bg-black/40 px-2 py-1 font-mono text-white/50">
          ↑↓
        </kbd>
        <span>ou clique</span>
      </div>
    </div>

    <div className="mt-3 flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-linear-to-r from-indigo-400 to-purple-500 transition-[width] duration-500"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
      <span className="min-w-[60px] text-right font-semibold text-white/70">
        {currentSlide + 1} / {totalSlides}
      </span>
    </div>
  </div>
);

