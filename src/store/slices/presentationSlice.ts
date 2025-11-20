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
    setCurrentSlide: (updater: number | ((prev: number) => number)) => void;
    nextSlide: (maxSlides: number) => void;
    previousSlide: () => void;
    goToSlide: (index: number, maxSlides: number) => void;
    setShowSlideList: (updater: boolean | ((prev: boolean) => boolean)) => void;
    setPresenterMode: (updater: boolean | ((prev: boolean) => boolean)) => void;
    togglePresenterMode: () => void;
    setFocusMode: (updater: boolean | ((prev: boolean) => boolean)) => void;
    toggleFocusMode: () => void;
    setHighContrast: (updater: boolean | ((prev: boolean) => boolean)) => void;
    toggleHighContrast: () => void;
    setSlideTransition: (transition: string) => void;
    setEditing: (updater: boolean | ((prev: boolean) => boolean)) => void;
    setDraftContent: (content: string) => void;
    setEditorFocus: (updater: boolean | ((prev: boolean) => boolean)) => void;
    toggleEditorFocus: () => void;
    setShowHelp: (updater: boolean | ((prev: boolean) => boolean)) => void;
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
            setCurrentSlide: (updater) => set((state) => ({
                currentSlide: typeof updater === 'function' ? updater(state.currentSlide) : updater
            })),

            nextSlide: (maxSlides) => set((state) => ({
                currentSlide: Math.min(state.currentSlide + 1, maxSlides - 1)
            })),

            previousSlide: () => set((state) => ({
                currentSlide: Math.max(state.currentSlide - 1, 0)
            })),

            goToSlide: (index, maxSlides) => set({
                currentSlide: Math.max(0, Math.min(index, maxSlides - 1))
            }),

            setShowSlideList: (updater) => set((state) => ({
                showSlideList: typeof updater === 'function' ? updater(state.showSlideList) : updater
            })),

            setPresenterMode: (updater) => set((state) => ({
                presenterMode: typeof updater === 'function' ? updater(state.presenterMode) : updater
            })),

            togglePresenterMode: () => set((state) => ({
                presenterMode: !state.presenterMode
            })),

            setFocusMode: (updater) => set((state) => ({
                focusMode: typeof updater === 'function' ? updater(state.focusMode) : updater
            })),

            toggleFocusMode: () => set((state) => ({
                focusMode: !state.focusMode
            })),

            setHighContrast: (updater) => set((state) => ({
                highContrast: typeof updater === 'function' ? updater(state.highContrast) : updater
            })),

            toggleHighContrast: () => set((state) => ({
                highContrast: !state.highContrast
            })),

            setSlideTransition: (transition) => set({
                slideTransition: transition as 'fade' | 'slide' | 'none'
            }),

            setEditing: (updater) => set((state) => ({
                editing: typeof updater === 'function' ? updater(state.editing) : updater
            })),

            setDraftContent: (content) => set({ draftContent: content }),

            setEditorFocus: (updater) => set((state) => ({
                editorFocus: typeof updater === 'function' ? updater(state.editorFocus) : updater
            })),

            toggleEditorFocus: () => set((state) => ({
                editorFocus: !state.editorFocus
            })),

            setShowHelp: (updater) => set((state) => ({
                showHelp: typeof updater === 'function' ? updater(state.showHelp) : updater
            })),

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
