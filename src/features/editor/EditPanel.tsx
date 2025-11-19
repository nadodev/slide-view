import React, { useEffect, useRef, useState, useMemo } from "react";
import parseMarkdownSafe from "@/utils/markdown";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/components/ui/resizable";
import { toast } from "sonner";
import GitHubIntegrationModal from "@/features/github/GitHubIntegrationModal";
import { EditorToolbar } from "@/features/editor/EditorToolbar";
import { MarkdownEditor } from "@/features/editor/MarkdownEditor";
import { SlidePreview } from "@/features/editor/SlidePreview";

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
  mode?: 'edit' | 'create';
  onCreateFiles?: (files: MarkdownFile[]) => void;
};

export default function EditPanel({
  open,
  value,
  onChange,
  onCancel,
  onSave,
  mode = 'edit',
}: EditPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const [mdFiles, setMdFiles] = useState<MarkdownFile[]>([
    { id: '1', name: 'slide-1.md', content: '' }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');

  const activeFile = mdFiles.find(f => f.id === activeFileId);
  const activeContent = mode === 'create' && activeFile ? activeFile.content : value;

  const previewHtml = useMemo(() => {
    try {
      return parseMarkdownSafe(activeContent || "");
    } catch {
      return "<p style='color:#f87171'>Erro ao renderizar preview.</p>";
    }
  }, [activeContent]);

  const lineCount = useMemo(() => {
    const content = activeContent || '';
    if (!content) return 1;
    return Math.max(1, content.split('\n').length);
  }, [activeContent]);

  const handleFormat = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = activeContent;

    let newContent: string;
    let newCursorPos: number;

    if (selectedText) {
      newContent =
        currentContent.substring(0, start) +
        before + selectedText + after +
        currentContent.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      const placeholderText = placeholder || 'texto';
      newContent =
        currentContent.substring(0, start) +
        before + placeholderText + after +
        currentContent.substring(end);
      newCursorPos = start + before.length + placeholderText.length;
    }

    if (mode === 'create' && activeFile) {
      setMdFiles(files => files.map(f =>
        f.id === activeFileId ? { ...f, content: newContent } : f
      ));
    } else {
      onChange(newContent);
    }

    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  const handleInsertTemplate = (templateContent: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = activeContent;

    const newContent =
      currentContent.substring(0, start) +
      templateContent +
      currentContent.substring(end);

    if (mode === 'create' && activeFile) {
      setMdFiles(files => files.map(f =>
        f.id === activeFileId ? { ...f, content: newContent } : f
      ));
    } else {
      onChange(newContent);
    }

    setTimeout(() => {
      if (textarea) {
        const newPosition = start + templateContent.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);

    setShowTemplates(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      if (key === "escape") {
        e.preventDefault();
        if (showTemplates) { setShowTemplates(false); return; }
        if (showHelp) { setShowHelp(false); return; }
        onCancel();
        return;
      }

      if (ctrl && key === "s" && !shift && !alt) {
        e.preventDefault();
        onSave();
        return;
      }

      if (ctrl && !shift && !alt) {
        switch (key) {
          case "b": e.preventDefault(); handleFormat('**', '**'); return;
          case "i": e.preventDefault(); handleFormat('*', '*'); return;
          case "1": e.preventDefault(); handleFormat('# ', '', 'Título 1'); return;
          case "2": e.preventDefault(); handleFormat('## ', '', 'Título 2'); return;
          case "u": e.preventDefault(); handleFormat('- ', ''); return;
          case "l": e.preventDefault(); handleFormat('[', '](url)', 'Link'); return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, showTemplates, showHelp, activeContent, mode, activeFileId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
      <EditorToolbar
        onFormat={handleFormat}
        onInsertTemplate={handleInsertTemplate}
        onShowTemplates={() => setShowTemplates(true)}
        onShowHelp={() => setShowHelp(true)}
        onShowExport={() => setShowExport(true)}
        onShowGitHub={() => setShowGitHubModal(true)}
        onSave={onSave}
        onCancel={onCancel}
      />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={30}>
            <MarkdownEditor
              value={activeContent}
              onChange={(val) => {
                if (mode === 'create' && activeFile) {
                  setMdFiles(files => files.map(f =>
                    f.id === activeFileId ? { ...f, content: val } : f
                  ));
                } else {
                  onChange(val);
                }
              }}
              onKeyDown={() => { }}
              onScroll={() => { }}
              textareaRef={textareaRef}
              lineNumbersRef={lineNumbersRef}
              lineCount={lineCount}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <SlidePreview htmlContent={previewHtml} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* GitHub Integration Modal */}
      {showGitHubModal && (
        <GitHubIntegrationModal
          isOpen={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
          currentFiles={mdFiles}
          onFilesLoaded={(files: MarkdownFile[]) => {
            setMdFiles(files);
            setActiveFileId(files[0]?.id || '1');
            toast.success(`${files.length} arquivos carregados`);
          }}
        />
      )}
    </div>
  );
}
