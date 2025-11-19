import { useEffect, useState, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.min.css";
import { useMermaid } from "@/hooks/useMermaid";

type PresenterViewProps = {
  currentHtml?: string;
  currentIndex: number;
  slidesLength: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
};

export default function PresenterView({
  currentHtml = "",
  currentIndex,
  slidesLength,
  onNext,
  onPrev,
  onExit,
  scrollContainerRef,
}: PresenterViewProps) {
  useMermaid(currentHtml);
  const [clockNow, setClockNow] = useState(() => new Date());
  const internalScrollRef = useRef<HTMLDivElement>(null);

  const scrollRef = scrollContainerRef || internalScrollRef;

  useEffect(() => {
    const t = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      document
        .querySelectorAll(".slide-content pre code")
        .forEach((b: Element) => hljs.highlightElement(b as HTMLElement));
    }, 100);
    return () => clearTimeout(timer);
  }, [currentHtml]);

  const progress = ((currentIndex + 1) / slidesLength) * 100;

  return (
    <div className="fixed inset-0 bg-linear-to-br from-gray-950 via-gray-900 to-black flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-white/5 to-transparent">
        <div
          className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out shadow-lg shadow-purple-500/50"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-linear-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-8 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="font-mono tracking-wide">
              {clockNow.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="font-semibold">
            Slide {currentIndex + 1} <span className="text-white/40">de</span>{" "}
            {slidesLength}
          </span>
        </div>

        <button
          onClick={onExit}
          className="text-white/50 hover:text-white text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
        >
          <span>Pressione</span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
            ESC
          </kbd>
          <span>para sair</span>
        </button>
      </div>

      <div className="flex-1 px-20 py-24 flex items-start justify-center min-h-0">
        <div
          ref={scrollRef}
          className="w-full max-w-6xl h-full overflow-y-auto custom-scrollbar py-4"
        >
          <div
            className="slide-content animate-fadeIn"
            dangerouslySetInnerHTML={{ __html: currentHtml }}
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-10 bg-linear-to-t from-black/40 via-black/20 to-transparent backdrop-blur-sm opacity-0 hover:opacity-100 transition-all duration-500">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 shadow-2xl">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="text-white/80 text-sm font-mono font-semibold">
              {currentIndex + 1} / {slidesLength}
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={currentIndex >= slidesLength - 1}
            className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .slide-content {
          color: #f3f4f6;
          line-height: 1.75;
        }

        .slide-content h1 {
          color: #ffffff;
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 2.5rem 0;
          line-height: 1.1;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1);
        }

        .slide-content h2 {
          color: #e0e7ff;
          font-size: 2.25rem;
          font-weight: 700;
          margin: 3rem 0 2rem 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 15px rgba(224, 231, 255, 0.4);
        }

        .slide-content h3 {
          color: #e0e7ff;
          font-size: 2rem;
          font-weight: 600;
          margin: 2.5rem 0 1.5rem 0;
          line-height: 1.3;
        }

        .slide-content h4 {
          color: #c7d2fe;
          font-size: 2rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
        }

        .slide-content p {
          font-size: 1.75rem;
          line-height: 1.8;
          margin: 0 0 1.75rem 0;
          color: #e5e7eb;
          font-weight: 400;
        }

        .slide-content ul, .slide-content ol {
          font-size: 1.75rem;
          margin: 0 0 2rem 0;
          padding-left: 2.5rem;
          color: #e5e7eb;
        }

        .slide-content li {
          margin-bottom: 1.25rem;
          line-height: 1.7;
          position: relative;
        }

        .slide-content ul li::marker {
          color: #818cf8;
          font-size: 1.2em;
        }

        .slide-content ol li::marker {
          color: #818cf8;
          font-weight: 700;
        }

        .slide-content strong {
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .slide-content em {
          color: #a78bfa;
          font-style: italic;
          font-weight: 500;
        }

        .slide-content code {
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%);
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.9em;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          color: #c7d2fe;
          border: 1px solid rgba(129, 140, 248, 0.2);
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .slide-content pre {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%) !important;
          padding: 2.5rem !important;
          border-radius: 1rem !important;
          margin: 2.5rem 0 !important;
          border: 1px solid rgba(129, 140, 248, 0.2);
          box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
          position: relative;
          overflow-x: auto;
        }

        .slide-content pre::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #818cf8 100%);
          border-radius: 1rem 1rem 0 0;
        }

        .slide-content pre code {
          background: transparent !important;
          padding: 0 !important;
          font-size: 1.25rem !important;
          color: inherit !important;
          line-height: 1.7 !important;
          border: none !important;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace !important;
        }

        .slide-content a {
          color: #818cf8;
          text-decoration: none;
          border-bottom: 2px solid rgba(129, 140, 248, 0.3);
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .slide-content a:hover {
          color: #a78bfa;
          border-bottom-color: #a78bfa;
          text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
        }

        .slide-content blockquote {
          border-left: 4px solid #818cf8;
          padding-left: 2rem;
          margin: 2.5rem 0;
          color: #d1d5db;
          font-style: italic;
          font-size: 1.5rem;
          background: rgba(129, 140, 248, 0.05);
          padding: 1.5rem 2rem;
          border-radius: 0 0.75rem 0.75rem 0;
        }

        .slide-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(129, 140, 248, 0.5) 50%, transparent 100%);
          margin: 4rem 0;
        }

        .slide-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .slide-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2rem 0;
          font-size: 1.25rem;
        }

        .slide-content th {
          background: rgba(129, 140, 248, 0.15);
          color: #e0e7ff;
          padding: 1rem 1.5rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #818cf8;
        }

        .slide-content td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #e5e7eb;
        }

        .slide-content tr:hover {
          background: rgba(129, 140, 248, 0.05);
        }

        /* Scrollbar customizado elegante */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(129, 140, 248, 0.3) transparent;
          scroll-behavior: smooth;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(129, 140, 248, 0.2);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(129, 140, 248, 0.4);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}
