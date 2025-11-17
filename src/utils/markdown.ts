import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import generateSlug from './slug';

// Configurar marked
marked.setOptions({
  breaks: true,
  gfm: true
});

// Configurar highlight.js para sintaxe colorida
const renderer = new marked.Renderer();
renderer.code = function(code: {text: string, lang?: string, escaped?: boolean}) {
  const { text, lang } = code;
  
  // Suporte para Mermaid
  if (lang === 'mermaid') {
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    // Preservar o texto exatamente como está, incluindo quebras de linha
    const escapedText = text.trim();
    return `<div class="mermaid-container"><div class="mermaid" id="${id}">${escapedText}</div></div>`;
  }
  
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch (err) {
      // Fallback para auto-detection
    }
  }
  const highlighted = hljs.highlightAuto(text).value;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
};

export function parseMarkdownSafe(md: string = ''): string {
  let html: string = marked.parse(md || '', { renderer }) as string;
  html = html.replace(/<pre><code class="language-(\w+)">/g, '<pre class="code-block"><code class="hljs language-$1">');
  html = html.replace(/<pre><code class="hljs language-(\w+)">/g, '<pre class="code-block"><code class="hljs language-$1">');
  html = html.replace(/<pre><code>/g, '<pre class="code-block"><code class="hljs">');

  html = html.replace(/<h([1-6])>(.*?)<\/h\1>/gi, (match: string, level: string, content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    const id = generateSlug(textContent);
    return `<h${level} id="${id}">${content}</h${level}>`;
  });

  return html;
}

export default parseMarkdownSafe;
