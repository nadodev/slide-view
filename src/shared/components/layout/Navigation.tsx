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
  Wifi,
  Save
} from "lucide-react";
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
  onSavePresentation?: () => void;
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
  onSavePresentation,
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
    <nav className="w-full bg-[#0a0a0a]/90 border-t border-white/10 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Navegação de Slides */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={currentSlide === 0}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm border border-white/10 hover:border-white/20"
            >
              <ChevronLeft size={18} />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 min-w-[100px] justify-center">
              <span className="text-sm font-semibold text-white">
                {currentSlide + 1}
              </span>
              <span className="text-xs text-white/40">/</span>
              <span className="text-sm text-white/60">{totalSlides}</span>
            </div>

            <button
              onClick={onNext}
              disabled={currentSlide === totalSlides - 1}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-lg shadow-blue-500/20"
            >
              <span>Próximo</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all duration-200 text-sm border border-white/10 hover:border-white/20"
            >
              <Pencil size={16} />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={onToggleFocus}
              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm border ${focusMode
                ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20"
                }`}
            >
              {focusMode ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="hidden sm:inline">
                {focusMode ? "Sair" : "Foco"}
              </span>
            </button>

            <button
              onClick={onDuplicate}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all duration-200 text-sm border border-white/10 hover:border-white/20"
            >
              <Copy size={16} />
              <span className="hidden md:inline">Duplicar</span>
            </button>

            {/* Remote Control */}
            {onShowRemoteControl && (
              <button
                onClick={onShowRemoteControl}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm border ${remoteSession?.isConnected
                  ? "bg-green-600 hover:bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                  : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20"
                  }`}
              >
                {remoteSession?.isConnected ? <Wifi size={16} /> : <QrCode size={16} />}
                <span className="hidden md:inline">
                  {remoteSession?.isConnected ? 'Remoto' : 'QR Code'}
                </span>
                {remoteSession?.isConnected && remoteSession.remoteClients > 0 && (
                  <span className="bg-white text-green-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {remoteSession.remoteClients}
                  </span>
                )}
              </button>
            )}

            {/* Save Presentation */}
            {onSavePresentation && (
              <button
                onClick={onSavePresentation}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-all duration-200 text-sm font-medium shadow-lg shadow-white/10"
              >
                <Save size={16} />
                <span className="hidden md:inline">Salvar</span>
              </button>
            )}

            {/* Save All Slides */}
            {onSaveAllSlides && (
              <button
                onClick={onSaveAllSlides}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all duration-200 text-sm border border-white/10 hover:border-white/20"
              >
                <Download size={16} />
                <span className="hidden md:inline">Baixar .md</span>
              </button>
            )}

            {/* Restart */}
            {onRestart && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 text-sm border border-red-500/20"
                  >
                    <RotateCw size={16} />
                    <span className="hidden lg:inline">Recomençar</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0a0a0a] border border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white flex items-center gap-2">
                      <RotateCw size={20} className="text-red-400" />
                      Recomençar Apresentação
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      Tem certeza que deseja recomençar? Todos os slides atuais serão perdidos e você retornará à tela inicial.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onRestart}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Sim, Recomençar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="h-6 w-px bg-white/10 mx-1" />

            <button
              onClick={onReset}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all duration-200 text-sm border border-white/10 hover:border-white/20"
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
