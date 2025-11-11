import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import UploadArea from './UploadArea';
import SlideViewer from './SlideViewer';
import Navigation from './Navigation';
import SlideList from './SlideList';
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
          if (slidesParts.length === 0) {
            slidesParts = [raw.trim()];
            setWarning('Marcador não encontrado — o arquivo será tratado como um único slide.');
          } else {
            setWarning('');
          }
        const loadedSlides = slidesParts.map((content, i) => ({ name: `${file.name.replace('.md','')}-${i+1}`, content, html: parseMarkdownSafe(content) }));
        setSlides(loadedSlides);
        setCurrentSlide(0);
        setShowSlideList(true);
        return;
      }

      const sortedFiles = files.sort((a,b) => a.name.localeCompare(b.name));
      const loadedSlides = await Promise.all(sortedFiles.map(async (file) => {
        const content = await file.text();
        return { name: file.name.replace('.md',''), content, html: parseMarkdownSafe(content) };
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
      if (e.key === 'ArrowRight' || e.key === ' ') { if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1); }
      if (e.key === 'ArrowLeft') { if (currentSlide > 0) setCurrentSlide(currentSlide - 1); }
      if (e.key === 'Home') setCurrentSlide(0);
      if (e.key === 'End') setCurrentSlide(slides.length - 1);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (slideContentRef.current && slides.length > 0) {
      slideContentRef.current.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
    }
  }, [currentSlide, slides]);

  useEffect(() => { if (slideContainerRef.current && slides.length > 0) slideContainerRef.current.scrollTo({ top:0, behavior:'smooth' }); }, [currentSlide, slides.length]);

  return (
    <div className={`presentation-container${highContrast ? ' high-contrast' : ''}`}>
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
              onReorder={(newSlides) => setSlides(newSlides)}
              onStart={() => { setShowSlideList(false); setCurrentSlide(0); setWarning(''); }}
              onRemove={(idx) => { const copy = slides.slice(); copy.splice(idx,1); setSlides(copy); }}
            />
          ) : (
            <>
              <SlideViewer html={slides[currentSlide].html} slideContainerRef={slideContainerRef} slideContentRef={slideContentRef} />

              <Navigation
                currentSlide={currentSlide}
                slidesLength={slides.length}
                onPrev={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                onNext={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
                onReset={() => { setSlides([]); setCurrentSlide(0); setError(''); setShowSlideList(false); }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Presentation;
