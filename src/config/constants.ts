// Application constants
// Central constants for the entire application
// All magic numbers and strings should be defined here

// ============================================
// APP CONSTANTS
// ============================================
export const APP_NAME = 'SlideView';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Create beautiful presentations with Markdown';

// ============================================
// TIMING CONSTANTS
// ============================================
export const DEBOUNCE_DELAY = 300;
export const AUTOSAVE_DELAY = 2000;
export const TOAST_DURATION = 3000;
export const ANIMATION_DURATION = 200;
export const NAVIGATION_DELAY = 120;

// ============================================
// UI CONSTANTS
// ============================================
export const HEADER_HEIGHT = 80;
export const SIDEBAR_WIDTH = 280;
export const SLIDE_MAX_WIDTH = 1200;
export const THUMBNAIL_SIZE = 150;

// ============================================
// EDITOR CONSTANTS
// ============================================
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = ['.md', '.markdown'];
export const DEFAULT_SLIDE_CONTENT = '# Novo Slide\n\nConteúdo aqui...';

// ============================================
// PRESENTATION CONSTANTS
// ============================================
export const SLIDE_TRANSITIONS = ['fade', 'slide', 'none'] as const;
export const DEFAULT_TRANSITION = 'fade';
export const MAX_SLIDES_PER_PRESENTATION = 100;

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
    SLIDES: 'slideview_slides',
    THEME: 'slideview_theme',
    SETTINGS: 'slideview_settings',
    GITHUB_TOKEN: 'slideview_github_token',
    LAST_PRESENTATION: 'slideview_last_presentation',
} as const;

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
    GITHUB_AUTH: '/api/github/auth',
    GITHUB_REPOS: '/api/github/repos',
    AI_GENERATE: '/api/ai/generate',
} as const;

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
export const SHORTCUTS = {
    SAVE: 'Ctrl+S',
    BOLD: 'Ctrl+B',
    ITALIC: 'Ctrl+I',
    HEADING_1: 'Ctrl+1',
    HEADING_2: 'Ctrl+2',
    LIST: 'Ctrl+U',
    LINK: 'Ctrl+L',
    NEXT_SLIDE: 'ArrowRight',
    PREV_SLIDE: 'ArrowLeft',
    FIRST_SLIDE: 'Home',
    LAST_SLIDE: 'End',
    FULLSCREEN: 'F11',
    PRESENTER_MODE: 'P',
    FOCUS_MODE: 'F',
} as const;
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Socket.io
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// GitHub OAuth
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

// AI Configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const DEFAULT_SLIDE_COUNT = 6;
