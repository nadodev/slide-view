// Central type definitions for the entire application
// All types should be imported from here to avoid duplication

// ============================================
// SLIDE TYPES
// ============================================
export interface Slide {
    id?: string;
    name: string;
    content: string;
    html: string;
    notes?: string[];
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
    _fileHandle?: any;
}

export interface SlideFile {
    id: string;
    name: string;
    content: string;
    fileHandle?: FileSystemFileHandle;
}

// ============================================
// PRESENTATION TYPES
// ============================================
export interface Presentation {
    id: string;
    title: string;
    slides: Slide[];
    currentSlide: number;
    theme?: PresentationTheme;
    settings?: PresentationSettings;
}

export interface PresentationTheme {
    primary: string;
    secondary: string;
    background: string;
    text: string;
}

export interface PresentationSettings {
    transition: 'fade' | 'slide' | 'none';
    autoAdvance: boolean;
    autoAdvanceDelay?: number;
    showNotes: boolean;
}

// ============================================
// REMOTE CONTROL TYPES
// ============================================
export interface RemoteSession {
    sessionId: string;
    isActive: boolean;
    connectedClients: number;
}

export interface RemoteCommand {
    type: 'next' | 'previous' | 'goto' | 'scroll';
    payload?: any;
}

// ============================================
// GITHUB TYPES
// ============================================
export interface GitHubUser {
    id: number;
    login: string;
    name: string;
    email: string;
    avatar_url: string;
}

export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    private: boolean;
    owner: GitHubUser;
    default_branch: string;
    updated_at: string;
    language?: string;
}

export interface GitHubAuthState {
    isAuthenticated: boolean;
    user: GitHubUser | null;
    token: string | null;
}

export interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
    branch: string;
    path: string;
}

export interface GitHubFile {
    name: string;
    content: string;
    sha?: string;
}

// ============================================
// EDITOR TYPES
// ============================================
export interface EditorState {
    content: string;
    cursorPosition: number;
    selection: {
        start: number;
        end: number;
    };
}

export interface MarkdownFile {
    id: string;
    name: string;
    content: string;
}

// ============================================
// EXPORT TYPES
// ============================================
export type ExportFormat = 'md' | 'html' | 'pdf' | 'txt' | 'xlsx';

export interface ExportOptions {
    format: ExportFormat;
    includeNotes?: boolean;
    theme?: string;
}
