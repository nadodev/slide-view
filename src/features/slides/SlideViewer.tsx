import type { RefObject } from "react";
import { useMermaid } from "@/hooks/useMermaid";

type SlideViewerProps = {
  html?: string;
  slideContainerRef?: RefObject<HTMLElement | null>;
  slideContentRef?: RefObject<HTMLElement | null>;
};

export default function SlideViewer({
  html = "",
  slideContainerRef,
  slideContentRef,
}: SlideViewerProps) {
  useMermaid(html);

  return (
    <div
      ref={slideContainerRef as any}
      className="w-full h-full rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col"
    >
      <div
        ref={slideContentRef as any}
        className="flex-1 overflow-y-scroll p-8 md:p-12 lg:p-16 custom-scroll"
        style={{ maxHeight: "100%" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <style jsx global>{`
        /* Scrollbar customizada para o conteúdo */
        .custom-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 5px;
          margin: 8px 0;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 5px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        /* Estilos para o conteúdo Markdown renderizado */
        .custom-scroll {
          color: #f3f4f6;
        }

        /* Títulos */
        .custom-scroll h1 {
          font-size: clamp(1.75rem, 3.5vw, 2.6rem) !important;
          font-weight: 800 !important;
          color: #ffffff !important;
          margin-bottom: 1.5rem !important;
          margin-top: 0 !important;
          line-height: 1.15 !important;
          letter-spacing: -0.01em !important;
        }

        .custom-scroll h2 {
          font-size: clamp(1.5rem, 2.7vw, 2.1rem) !important;
          font-weight: 700 !important;
          color: #f9fafb !important;
          margin-bottom: 1.25rem !important;
          margin-top: 2.5rem !important;
          line-height: 1.25 !important;
        }

        .custom-scroll h3 {
          font-size: clamp(1.35rem, 2.1vw, 1.7rem) !important;
          font-weight: 600 !important;
          color: #e5e7eb !important;
          margin-bottom: 1rem !important;
          margin-top: 2rem !important;
          line-height: 1.3 !important;
        }

        .custom-scroll h4 {
          font-size: 1.35rem !important;
          font-weight: 600 !important;
          color: #d1d5db !important;
          margin-bottom: 0.85rem !important;
          margin-top: 1.75rem !important;
        }

        .custom-scroll h5 {
          font-size: 1.2rem !important;
          font-weight: 600 !important;
          color: #d1d5db !important;
          margin-bottom: 0.65rem !important;
          margin-top: 1.4rem !important;
        }

        .custom-scroll h6 {
          font-size: 1.05rem !important;
          font-weight: 600 !important;
          color: #9ca3af !important;
          margin-bottom: 0.6rem !important;
          margin-top: 1.3rem !important;
        }

        .custom-scroll h1:first-child,
        .custom-scroll h2:first-child,
        .custom-scroll h3:first-child,
        .custom-scroll h4:first-child,
        .custom-scroll h5:first-child,
        .custom-scroll h6:first-child {
          margin-top: 0;
        }

        /* Parágrafos */
        .custom-scroll p {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #d1d5db;
          margin-bottom: 1.25rem;
        }

        /* Links */
        .custom-scroll a {
          color: #60a5fa !important;
          text-decoration: underline !important;
          text-decoration-color: rgba(96, 165, 250, 0.3) !important;
          text-underline-offset: 3px !important;
          transition: all 0.2s !important;
        }

        .custom-scroll a:hover {
          color: #93c5fd !important;
          text-decoration-color: rgba(147, 197, 253, 0.6) !important;
        }

        /* Listas */
        .custom-scroll ul,
        .custom-scroll ol {
          margin-bottom: 2rem;
          padding-left: 2.5rem;
          color: #d1d5db;
        }

        .custom-scroll ul {
          list-style-type: disc;
        }

        .custom-scroll ol {
          list-style-type: decimal;
        }

        .custom-scroll li {
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .custom-scroll li::marker {
          color: #60a5fa !important;
        }

        /* Listas aninhadas */
        .custom-scroll ul ul,
        .custom-scroll ol ul,
        .custom-scroll ul ol,
        .custom-scroll ol ol {
          margin-top: 0.75rem !important;
          margin-bottom: 0.75rem !important;
        }

        /* Código inline */
        .custom-scroll code {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #93c5fd !important;
          padding: 0.25rem 0.5rem !important;
          border-radius: 0.375rem !important;
          font-size: 0.95em !important;
          font-family: "Consolas", "Monaco", "Courier New", monospace !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
        }

        /* Blocos de código */
        .custom-scroll pre {
          background-color: #1f2937;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        .custom-scroll pre code {
          background-color: transparent;
          color: #e5e7eb;
          padding: 0;
          border: none;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Citações */
        .custom-scroll blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          color: #9ca3af;
          font-style: italic;
          background-color: rgba(59, 130, 246, 0.05);
          padding: 1.25rem 1.5rem;
          border-radius: 0.5rem;
        }

        .custom-scroll blockquote p {
          margin-bottom: 0.5rem;
        }

        .custom-scroll blockquote p:last-child {
          margin-bottom: 0;
        }

        /* Linha horizontal */
        .custom-scroll hr {
          border: none;
          border-top: 2px solid #374151;
          margin: 2.5rem 0;
        }

        /* Tabelas */
        .custom-scroll table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
          background-color: #1f2937;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .custom-scroll thead {
          background-color: #374151;
        }

        .custom-scroll th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #f9fafb;
          border-bottom: 2px solid #4b5563;
        }

        .custom-scroll td {
          padding: 0.875rem 1rem;
          color: #d1d5db;
          border-bottom: 1px solid #374151;
        }

        .custom-scroll tbody tr:hover {
          background-color: rgba(55, 65, 81, 0.5);
        }

        /* Imagens */
        .custom-scroll img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        /* Ênfase */
        .custom-scroll strong,
        .custom-scroll b {
          font-weight: 700 !important;
          color: #ffffff !important;
        }

        .custom-scroll em,
        .custom-scroll i {
          font-style: italic !important;
          color: #e5e7eb !important;
        }

        /* Texto riscado */
        .custom-scroll del,
        .custom-scroll s {
          text-decoration: line-through;
          color: #9ca3af;
        }

        /* Espaçamento entre elementos adjacentes */
        .custom-scroll > *:last-child {
          margin-bottom: 0;
        }

        /* Estilos para Mermaid */
        .custom-scroll .mermaid-container {
          margin: 2rem 0;
          padding: 1.5rem;
          background-color: #1e293b;
          border-radius: 0.75rem;
          border: 1px solid #334155;
          overflow-x: auto;
        }

        .custom-scroll .mermaid {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .custom-scroll .mermaid svg {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
