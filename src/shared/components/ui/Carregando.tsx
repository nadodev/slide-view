import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface CarregandoProps {
  message?: string;
  showProgress?: boolean;
}

export function Carregando({ message = "Carregando...", showProgress = false }: CarregandoProps) {
  const [progress, setProgress] = useState(showProgress ? 5 : 0); // Valor inicial visível

  useEffect(() => {
    if (!showProgress) {
      setProgress(0);
      return;
    }

    // Iniciar com valor visível
    setProgress(5);

    // Animação mais lenta e gradual
    const timer = setInterval(() => {
      setProgress((prev) => {
        // Progresso mais lento: 1-4% por iteração
        const increment = Math.random() * 3 + 1;
        return Math.min(85, prev + increment);
      });
    }, 800); // Intervalo maior: 800ms entre atualizações

    return () => {
      clearInterval(timer);
    };
  }, [showProgress]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-900/95 border border-slate-700/50 backdrop-blur-sm px-8 py-6 text-white shadow-2xl min-w-[300px]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-full">
                <Sparkles className="h-5 w-5 animate-spin text-white" />
              </div>
            </div>
            <span className="text-lg font-semibold">{message}</span>
          </div>

          {showProgress && (
            <div className="w-full space-y-3">
              <div className="w-full">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-800  border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${progress}%`,
                      minWidth: progress > 0 ? '8px' : '0px'
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Processando...</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
