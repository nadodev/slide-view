import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface PresentationSession {
  sessionId: string;
  qrUrl: string;
  isConnected: boolean;
  remoteClients: number;
}

interface RemoteCommand {
  command: 'next' | 'previous' | 'goto' | 'scroll' | 'scroll-sync';
  slideIndex?: number;
  scrollDirection?: 'up' | 'down';
  scrollPosition?: number;
  fromClient: string;
}

interface UseSocketReturn {
  session: PresentationSession | null;
  isConnecting: boolean;
  error: string | null;
  createPresentation: () => void;
  updateSlide: (currentSlide: number, totalSlides: number) => void;
  disconnect: () => void;
  onRemoteCommand: (callback: (command: RemoteCommand) => void) => void;
  isSupported: boolean;
  platform: string;
}

export const useSocket = (): UseSocketReturn => {
  const [session, setSession] = useState<PresentationSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const commandCallbackRef = useRef<((command: RemoteCommand) => void) | null>(null);

  // Detectar plataforma e suporte a WebSockets
  const [platform, setPlatform] = useState<string>('unknown');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    if (hostname.includes('vercel.app')) {
      setPlatform('vercel');
      setIsSupported(false); // Vercel não suporta WebSockets adequadamente
    } else if (hostname.includes('netlify.app')) {
      setPlatform('netlify');
      setIsSupported(false); // Netlify não suporta WebSockets
    } else if (hostname.includes('railway.app')) {
      setPlatform('railway');
      setIsSupported(true);
    } else if (hostname.includes('render.com')) {
      setPlatform('render');
      setIsSupported(true);
    } else if (hostname.includes('herokuapp.com')) {
      setPlatform('heroku');
      setIsSupported(true);
    } else if (hostname.includes('localhost')) {
      setPlatform('development');
      setIsSupported(true);
    } else {
      setPlatform('custom');
      setIsSupported(true); // Assumir que suporta, testar depois
    }
  }, []);

  // Conectar ao servidor
  const connect = () => {
    if (socketRef.current?.connected) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      socketRef.current = io(apiUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Conectado ao servidor Socket.IO');
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log('🔌 Desconectado do servidor Socket.IO');
        setSession(prev => prev ? { ...prev, isConnected: false } : null);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('❌ Erro de conexão:', err);
        if (platform === 'development') {
          setError('Servidor não está rodando. Execute: npm run dev:full');
        } else {
          setError('Erro ao conectar com o servidor');
        }
        setIsConnecting(false);
      });

      // Eventos de controle remoto
      socketRef.current.on('remote-connected', ({ totalRemotes }) => {
        setSession(prev => prev ? { ...prev, remoteClients: totalRemotes } : null);
      });

      socketRef.current.on('remote-disconnected', ({ totalRemotes }) => {
        setSession(prev => prev ? { ...prev, remoteClients: totalRemotes } : null);
      });

      socketRef.current.on('remote-command', (command: RemoteCommand) => {
        if (commandCallbackRef.current) {
          commandCallbackRef.current(command);
        }
      });

    } catch (err) {
      console.error('❌ Erro ao inicializar socket:', err);
      setError('Erro ao inicializar conexão');
      setIsConnecting(false);
    }
  };

  const createPresentation = () => {
    // Verificar se a plataforma suporta WebSockets
    if (!isSupported) {
      setError(`Controle remoto não disponível em ${platform}. Use Railway, Render ou Heroku.`);
      return;
    }

    // No desenvolvimento, verificar se servidor está rodando
    if (platform === 'development') {
      const checkServer = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/health');
          if (!response.ok) {
            throw new Error('Servidor não respondeu');
          }
        } catch (error) {
          setError('Servidor Socket.IO não está rodando. Execute: npm run dev:full');
          setIsConnecting(false);
          return;
        }
      };
      checkServer();
    }

    if (!socketRef.current) {
      connect();
    }

    setIsConnecting(true);
    setError(null);

    if (socketRef.current) {
      socketRef.current.emit('create-presentation', (response: any) => {
        setIsConnecting(false);

        if (response.success) {
          setSession({
            sessionId: response.sessionId,
            qrUrl: response.qrUrl,
            isConnected: true,
            remoteClients: 0,
          });
          console.log('📺 Apresentação criada:', response.sessionId);
        } else {
          setError('Erro ao criar apresentação');
        }
      });
    }
  };

  const updateSlide = (currentSlide: number, totalSlides: number) => {
    if (socketRef.current && session) {
      socketRef.current.emit('update-presentation', {
        sessionId: session.sessionId,
        currentSlide,
        totalSlides,
      });
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSession(null);
    setError(null);
    setIsConnecting(false);
  };

  const onRemoteCommand = (callback: (command: RemoteCommand) => void) => {
    commandCallbackRef.current = callback;
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    session,
    isConnecting,
    error,
    createPresentation,
    updateSlide,
    disconnect,
    onRemoteCommand,
    isSupported,
    platform,
  };
};