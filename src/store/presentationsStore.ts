import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Slide } from '@/types';

export interface Presentation {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    slides: Slide[];
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    isFavorite?: boolean;
}

interface PresentationsState {
    presentations: Presentation[];
    currentPresentationId: string | null;

    // Actions
    addPresentation: (presentation: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>) => Presentation;
    updatePresentation: (id: string, updates: Partial<Presentation>) => void;
    deletePresentation: (id: string) => void;
    setCurrentPresentation: (id: string | null) => void;
    getCurrentPresentation: () => Presentation | null;
    getPresentation: (id: string) => Presentation | null;
    toggleFavorite: (id: string) => void;
    duplicatePresentation: (id: string) => void;
}

export const usePresentationsStore = create<PresentationsState>()(
    persist(
        (set, get) => ({
            presentations: [],
            currentPresentationId: null,

            addPresentation: (presentation) => {
                const newPresentation: Presentation = {
                    ...presentation,
                    id: `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set((state) => ({
                    presentations: [newPresentation, ...state.presentations],
                    currentPresentationId: newPresentation.id,
                }));

                return newPresentation;
            },

            updatePresentation: (id, updates) => {
                set((state) => ({
                    presentations: state.presentations.map((p) =>
                        p.id === id
                            ? { ...p, ...updates, updatedAt: new Date() }
                            : p
                    ),
                }));
            },

            deletePresentation: (id) => {
                set((state) => ({
                    presentations: state.presentations.filter((p) => p.id !== id),
                    currentPresentationId:
                        state.currentPresentationId === id ? null : state.currentPresentationId,
                }));
            },

            setCurrentPresentation: (id) => {
                set({ currentPresentationId: id });
            },

            getCurrentPresentation: () => {
                const state = get();
                return (
                    state.presentations.find((p) => p.id === state.currentPresentationId) || null
                );
            },

            getPresentation: (id) => {
                const state = get();
                return state.presentations.find((p) => p.id === id) || null;
            },

            toggleFavorite: (id) => {
                set((state) => ({
                    presentations: state.presentations.map((p) =>
                        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
                    ),
                }));
            },

            duplicatePresentation: (id) => {
                const state = get();
                const original = state.presentations.find((p) => p.id === id);
                if (!original) return;

                const duplicate: Presentation = {
                    ...original,
                    id: `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: `${original.title} (cópia)`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                set((state) => ({
                    presentations: [duplicate, ...state.presentations],
                }));
            },
        }),
        {
            name: 'presentations-storage',
        }
    )
);
