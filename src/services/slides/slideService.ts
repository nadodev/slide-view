import { Slide } from "@/types";
import parseMarkdownSafe from "@/utils/markdown";

const DELIMITER_FALLBACK = "----'----";

/**
 * Extract notes from markdown content
 */
export function extractNotes(text: string): { clean: string; notes: string[] } {
    const notes: string[] = [];
    if (!text) return { clean: "", notes };

    const cleaned = text.replace(
        /<!--\s*note:\s*([\s\S]*?)-->/gi,
        (_match, note) => {
            if (note && note.trim()) notes.push(note.trim());
            return "";
        },
    );

    return { clean: cleaned.trim(), notes };
}

/**
 * Parse markdown files into slides
 */
export async function parseMarkdownFiles(
    files: File[],
    options: { splitSingle?: boolean; delimiter?: string } = {}
): Promise<Slide[]> {
    if (files.length === 0) return [];

    // Single file with split option
    if (files.length === 1 && options.splitSingle) {
        const file = files[0];
        const raw = await file.text();
        const marker = (options.delimiter || DELIMITER_FALLBACK).trim();
        const esc = (value: string) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const lineRegex = new RegExp("^\\s*" + esc(marker) + "\\s*$", "gm");

        let slidesParts = raw
            .split(lineRegex)
            .map((part) => part.trim())
            .filter(Boolean);

        if (slidesParts.length <= 1) {
            const altRegex = new RegExp(
                "\\r?\\n\\s*" + esc(marker) + "\\s*\\r?\\n",
            );
            slidesParts = raw
                .split(altRegex)
                .map((part) => part.trim())
                .filter(Boolean);
        }

        if (slidesParts.length <= 1) {
            throw new Error(
                "Marcador não encontrado — nenhum slide foi carregado. Verifique o marcador ou desmarque a opção de dividir.",
            );
        }

        return slidesParts.map((content, index) => {
            const { clean, notes } = extractNotes(content);
            return {
                name: `${file.name.replace(".md", "")}-${index + 1}`,
                content: clean,
                notes,
                html: parseMarkdownSafe(clean),
            };
        });
    }

    // Multiple files
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

    return Promise.all(
        sortedFiles.map(async (file) => {
            const raw = await file.text();
            const { clean, notes } = extractNotes(raw);
            return {
                name: file.name.replace(".md", ""),
                content: clean,
                notes,
                html: parseMarkdownSafe(clean),
            };
        }),
    );
}

/**
 * Export slides as combined markdown
 */
export function exportSlidesAsMarkdown(slides: Slide[]): string {
    if (slides.length === 0) return "";
    return slides
        .map((slide) => slide.content || "")
        .join(`\n\n${DELIMITER_FALLBACK}\n\n`);
}

/**
 * Save content to file using File System Access API or fallback to download
 */
export async function saveToFile(
    content: string,
    suggestedName: string,
    type: "markdown" | "text" | "html" = "markdown"
): Promise<void> {
    const mimeTypes = {
        markdown: "text/markdown",
        text: "text/plain",
        html: "text/html",
    };

    const extensions = {
        markdown: ".md",
        text: ".txt",
        html: ".html",
    };

    const supportsFS =
        typeof window !== "undefined" && "showSaveFilePicker" in window;

    if (supportsFS) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName,
                types: [
                    {
                        description: type === "markdown" ? "Markdown" : type === "html" ? "HTML" : "Text",
                        accept: { [mimeTypes[type]]: [extensions[type]] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (err) {
            if ((err as Error).name === "AbortError") {
                // User cancelled
                return;
            }
            throw err;
        }
    } else {
        // Fallback to download
        const blob = new Blob([content], { type: mimeTypes[type] });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = suggestedName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }
}

/**
 * Update file handle for a slide (for File System Access API)
 */
export async function updateSlideFileHandle(
    slide: Slide,
    content: string
): Promise<any> {
    const supportsFS =
        typeof window !== "undefined" && "showSaveFilePicker" in window;

    if (!supportsFS) {
        throw new Error("File System Access API not supported");
    }

    let handle = slide._fileHandle;

    if (!handle) {
        handle = await (window as any).showSaveFilePicker({
            suggestedName: slide.name?.endsWith(".md")
                ? slide.name
                : `${slide.name || "slide"}.md`,
            types: [
                { description: "Markdown", accept: { "text/markdown": [".md"] } },
                { description: "Text", accept: { "text/plain": [".txt"] } },
            ],
        });
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    return handle;
}
