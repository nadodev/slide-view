import React from 'react';
import { ChevronLeft, ChevronRight, Pencil, Eye, EyeOff } from 'lucide-react';

export default function Navigation({ currentSlide, slidesLength, onPrev, onNext, onReset, onEdit, onToggleFocus, focusMode }) {
  return (
    <div className="navigation">
      <button className="nav-btn" onClick={onPrev} disabled={currentSlide === 0}>
        <ChevronLeft size={20} />
        Anterior
      </button>

      <span className="slide-counter">{currentSlide + 1} / {slidesLength}</span>

      <button className="nav-btn" onClick={onNext} disabled={currentSlide === slidesLength - 1}>
        Próximo
        <ChevronRight size={20} />
      </button>

      {typeof onEdit === 'function' && (
        <button className="reload-btn" onClick={onEdit} aria-label="Editar slide atual">
          <Pencil size={16} /> Editar
        </button>
      )}

      {typeof onToggleFocus === 'function' && (
        <button className="reload-btn" onClick={onToggleFocus} aria-label={focusMode ? 'Sair do modo de foco' : 'Ativar modo de foco'}>
          {focusMode ? <Eye size={16} /> : <EyeOff size={16} />} {focusMode ? 'Sair foco' : 'Foco'}
        </button>
      )}

      <button className="reload-btn" onClick={onReset}>Recarregar</button>
    </div>
  );
}
