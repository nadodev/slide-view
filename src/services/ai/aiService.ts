import { Slide } from "@/types";
import { createSlideFromMarkdown, generateSlidesWithGemini } from "@/utils/gemini";
import parseMarkdownSafe from "@/utils/markdown";

/**
 * Generate slides using Gemini AI
 */
export async function generateSlides(
    prompt: string,
    slideCount: number = 6,
    baseText?: string
): Promise<Slide[]> {
    const generatedSlides = await generateSlidesWithGemini(
        prompt,
        slideCount,
        baseText,
    );

    const newSlides = generatedSlides.map((markdown, index) =>
        createSlideFromMarkdown(markdown, index),
    );

    return newSlides.map((slide) => ({
        ...slide,
        html: parseMarkdownSafe(slide.content || ""),
    }));
}
