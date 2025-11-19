import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  EyeOff,
  Download,
  Copy,
  RotateCw,
  QrCode,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

type NavigationProps = {
  currentSlide: number;
  totalSlides: number;
  setCurrentSlide: (slide: number) => void;
  setTransitionKey: (updater: number | ((prev: number) => number)) => void;
  setSlideTransition: (transition: string) => void;
  slideTransition: string;
  focusMode: boolean;
  setFocusMode: (mode: boolean) => void;
  presenterMode: boolean;
  setPresenterMode: (mode: boolean) => void;
  setShowSlideList: (show: boolean) => void;
  setEditing: (editing: boolean) => void;
  onStartEditing: () => void;
  duplicateSlide: () => void;
  onSaveAllSlides?: () => void;
  onRestart?: () => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
  
  // Remote control props
  onShowRemoteControl?: () => void;
  remoteSession?: {
    isConnected: boolean;
    remoteClients: number;
  } | null;
};

const Navigation = ({
  currentSlide,
  totalSlides,
  setCurrentSlide,
  setTransitionKey,
  focusMode,
  setFocusMode,
  onStartEditing,
  duplicateSlide,
  onSaveAllSlides,
  onRestart,
  onShowRemoteControl,
  remoteSession,
}: NavigationProps) => {
  
  const onPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setTransitionKey(prev => prev + 1);
    }
  };
  
  const onNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      setTransitionKey(prev => prev + 1);
    }
  };
  
  const onReset = () => {
    setCurrentSlide(0);
    setTransitionKey(prev => prev + 1);
  };
  
  const onEdit = () => {
    onStartEditing();
  };
  
  const onToggleFocus = () => {
    setFocusMode(!focusMode);
  };
  
  const onDuplicate = () => {
    duplicateSlide();
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Navegação de Slides */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={currentSlide === 0}
              aria-label="Slide anterior"
              title="Anterior (←)"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm border border-gray-700 hover:border-gray-600"
            >
              <ChevronLeft size={18} />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 min-w-[100px] justify-center">
              <span className="text-sm font-semibold text-white">
                {currentSlide + 1}
              </span>
              <span className="text-xs text-gray-500">/</span>
              <span className="text-sm text-gray-400">{totalSlides}</span>
            </div>

            <button
              onClick={onNext}
              disabled={currentSlide === totalSlides - 1}
              aria-label="Próximo slide"
              title="Próximo (→)"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-lg shadow-blue-900/30"
            >
              <span>Próximo</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              aria-label="Editar slide atual"
              title="Editar"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all duration-200 text-sm border border-gray-700 hover:border-gray-600"
            >
              <Pencil size={16} />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={onToggleFocus}
              aria-label={
                focusMode ? "Sair do modo de foco" : "Ativar modo de foco"
              }
              title={focusMode ? "Sair do foco" : "Modo foco"}
              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm border ${
                focusMode
                  ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-500"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700 hover:border-gray-600"
              }`}
            >
              {focusMode ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="hidden sm:inline">
                {focusMode ? "Sair" : "Foco"}
              </span>
            </button>

            <button
              onClick={onDuplicate}
              aria-label="Duplicar slide atual"
              title="Duplicar (Ctrl+D)"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all duration-200 text-sm border border-gray-700 hover:border-gray-600"
            >
              <Copy size={16} />
              <span className="hidden md:inline">Duplicar</span>
            </button>

            {/* Botão Controle Remoto */}
            {onShowRemoteControl && (
              <button
                onClick={() => {
                  console.log('Botão QR Code clicado no Navigation');
                  onShowRemoteControl();
                }}
                aria-label="Ativar controle remoto"
                title="Controlar apresentação pelo celular"
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm border ${
                  remoteSession?.isConnected
                    ? "bg-violet-600 hover:bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-900/30"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700 hover:border-violet-400"
                }`}
              >
                {remoteSession?.isConnected ? <Wifi size={16} /> : <QrCode size={16} />}
                <span className="hidden md:inline">
                  {remoteSession?.isConnected ? 'Remoto' : 'QR Code'}
                </span>
                {remoteSession?.isConnected && remoteSession.remoteClients > 0 && (
                  <span className="bg-white text-violet-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {remoteSession.remoteClients}
                  </span>
                )}
              </button>
            )}

            {/* Botão de Salvar Todos */}
            {onSaveAllSlides && (
              <button
                onClick={onSaveAllSlides}
                aria-label="Salvar todos os slides"
                title="Salvar apresentação completa (.md)"
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-all duration-200 text-sm border border-green-500 shadow-lg shadow-green-900/30"
              >
                <Download size={16} />
                <span className="hidden md:inline">Salvar Todos</span>
              </button>
            )}

            {/* Botão Recomençar */}
            {onRestart && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    aria-label="Recomençar - voltar à tela inicial"
                    title="Recomençar apresentação"
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all duration-200 text-sm border border-orange-500 shadow-lg shadow-orange-900/30"
                  >
                    <RotateCw size={16} />
                    <span className="hidden lg:inline">Recomençar</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white flex items-center gap-2">
                      <RotateCw size={20} className="text-orange-400" />
                      Recomençar Apresentação
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                      Tem certeza que deseja recomençar? Todos os slides atuais serão perdidos e você retornará à tela inicial.
                      <div className="mt-3 p-3 bg-orange-900/20 border border-orange-800/50 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-300">
                          <span className="text-orange-400">⚠️</span>
                          <span className="text-sm font-medium">Esta ação não pode ser desfeita</span>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onRestart}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Sim, Recomençar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* {typeof onExportPdf === "function" && (
              <button
                onClick={onExportPdf}
                aria-label="Exportar slide atual como PDF"
                title="Exportar PDF"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all duration-200 text-sm border border-gray-700 hover:border-gray-600"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                  <path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                  <path d="M12 12v6" />
                  <path d="M9 15l3-3 3 3" />
                </svg>
                <span className="hidden md:inline">PDF</span>
              </button>
            )} */}

            <div className="h-6 w-px bg-gray-700 mx-1" />

            <button
              onClick={onReset}
              aria-label="Recarregar"
              title="Recarregar"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all duration-200 text-sm border border-gray-700 hover:border-gray-600"
            >
              <RotateCw size={16} />
              <span className="hidden lg:inline">Recarregar</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
