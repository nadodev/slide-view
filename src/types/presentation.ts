// Global type definitions for Presentation
export type PresentationMode = 'normal' | 'presenter' | 'focus';

export type PresentationState = {
    currentSlide: number;
    showSlideList: boolean;
    presenterMode: boolean;
    focusMode: boolean;
    highContrast: boolean;
    slideTransition: 'fade' | 'slide' | 'none';
};
