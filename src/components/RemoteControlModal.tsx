import React from 'react';
import { QrCode, Smartphone, AlertTriangle, ExternalLink } from 'lucide-react';
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
  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <AlertTriangle className="text-orange-400" size={24} />
              <h2 className="text-xl font-bold text-white">Controle Remoto</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Não disponível em {platform === 'vercel' ? 'Vercel' : platform}
            </p>
          </div>

          {/* Platform info */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-400 mt-0.5" size={20} />
              <div>
                <h3 className="text-orange-200 font-semibold text-sm mb-1">
                  WebSockets não suportados
                </h3>
                <p className="text-orange-300/80 text-xs">
                  {platform === 'vercel' 
                    ? 'Vercel tem limitações com WebSockets em tempo real'
                    : `${platform} não suporta WebSockets para esta aplicação`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div className="mb-6">
            <h3 className="text-slate-300 font-semibold mb-3 text-sm">✅ Para usar controle remoto:</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 text-sm">Railway.app</span>
                <span className="text-green-400 text-xs">Recomendado</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 text-sm">Render.com</span>
                <span className="text-blue-400 text-xs">Grátis</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 text-sm">Heroku</span>
                <span className="text-purple-400 text-xs">Estável</span>
              </div>
            </div>
          </div>

          {/* Quick deploy button */}
          <div className="text-center mb-6">
            <Button
              onClick={() => window.open('https://railway.app', '_blank')}
              className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Deploy no Railway
            </Button>
            <p className="text-slate-500 text-xs mt-2">
              Deploy gratuito com controle remoto funcionando
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 hover:border-violet-400 text-white"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se suportado, importar e mostrar QRCodeDisplay original
  return null; // Isso não deveria ser chamado se isSupported for true
};