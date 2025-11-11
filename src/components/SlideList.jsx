import React, { useState } from 'react';

export default function SlideList({ slides, onReorder, onStart, onRemove, highContrast = false, onToggleContrast }) {
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

  const stripTags = (html) => html ? html.replace(/<[^>]+>/g, '') : '';
  const shortPreview = (html) => {
    const text = stripTags(html).replace(/\s+/g, ' ').trim();
    return text.length > 180 ? text.slice(0, 180) + '…' : text;
  };

  const move = (from, to) => {
    if (from === to || from < 0 || to < 0 || from >= slides.length || to >= slides.length) return;
    const copy = slides.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    if (typeof onReorder === 'function') onReorder(copy);
  };

  return (
    <div className="slide-list" role="list" aria-label="Lista de slides">
      <div className="slide-list-header">
        <h3>{slides.length} slide(s)</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="nav-btn" onClick={onStart} aria-label="Iniciar apresentação">Iniciar</button>
          <button
            className="reload-btn"
            onClick={() => typeof onToggleContrast === 'function' && onToggleContrast()}
            aria-pressed={!!highContrast}
            aria-label="Alternar alto contraste"
          >
            {highContrast ? 'Contraste Padrão' : 'Alto Contraste'}
          </button>
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
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { move(idx, Math.max(0, idx - 1)); }
              if (e.key === 'ArrowRight') { move(idx, Math.min(slides.length - 1, idx + 1)); }
              if (e.key === 'Delete') { onRemove(idx); }
            }}
          >
            <div className="thumb-body">
              <div className="thumb-number">{idx + 1}</div>
              <div className="thumb-preview-text" title={stripTags(s.html)}>
                <pre aria-hidden style={{ whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{shortPreview(s.html)}</pre>
              </div>
            </div>
            <div className="thumb-actions">
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="nav-btn" onClick={() => move(idx, Math.max(0, idx - 1))} aria-label={`Mover slide ${idx + 1} para esquerda`}>&larr;</button>
                <button className="nav-btn" onClick={() => move(idx, Math.min(slides.length - 1, idx + 1))} aria-label={`Mover slide ${idx + 1} para direita`}>&rarr;</button>
                <button className="reload-btn" onClick={() => onRemove(idx)} aria-label={`Remover slide ${idx + 1}`}>Remover</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
