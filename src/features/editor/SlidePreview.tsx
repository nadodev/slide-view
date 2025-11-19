import { useRef } from "react";
import { useMermaid } from "@/hooks/useMermaid";

type SlidePreviewProps = {
  htmlContent: string;
};

export function SlidePreview({ htmlContent }: SlidePreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useMermaid(htmlContent);

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Preview</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-8"
      >
        <div
          className="prose prose-invert max-w-none slide-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      <style>{`
        .slide-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .slide-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #e0e7ff;
        }
        .slide-content p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        .slide-content ul, .slide-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .slide-content li {
          margin-bottom: 0.5rem;
          color: #cbd5e1;
        }
        .slide-content pre {
          background: #1e293b;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .slide-content code {
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
        }
        .slide-content blockquote {
          border-left: 4px solid #818cf8;
          padding-left: 1rem;
          font-style: italic;
          color: #94a3b8;
          margin: 1.5rem 0;
        }
        .slide-content img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .slide-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .slide-content th, .slide-content td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem;
          text-align: left;
        }
        .slide-content th {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
