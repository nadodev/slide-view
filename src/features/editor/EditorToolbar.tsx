import React from "react";
import {
    Bold, Italic, Heading1, Heading2, List, Code, Table, Image, Quote, Link2, Minimize2, HelpCircle,
    Download, GitBranch, Upload, Sparkles, Type, Save, X
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type EditorToolbarProps = {
    onFormat: (before: string, after?: string, placeholder?: string) => void;
    onInsertTemplate: (template: string) => void;
    onShowTemplates: () => void;
    onShowHelp: () => void;
    onShowExport: () => void;
    onShowGitHub: () => void;
    onSave: () => void;
    onCancel: () => void;
};

export function EditorToolbar({
    onFormat,
    onInsertTemplate,
    onShowTemplates,
    onShowHelp,
    onShowExport,
    onShowGitHub,
    onSave,
    onCancel
}: EditorToolbarProps) {
    return (
        <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('**', '**')}
                    title="Negrito (Ctrl+B)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('*', '*')}
                    title="Itálico (Ctrl+I)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('# ', '', 'Título 1')}
                    title="Título 1 (Ctrl+1)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('## ', '', 'Título 2')}
                    title="Título 2 (Ctrl+2)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('- ', '')}
                    title="Lista (Ctrl+U)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('```\n', '\n```', '// código')}
                    title="Código"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Code className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('| Coluna 1 | Coluna 2 |\n|---|---|\n| Dado 1 | Dado 2 |', '')}
                    title="Tabela"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Table className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('![Descrição](', ')', 'url')}
                    title="Imagem"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Image className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('> ', '')}
                    title="Citação"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('[', '](url)', 'Texto')}
                    title="Link (Ctrl+L)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Link2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFormat('---\n', '')}
                    title="Divisor (Ctrl+H)"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Minimize2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShowTemplates}
                    title="Templates"
                    className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                    <Sparkles className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShowGitHub}
                    title="GitHub Integration"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <GitBranch className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShowExport}
                    title="Exportar"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <Download className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShowHelp}
                    title="Ajuda"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="h-8 px-3 text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white border-0"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                </Button>
            </div>
        </div>
    );
}
