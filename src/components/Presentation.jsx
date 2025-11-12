import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import UploadArea from './UploadArea';
import SlideViewer from './SlideViewer';
import { useMemo } from 'react';
import Navigation from './Navigation';
import SlideList from './SlideList';
import PresenterView from './PresenterView';
import EditPanel from './EditPanel';
import { Sparkles, AlertCircle } from 'lucide-react';
import '../styles/presentation.css';

const parseMarkdownSafe = (md) => {
  let html = marked.parse(md);
  html = html.replace(/<pre><code class="language-(\w+)">/g, '<pre class="code-block"><code class="hljs language-$1">');
  html = html.replace(/<pre><code class="hljs language-(\w+)">/g, '<pre class="code-block"><code class="hljs language-$1">');
  html = html.replace(/<pre><code>/g, '<pre class="code-block"><code class="hljs">');
  return html;
};

const Presentation = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSlideList, setShowSlideList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const slideContentRef = useRef(null);
  const slideContainerRef = useRef(null);
  const [highContrast, setHighContrast] = useState(() => {
    try { return localStorage.getItem('presentation-high-contrast') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('presentation-high-contrast', highContrast ? '1' : '0'); } catch {}
  }, [highContrast]);

  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          return hljs.highlightAuto(code).value;
        }
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
  });

  const [presenterMode, setPresenterMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [editorFocus, setEditorFocus] = useState(false); // full-screen edit panel
  const [showHelp, setShowHelp] = useState(false);
  const [slideTransition, setSlideTransition] = useState('fade'); // 'fade', 'slide', 'none'
  const thumbsRailRef = useRef(null);
  const [transitionKey, setTransitionKey] = useState(0);

  // Disable page scroll while in focus mode
  useEffect(() => {
    if (focusMode) {
      const prevX = document.body.style.overflowX;
      const prevY = document.body.style.overflowY;
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
      return () => {
        document.body.style.overflowX = prevX || '';
        document.body.style.overflowY = prevY || '';
      };
    }
    return undefined;
  }, [focusMode]);

  // Attempt to save a slide's markdown to a local file using the File System Access API when available.
  const saveSlideToFile = async (index, content) => {
    try {
      const slide = slides[index];
      if (!slide) return;
      const supportsFS = typeof window !== 'undefined' && 'showSaveFilePicker' in window;
      if (supportsFS) {
        // If we already have a handle in memory, reuse it; otherwise ask where to save
        let handle = slide._fileHandle;
        if (!handle) {
          handle = await window.showSaveFilePicker({
            suggestedName: (slide.name?.endsWith('.md') ? slide.name : `${slide.name || 'slide'}.md`),
            types: [
              { description: 'Markdown', accept: { 'text/markdown': ['.md'] } },
              { description: 'Text', accept: { 'text/plain': ['.txt'] } }
            ]
          });
          // Stash handle in memory for this session only (not persisted)
          setSlides(prev => {
            const cp = prev.slice();
            if (cp[index]) cp[index]._fileHandle = handle;
            return cp;
          });
        }
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        // Fallback: trigger a download of the current content
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (slide.name?.endsWith('.md') ? slide.name : `${slide.name || 'slide'}.md`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Swallow errors silently or optionally set a warning
      console.warn('Falha ao salvar arquivo:', err);
      setWarning('Não foi possível salvar diretamente no arquivo. Seu navegador pode não suportar, ou a permissão foi negada.');
      setTimeout(() => setWarning(''), 4000);
    }
  };

  const extractNotes = (text) => {
    const notes = [];
    if (!text) return { clean: text || '', notes };
    const cleaned = text.replace(/<!--\s*note:\s*([\s\S]*?)-->/gi, (m, p1) => {
      if (p1 && p1.trim()) notes.push(p1.trim());
      return '';
    });
    return { clean: cleaned.trim(), notes };
  };

  const handleFileUpload = async (e, options = {}) => {
    if (options?.error) {
      setError(options.error);
      return;
    }
    const files = Array.from(e?.target?.files || []);
    if (files.length === 0) return;
    setLoading(true); setError('');
    try {
      if (files.length === 1 && options.splitSingle) {
        const file = files[0];
        const raw = await file.text();
        const marker = (options.delimiter || '---').trim();
        const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const lineRegex = new RegExp('^\\s*' + esc(marker) + '\\s*$', 'gm');
          let slidesParts = raw.split(lineRegex).map((p) => p.trim()).filter(Boolean);
          if (slidesParts.length <= 1) {
            const altRegex = new RegExp('\\r?\\n\\s*' + esc(marker) + '\\s*\\r?\\n');
            slidesParts = raw.split(altRegex).map((p) => p.trim()).filter(Boolean);
          }
          // If after attempts we still have a single part, the marker wasn't present — treat as blocking error.
          if (slidesParts.length <= 1) {
            setError('Marcador não encontrado — nenhum slide foi carregado. Verifique o marcador ou desmarque a opção de dividir.');
            setLoading(false);
            return;
          }
          setWarning('');
        const loadedSlides = slidesParts.map((content, i) => {
          const { clean, notes } = extractNotes(content);
          return { name: `${file.name.replace('.md','')}-${i+1}`, content: clean, notes, html: parseMarkdownSafe(clean) };
        });
        setSlides(loadedSlides);
        setCurrentSlide(0);
        setShowSlideList(true);
        return;
      }

      const sortedFiles = files.sort((a,b) => a.name.localeCompare(b.name));
      const loadedSlides = await Promise.all(sortedFiles.map(async (file) => {
        const raw = await file.text();
        const { clean, notes } = extractNotes(raw);
        return { name: file.name.replace('.md',''), content: clean, notes, html: parseMarkdownSafe(clean) };
      }));
      setSlides(loadedSlides);
      setCurrentSlide(0);
      setShowSlideList(true);
    } catch (err) {
      setError('Erro ao carregar arquivos: ' + (err?.message || err));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore global shortcuts while editing or typing in inputs/textareas/contenteditable
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();
      if (editing || tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      const k = e.key.toLowerCase();
      if (e.key === '?' || (e.shiftKey && k === '/')) { // Help shortcut
        setShowHelp((v) => !v);
        return;
      }
      if (k === 'h') { // Toggle focus mode
        if (!presenterMode) setFocusMode((v) => !v);
        return;
      }
      if (k === 'e') { // Edit shortcut
        if (!presenterMode && slides.length > 0) {
          setDraftContent(slides[currentSlide].content || '');
          setEditing(true);
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && k === 'd') { // Duplicate slide
        e.preventDefault();
        if (!presenterMode && slides.length > 0) {
          duplicateSlide();
          return;
        }
      }
      if (k === 'f') { toggleFullscreen(); }
      if (k === 'p') { setPresenterMode((v) => !v); }
      if (e.key === 'ArrowRight' || e.key === ' ') { 
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1); 
          setTransitionKey(prev => prev + 1);
        }
      }
      if (e.key === 'ArrowLeft') { 
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1); 
          setTransitionKey(prev => prev + 1);
        }
      }
      if (e.key === 'Home') { setCurrentSlide(0); setTransitionKey(prev => prev + 1); }
      if (e.key === 'End') { setCurrentSlide(slides.length - 1); setTransitionKey(prev => prev + 1); }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length, editing, presenterMode]);

  useEffect(() => {
    if (slideContentRef.current && slides.length > 0) {
      slideContentRef.current.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
    }
  }, [currentSlide, slides]);

  useEffect(() => { if (slideContainerRef.current && slides.length > 0) slideContainerRef.current.scrollTo({ top:0, behavior:'smooth' }); }, [currentSlide, slides.length]);

  // Auto-scroll thumbnail rail to keep current slide visible
  useEffect(() => {
    if (thumbsRailRef.current && slides.length > 0) {
      const activeThumb = thumbsRailRef.current.querySelector('.thumb-item.active');
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentSlide, slides.length]);

  useEffect(() => {
    try {
      if (slides && slides.length > 0) {
        const payload = slides.map((s) => ({ name: s.name, content: s.content, notes: s.notes || [] }));
        localStorage.setItem('presentation-slides', JSON.stringify(payload));
      } else {
        localStorage.removeItem('presentation-slides');
      }
    } catch (err) {
    }
  }, [slides]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('presentation-slides');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loaded = parsed.map((p) => ({ name: p.name, content: p.content, notes: p.notes || [], html: parseMarkdownSafe(p.content) }));
          setSlides(loaded);
          setShowSlideList(true);
        }
      }
    } catch (err) {}
  }, []);

  // Fullscreen helper
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // ignore
    }
  };

  // Export all slides as a single combined markdown file
  const exportCombinedMarkdown = () => {
    const delimiter = '---'; // You can make this configurable
    const combined = slides.map((s) => s.content).join(`\n\n${delimiter}\n\n`);
    const blob = new Blob([combined], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apresentacao-combinada.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Duplicate current slide
  const duplicateSlide = () => {
    if (slides.length === 0) return;
    const current = slides[currentSlide];
    const duplicate = {
      name: `${current.name}-copia`,
      content: current.content,
      notes: current.notes ? [...current.notes] : [],
      html: current.html
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, duplicate);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
  };

  return (
  <div className={`presentation-container${highContrast ? ' high-contrast' : ''}${presenterMode ? ' presenter-full' : ''}${focusMode ? ' focus-mode' : ''}`}>
      {slides.length === 0 ? (
        <div className="upload-wrapper">
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <button
              className="reload-btn"
              onClick={() => setHighContrast((v) => !v)}
              aria-pressed={highContrast}
              aria-label="Toggle alto contraste"
            >
              {highContrast ? 'Contraste Padrão' : 'Alto Contraste'}
            </button>
          </div>
          <UploadArea onFilesChange={handleFileUpload} loading={loading} />

          <div className="instructions">
            <h3>Instruções</h3>
            <ul>
              <li>Nomeie seus arquivos para controlar a ordem (ex: 01-intro.md, 02-conceitos.md)</li>
              <li>Use código com blocos de linguagem para destaque</li>
            </ul>
          </div>

          {loading && <div className="message"><Sparkles /> Carregando...</div>}
          {error && <div className="message error"><AlertCircle /> {error}</div>}
          {warning && <div className="message" style={{ color: '#a16207', background: '#fff7ed', padding: 8, borderRadius: 6 }}>{warning}</div>}
        </div>
      ) : (
        <>
          {showSlideList ? (
            <SlideList
              slides={slides}
              onReorder={(newSlides) => { setSlides(newSlides); setError(''); setWarning(''); }}
              onStart={() => { setShowSlideList(false); setCurrentSlide(0); setWarning(''); setError(''); }}
              onRemove={(idx) => { const copy = slides.slice(); copy.splice(idx,1); setSlides(copy); setCurrentSlide((c) => Math.min(c, Math.max(0, copy.length - 1))); if (copy.length === 0) setPresenterMode(false); }}
              highContrast={highContrast}
              onToggleContrast={() => setHighContrast((v) => !v)}
            />
          ) : (
            <>
              {presenterMode ? (
                <PresenterView
                  currentHtml={slides[currentSlide].html}
                  currentIndex={currentSlide}
                  slidesLength={slides.length}
                  onNext={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
                  onPrev={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                  onExit={() => setPresenterMode(false)}
                />
              ) : (
                <>
                  <div className="presentation-with-thumbs">
                    {!focusMode && !presenterMode && (
                      <aside className="thumbs-rail" ref={thumbsRailRef} aria-label="Lista de miniaturas">
                        <ul>
                          {slides.map((s, idx) => {
                            const active = idx === currentSlide;
                            const previewText = (s.content || '').replace(/[#`>*_\-]/g,'').slice(0,70);
                            return (
                              <li key={idx}>
                                <button
                                  type="button"
                                  className={`thumb-item${active ? ' active' : ''}`}
                                  onClick={() => { 
                                    setCurrentSlide(idx); 
                                    setTransitionKey(prev => prev + 1);
                                  }}
                                  aria-label={`Ir para slide ${idx+1}`}
                                >
                                  <span className="thumb-number">{idx+1}</span>
                                  <span className="thumb-text">{previewText || 'Slide vazio'}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </aside>
                    )}
                    <div className="presentation-main">
                      <div key={transitionKey} className={`slide-transition slide-transition-${slideTransition}`}>
                        <SlideViewer html={slides[currentSlide].html} slideContainerRef={slideContainerRef} slideContentRef={slideContentRef} />
                      </div>
                    </div>
                  </div>

                  <Navigation
                    currentSlide={currentSlide}
                    slidesLength={slides.length}
                    onPrev={() => { 
                      setCurrentSlide((s) => Math.max(0, s - 1)); 
                      setTransitionKey(prev => prev + 1);
                    }}
                    onNext={() => { 
                      setCurrentSlide((s) => Math.min(slides.length - 1, s + 1)); 
                      setTransitionKey(prev => prev + 1);
                    }}
                        onEdit={() => { setDraftContent(slides[currentSlide].content || ''); setEditing(true); }}
                        onToggleFocus={() => setFocusMode((v) => !v)}
                        focusMode={focusMode}
                        onExport={exportCombinedMarkdown}
                        onDuplicate={duplicateSlide}
                        onReset={() => { setSlides([]); setCurrentSlide(0); setError(''); setShowSlideList(false); setPresenterMode(false); }}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
          <EditPanel
            open={editing}
            value={draftContent}
            onChange={setDraftContent}
            onCancel={() => setEditing(false)}
            onSave={() => {
              setSlides((prev) => {
                const copy = prev.slice();
                const item = copy[currentSlide];
                if (item) {
                  item.content = draftContent;
                  item.html = parseMarkdownSafe(draftContent);
                }
                return copy;
              });
              setEditing(false);
              // Try saving to file on each save; this will prompt once per slide
              saveSlideToFile(currentSlide, draftContent);
            }}
            editorFocus={editorFocus}
            onToggleEditorFocus={() => setEditorFocus(v => !v)}
          />
      {focusMode && (
        <div className="focus-indicator" aria-live="polite">Focus Mode ON (H para sair)</div>
      )}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-panel" onClick={(e) => e.stopPropagation()}>
            <h2>Atalhos de Teclado</h2>
            <div className="help-grid">
              <div className="help-item">
                <kbd>→</kbd> <kbd>Space</kbd>
                <span>Próximo slide</span>
              </div>
              <div className="help-item">
                <kbd>←</kbd>
                <span>Slide anterior</span>
              </div>
              <div className="help-item">
                <kbd>Home</kbd>
                <span>Primeiro slide</span>
              </div>
              <div className="help-item">
                <kbd>End</kbd>
                <span>Último slide</span>
              </div>
              <div className="help-item">
                <kbd>E</kbd>
                <span>Editar slide atual</span>
              </div>
              <div className="help-item">
                <kbd>Ctrl</kbd>+<kbd>D</kbd>
                <span>Duplicar slide</span>
              </div>
              <div className="help-item">
                <kbd>H</kbd>
                <span>Modo foco (sem chrome)</span>
              </div>
              <div className="help-item">
                <kbd>P</kbd>
                <span>Modo apresentador</span>
              </div>
              <div className="help-item">
                <kbd>F</kbd>
                <span>Tela cheia</span>
              </div>
              <div className="help-item">
                <kbd>?</kbd>
                <span>Mostrar/ocultar ajuda</span>
              </div>
              <div className="help-item">
                <kbd>Esc</kbd>
                <span>Fechar painéis</span>
              </div>
            </div>
            <button className="help-close" onClick={() => setShowHelp(false)}>Fechar (Esc ou clique fora)</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presentation;
