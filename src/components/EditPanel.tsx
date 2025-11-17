import React, { useEffect, useRef, useState, useMemo } from "react";
import { Maximize2, Minimize2, Eye, EyeOff, X, Save, Plus, FileText, Trash2, Sparkles, Type, List, Code, Table, Image, Quote, Bold, Italic, Heading1, Heading2, Link2, HelpCircle, Download } from "lucide-react";
import parseMarkdownSafe from "../utils/markdown";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable";
import { Button } from "./ui/button";
import { useMermaid } from "../hooks/useMermaid";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

type MarkdownFile = {
  id: string;
  name: string;
  content: string;
};

type EditPanelProps = {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
  editorFocus?: boolean;
  onToggleEditorFocus?: () => void;
  mode?: 'edit' | 'create'; // 'edit' para editar slide, 'create' para criar arquivos .md
  onCreateFiles?: (files: MarkdownFile[]) => void; // Callback quando criar arquivos
};

export default function EditPanel({
  open,
  value,
  onChange,
  onCancel,
  onSave,
  editorFocus = false,
  onToggleEditorFocus,
  mode = 'edit',
  onCreateFiles,
}: EditPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const lineNumbersRef1 = useRef<HTMLDivElement | null>(null);
  const lineNumbersRef2 = useRef<HTMLDivElement | null>(null);
  const lineNumbersRef3 = useRef<HTMLDivElement | null>(null);

  const [internalFocus, setInternalFocus] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const focusOn = onToggleEditorFocus ? editorFocus : internalFocus;
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement | null>(null);
  
  // Estado para modo de criação de múltiplos arquivos
  const [mdFiles, setMdFiles] = useState<MarkdownFile[]>([
    { id: '1', name: 'slide-1.md', content: '' }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');

  // Templates pré-definidos
  const templates = [
    {
      id: 'title',
      name: 'Título',
      icon: Type,
      content: '# Título Principal\n\n',
      description: 'Título grande (H1)'
    },
    {
      id: 'subtitle',
      name: 'Subtítulo',
      icon: Type,
      content: '## Subtítulo\n\n',
      description: 'Subtítulo (H2)'
    },
    {
      id: 'description',
      name: 'Descrição',
      icon: FileText,
      content: 'Descrição do conteúdo aqui...\n\n',
      description: 'Texto descritivo'
    },
    {
      id: 'bullets',
      name: 'Lista com Bullets',
      icon: List,
      content: '- Item 1\n- Item 2\n- Item 3\n\n',
      description: 'Lista não ordenada'
    },
    {
      id: 'numbered',
      name: 'Lista Numerada',
      icon: List,
      content: '1. Primeiro item\n2. Segundo item\n3. Terceiro item\n\n',
      description: 'Lista ordenada'
    },
    {
      id: 'bold',
      name: 'Texto em Negrito',
      icon: Type,
      content: '**Texto em negrito**\n\n',
      description: 'Texto destacado'
    },
    {
      id: 'italic',
      name: 'Texto em Itálico',
      icon: Type,
      content: '*Texto em itálico*\n\n',
      description: 'Texto enfatizado'
    },
    {
      id: 'code',
      name: 'Bloco de Código',
      icon: Code,
      content: '```\n// Seu código aqui\n```\n\n',
      description: 'Código formatado'
    },
    {
      id: 'inline-code',
      name: 'Código Inline',
      icon: Code,
      content: '`código inline`\n\n',
      description: 'Código em linha'
    },
    {
      id: 'table',
      name: 'Tabela',
      icon: Table,
      content: '| Coluna 1 | Coluna 2 | Coluna 3 |\n|----------|----------|----------|\n| Dado 1   | Dado 2   | Dado 3   |\n\n',
      description: 'Tabela markdown'
    },
    {
      id: 'quote',
      name: 'Citação',
      icon: Quote,
      content: '> Citação ou destaque importante\n\n',
      description: 'Bloco de citação'
    },
    {
      id: 'image',
      name: 'Imagem',
      icon: Image,
      content: '![Descrição da imagem](url-da-imagem)\n\n',
      description: 'Inserir imagem'
    },
    {
      id: 'link',
      name: 'Link',
      icon: FileText,
      content: '[Texto do link](https://exemplo.com)\n\n',
      description: 'Link clicável'
    },
    {
      id: 'divider',
      name: 'Divisor',
      icon: FileText,
      content: '---\n\n',
      description: 'Linha divisória'
    },
    {
      id: 'mermaid',
      name: 'Diagrama Mermaid',
      icon: Code,
      content: '```mermaid\ngraph TD\n    A[Início] --> B[Processo]\n    B --> C{Fim?}\n    C -->|Sim| D[Finalizar]\n    C -->|Não| B\n```\n\n',
      description: 'Diagrama de fluxo Mermaid'
    }
  ];

  const suppressEditorSync = useRef(false);
  const suppressPreviewSync = useRef(false);

  // Funções para gerenciar arquivos .md
  const addNewFile = () => {
    const newId = Date.now().toString();
    const newFile: MarkdownFile = {
      id: newId,
      name: `slide-${mdFiles.length + 1}.md`,
      content: ''
    };
    setMdFiles([...mdFiles, newFile]);
    setActiveFileId(newId);
  };

  const removeFile = (id: string) => {
    if (mdFiles.length === 1) return; // Não permite remover o último arquivo
    const newFiles = mdFiles.filter(f => f.id !== id);
    setMdFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const updateFileName = (id: string, newName: string) => {
    setMdFiles(files => files.map(f => 
      f.id === id ? { ...f, name: newName.endsWith('.md') ? newName : `${newName}.md` } : f
    ));
  };

  const updateFileContent = (id: string, content: string) => {
    setMdFiles(files => files.map(f => 
      f.id === id ? { ...f, content } : f
    ));
  };

  const handleCreateFiles = () => {
    if (onCreateFiles) {
      onCreateFiles(mdFiles.filter(f => f.content.trim())); // Apenas arquivos com conteúdo
      onCancel(); // Fechar o editor após criar
    }
  };

  // Função para inserir template na posição do cursor
  const insertTemplate = (templateContent: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = mode === 'create' && activeFile ? activeFile.content : value;
    
    const newContent = 
      currentContent.substring(0, start) + 
      templateContent + 
      currentContent.substring(end);

    if (mode === 'create' && activeFile) {
      updateFileContent(activeFileId, newContent);
    } else {
      onChange(newContent);
    }

    // Reposicionar cursor após o template inserido
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + templateContent.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);

    setShowTemplates(false);
  };

  // Função para aplicar formatação markdown
  const applyMarkdownFormat = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = mode === 'create' && activeFile ? activeFile.content : value;
    
    let newContent: string;
    let newCursorPos: number;

    if (selectedText) {
      // Se há texto selecionado, aplicar formatação ao redor
      newContent = 
        currentContent.substring(0, start) + 
        before + selectedText + after + 
        currentContent.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // Se não há seleção, inserir placeholder
      const placeholderText = placeholder || 'texto';
      newContent = 
        currentContent.substring(0, start) + 
        before + placeholderText + after + 
        currentContent.substring(end);
      newCursorPos = start + before.length + placeholderText.length;
    }

    if (mode === 'create' && activeFile) {
      updateFileContent(activeFileId, newContent);
    } else {
      onChange(newContent);
    }

    // Reposicionar cursor
    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  const activeFile = mdFiles.find(f => f.id === activeFileId);
  const activeContent = mode === 'create' && activeFile ? activeFile.content : value;

  const previewHtml = useMemo(() => {
    try {
      return parseMarkdownSafe(activeContent || "");
    } catch {
      return "<p style='color:#f87171'>Erro ao renderizar preview.</p>";
    }
  }, [activeContent]);

  // Funções de exportação
  const exportAsMarkdown = () => {
    const blob = new Blob([activeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'create' && activeFile ? activeFile.name : 'slide.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slide Exportado</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #e2e8f0;
      background: #0f172a;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #f1f5f9;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    code {
      background: #1e293b;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #1e293b;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    a {
      color: #60a5fa;
    }
  </style>
</head>
<body>
  ${previewHtml}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'create' && activeFile ? activeFile.name.replace('.md', '.html') : 'slide.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsTXT = () => {
    // Remove markdown formatting
    const textContent = activeContent
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/!\[(.*?)\]\(.*?\)/g, '$1'); // Remove images
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'create' && activeFile ? activeFile.name.replace('.md', '.txt') : 'slide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    // Para PDF, vamos usar window.print() ou uma biblioteca
    // Por enquanto, vamos criar um HTML e usar print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para exportar como PDF');
      return;
    }
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Slide Exportado</title>
  <style>
    @media print {
      @page {
        margin: 2cm;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #1e293b;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #0f172a;
      margin-top: 1.5em;
    }
    code {
      background: #f1f5f9;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
    }
    pre {
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  ${previewHtml}
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const exportAsXLS = () => {
    // Para XLS, vamos criar um CSV simples
    const lines = activeContent.split('\n').filter(line => line.trim());
    const csvContent = lines.map(line => {
      // Remove markdown formatting
      const cleanLine = line
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^[-*+]\s+/, '') // Remove list markers
        .replace(/^\d+\.\s+/, ''); // Remove numbered list markers
      return `"${cleanLine.replace(/"/g, '""')}"`;
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'create' && activeFile ? activeFile.name.replace('.md', '.csv') : 'slide.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Inicializar Mermaid para o preview
  useMermaid(previewHtml);

  // Calcular número de linhas
  const lineCount = useMemo(() => {
    const content = activeContent || '';
    if (!content) return 1;
    return Math.max(1, content.split('\n').length);
  }, [activeContent]);

  // Sincronizar scroll da numeração de linhas com o textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers1 = lineNumbersRef1.current;
    const lineNumbers2 = lineNumbersRef2.current;
    const lineNumbers3 = lineNumbersRef3.current;
    
    if (!textarea) return;

    const syncScroll = () => {
      if (lineNumbers1) lineNumbers1.scrollTop = textarea.scrollTop;
      if (lineNumbers2) lineNumbers2.scrollTop = textarea.scrollTop;
      if (lineNumbers3) lineNumbers3.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, []);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
    // Resetar arquivos quando abrir no modo create
    if (open && mode === 'create' && mdFiles.length === 0) {
      setMdFiles([{ id: '1', name: 'slide-1.md', content: '' }]);
      setActiveFileId('1');
    }
  }, [open, mode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Fechar modais com ESC
      if (key === "escape") {
        e.preventDefault();
        if (showTemplates) {
          setShowTemplates(false);
          return;
        }
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        onCancel();
        return;
      }

      // Salvar
      if (ctrl && key === "s" && !shift && !alt) {
        e.preventDefault();
        onSave();
        return;
      }

      // Atalhos de formatação
      if (ctrl && !shift && !alt) {
        switch (key) {
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
        e.preventDefault();
            const level = parseInt(key);
            applyMarkdownFormat(`${'#'.repeat(level)} `, '', `Título ${level}`);
            return;
          case "b":
            e.preventDefault();
            applyMarkdownFormat('**', '**');
            return;
          case "i":
            e.preventDefault();
            applyMarkdownFormat('*', '*');
            return;
          case "k":
            e.preventDefault();
            applyMarkdownFormat('`', '`');
            return;
          case "l":
            e.preventDefault();
            applyMarkdownFormat('[', '](url)', 'Link');
            return;
          case "u":
            e.preventDefault();
            applyMarkdownFormat('- ', '');
            return;
          case "h":
            e.preventDefault();
            applyMarkdownFormat('---\n', '');
            return;
          case "a":
            e.preventDefault();
            textarea.select();
            return;
          case "z":
            e.preventDefault();
            document.execCommand('undo');
            return;
          case "y":
            e.preventDefault();
            document.execCommand('redo');
            return;
        }
      }

      // Atalhos com Shift
      if (ctrl && shift && !alt) {
        switch (key) {
          case "i":
            e.preventDefault();
            applyMarkdownFormat('![', '](url)', 'Imagem');
            return;
          case "o":
            e.preventDefault();
            applyMarkdownFormat('1. ', '');
            return;
          case "q":
            e.preventDefault();
            applyMarkdownFormat('> ', '');
            return;
          case "c":
            e.preventDefault();
            applyMarkdownFormat('`', '`');
            return;
        }
      }

      // Atalhos com Alt
      if (shift && alt && !ctrl) {
        switch (key) {
          case "c":
            e.preventDefault();
            applyMarkdownFormat('```\n', '\n```');
            return;
          case "h":
            e.preventDefault();
            setShowHelp(true);
            return;
        }
      }

      // F9 - Toggle Preview
      if (key === "f9") {
        e.preventDefault();
        setShowPreview(!showPreview);
        return;
      }

      // F11 - Toggle Fullscreen
      if (key === "f11") {
        e.preventDefault();
        if (onToggleEditorFocus) {
          onToggleEditorFocus();
        } else {
          setInternalFocus(!internalFocus);
        }
        return;
      }
    };
    window.addEventListener("keydown", handler as EventListener);
    return () =>
      window.removeEventListener("keydown", handler as EventListener);
  }, [open, onSave, onCancel, showTemplates, showHelp, showPreview, applyMarkdownFormat, onToggleEditorFocus, internalFocus]);

  const sync = (from: HTMLElement, to: HTMLElement) => {
    const maxFrom = from.scrollHeight - from.clientHeight;
    if (maxFrom <= 0) return;
    const ratio = from.scrollTop / maxFrom;
    const maxTo = to.scrollHeight - to.clientHeight;
    to.scrollTop = ratio * maxTo;
  };

  const onEditorScroll = () => {
    if (!showPreview || focusOn) return;
    if (suppressEditorSync.current) return;
    const editorEl = textareaRef.current;
    const previewEl = previewScrollRef.current;
    if (!editorEl || !previewEl) return;
    suppressPreviewSync.current = true;
    sync(editorEl, previewEl);
    requestAnimationFrame(() => {
      suppressPreviewSync.current = false;
    });
  };

  const onPreviewScroll = () => {
    if (!showPreview || focusOn) return;
    if (suppressPreviewSync.current) return;
    const editorEl = textareaRef.current;
    const previewEl = previewScrollRef.current;
    if (!editorEl || !previewEl) return;
    suppressEditorSync.current = true;
    sync(previewEl, editorEl);
    requestAnimationFrame(() => {
      suppressEditorSync.current = false;
    });
  };

  useEffect(() => {
    const previewEl = previewScrollRef.current;
    if (!previewEl) return;
    previewEl.addEventListener("scroll", onPreviewScroll);
    return () => {
      previewEl.removeEventListener("scroll", onPreviewScroll);
    };
  }, [showPreview, focusOn, value]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Editar slide"
      data-preview={showPreview ? "on" : "off"}
    >
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
        {/* Header Moderno */}
        <header className="relative flex items-center justify-between px-8 py-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Editor de Markdown
              </h2>
              <p className="text-xs text-slate-400">
                Edite e visualize em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de Exportação */}
            <Drawer open={showExport} onOpenChange={setShowExport}>
              <DrawerTrigger asChild>
                <button
                  className="group px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-700/50"
                  title="Exportar"
                >
                  <Download
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                  <span className="text-sm font-medium">Exportar</span>
                </button>
              </DrawerTrigger>
              <DrawerContent side="right" className="bg-slate-900 border-slate-700">
                <DrawerHeader>
                  <DrawerTitle className="text-white text-xl font-bold">
                    Exportar Conteúdo
                  </DrawerTitle>
                  <DrawerDescription className="text-slate-400">
                    Escolha o formato para exportar seu conteúdo
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-6 py-4 space-y-3">
                  <button
                    onClick={() => {
                      exportAsMarkdown();
                      setShowExport(false);
                    }}
                    className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                        <FileText size={20} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">Markdown (.md)</div>
                        <div className="text-xs text-slate-400">Exportar como arquivo Markdown</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportAsHTML();
                      setShowExport(false);
                    }}
                    className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-green-500/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                        <Code size={20} className="text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">HTML (.html)</div>
                        <div className="text-xs text-slate-400">Exportar como página HTML</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportAsPDF();
                      setShowExport(false);
                    }}
                    className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-red-500/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors">
                        <FileText size={20} className="text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">PDF (.pdf)</div>
                        <div className="text-xs text-slate-400">Exportar como PDF (usa impressão do navegador)</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportAsTXT();
                      setShowExport(false);
                    }}
                    className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-600/20 rounded-lg group-hover:bg-yellow-600/30 transition-colors">
                        <FileText size={20} className="text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">Texto (.txt)</div>
                        <div className="text-xs text-slate-400">Exportar como texto simples</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportAsXLS();
                      setShowExport(false);
                    }}
                    className="w-full p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                        <Table size={20} className="text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold mb-1">Excel/CSV (.csv)</div>
                        <div className="text-xs text-slate-400">Exportar como planilha CSV</div>
                      </div>
                    </div>
                  </button>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      Fechar
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Botão de Ajuda */}
            <button
              className="group px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-700/50"
              onClick={() => setShowHelp(true)}
              title="Ajuda e Atalhos (Shift+Alt+H)"
            >
              <HelpCircle
                size={16}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-medium">Ajuda</span>
            </button>

            {/* Botão de Templates */}
            <button
              className="group px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-700/50"
              onClick={() => setShowTemplates(true)}
              title="Inserir template"
            >
              <Sparkles
                size={16}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-medium">Templates</span>
            </button>

            {!focusOn && (
              <button
                className={`group px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  showPreview
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-700/50"
                }`}
                aria-pressed={showPreview}
                onClick={() => setShowPreview((v) => !v)}
                title={showPreview ? "Ocultar preview" : "Mostrar preview"}
              >
                {showPreview ? (
                  <EyeOff
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                ) : (
                  <Eye
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                )}
                <span className="text-sm font-medium">
                  {showPreview ? "Ocultar" : "Preview"}
                </span>
              </button>
            )}

            <button
              className="group px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-all duration-200"
              onClick={() =>
                onToggleEditorFocus
                  ? onToggleEditorFocus()
                  : setInternalFocus((v) => !v)
              }
              title={focusOn ? "Sair do foco do editor" : "Foco no editor"}
            >
              {focusOn ? (
                <Minimize2
                  size={16}
                  className="transition-transform group-hover:scale-110"
                />
              ) : (
                <Maximize2
                  size={16}
                  className="transition-transform group-hover:scale-110"
                />
              )}
              <span className="text-sm font-medium">
                {focusOn ? "Normal" : "Expandir"}
              </span>
            </button>

            <div className="w-px h-8 bg-slate-700/50 mx-1" />

            <button
              className="group px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-all duration-200"
              onClick={onCancel}
              title="Cancelar (Esc)"
            >
              <X
                size={16}
                className="transition-transform group-hover:rotate-90"
              />
              <span className="text-sm font-medium">Cancelar</span>
            </button>

            {mode === 'create' ? (
              <button
                className="group px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all duration-200 hover:scale-105"
                onClick={handleCreateFiles}
                title="Criar slides dos arquivos .md"
              >
                <Plus
                  size={16}
                  className="transition-transform group-hover:scale-110"
                />
                <span className="text-sm">Criar Slides ({mdFiles.filter(f => f.content.trim()).length})</span>
              </button>
            ) : (
            <button
              className="group px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-105"
              onClick={onSave}
              title="Salvar (Ctrl+S ou Cmd+S)"
            >
              <Save
                size={16}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm">Salvar</span>
            </button>
            )}
          </div>
        </header>

        {/* Área de Edição */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar de Arquivos (apenas no modo create) */}
          {mode === 'create' && (
            <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Arquivos .md</h3>
                  <Button
                    size="sm"
                    onClick={addNewFile}
                    className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <p className="text-xs text-slate-400">Cada arquivo será um slide</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {mdFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 border-b border-slate-700/30 cursor-pointer transition-colors ${
                      activeFileId === file.id
                        ? 'bg-blue-600/20 border-l-2 border-l-blue-500'
                        : 'hover:bg-slate-700/30'
                    }`}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={file.name.replace('.md', '')}
                        onChange={(e) => updateFileName(file.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent text-xs text-white font-medium border-none outline-none focus:bg-slate-700/50 px-1 rounded"
                        placeholder="Nome do arquivo"
                      />
                      {mdFiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {file.content.trim() ? `${file.content.split('\n').length} linhas` : 'Vazio'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="flex-1 overflow-hidden">
          {focusOn ? (
            /* Modo Foco - Apenas Editor */
            <div className="h-full flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 flex-shrink-0 overflow-x-auto">
                  <button
                    onClick={() => applyMarkdownFormat('# ', '', 'Título')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Título (H1)"
                  >
                    <Heading1 size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('## ', '', 'Subtítulo')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Subtítulo (H2)"
                  >
                    <Heading2 size={16} />
                  </button>
                  <div className="w-px h-6 bg-slate-700/50 mx-1" />
                  <button
                    onClick={() => applyMarkdownFormat('**', '**')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white font-bold"
                    title="Negrito"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('*', '*')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white italic"
                    title="Itálico"
                  >
                    <Italic size={16} />
                  </button>
                  <div className="w-px h-6 bg-slate-700/50 mx-1" />
                  <button
                    onClick={() => applyMarkdownFormat('- ', '')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Lista com Bullets"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('1. ', '')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Lista Numerada"
                  >
                    <Type size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('> ', '')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Citação"
                  >
                    <Quote size={16} />
                  </button>
                  <div className="w-px h-6 bg-slate-700/50 mx-1" />
                  <button
                    onClick={() => applyMarkdownFormat('`', '`')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Código Inline"
                  >
                    <Code size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('```\n', '\n```')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Bloco de Código"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('| ', ' |', 'Coluna')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Tabela"
                  >
                    <Table size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('[', '](url)', 'Link')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Link"
                  >
                    <Link2 size={16} />
                  </button>
                  <button
                    onClick={() => applyMarkdownFormat('![', '](url)', 'Imagem')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Imagem"
                  >
                    <Image size={16} />
                  </button>
                  <div className="w-px h-6 bg-slate-700/50 mx-1" />
                  <button
                    onClick={() => applyMarkdownFormat('---\n', '')}
                    className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                    title="Divisor"
                  >
                    <Minimize2 size={16} />
                  </button>
                </div>
                <div className="absolute top-16 left-4 z-10">
                <span className="px-3 py-1 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-full text-xs font-medium text-slate-300">
                  📝 Markdown
                </span>
              </div>
                <div className="flex-1 flex overflow-hidden">
                  {/* Numeração de Linhas */}
                  <div
                    ref={lineNumbersRef1}
                    className="flex-shrink-0 w-12 bg-slate-900/50 border-r border-slate-700/50 text-right text-xs text-slate-500 font-mono py-20 px-2 overflow-hidden select-none"
                    style={{ lineHeight: '1.75rem' }}
                  >
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i + 1} className="leading-relaxed">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {/* Editor */}
              <textarea
                ref={textareaRef}
                    value={mode === 'create' && activeFile ? activeFile.content : value}
                    onChange={(e) => {
                      if (mode === 'create' && activeFile) {
                        updateFileContent(activeFileId, e.target.value);
                      } else {
                        onChange(e.target.value);
                      }
                    }}
                onScroll={onEditorScroll}
                spellCheck={false}
                placeholder="# Título do Slide

Comece a digitar seu conteúdo em Markdown aqui...

- Lista de itens
- Outro item

**Texto em negrito** e *itálico*"
                aria-label="Editor de Markdown do slide"
                    className="flex-1 w-full h-full pt-20 px-6 pb-6 bg-slate-950 text-slate-100 font-mono text-[15px] leading-relaxed resize-none outline-none border-none overflow-auto custom-scrollbar placeholder:text-slate-600"
                    style={{ lineHeight: '1.75rem' }}
              />
                </div>
            </div>
          ) : showPreview ? (
            /* Modo Split - Editor + Preview com Resizable */
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full flex flex-col relative">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 flex-shrink-0 overflow-x-auto z-10">
                      <button
                        onClick={() => applyMarkdownFormat('# ', '', 'Título')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Título (H1)"
                      >
                        <Heading1 size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('## ', '', 'Subtítulo')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Subtítulo (H2)"
                      >
                        <Heading2 size={16} />
                      </button>
                      <div className="w-px h-6 bg-slate-700/50 mx-1" />
                      <button
                        onClick={() => applyMarkdownFormat('**', '**')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white font-bold"
                        title="Negrito"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('*', '*')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white italic"
                        title="Itálico"
                      >
                        <Italic size={16} />
                      </button>
                      <div className="w-px h-6 bg-slate-700/50 mx-1" />
                      <button
                        onClick={() => applyMarkdownFormat('- ', '')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Lista com Bullets"
                      >
                        <List size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('1. ', '')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Lista Numerada"
                      >
                        <Type size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('> ', '')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Citação"
                      >
                        <Quote size={16} />
                      </button>
                      <div className="w-px h-6 bg-slate-700/50 mx-1" />
                      <button
                        onClick={() => applyMarkdownFormat('`', '`')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Código Inline"
                      >
                        <Code size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('```\n', '\n```')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Bloco de Código"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('| ', ' |', 'Coluna')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Tabela"
                      >
                        <Table size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('[', '](url)', 'Link')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Link"
                      >
                        <Link2 size={16} />
                      </button>
                      <button
                        onClick={() => applyMarkdownFormat('![', '](url)', 'Imagem')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Imagem"
                      >
                        <Image size={16} />
                      </button>
                      <div className="w-px h-6 bg-slate-700/50 mx-1" />
                      <button
                        onClick={() => applyMarkdownFormat('---\n', '')}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                        title="Divisor"
                      >
                        <Minimize2 size={16} />
                      </button>
                    </div>
                    <div className="absolute top-16 left-4 z-10">
                    <span className="px-3 py-1 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-full text-xs font-medium text-slate-300">
                        📝 Markdown {mode === 'create' && activeFile && `- ${activeFile.name}`}
                    </span>
                  </div>
                    <div className="flex-1 flex overflow-hidden">
                      {/* Numeração de Linhas */}
                      <div
                        ref={lineNumbersRef2}
                        className="flex-shrink-0 w-12 bg-slate-900/50 border-r border-slate-700/50 text-right text-xs text-slate-500 font-mono py-20 px-2 overflow-hidden select-none"
                        style={{ lineHeight: '1.75rem' }}
                      >
                        {Array.from({ length: lineCount }, (_, i) => (
                          <div key={i + 1} className="leading-relaxed">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      {/* Editor */}
                  <textarea
                    ref={textareaRef}
                        value={mode === 'create' && activeFile ? activeFile.content : value}
                        onChange={(e) => {
                          if (mode === 'create' && activeFile) {
                            updateFileContent(activeFileId, e.target.value);
                          } else {
                            onChange(e.target.value);
                          }
                        }}
                    onScroll={onEditorScroll}
                    spellCheck={false}
                    placeholder="# Título do Slide

Comece a digitar seu conteúdo em Markdown aqui...

- Lista de itens
- Outro item

**Texto em negrito** e *itálico*"
                    aria-label="Editor de Markdown do slide"
                        className="flex-1 w-full h-full pt-20 px-6 pb-6 bg-slate-950 text-slate-100 font-mono text-[15px] leading-relaxed resize-none outline-none border-none overflow-auto custom-scrollbar placeholder:text-slate-600"
                        style={{ lineHeight: '1.75rem' }}
                  />
                    </div>
                </div>
              </ResizablePanel>
              
              <ResizableHandle className="w-2 bg-slate-700/30 hover:bg-slate-600/50 transition-all duration-200 relative group border-l border-r border-slate-600/20 hover:border-slate-500/40">
                <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-slate-500/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-slate-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </ResizableHandle>
              
              <ResizablePanel defaultSize={50} minSize={30}>
                <div
                  ref={previewScrollRef}
                  className="h-full flex flex-col overflow-auto bg-gradient-to-br from-slate-900 to-slate-800 custom-scrollbar"
                >
                  <div className="sticky top-0 z-10 px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">
                        Preview ao Vivo
                      </h3>
                    </div>
                    <span className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Sync
                    </span>
                  </div>
                  <div className="p-8">
                    {previewHtml.trim() ? (
                      <div
                        className="markdown-preview"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                          <Eye size={24} className="text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-500 italic">
                          Nada para pré-visualizar ainda
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Digite markdown no editor para ver o resultado aqui
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            /* Modo Apenas Editor */
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 flex-shrink-0 overflow-x-auto">
                <button
                  onClick={() => applyMarkdownFormat('# ', '', 'Título')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Título (H1)"
                >
                  <Heading1 size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('## ', '', 'Subtítulo')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Subtítulo (H2)"
                >
                  <Heading2 size={16} />
                </button>
                <div className="w-px h-6 bg-slate-700/50 mx-1" />
                <button
                  onClick={() => applyMarkdownFormat('**', '**')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white font-bold"
                  title="Negrito"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('*', '*')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white italic"
                  title="Itálico"
                >
                  <Italic size={16} />
                </button>
                <div className="w-px h-6 bg-slate-700/50 mx-1" />
                <button
                  onClick={() => applyMarkdownFormat('- ', '')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Lista com Bullets"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('1. ', '')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Lista Numerada"
                >
                  <Type size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('> ', '')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Citação"
                >
                  <Quote size={16} />
                </button>
                <div className="w-px h-6 bg-slate-700/50 mx-1" />
                <button
                  onClick={() => applyMarkdownFormat('`', '`')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Código Inline"
                >
                  <Code size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('```\n', '\n```')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Bloco de Código"
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('| ', ' |', 'Coluna')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Tabela"
                >
                  <Table size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('[', '](url)', 'Link')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Link"
                >
                  <Link2 size={16} />
                </button>
                <button
                  onClick={() => applyMarkdownFormat('![', '](url)', 'Imagem')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Imagem"
                >
                  <Image size={16} />
                </button>
                <div className="w-px h-6 bg-slate-700/50 mx-1" />
                <button
                  onClick={() => applyMarkdownFormat('---\n', '')}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-300 hover:text-white"
                  title="Divisor"
                >
                  <Minimize2 size={16} />
                </button>
              </div>
              <div className="absolute top-16 left-4 z-10">
                <span className="px-3 py-1 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-full text-xs font-medium text-slate-300">
                  📝 Markdown {mode === 'create' && activeFile && `- ${activeFile.name}`}
                </span>
              </div>
              <div className="flex-1 flex overflow-hidden">
                {/* Numeração de Linhas */}
                <div
                  ref={lineNumbersRef3}
                  className="flex-shrink-0 w-12 bg-slate-900/50 border-r border-slate-700/50 text-right text-xs text-slate-500 font-mono py-20 px-2 overflow-hidden select-none"
                  style={{ lineHeight: '1.75rem' }}
                >
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i + 1} className="leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Editor */}
              <textarea
                ref={textareaRef}
                  value={mode === 'create' && activeFile ? activeFile.content : value}
                  onChange={(e) => {
                    if (mode === 'create' && activeFile) {
                      updateFileContent(activeFileId, e.target.value);
                    } else {
                      onChange(e.target.value);
                    }
                  }}
                onScroll={onEditorScroll}
                spellCheck={false}
                placeholder="# Título do Slide

Comece a digitar seu conteúdo em Markdown aqui...

- Lista de itens
- Outro item

**Texto em negrito** e *itálico*"
                aria-label="Editor de Markdown do slide"
                  className="flex-1 w-full h-full pt-20 px-6 pb-6 bg-slate-950 text-slate-100 font-mono text-[15px] leading-relaxed resize-none outline-none border-none overflow-auto custom-scrollbar placeholder:text-slate-600"
                  style={{ lineHeight: '1.75rem' }}
              />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono text-slate-300">
                  Ctrl+S
                </kbd>
                <span>Salvar</span>
              </div>
              <div className="w-px h-4 bg-slate-700/50" />
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono text-slate-300">
                  Esc
                </kbd>
                <span>Cancelar</span>
              </div>
              {!focusOn && showPreview && (
                <>
                  <div className="w-px h-4 bg-slate-700/50" />
                  <span className="text-emerald-400 font-medium">
                    ⚡ Preview sincronizado
                  </span>
                  <div className="w-px h-4 bg-slate-700/50" />
                  <span className="text-blue-400 font-medium flex items-center gap-1">
                    ↔️ Redimensionável
                  </span>
                </>
              )}
            </div>
            <div className="text-slate-500">{value.length} caracteres</div>
          </div>
        </footer>
      </div>

      {/* Modal de Ajuda */}
      {showHelp && (
        <div 
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHelp(false);
            }
          }}
        >
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <HelpCircle size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Ajuda e Atalhos</h2>
                  <p className="text-sm text-slate-400">Atalhos de teclado e referências</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Fechar (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                {/* Atalhos do Teclado */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Atalhos do Teclado
                  </h3>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">F9</span>
                          <span className="text-sm text-slate-400">Habilitar/desabilitar preview</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">F11</span>
                          <span className="text-sm text-slate-400">Tela inteira</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + 1~6</span>
                          <span className="text-sm text-slate-400">Inserir título 1~6</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + B</span>
                          <span className="text-sm text-slate-400">Negrito</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + I</span>
                          <span className="text-sm text-slate-400">Itálico</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + K</span>
                          <span className="text-sm text-slate-400">Código inline</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + L</span>
                          <span className="text-sm text-slate-400">Link</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + U</span>
                          <span className="text-sm text-slate-400">Lista não ordenada</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + H</span>
                          <span className="text-sm text-slate-400">Linha horizontal</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + Z</span>
                          <span className="text-sm text-slate-400">Desfazer</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + Y</span>
                          <span className="text-sm text-slate-400">Refazer</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + A</span>
                          <span className="text-sm text-slate-400">Selecionar tudo</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + Shift + I</span>
                          <span className="text-sm text-slate-400">Inserir Imagem</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + Shift + O</span>
                          <span className="text-sm text-slate-400">Lista ordenada</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + Shift + Q</span>
                          <span className="text-sm text-slate-400">Blockquote</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + Shift + C</span>
                          <span className="text-sm text-slate-400">Código inline</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Shift + Alt + C</span>
                          <span className="text-sm text-slate-400">Bloco de código</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Shift + Alt + H</span>
                          <span className="text-sm text-slate-400">Abrir ajuda</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Esc</span>
                          <span className="text-sm text-slate-400">Fechar modais</span>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                          <span className="text-sm text-slate-300 font-mono">Ctrl + S</span>
                          <span className="text-sm text-slate-400">Salvar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referências */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                    Referências
                  </h3>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <div className="p-3 hover:bg-slate-700/30 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-white mb-1">Sintaxe Markdown</h4>
                      <p className="text-xs text-slate-400">Use a barra de ferramentas ou os atalhos para aplicar formatação</p>
                    </div>
                    <div className="p-3 hover:bg-slate-700/30 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-white mb-1">Diagramas Mermaid</h4>
                      <p className="text-xs text-slate-400">Use blocos de código com <code className="bg-slate-900 px-1 rounded text-blue-400">```mermaid</code> para criar diagramas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Pressione Esc para fechar
              </p>
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Templates */}
      {showTemplates && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplates(false);
            }
          }}
        >
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Sparkles size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Templates Prontos</h2>
                  <p className="text-sm text-slate-400">Clique em um template para inserir no cursor</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Fechar (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => insertTemplate(template.content)}
                      className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200 text-left hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-slate-700/50 group-hover:bg-blue-600/20 rounded-lg transition-colors">
                          <Icon size={18} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                            {template.name}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-2">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {templates.length} templates disponíveis
              </p>
              <button
                onClick={() => setShowTemplates(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }

        /* Estilos do Markdown Preview */
        .markdown-preview {
          color: #e2e8f0;
          line-height: 1.75;
          max-width: none;
        }

        /* Headings */
        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          font-weight: 700;
          color: #ffffff;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          line-height: 1.25;
        }

        .markdown-preview h1 {
          font-size: 2.5rem;
          background: linear-gradient(to right, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding-bottom: 0.5em;
          border-bottom: 2px solid rgba(100, 116, 139, 0.3);
        }

        .markdown-preview h2 {
          font-size: 2rem;
          color: #f1f5f9;
          padding-bottom: 0.3em;
          border-bottom: 1px solid rgba(100, 116, 139, 0.3);
        }

        .markdown-preview h3 {
          font-size: 1.5rem;
          color: #e2e8f0;
        }

        .markdown-preview h4 {
          font-size: 1.25rem;
          color: #cbd5e1;
        }

        .markdown-preview h5 {
          font-size: 1.125rem;
          color: #cbd5e1;
        }

        .markdown-preview h6 {
          font-size: 1rem;
          color: #94a3b8;
        }

        /* Paragraphs */
        .markdown-preview p {
          margin-top: 1em;
          margin-bottom: 1em;
          color: #cbd5e1;
        }

        /* Links */
        .markdown-preview a {
          color: #60a5fa;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        .markdown-preview a:hover {
          color: #93c5fd;
          border-bottom-color: #60a5fa;
        }

        /* Strong & Em */
        .markdown-preview strong {
          font-weight: 700;
          color: #ffffff;
        }

        .markdown-preview em {
          font-style: italic;
          color: #e2e8f0;
        }

        /* Lists */
        .markdown-preview ul,
        .markdown-preview ol {
          margin-top: 1em;
          margin-bottom: 1em;
          padding-left: 1.5em;
          color: #cbd5e1;
        }

        .markdown-preview li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .markdown-preview ul > li {
          list-style-type: disc;
        }

        .markdown-preview ul > li::marker {
          color: #60a5fa;
        }

        .markdown-preview ol > li {
          list-style-type: decimal;
        }

        .markdown-preview ol > li::marker {
          color: #a78bfa;
          font-weight: 600;
        }

        /* Code */
        .markdown-preview code {
          background: #1e293b;
          color: #c084fc;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.875em;
          border: 1px solid rgba(100, 116, 139, 0.3);
        }

        .markdown-preview pre {
          background: #0f172a;
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 0.75rem;
          padding: 1.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .markdown-preview pre code {
          background: transparent;
          padding: 0;
          border: none;
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        /* Blockquotes */
        .markdown-preview blockquote {
          border-left: 4px solid #3b82f6;
          background: rgba(30, 41, 59, 0.5);
          padding: 1rem 1.5rem;
          margin: 1.5em 0;
          border-radius: 0 0.5rem 0.5rem 0;
          color: #cbd5e1;
        }

        .markdown-preview blockquote p {
          margin: 0.5em 0;
        }

        /* Tables */
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          background: rgba(30, 41, 59, 0.3);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .markdown-preview th {
          background: rgba(51, 65, 85, 0.8);
          color: #f1f5f9;
          font-weight: 600;
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 2px solid rgba(100, 116, 139, 0.5);
        }

        .markdown-preview td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
          color: #cbd5e1;
        }

        .markdown-preview tr:last-child td {
          border-bottom: none;
        }

        .markdown-preview tr:hover {
          background: rgba(51, 65, 85, 0.3);
        }

        /* Horizontal Rule */
        .markdown-preview hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(100, 116, 139, 0.5), transparent);
          margin: 2em 0;
        }

        /* Images */
        .markdown-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5em 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* Checkbox Lists */
        .markdown-preview input[type="checkbox"] {
          margin-right: 0.5em;
          accent-color: #3b82f6;
        }

        /* Estilos para Mermaid */
        .markdown-preview .mermaid-container {
          margin: 2rem 0;
          padding: 1.5rem;
          background-color: #1e293b;
          border-radius: 0.75rem;
          border: 1px solid #334155;
          overflow-x: auto;
        }

        .markdown-preview .mermaid {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .markdown-preview .mermaid svg {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
