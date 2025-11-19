// Types for UploadArea components
export interface UploadAreaProps {
    onFilesChange?: (
        e: React.ChangeEvent<HTMLInputElement> | null,
        options?: any
    ) => void;
    onAIGenerate?: (prompt: string, slideCount: number, baseText?: string) => void;
    onCreateSlide?: () => void;
    loading?: boolean;
}

export interface FileUploaderProps {
    onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    isDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    uploadProgress: number;
}

export interface AIGeneratorProps {
    onGenerate: (prompt: string, slideCount: number, baseText?: string) => void;
    loading?: boolean;
}

export interface UploadOptionsProps {
    splitSingle: boolean;
    delimiter: string;
    onSplitChange: (value: boolean) => void;
    onDelimiterChange: (value: string) => void;
}
