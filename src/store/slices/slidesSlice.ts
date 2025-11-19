import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Slide } from '@/types';
import parseMarkdownSafe from '@/utils/markdown';

type SlidesState = {
    // State
    slides: Slide[];
    loading: boolean;
    error: string;
    warning: string;

    // Actions
    setSlides: (slides: Slide[]) => void;
    addSlide: (slide: Slide) => void;
    updateSlide: (index: number, slide: Partial<Slide>) => void;
    removeSlide: (index: number) => void;
    duplicateSlide: (index: number) => void;
    reorderSlides: (fromIndex: number, toIndex: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
    setWarning: (warning: string) => void;
    resetSlides: () => void;
};

const extractNotes = (text: string) => {
    const notes: string[] = [];
    if (!text) return { clean: '', notes };
    const cleaned = text.replace(
        /<!--\s*note:\s*([\s\S]*?)-->/gi,
        (_match, note) => {
            if (note && note.trim()) notes.push(note.trim());
            return '';
        },
    );
    return { clean: cleaned.trim(), notes };
};

export const useSlidesStore = create<SlidesState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                slides: [],
                loading: false,
                error: '',
                warning: '',

                // Actions
                setSlides: (slides) => set({ slides, error: '', warning: '' }),

                addSlide: (slide) => set((state) => ({
                    slides: [...state.slides, slide]
                })),

                updateSlide: (index, slideUpdate) => set((state) => {
                    const newSlides = [...state.slides];
                    if (newSlides[index]) {
                        newSlides[index] = { ...newSlides[index], ...slideUpdate };

                        // If content changed, update HTML
                        if (slideUpdate.content !== undefined) {
                            const { clean, notes } = extractNotes(slideUpdate.content);
                            newSlides[index].content = clean;
                            newSlides[index].notes = notes;
                            newSlides[index].html = parseMarkdownSafe(clean);
                        }
                    }
                    return { slides: newSlides };
                }),

                removeSlide: (index) => set((state) => ({
                    slides: state.slides.filter((_, i) => i !== index)
                })),

                duplicateSlide: (index) => set((state) => {
                    const slide = state.slides[index];
                    if (!slide) return state;

                    const duplicate: Slide = {
                        name: `${slide.name}-copia`,
                        content: slide.content,
                        notes: slide.notes ? [...slide.notes] : [],
                        html: slide.html,
                    };

                    const newSlides = [...state.slides];
                    newSlides.splice(index + 1, 0, duplicate);
                    return { slides: newSlides };
                }),

                reorderSlides: (fromIndex, toIndex) => set((state) => {
                    if (fromIndex === toIndex) return state;

                    const newSlides = [...state.slides];
                    const [movedSlide] = newSlides.splice(fromIndex, 1);
                    newSlides.splice(toIndex, 0, movedSlide);

                    return { slides: newSlides };
                }),

                setLoading: (loading) => set({ loading }),

                setError: (error) => set({ error, warning: '' }),

                setWarning: (warning) => set({ warning, error: '' }),

                resetSlides: () => set({
                    slides: [],
                    loading: false,
                    error: '',
                    warning: ''
                }),
            }),
            {
                name: 'slides-storage',
                partialize: (state) => ({ slides: state.slides }),
            }
        ),
        { name: 'SlidesStore' }
    )
);
