import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';

const parseMarkdownSafe = (md) => {
  let html = marked.parse(md || '');
  html = html.replace(/<pre><code class="language-(\w+)">/g, '<pre class="code-block"><code class="hljs language-$1">');
  html = html.replace(/<pre><code class="hljs language-(\w+)">/g, '<pre class="code-block"><code class="hljs language-$1">');
  html = html.replace(/<pre><code>/g, '<pre class="code-block"><code class="hljs">');
  return html;
};

export default function PresenterView({ currentHtml, currentIndex, slidesLength, onNext, onPrev, onExit }) {
  const [clockNow, setClockNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.presenter .slide-content pre code').forEach((b) => hljs.highlightElement(b));
    }, 60);
    return () => clearTimeout(timer);
  }, [currentHtml]);

  return (
    <div className="presenter" role="dialog" aria-label="Modo apresentador">
      <div className="presenter-bar">
        <div className="presenter-top">
          <div className="presenter-left">
            <div className="presenter-clock">{clockNow.toLocaleTimeString()}</div>
            <div className="presenter-index">{currentIndex + 1} / {slidesLength}</div>
          </div>
          <div className="presenter-center">
            <div className="presenter-progress"><span style={{ width: `${Math.min(100, Math.max(0, ((currentIndex + 1) / Math.max(1, slidesLength)) * 100))}%` }} /></div>
          </div>
          <div className="presenter-actions" role="group" aria-label="Controles de apresentação">
            <button className="nav-btn" onClick={onPrev} aria-label="Slide anterior">Anterior</button>
            <button className="nav-btn" onClick={onNext} aria-label="Próximo slide">Próximo</button>
            <span className="presenter-divider" aria-hidden />
            <button className="exit-btn" onClick={onExit} aria-label="Sair do modo apresentador">Sair</button>
          </div>
        </div>
        <div className="presenter-help" aria-hidden>
          <span>F: Fullscreen</span>
          <span>P: Presenter</span>
          <span>←/→ ou Espaço: navegar</span>
        </div>
      </div>

      <div className="presenter-main" aria-label="Slide atual">
        <div className="presenter-current">
          <div className="slide-container presenter-large full-bleed">
            <div className="slide-content" dangerouslySetInnerHTML={{ __html: currentHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}
