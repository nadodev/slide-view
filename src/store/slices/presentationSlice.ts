import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type PresentationState = {
    // State
    currentSlide: number;
    showSlideList: boolean;
    presenterMode: boolean;
    focusMode: boolean;
    highContrast: boolean;
    slideTransition: 'fade' | 'slide' | 'none';
    editing: boolean;
    draftContent: string;
    editorFocus: boolean;
    showHelp: boolean;

    // Actions
    setCurrentSlide: (index: number) => void;
    nextSlide: (maxSlides: number) => void;
    previousSlide: () => void;
    goToSlide: (index: number, maxSlides: number) => void;
    setShowSlideList: (show: boolean) => void;
    setPresenterMode: (mode: boolean) => void;
    togglePresenterMode: () => void;
    setFocusMode: (mode: boolean) => void;
    toggleFocusMode: () => void;
    setHighContrast: (contrast: boolean) => void;
    toggleHighContrast: () => void;
    setSlideTransition: (transition: 'fade' | 'slide' | 'none') => void;
    setEditing: (editing: boolean) => void;
    setDraftContent: (content: string) => void;
    setEditorFocus: (focus: boolean) => void;
    toggleEditorFocus: () => void;
    setShowHelp: (show: boolean) => void;
    toggleShowHelp: () => void;
    resetPresentation: () => void;
};

export const usePresentationStore = create<PresentationState>()(
    devtools(
        (set) => ({
            // Initial state
            currentSlide: 0,
            showSlideList: false,
            presenterMode: false,
            focusMode: false,
            highContrast: false,
            slideTransition: 'fade',
            editing: false,
            draftContent: '',
            editorFocus: false,
            showHelp: false,

            // Actions
            setCurrentSlide: (index) => set({ currentSlide: index }),

            nextSlide: (maxSlides) => set((state) => ({
                currentSlide: Math.min(state.currentSlide + 1, maxSlides - 1)
            })),

            previousSlide: () => set((state) => ({
                currentSlide: Math.max(state.currentSlide - 1, 0)
            })),

            goToSlide: (index, maxSlides) => set({
                currentSlide: Math.max(0, Math.min(index, maxSlides - 1))
            }),

            setShowSlideList: (show) => set({ showSlideList: show }),

            setPresenterMode: (mode) => set({ presenterMode: mode }),

            togglePresenterMode: () => set((state) => ({
                presenterMode: !state.presenterMode
            })),

            setFocusMode: (mode) => set({ focusMode: mode }),

            toggleFocusMode: () => set((state) => ({
                focusMode: !state.focusMode
            })),

            setHighContrast: (contrast) => set({ highContrast: contrast }),

            toggleHighContrast: () => set((state) => ({
                highContrast: !state.highContrast
            })),

            setSlideTransition: (transition) => set({ slideTransition: transition }),

            setEditing: (editing) => set({ editing }),

            setDraftContent: (content) => set({ draftContent: content }),

            setEditorFocus: (focus) => set({ editorFocus: focus }),

            toggleEditorFocus: () => set((state) => ({
                editorFocus: !state.editorFocus
            })),

            setShowHelp: (show) => set({ showHelp: show }),

            toggleShowHelp: () => set((state) => ({
                showHelp: !state.showHelp
            })),

            resetPresentation: () => set({
                currentSlide: 0,
                showSlideList: false,
                presenterMode: false,
                focusMode: false,
                editing: false,
                draftContent: '',
                showHelp: false,
            }),
        }),
        { name: 'PresentationStore' }
    )
);
