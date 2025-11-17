import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipBack, 
  SkipForward,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Smartphone,
  Wifi,
  WifiOff,
  QrCode
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export const RemoteControl: React.FC = () => {
  console.log('RemoteControl component renderizado');
  
  const { sessionId } = useParams<{ sessionId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [presentationContent, setPresentationContent] = useState<string>('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  // Detectar se estamos na Vercel
  const isVercel = window.location.hostname.includes('vercel.app');

  console.log('RemoteControl state:', { 
    sessionId, 
    isConnected, 
    isConnecting, 
    error, 
    currentSlide, 
    totalSlides,
    hostname: window.location.hostname
  });

  // Wrapper de erro para capturar problemas de renderização
  try {

  useEffect(() => {
    console.log('RemoteControl iniciado:', { sessionId, hostname: window.location.hostname });
    
    if (!sessionId) {
      console.error('SessionId não encontrado');
      setError('ID da sessão não encontrado');
      setIsConnecting(false);
      return;
    }

    // Se for Vercel, mostrar mensagem de que WebSockets não funcionam
    if (isVercel) {
      console.log('Vercel detectado - WebSockets não funcionam');
      setIsConnecting(false);
      setError('Vercel não suporta WebSockets. Use Railway, Render ou Heroku para controle remoto.');
      return;
    }

    // Detectar URL da API baseado no ambiente
    let apiUrl: string;
    if (window.location.hostname.includes('railway.app')) {
      // No Railway, usar a mesma URL base
      apiUrl = window.location.origin;
      console.log('Railway detectado, usando:', apiUrl);
    } else if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
      // No desenvolvimento local, usar porta específica do servidor
      apiUrl = 'http://localhost:3001';
      console.log('Desenvolvimento local detectado, usando:', apiUrl);
    } else {
      // Fallback para outras plataformas
      apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      console.log('Usando URL configurada:', apiUrl);
    }

    console.log('Tentando conectar Socket.IO em:', apiUrl);

    // Verificar se é ambiente de desenvolvimento e mostrar aviso
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
      toast.info('Modo Desenvolvimento', {
        description: 'Certifique-se que o servidor está rodando na porta 3001'
      });
    }

    // Conectar ao servidor
    const socketConnection = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketConnection.on('connect', () => {
      console.log('Socket.IO conectado com sucesso!');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      
      // Juntar-se à sessão
      socketConnection.emit('join-remote', sessionId, (response: any) => {
        console.log('Resposta join-remote:', response);
        console.log('currentSlide recebido:', response?.currentSlide);
        console.log('totalSlides recebido:', response?.totalSlides);
        
        if (response?.success) {
          console.log('🎯 Atualizando estado do controle remoto:', {
            currentSlide: response.currentSlide,
            totalSlides: response.totalSlides
          });
          setCurrentSlide(response.currentSlide || 0);
          setTotalSlides(response.totalSlides || 0);
          setJoinError(null);
          toast.success('Conectado!', {
            description: 'Controle remoto ativo'
          });
        } else {
          console.error('Erro join-remote:', response);
          // Não usar o `error` global (que mostra tela inteira) para falha de join;
          // armazenar em `joinError` e permitir retry sem recarregar
          setJoinError(response?.error || 'Sessão não encontrada');
          toast.error('Erro', {
            description: response?.error || 'Falha na conexão'
          });
        }
      });
    });

    socketConnection.on('disconnect', () => {
      console.log('Socket.IO desconectado');
      setIsConnected(false);
      toast.warning('Desconectado', {
        description: 'Reconectando...'
      });
    });

    socketConnection.on('connect_error', (error) => {
      console.error('Erro de conexão Socket.IO:', error);
      setIsConnected(false);
      setIsConnecting(false);
      setError(`Não foi possível conectar: ${error.message || 'Servidor indisponível'}`);
      toast.error('Erro de conexão', {
        description: 'Verifique se a apresentação está ativa'
      });
    });

    socketConnection.on('sync-slide', ({ currentSlide: newSlide, totalSlides: newTotal }) => {
      console.log('📍 sync-slide recebido:', { newSlide, newTotal, currentSlideAtual: currentSlide });
      setCurrentSlide(newSlide);
      setTotalSlides(newTotal);
      console.log('📍 Estado atualizado para:', { currentSlide: newSlide, totalSlides: newTotal });
    });

    socketConnection.on('presentation-content', ({ content, scrollPosition: newScrollPos }) => {
      console.log('Conteúdo da apresentação recebido');
      
      try {
        // Tentar parsear como JSON primeiro (novo formato)
        const parsedContent = JSON.parse(content);
        if (parsedContent.html) {
          setPresentationContent(parsedContent.html);
          setCurrentSlide(parsedContent.currentSlide || 0);
          setTotalSlides(parsedContent.totalSlides || 0);
          setScrollPosition(parsedContent.scrollPosition || 0);
          console.log('✅ Conteúdo JSON processado:', {
            currentSlide: parsedContent.currentSlide,
            totalSlides: parsedContent.totalSlides,
            scrollPosition: parsedContent.scrollPosition
          });
        } else {
          // Fallback para o formato antigo
          setPresentationContent(content);
          setScrollPosition(newScrollPos || 0);
        }
      } catch (e) {
        // Se não for JSON, usar como string simples (formato antigo)
        setPresentationContent(content);
        setScrollPosition(newScrollPos || 0);
      }
    });

    socketConnection.on('scroll-sync', ({ scrollPosition: newScrollPos }) => {
      setScrollPosition(newScrollPos);
    });

    socketConnection.on('presentation-ended', () => {
      toast.info('Apresentação encerrada', {
        description: 'A apresentação foi finalizada'
      });
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [sessionId]);

  // Sincronizar scroll position do espelho (recebido do servidor)
  useEffect(() => {
    if (mirrorRef.current && scrollPosition !== undefined && !isScrollingRef.current) {
      // Só atualizar se não estiver fazendo scroll manualmente
      const currentScroll = mirrorRef.current.scrollTop;
      const diff = Math.abs(currentScroll - scrollPosition);
      
      // Só atualizar se a diferença for significativa (mais de 5px)
      // para evitar micro-ajustes que causam loops
      if (diff > 5) {
        isScrollingRef.current = true;
        mirrorRef.current.scrollTop = scrollPosition;
        
        // Resetar flag após um tempo
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 200);
      }
    }
  }, [scrollPosition]);

  const sendScrollSync = (scrollTop: number) => {
    if (!socket || !isConnected) return;

    // Throttle: enviar apenas a cada 50ms para evitar spam
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      socket.emit('remote-command', {
        sessionId,
        command: 'scroll-sync',
        scrollPosition: scrollTop,
      });
      console.log('📱 Scroll sincronizado:', scrollTop);
    }, 50);
  };

  // Handler para scroll (mouse wheel e touch)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target && !isScrollingRef.current) {
      // Pequeno delay para evitar conflito com scroll recebido do servidor
      setTimeout(() => {
        if (!isScrollingRef.current && target) {
          sendScrollSync(target.scrollTop);
        }
      }, 10);
    }
  };

  // Handler para touch events
  const handleTouchStart = () => {
    isScrollingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target) {
      isScrollingRef.current = true;
      sendScrollSync(target.scrollTop);
    }
  };

  const handleTouchEnd = () => {
    // Pequeno delay para garantir que o scroll final seja enviado
    setTimeout(() => {
      isScrollingRef.current = false;
      if (mirrorRef.current) {
        sendScrollSync(mirrorRef.current.scrollTop);
      }
    }, 100);
  };

  const retryJoin = () => {
    if (!socket) {
      toast.error('Socket não está disponível para reconectar');
      return;
    }

    setIsConnecting(true);
    setJoinError(null);

    socket.emit('join-remote', sessionId, (response: any) => {
      console.log('Resposta join-remote (retry):', response);
      setIsConnecting(false);
      if (response?.success) {
        setJoinError(null);
        setCurrentSlide(response.currentSlide || 0);
        setTotalSlides(response.totalSlides || 0);
        toast.success('Reconectado!', { description: 'Controle remoto ativo' });
      } else {
        setJoinError(response?.error || 'Sessão não encontrada');
        toast.error('Falha ao reconectar', { description: response?.error || 'Sessão não encontrada' });
      }
    });
  };

  const sendCommand = (command: 'next' | 'previous' | 'goto' | 'scroll' | 'presenter' | 'focus', slideIndex?: number, scrollDirection?: 'up' | 'down') => {
    console.log('RemoteControl - Enviando comando:', { command, slideIndex, scrollDirection });
    
    if (!socket || !isConnected) {
      toast.error('Não conectado', {
        description: 'Verifique a conexão'
      });
      return;
    }

    // Toggle para presenter e focus
    if (command === 'presenter') {
      const newState = !isPresenterMode;
      setIsPresenterMode(newState);
      socket.emit('remote-command', {
        sessionId,
        command: 'presenter',
        toggle: newState,
      });
      toast.success(newState ? 'Modo apresentação ativado' : 'Modo apresentação desativado');
      return;
    }

    if (command === 'focus') {
      const newState = !isFocusMode;
      setIsFocusMode(newState);
      socket.emit('remote-command', {
        sessionId,
        command: 'focus',
        toggle: newState,
      });
      toast.success(newState ? 'Modo foco ativado' : 'Modo foco desativado');
      return;
    }

    socket.emit('remote-command', {
      sessionId,
      command,
      slideIndex,
      scrollDirection,
    });

    // Feedback visual
    const commandMessages = {
      next: 'Próximo slide',
      previous: 'Slide anterior',
      goto: `Indo para slide ${(slideIndex || 0) + 1}`,
      scroll: scrollDirection === 'up' ? 'Rolando para cima' : 'Rolando para baixo',
    };

    if (commandMessages[command]) {
      toast.success(commandMessages[command]);
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Conectando...</h2>
          <p className="text-slate-400">Estabelecendo conexão com a apresentação</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {isVercel ? <QrCode className="text-orange-400" size={32} /> : <WifiOff className="text-red-400" size={32} />}
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            {isVercel ? 'Controle Remoto Não Disponível' : 'Erro de Conexão'}
          </h2>
          <p className="text-slate-400 mb-4">{error}</p>
          {isVercel ? (
            <div className="text-left bg-slate-800/50 p-4 rounded-lg mb-4">
              <p className="text-slate-300 text-sm mb-2">✅ Funciona em:</p>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Railway.app (recomendado)</li>
                <li>• Render.com</li>
                <li>• Heroku</li>
                <li>• Servidor próprio</li>
              </ul>
            </div>
          ) : null}
          <Button 
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isVercel ? '← Voltar à Apresentação' : 'Tentar Novamente'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Smartphone className="text-violet-400" size={24} />
            <h1 className="text-white text-2xl font-bold">Controle Remoto</h1>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <Wifi size={14} />
                <span>Conectado</span>
              </div>
            ) : (
              <span className="text-red-400 text-sm">Desconectado</span>
            )}
          </div>

          {/* Join Error (não bloquear toda a UI) */}
          {joinError ? (
            <div className="mb-4 p-3 rounded-lg bg-yellow-900/30 border border-yellow-800">
              <p className="text-yellow-200 text-sm">{joinError}</p>
              <div className="mt-3 flex justify-center">
                <Button onClick={retryJoin} className="bg-yellow-700 hover:bg-yellow-600">Tentar reconectar</Button>
              </div>
            </div>
          ) : null}

          {/* Slide Counter */}
          {totalSlides > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-3 mb-6">
              <p className="text-slate-400 text-sm mb-1">Slide atual</p>
              <p className="text-white text-2xl font-bold">
                {currentSlide + 1} <span className="text-slate-500">de {totalSlides}</span>
              </p>
              {/* Progress Bar */}
              <div className="mt-2 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Espelho da Apresentação */}
          <div className="bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/20 rounded-lg blur-sm"></div>
                  <div className="relative bg-linear-to-br from-violet-600 to-indigo-600 p-2 rounded-lg">
                    <span className="text-white text-lg">📺</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Espelho da Apresentação</h3>
                  <p className="text-slate-400 text-xs">Role para sincronizar</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-xs">
                  {currentSlide + 1} / {totalSlides}
                </span>
              </div>
            </div>
            
            <div 
              ref={mirrorRef}
              className="relative rounded-2xl shadow-2xl overflow-hidden touch-pan-y border border-white/10 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"
              style={{ height: '320px', WebkitOverflowScrolling: 'touch' }}
            >
              {/* Gradient overlay no topo */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-linear-to-b from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none"></div>
              
              {/* Gradient overlay na base */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none"></div>
              {presentationContent ? (
                <div 
                  className="h-full overflow-y-auto custom-scrollbar-mirror"
                  onScroll={handleScroll}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div 
                    className="presentation-mirror p-8 text-slate-100 leading-relaxed"
                    style={{
                      fontSize: '12px',
                      lineHeight: '1.7',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      touchAction: 'pan-y',
                      minHeight: '100%'
                    }}
                    dangerouslySetInnerHTML={{ __html: presentationContent }}
                  />
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      /* Custom scrollbar para o espelho */
                      .custom-scrollbar-mirror {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(139, 92, 246, 0.5) transparent;
                      }
                      
                      .custom-scrollbar-mirror::-webkit-scrollbar {
                        width: 6px;
                      }
                      
                      .custom-scrollbar-mirror::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      
                      .custom-scrollbar-mirror::-webkit-scrollbar-thumb {
                        background: rgba(139, 92, 246, 0.4);
                        border-radius: 10px;
                        border: 1px solid transparent;
                        background-clip: padding-box;
                      }
                      
                      .custom-scrollbar-mirror::-webkit-scrollbar-thumb:hover {
                        background: rgba(139, 92, 246, 0.6);
                      }
                      
                      .presentation-mirror h1 {
                        font-size: 18px !important;
                        font-weight: 800 !important;
                        margin: 1.2em 0 0.6em 0 !important;
                        color: #ffffff !important;
                        border-bottom: 2px solid rgba(139, 92, 246, 0.4) !important;
                        padding-bottom: 0.4em !important;
                        line-height: 1.3 !important;
                      }
                      
                      .presentation-mirror h2 {
                        font-size: 16px !important;
                        font-weight: 700 !important;
                        margin: 1em 0 0.5em 0 !important;
                        color: #e2e8f0 !important;
                        line-height: 1.4 !important;
                      }
                      
                      .presentation-mirror h3 {
                        font-size: 14px !important;
                        font-weight: 600 !important;
                        margin: 0.8em 0 0.4em 0 !important;
                        color: #cbd5e1 !important;
                        line-height: 1.5 !important;
                      }
                      
                      .presentation-mirror p {
                        margin: 0.6em 0 !important;
                        color: #cbd5e1 !important;
                        line-height: 1.7 !important;
                      }
                      
                      .presentation-mirror ul, .presentation-mirror ol {
                        margin: 0.6em 0 0.6em 1.5em !important;
                        color: #cbd5e1 !important;
                      }
                      
                      .presentation-mirror li {
                        margin: 0.3em 0 !important;
                        line-height: 1.6 !important;
                      }
                      
                      .presentation-mirror code {
                        background-color: rgba(139, 92, 246, 0.15) !important;
                        padding: 0.15em 0.4em !important;
                        border-radius: 0.375rem !important;
                        font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
                        font-size: 11px !important;
                        color: #a78bfa !important;
                        border: 1px solid rgba(139, 92, 246, 0.2) !important;
                      }
                      
                      .presentation-mirror pre {
                        background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%) !important;
                        color: #e2e8f0 !important;
                        padding: 1em !important;
                        border-radius: 0.75rem !important;
                        margin: 0.8em 0 !important;
                        overflow-x: auto !important;
                        font-size: 10px !important;
                        border: 1px solid rgba(139, 92, 246, 0.2) !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
                      }
                      
                      .presentation-mirror pre code {
                        background: transparent !important;
                        padding: 0 !important;
                        border: none !important;
                        color: inherit !important;
                      }
                      
                      .presentation-mirror blockquote {
                        border-left: 4px solid rgba(139, 92, 246, 0.6) !important;
                        margin: 0.8em 0 !important;
                        padding-left: 1.2em !important;
                        color: #a78bfa !important;
                        font-style: italic !important;
                        background: rgba(139, 92, 246, 0.05) !important;
                        padding: 0.8em 1.2em !important;
                        border-radius: 0 0.5rem 0.5rem 0 !important;
                      }
                      
                      .presentation-mirror strong {
                        font-weight: 700 !important;
                        color: #ffffff !important;
                      }
                      
                      .presentation-mirror em {
                        font-style: italic !important;
                        color: #cbd5e1 !important;
                      }
                      
                      .presentation-mirror a {
                        color: #a78bfa !important;
                        text-decoration: underline !important;
                        text-decoration-color: rgba(139, 92, 246, 0.4) !important;
                      }
                      
                      .presentation-mirror a:hover {
                        color: #c4b5fd !important;
                      }
                      
                      .presentation-mirror table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin: 0.8em 0 !important;
                        font-size: 11px !important;
                        border-radius: 0.5rem !important;
                        overflow: hidden !important;
                      }
                      
                      .presentation-mirror th, .presentation-mirror td {
                        border: 1px solid rgba(139, 92, 246, 0.2) !important;
                        padding: 0.5em 0.8em !important;
                        text-align: left !important;
                      }
                      
                      .presentation-mirror th {
                        background: rgba(139, 92, 246, 0.2) !important;
                        font-weight: 600 !important;
                        color: #ffffff !important;
                      }
                      
                      .presentation-mirror td {
                        color: #cbd5e1 !important;
                      }
                      
                      .presentation-mirror img {
                        max-width: 100% !important;
                        height: auto !important;
                        border-radius: 0.5rem !important;
                        margin: 0.8em 0 !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
                      }
                    `
                  }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-900/50">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-lg"></div>
                      <div className="relative animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent mx-auto"></div>
                    </div>
                    <p className="text-slate-200 text-sm font-medium">Carregando apresentação...</p>
                    <p className="text-slate-400 text-xs mt-1">Aguarde a sincronização</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                  <span className="text-violet-400 animate-pulse">👆</span>
                  <span className="text-violet-300 font-medium">Role para sincronizar</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 font-medium">Desconectado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Navigation */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => sendCommand('previous')}
              disabled={!isConnected || currentSlide <= 0}
              size="lg"
              className="h-16 bg-slate-800 hover:bg-slate-700 border border-slate-600 flex flex-col items-center gap-1"
            >
              <ChevronLeft size={24} />
              <span className="text-xs">Anterior</span>
            </Button>

            <Button
              onClick={() => sendCommand('next')}
              disabled={!isConnected || currentSlide >= totalSlides - 1}
              size="lg"
              className="h-16 bg-slate-800 hover:bg-slate-700 border border-slate-600 flex flex-col items-center gap-1"
            >
              <ChevronRight size={24} />
              <span className="text-xs">Próximo</span>
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => sendCommand('goto', 0)}
              disabled={!isConnected || currentSlide === 0}
              variant="outline"
              size="lg"
              className="h-12 border-slate-600 hover:border-violet-400 flex items-center gap-2"
            >
              <SkipBack size={20} />
              <span className="text-sm">Primeiro</span>
            </Button>

            <Button
              onClick={() => sendCommand('goto', totalSlides - 1)}
              disabled={!isConnected || currentSlide >= totalSlides - 1}
              variant="outline"
              size="lg"
              className="h-12 border-slate-600 hover:border-violet-400 flex items-center gap-2"
            >
              <SkipForward size={20} />
              <span className="text-sm">Último</span>
            </Button>
          </div>

          {/* Scroll Controls */}
          <div className="mt-6">
            <h3 className="text-slate-300 text-sm font-medium mb-3">🖱️ Controles de Rolagem:</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  console.log('Botão scroll UP clicado!');
                  sendCommand('scroll', currentSlide, 'up');
                }}
                disabled={!isConnected}
                size="lg"
                className="h-14 bg-indigo-800 hover:bg-indigo-700 border border-indigo-600 flex flex-col items-center gap-1"
              >
                <ChevronUp size={24} />
                <span className="text-xs">Rolar ↑</span>
              </Button>

              <Button
                onClick={() => {
                  console.log('Botão scroll DOWN clicado!');
                  sendCommand('scroll', currentSlide, 'down');
                }}
                disabled={!isConnected}
                size="lg"
                className="h-14 bg-indigo-800 hover:bg-indigo-700 border border-indigo-600 flex flex-col items-center gap-1"
              >
                <ChevronDown size={24} />
                <span className="text-xs">Rolar ↓</span>
              </Button>
            </div>
          </div>

          {/* Atalhos Especiais */}
          <div className="mt-6">
            <h3 className="text-slate-300 text-sm font-medium mb-3">⌨️ Atalhos Especiais:</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  console.log('Botão Presenter Mode clicado!');
                  sendCommand('presenter');
                }}
                disabled={!isConnected}
                size="lg"
                className={`h-14 flex flex-col items-center gap-1 transition-all ${
                  isPresenterMode
                    ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 shadow-lg shadow-purple-500/50'
                    : 'bg-purple-800 hover:bg-purple-700 border border-purple-600'
                }`}
              >
                <Play size={20} className={isPresenterMode ? 'text-white' : 'text-purple-200'} />
                <span className={`text-xs ${isPresenterMode ? 'text-white font-semibold' : 'text-purple-200'}`}>
                  {isPresenterMode ? 'Apresentando (P)' : 'Apresentar (P)'}
                </span>
              </Button>

              <Button
                onClick={() => {
                  console.log('Botão Focus Mode clicado!');
                  sendCommand('focus');
                }}
                disabled={!isConnected}
                size="lg"
                className={`h-14 flex flex-col items-center gap-1 transition-all ${
                  isFocusMode
                    ? 'bg-amber-600 hover:bg-amber-700 border-2 border-amber-400 shadow-lg shadow-amber-500/50'
                    : 'bg-amber-800 hover:bg-amber-700 border border-amber-600'
                }`}
              >
                <QrCode size={20} className={isFocusMode ? 'text-white' : 'text-amber-200'} />
                <span className={`text-xs ${isFocusMode ? 'text-white font-semibold' : 'text-amber-200'}`}>
                  {isFocusMode ? 'Foco Ativo (F)' : 'Foco (F)'}
                </span>
              </Button>
            </div>
          </div>

          {/* Slide Grid - Quick Jump */}
          {totalSlides > 0 && totalSlides <= 20 && (
            <div className="mt-8">
              <h3 className="text-slate-300 text-sm font-medium mb-3">Ir para slide:</h3>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => sendCommand('goto', i)}
                    disabled={!isConnected}
                    size="sm"
                    variant={currentSlide === i ? "default" : "outline"}
                    className={`h-10 text-xs ${
                      currentSlide === i
                        ? 'bg-violet-600 hover:bg-violet-700 border-violet-500'
                        : 'border-slate-600 hover:border-violet-400'
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-xs">
            Sessão: {sessionId}
          </p>
        </div>
      </div>
    </div>
  );

  } catch (renderError) {
    console.error('Erro de renderização no RemoteControl:', renderError);
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <h1 className="text-red-600 font-bold text-xl mb-2">Erro de Carregamento</h1>
          <p className="text-gray-600 mb-4">
            Ocorreu um erro ao carregar o controle remoto.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            SessionId: {sessionId}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
};