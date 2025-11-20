import { useState } from "react";
import {
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Eye,
  Sparkles,
  Save,
} from "lucide-react";
import type { Slide } from "@/types";

type SlideListProps = {
  slides: Slide[];
  onReorder?: (s: Slide[]) => void;
  onStart: () => void;
  onRemove: (idx: number) => void;
  onSave?: () => void;
  highContrast?: boolean;
  onToggleContrast?: () => void;
};

export default function SlideList({
  slides,
  onReorder,
  onStart,
  onRemove,
  onSave,
  highContrast = false,
  onToggleContrast,
}: SlideListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    setDragIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, destIdx: number) => {
    e.preventDefault();
    const src = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(src)) return;
    if (src === destIdx) return;
    const copy = slides.slice();
    const [moved] = copy.splice(src, 1);
    copy.splice(destIdx, 0, moved);
    setDragIndex(null);
    if (typeof onReorder === "function") onReorder(copy);
  };

  const stripTags = (html?: string): string =>
    html ? html.replace(/<[^>]+>/g, "") : "";
  const shortPreview = (html?: string) => {
    const text = stripTags(html).replace(/\s+/g, " ").trim();
    return text.length > 180 ? text.slice(0, 180) + "…" : text;
  };

  const move = (from: number, to: number) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= slides.length ||
      to >= slides.length
    )
      return;
    const copy = slides.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    if (typeof onReorder === "function") onReorder(copy);
  };

  return (
    <div
      className="w-full min-h-screen bg-[#0a0a0a] p-6"
      role="list"
      aria-label="Lista de slides"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Sparkles className="text-blue-400" size={20} />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Seus Slides
                </h2>
              </div>
              <div className="flex items-center gap-2 text-white/40 ml-1">
                <Eye size={16} />
                <p className="text-sm font-medium">
                  {slides.length} slide{slides.length !== 1 ? "s" : ""} carregado{slides.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  typeof onToggleContrast === "function" && onToggleContrast()
                }
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 border border-white/10 text-sm font-medium"
              >
                {highContrast ? "🔆 Contraste Padrão" : "🌓 Alto Contraste"}
              </button>

              {onSave && (
                <button
                  onClick={onSave}
                  className="px-5 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all duration-200 flex items-center gap-2 text-sm shadow-lg shadow-white/10"
                >
                  <Save size={18} />
                  Salvar
                </button>
              )}

              <button
                onClick={onStart}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-all duration-200 flex items-center gap-2 text-sm shadow-lg shadow-blue-500/20"
              >
                <Play size={18} fill="currentColor" />
                Iniciar Apresentação
              </button>
            </div>
          </div>
        </div>

        {/* Slides Grid */}
        {slides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((s: Slide, idx: number) => (
              <div
                key={`${s.name ?? "slide"}-${idx}`}
                className="relative group"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-xl border transition-all duration-300 overflow-hidden ${dragIndex === idx
                    ? "opacity-50 scale-95 border-blue-500 shadow-2xl"
                    : hoveredIndex === idx
                      ? "border-white/20 shadow-2xl shadow-black/50 transform -translate-y-1"
                      : "border-white/10"
                    }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Slide ${idx + 1}: ${s.name ?? "Sem título"}`}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "ArrowLeft") {
                      move(idx, Math.max(0, idx - 1));
                    }
                    if (e.key === "ArrowRight") {
                      move(idx, Math.min(slides.length - 1, idx + 1));
                    }
                    if (e.key === "Delete") {
                      onRemove(idx);
                    }
                  }}
                >
                  {/* Decorative line */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Drag Handle */}
                  <div className="absolute top-4 left-4 p-1.5 bg-black/50 rounded-md text-white/40 group-hover:text-white/80 cursor-grab active:cursor-grabbing transition-all backdrop-blur-sm border border-white/10 z-10">
                    <GripVertical size={16} />
                  </div>

                  {/* Slide Number Badge */}
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {idx + 1}
                  </div>

                  {/* Preview Area */}
                  <div className="p-6 pt-14">
                    <div className="relative">
                      <div className="relative bg-white/5 rounded-lg p-4 min-h-[180px] max-h-[180px] overflow-hidden border border-white/5">
                        <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap wrap-break-word m-0 font-mono">
                          {shortPreview(s.html)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex items-center justify-between gap-3 border-t border-white/5 mt-2">
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        title="Mover para esquerda"
                        onClick={() => move(idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        title="Mover para direita"
                        onClick={() =>
                          move(idx, Math.min(slides.length - 1, idx + 1))
                        }
                        disabled={idx === slides.length - 1}
                        className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      title="Remover slide"
                      onClick={() => onRemove(idx)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-all text-xs font-medium border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 size={14} />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {slides.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
              <Play size={32} className="text-white/40 ml-1" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum slide carregado
            </h3>
            <p className="text-white/40 mb-8">
              Faça upload de arquivos .md para começar sua apresentação
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
