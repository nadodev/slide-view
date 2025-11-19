// Global type definitions for Slides
export type Slide = {
    name: string;
    content: string;
    notes?: string[];
    html: string;
    _fileHandle?: any; // FileSystemFileHandle for File System Access API
};

export type SlideTransition = 'fade' | 'slide' | 'none';

export type UploadOptions = {
    splitSingle?: boolean;
    delimiter?: string;
    error?: string;
};
