import React, { useRef, useEffect } from "react";

type MarkdownEditorProps = {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    lineNumbersRef: React.RefObject<HTMLDivElement | null>;
    lineCount: number;
};

export function MarkdownEditor({
    value,
    onChange,
    onKeyDown,
    onScroll,
    textareaRef,
    lineNumbersRef,
    lineCount
}: MarkdownEditorProps) {

    useEffect(() => {
        const textarea = textareaRef.current;
        const lineNumbers = lineNumbersRef.current;

        if (!textarea || !lineNumbers) return;

        const syncScroll = () => {
            lineNumbers.scrollTop = textarea.scrollTop;
        };

        textarea.addEventListener('scroll', syncScroll);
        return () => textarea.removeEventListener('scroll', syncScroll);
    }, [textareaRef, lineNumbersRef]);

    return (
        <div className="relative w-full h-full flex bg-[#0d1117] font-mono text-sm">
            <div
                ref={lineNumbersRef}
                className="w-12 shrink-0 bg-[#0d1117] border-r border-white/5 text-right pr-3 py-4 select-none overflow-hidden text-zinc-600"
            >
                {Array.from({ length: lineCount }).map((_, i) => (
                    <div key={i} className="leading-6 text-xs">
                        {i + 1}
                    </div>
                ))}
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onScroll={onScroll}
                className="flex-1 w-full h-full bg-transparent text-zinc-300 p-4 resize-none focus:outline-none leading-6 custom-scrollbar"
                spellCheck={false}
                placeholder="Comece a digitar seus slides em Markdown..."
            />
        </div>
    );
}
