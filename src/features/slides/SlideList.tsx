import { useState } from "react";
import {
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Eye,
  Sparkles,
} from "lucide-react";
import type { Slide } from "./slides/types";

type SlideListProps = {
  slides: Slide[];
  onReorder?: (s: Slide[]) => void;
  onStart: () => void;
  onRemove: (idx: number) => void;
  highContrast?: boolean;
  onToggleContrast?: () => void;
};

export default function SlideList({
  slides,
  onReorder,
  onStart,
  onRemove,
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
      className="w-full min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6"
      role="list"
      aria-label="Lista de slides"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-violet-400" size={28} />
                <h2 className="text-4xl font-black bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Seus Slides
                </h2>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Eye size={18} className="text-violet-400" />
                <p className="text-lg">
                  {slides.length} slide{slides.length !== 1 ? "s" : ""} carregado
                  {slides.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  typeof onToggleContrast === "function" && onToggleContrast()
                }
                aria-pressed={!!highContrast}
                aria-label="Alternar alto contraste"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all duration-200 border border-slate-600 font-medium shadow-lg hover:shadow-xl"
              >
                {highContrast ? "🔆 Contraste Padrão" : "🌓 Alto Contraste"}
              </button>

              <button
                onClick={onStart}
                aria-label="Iniciar apresentação"
                className="group relative px-8 py-3 bg-linear-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-violet-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-cyan-600 via-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Play size={20} fill="currentColor" className="relative" />
                <span className="relative">Iniciar Apresentação</span>
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
                className="relative"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Glow effect on hover */}
                {hoveredIndex === idx && (
                  <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-cyan-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                )}
                
                <div
                  className={`relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 ${
                    dragIndex === idx
                      ? "opacity-50 scale-95 border-violet-500 shadow-2xl"
                      : hoveredIndex === idx
                        ? "border-violet-500/50 shadow-2xl shadow-violet-500/20 transform -translate-y-1"
                        : "border-slate-700/50 hover:border-slate-600"
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
                  {/* Drag Handle */}
                  <div className="absolute top-4 left-4 p-1.5 bg-slate-800/80 rounded-lg text-slate-500 group-hover:text-slate-400 cursor-grab active:cursor-grabbing transition-all backdrop-blur-sm border border-slate-700/50">
                    <GripVertical size={18} />
                  </div>

                  {/* Slide Number Badge */}
                  <div className="absolute top-4 right-4 bg-linear-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {idx + 1}
                  </div>

                  {/* Preview Area */}
                  <div className="p-6 pt-14">
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-br from-slate-800/50 to-slate-900/50 rounded-xl blur-sm"></div>
                      <div className="relative bg-slate-950/80 backdrop-blur-sm rounded-xl p-5 min-h-[180px] max-h-[180px] overflow-hidden border border-slate-700/50">
                        <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word m-0 font-mono">
                          {shortPreview(s.html)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-3">
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        title="Mover para esquerda"
                        onClick={() => move(idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800 border border-slate-700/50 shadow-lg hover:shadow-xl"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        title="Mover para direita"
                        onClick={() =>
                          move(idx, Math.min(slides.length - 1, idx + 1))
                        }
                        disabled={idx === slides.length - 1}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800 border border-slate-700/50 shadow-lg hover:shadow-xl"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      title="Remover slide"
                      onClick={() => onRemove(idx)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/30 shadow-lg hover:shadow-red-500/20 font-medium"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {slides.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-linear-to-r from-violet-600 to-cyan-600 rounded-full blur-2xl opacity-20"></div>
              <div className="relative w-24 h-24 bg-linear-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-2 border-slate-700/50 shadow-2xl">
                <Play size={40} className="text-slate-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-3">
              Nenhum slide carregado
            </h3>
            <p className="text-slate-500 text-lg">
              Faça upload de arquivos .md para começar sua apresentação
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
