import React, { useState } from 'react';

export default function SlideList({ slides, onReorder, onStart, onRemove }) {
  const [dragIndex, setDragIndex] = useState(null);

  const handleDragStart = (e, idx) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    setDragIndex(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, destIdx) => {
    e.preventDefault();
    const src = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(src)) return;
    if (src === destIdx) return;
    const copy = slides.slice();
    const [moved] = copy.splice(src, 1);
    copy.splice(destIdx, 0, moved);
    setDragIndex(null);
    if (typeof onReorder === 'function') onReorder(copy);
  };

  return (
    <div className="slide-list" role="list" aria-label="Lista de slides">
      <div className="slide-list-header">
        <h3>{slides.length} slide(s)</h3>
        <div>
          <button className="nav-btn" onClick={onStart} aria-label="Iniciar apresentação">Iniciar</button>
        </div>
      </div>

      <div className="slide-thumbs">
        {slides.map((s, idx) => (
          <div
            key={s.name + '-' + idx}
            className={`thumb ${dragIndex === idx ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            role="listitem"
            tabIndex={0}
            aria-label={`Slide ${idx + 1}: ${s.name}`}
          >
            <div className="thumb-body">
              <div className="thumb-number">{idx + 1}</div>
              <div className="thumb-preview" dangerouslySetInnerHTML={{ __html: s.html }} />
            </div>
            <div className="thumb-actions">
              <button className="reload-btn" onClick={() => onRemove(idx)} aria-label={`Remover slide ${idx + 1}`}>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
