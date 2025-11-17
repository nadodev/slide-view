import React from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from './ui/button';

interface RemoteControlModalProps {
  qrUrl?: string;
  sessionId?: string;
  remoteClients?: number;
  isConnected?: boolean;
  isSupported: boolean;
  platform: string;
  onClose?: () => void;
}

export const RemoteControlModal: React.FC<RemoteControlModalProps> = ({
  qrUrl,
  sessionId,
  remoteClients = 0,
  isConnected = false,
  isSupported,
  platform,
  onClose,
}) => {
  const isDevelopment = platform === 'development';
  
  // Mostrar modal apenas quando não está suportado ou em desenvolvimento
  if (!isSupported || isDevelopment) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <Smartphone className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-white">Controle Remoto</h2>
            </div>
            <p className="text-slate-400 text-sm">
              {isDevelopment ? 'Funcionalidade em desenvolvimento' : 'Não disponível no momento'}
            </p>
          </div>

          {/* User-friendly message */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="text-center">
              <Smartphone className="text-blue-400 mx-auto mb-3" size={48} />
              <h3 className="text-blue-200 font-semibold text-base mb-2">
                {isDevelopment ? '🔧 Funcionalidade em Desenvolvimento' : '📱 Controle Remoto'}
              </h3>
              <p className="text-blue-300/80 text-sm">
                {isDevelopment 
                  ? 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve!'
                  : 'O controle remoto via celular estará disponível em uma próxima atualização.'
                }
              </p>
            </div>
          </div>

          {/* Development instructions */}
          {isDevelopment && (
            <div className="mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-300 text-sm mb-2">Para desenvolvedores:</p>
                <code className="text-green-400 text-xs bg-slate-900/50 px-2 py-1 rounded">
                  npm run dev:full
                </code>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 hover:border-blue-400 text-white"
            >
              Entendi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se suportado, não renderizar nada (o QRCodeDisplay será renderizado pelo componente pai)
  return null;
};