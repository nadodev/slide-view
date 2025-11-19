import { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import type { FileUploaderProps } from './types';

export function FileUploader({
    onFilesChange,
    loading,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    uploadProgress,
}: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const openFilePicker = () => {
        if (inputRef.current) inputRef.current.click();
    };

    return (
        <div
            className={`relative transition-all duration-300 ease-out ${isDragging
                    ? "bg-violet-500/10 border-4 border-dashed border-violet-400 rounded-2xl m-4 scale-[1.01] shadow-2xl shadow-violet-500/20"
                    : "bg-gradient-to-br from-slate-800/40 to-slate-900/40"
                }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {isDragging && (
                <div
                    className="absolute inset-4 rounded-2xl bg-violet-500/5 border-2 border-dashed border-violet-300/50 flex items-center justify-center z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                        backgroundImage: `
              linear-gradient(45deg, rgba(139, 92, 246, 0.1) 25%, transparent 25%), 
              linear-gradient(-45deg, rgba(139, 92, 246, 0.1) 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, rgba(139, 92, 246, 0.1) 75%), 
              linear-gradient(-45deg, transparent 75%, rgba(139, 92, 246, 0.1) 75%)
            `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    }}
                >
                    <div className="text-center space-y-4 bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-violet-400/30">
                        <div className="text-5xl animate-bounce">📁</div>
                        <p className="text-violet-300 font-bold text-xl">
                            ✨ Solte seus arquivos .md aqui
                        </p>
                        <p className="text-violet-400/80 text-sm max-w-xs">
                            Arquivos Markdown serão processados automaticamente e convertidos em slides
                        </p>
                        <div className="flex items-center justify-center gap-2 text-violet-400/60 text-xs">
                            <span>🔄</span>
                            <span>Suporta múltiplos arquivos</span>
                        </div>
                    </div>
                </div>
            )}

            <label className={`block p-12 md:p-16 cursor-pointer ${isDragging ? 'opacity-30' : ''}`}>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".md"
                    onChange={onFilesChange}
                    aria-label="Selecionar arquivos markdown"
                    className="hidden"
                    disabled={loading}
                />

                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* Icon with animation */}
                    <div
                        className={`transition-all duration-500 ${isDragging ? "scale-110 rotate-6" : "scale-100 rotate-0"
                            }`}
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 p-7 md:p-8 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                                <Upload size={44} className="text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-3">
                        <p className="text-xl md:text-2xl font-bold text-slate-100">
                            {isDragging ? "✨ Solte os arquivos aqui" : "Arraste seus arquivos .md"}
                        </p>
                        <div className="flex items-center gap-3 max-w-xs mx-auto">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                            <p className="text-slate-500 font-medium text-sm">ou</p>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                        </div>
                    </div>

                    {/* Button */}
                    <Button
                        type="button"
                        onClick={openFilePicker}
                        disabled={loading}
                        size="lg"
                        className="group relative px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-cyan-600 hover:via-fuchsia-600 hover:to-violet-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-violet-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden border-0"
                    >
                        <FileText size={22} />
                        {loading ? "Processando..." : "Selecionar Arquivos"}
                    </Button>

                    {/* Progress Bar */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full max-w-md space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-slate-400 text-center">
                                Processando arquivos... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <p className="text-xs md:text-sm text-emerald-300 font-medium">
                            Suporta múltiplos arquivos .md
                        </p>
                    </div>
                </div>
            </label>
        </div>
    );
}
