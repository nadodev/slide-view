import { Trash2, Trash2Icon, GripVertical } from "lucide-react";
import type { Slide } from "@/types";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { useState } from "react";

type SlideThumbItemProps = {
  index: number;
  slide: Slide;
  previewText: string;
  isActive: boolean;
  canRemove: boolean;
  onSelect: (index: number) => void;
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
};

export default function SlideThumbItem({
  index,
  slide,
  previewText,
  isActive,
  canRemove,
  onSelect,
  onRemove,
  onReorder,
}: SlideThumbItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", index.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Só remove o highlight se realmente saiu do elemento
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (fromIndex !== index && onReorder) {
      onReorder(fromIndex, index);
    }
  };

  return (
    <li
      className={`relative transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''} ${draggedOver ? 'transform -translate-y-1' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Indicador visual de drop zone */}
      {draggedOver && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full z-10" />
      )}

      <button
        type="button"
        onClick={() => onSelect(index)}
        className={`cursor-pointer group w-full overflow-hidden rounded-xl border text-left transition ${isActive
          ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-900/20"
          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
          }`}
      >

        <div className="p-4">

          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <GripVertical
                size={16}
                className={`cursor-grab active:cursor-grabbing transition-colors ${isActive ? "text-blue-400" : "text-white/20 group-hover:text-white/40"
                  }`}
              />
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${isActive
                ? "bg-blue-500/20 text-blue-400"
                : "bg-white/10 text-white/60 group-hover:bg-white/15"
                }`}
            >
              {index + 1}
            </div>

            <div className="min-w-0 flex-1 pr-6">
              {slide.name && (
                <p
                  className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-white/80"
                    }`}
                >
                  {slide.name}
                </p>
              )}
              <p
                className={`line-clamp-2 text-xs leading-relaxed ${isActive ? "text-white/80" : "text-white/60"
                  }`}
              >
                {previewText || "Slide sem conteúdo"}
              </p>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="h-1 w-full bg-blue-500" />
        )}
      </button>
      {canRemove && onRemove && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Excluir slide ${index + 1}`}
              title="Excluir slide"
              className="
                absolute top-2 right-2
                h-6 w-6 p-0.5
                flex items-center justify-center
                rounded-sm cursor-pointer
                text-white/20
                transition-colors 
                group
                hover:bg-red-500/20 hover:text-red-400
                "
            >
              <Trash2Icon
                size={16}
                className="
                  transition-colors
                "
              />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#0a0a0a] border border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Excluir Slide {index + 1}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                Tem certeza que deseja excluir este slide? Esta ação não pode ser desfeita.
                {slide.name && (
                  <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm font-medium text-white/80">Slide: {slide.name}</span>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRemove(index)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir Slide
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </li>
  );
}

