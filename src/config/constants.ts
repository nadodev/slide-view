// Application constants
export const APP_NAME = 'SlideView';
export const APP_VERSION = '1.0.0';

// Slide constants
export const MAX_SLIDES = 100;
export const DEFAULT_SLIDE_TRANSITION = 'fade';
export const SLIDE_DELIMITER = "----'----";

// Storage keys
export const STORAGE_KEYS = {
    SLIDES: 'slides-storage',
    HIGH_CONTRAST: 'presentation-high-contrast',
    THEME: 'app-theme',
} as const;

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Socket.io
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// GitHub OAuth
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

// AI Configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const DEFAULT_SLIDE_COUNT = 6;
