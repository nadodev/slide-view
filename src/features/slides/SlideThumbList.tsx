import SlideThumbItem from "./SlideThumbItem";
import SlideThumbSkeleton from "./SlideThumbSkeleton";
import { Slide } from "@/types";

type SlideThumbListProps = {
  slides: Slide[];
  currentSlide: number;
  onSelect: (index: number) => void;
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  loading?: boolean;
};

const sanitizePreview = (content?: string) =>
  (content || "").replace(/[#`>*_\-]/g, "").trim().slice(0, 80);

export default function SlideThumbList({
  slides,
  currentSlide,
  onSelect,
  onRemove,
  onReorder,
  loading = false,
}: SlideThumbListProps) {
  const canRemove = slides.length > 1 && typeof onRemove === "function";

  return (
    <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
      <ul className="space-y-3">
        {loading ? (
          // Renderizar skeletons quando carregando
          Array.from({ length: 3 }).map((_, index) => (
            <SlideThumbSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          // Renderizar slides normalmente
          slides.map((slide, index) => (
            <SlideThumbItem
              key={`${slide.name ?? "slide"}-${index}`}
              index={index}
              slide={slide}
              previewText={sanitizePreview(slide.content)}
              isActive={index === currentSlide}
              canRemove={canRemove}
              onSelect={onSelect}
              onRemove={onRemove}
              onReorder={onReorder}
            />
          ))
        )}
      </ul>
    </div>
  );
}

