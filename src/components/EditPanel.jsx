import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function EditPanel({ open, value, onChange, onCancel, onSave, editorFocus = false, onToggleEditorFocus }) {
  const textareaRef = useRef(null);
  const [internalFocus, setInternalFocus] = useState(false);
  const focusOn = onToggleEditorFocus ? editorFocus : internalFocus;

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onSave, onCancel]);

  if (!open) return null;
  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Editar slide">
      <div className={`editor-panel${focusOn ? ' focus' : ''}`}>
        <header>
          <h2>Editar Markdown do Slide</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="secondary"
              onClick={() => (onToggleEditorFocus ? onToggleEditorFocus() : setInternalFocus(v => !v))}
              title={focusOn ? 'Sair do foco do editor' : 'Foco no editor'}
            >
              {focusOn ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {focusOn ? 'Sair foco' : 'Foco'}
            </button>
            <button className="secondary" onClick={onCancel} title="Cancelar (Esc)">Cancelar</button>
            <button className="primary" onClick={onSave} title="Salvar (Ctrl+S ou Cmd+S)">Salvar</button>
          </div>
        </header>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="Edite o Markdown do slide aqui..."
          aria-label="Editor de Markdown do slide"
        />
        <footer>
          <span style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Dica: Ctrl+S para salvar, Esc para cancelar</span>
        </footer>
      </div>
    </div>
  );
}
