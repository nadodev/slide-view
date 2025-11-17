import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Hook para detectar se WebSockets funcionam na plataforma atual
export const useWebSocketDetection = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    const detectWebSocketSupport = () => {
      // Detectar plataforma
      const hostname = window.location.hostname;
      if (hostname.includes('vercel.app')) {
        setPlatform('vercel');
        setIsSupported(false); // Vercel não suporta WebSockets adequadamente
        return;
      } else if (hostname.includes('railway.app')) {
        setPlatform('railway');
      } else if (hostname.includes('render.com')) {
        setPlatform('render');
      } else if (hostname.includes('herokuapp.com')) {
        setPlatform('heroku');
      } else if (hostname.includes('localhost')) {
        setPlatform('development');
      }

      // Testar WebSocket
      try {
        const testSocket = io(window.location.origin, {
          timeout: 3000,
          transports: ['websocket', 'polling']
        });

        testSocket.on('connect', () => {
          setIsSupported(true);
          testSocket.disconnect();
        });

        testSocket.on('connect_error', () => {
          setIsSupported(false);
          testSocket.disconnect();
        });

        setTimeout(() => {
          if (isSupported === null) {
            setIsSupported(false);
            testSocket.disconnect();
          }
        }, 3000);

      } catch (error) {
        setIsSupported(false);
      }
    };

    detectWebSocketSupport();
  }, []);

  return { isSupported, platform };
};