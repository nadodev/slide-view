import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

// Carregar variáveis de ambiente
// Detectar se está no Railway ou outro ambiente
const isRailway = process.env.RAILWAY_ENVIRONMENT;
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isRailway) {
  dotenv.config({ path: '.env.railway' });
} else if (isDevelopment) {
  dotenv.config({ path: '.env' });
} else {
  dotenv.config({ path: '.env.production' });
}

console.log('Environment:', { 
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY: isRailway ? 'YES' : 'NO',
  PORT: process.env.PORT 
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Configuração do Socket.IO com CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache por 1 dia
  index: false  // Não servir index.html automaticamente
}));

console.log('Servindo arquivos estáticos de:', path.join(__dirname, 'dist'));

// Store das sessões de apresentação
const presentations = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Criar nova sessão de apresentação
  socket.on('create-presentation', (callback) => {
    const sessionId = uuidv4().slice(0, 8); // ID curto para facilitar
    const presentation = {
      id: sessionId,
      hostSocket: socket.id,
      currentSlide: 0,
      totalSlides: 0,
      remoteClients: [],
      createdAt: new Date()
    };
    
    presentations.set(sessionId, presentation);
    socket.join(`presentation-${sessionId}`);
    
    console.log(`📺 Nova apresentação criada: ${sessionId}`);
    
    // Determinar URL base dinamicamente
    // Tentar obter do header da requisição primeiro (mais confiável)
    const request = socket.request;
    const host = request?.headers?.host || request?.headers?.origin?.replace(/^https?:\/\//, '') || null;
    const protocol = request?.headers?.['x-forwarded-proto'] || (request?.secure ? 'https' : 'http') || 'http';
    
    const isProduction = process.env.NODE_ENV === 'production';
    const vercelUrl = process.env.VERCEL_URL;
    const isRailway = process.env.RAILWAY_ENVIRONMENT;
    const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN;
    
    let baseUrl;
    
    // Prioridade 1: URL do header da requisição (mais confiável)
    if (host) {
      baseUrl = `${protocol}://${host}`;
      console.log('✅ Usando URL do header:', baseUrl);
    } 
    // Prioridade 2: Variáveis de ambiente específicas
    else if (isProduction && railwayUrl) {
      baseUrl = `https://${railwayUrl}`;
      console.log('✅ Usando Railway URL:', baseUrl);
    } else if (isProduction && vercelUrl) {
      baseUrl = `https://${vercelUrl}`;
      console.log('✅ Usando Vercel URL:', baseUrl);
    } else if (process.env.VITE_BASE_URL) {
      baseUrl = process.env.VITE_BASE_URL;
      console.log('✅ Usando VITE_BASE_URL:', baseUrl);
    } else if (process.env.BASE_URL) {
      baseUrl = process.env.BASE_URL;
      console.log('✅ Usando BASE_URL:', baseUrl);
    } 
    // Prioridade 3: Fallback baseado no ambiente
    else if (isProduction && isRailway) {
      baseUrl = 'https://slide-view-production.up.railway.app';
      console.log('⚠️ Usando fallback Railway:', baseUrl);
    } else if (isProduction) {
      baseUrl = `http://localhost:${PORT}`;
      console.log('⚠️ Usando fallback produção:', baseUrl);
    } else {
      // Desenvolvimento - usar a porta do servidor ou do Vite
      const vitePort = process.env.VITE_PORT || '5173';
      baseUrl = `http://localhost:${vitePort}`;
      console.log('⚠️ Usando fallback desenvolvimento:', baseUrl);
    }
    
    // Remover trailing slash se houver
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log('🔧 Environment vars:', {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: isRailway,
      RAILWAY_PUBLIC_DOMAIN: railwayUrl,
      VERCEL_URL: vercelUrl,
      VITE_BASE_URL: process.env.VITE_BASE_URL,
      BASE_URL: process.env.BASE_URL,
      host: host,
      protocol: protocol
    });
    console.log('🔗 QR Code URL gerada:', `${baseUrl}/remote/${sessionId}`);
    
    callback({
      success: true,
      sessionId,
      qrUrl: `${baseUrl}/remote/${sessionId}`
    });
  });

  // Conectar como controle remoto
  socket.on('join-remote', (sessionId, callback) => {
    console.log('🔌 Cliente tentando conectar ao remote:', sessionId);
    const presentation = presentations.get(sessionId);
    
    if (!presentation) {
      console.log('❌ Apresentação não encontrada:', sessionId);
      console.log('📋 Sessões ativas:', Array.from(presentations.keys()));
      callback({ success: false, error: 'Apresentação não encontrada' });
      return;
    }

    // Verificar se cliente já está na lista
    if (!presentation.remoteClients.includes(socket.id)) {
      presentation.remoteClients.push(socket.id);
    }
    
    socket.join(`presentation-${sessionId}`);
    
    // Notificar o host sobre nova conexão
    socket.to(presentation.hostSocket).emit('remote-connected', {
      clientId: socket.id,
      totalRemotes: presentation.remoteClients.length
    });

    // Enviar estado atual para o remote
    callback({
      success: true,
      currentSlide: presentation.currentSlide,
      totalSlides: presentation.totalSlides
    });

    console.log(`✅ Controle remoto conectado à sessão: ${sessionId}`);
    
    // Enviar conteúdo da apresentação se disponível
    if (presentation.content) {
      socket.emit('presentation-content', {
        content: presentation.content,
        scrollPosition: presentation.scrollPosition || 0
      });
    }
  });

  // Receber conteúdo da apresentação do host
  socket.on('share-presentation-content', (sessionId, content) => {
    console.log('📤 Host compartilhando conteúdo da sessão:', sessionId);
    console.log('📦 Tamanho do conteúdo recebido:', content.length, 'chars');
    
    const presentation = presentations.get(sessionId);
    
    if (presentation && presentation.hostSocket === socket.id) {
      presentation.content = content;
      presentation.lastUpdated = new Date();
      console.log('✅ Conteúdo salvo para sessão:', sessionId);
      console.log('📊 Remote clients conectados:', presentation.remoteClients.length);
      
      // Enviar conteúdo atualizado para todos os controles remotos conectados
      const broadcastData = {
        content: content,
        scrollPosition: presentation.scrollPosition || 0
      };
      
      socket.to(`presentation-${sessionId}`).emit('presentation-content', broadcastData);
      console.log('📡 Conteúdo enviado para controles remotos');
    } else {
      console.log('❌ Tentativa inválida de compartilhar conteúdo:', {
        sessionId,
        presentation: !!presentation,
        isCorrectHost: presentation ? presentation.hostSocket === socket.id : false,
        hostSocket: presentation?.hostSocket,
        currentSocket: socket.id
      });
    }
  });

  // Comandos de navegação do controle remoto
  socket.on('remote-command', ({ sessionId, command, slideIndex, scrollDirection, scrollPosition, toggle }) => {
    console.log('🎮 Servidor - Comando recebido:', { sessionId, command, slideIndex, scrollDirection, scrollPosition, toggle });
    console.log('📊 Tipo de comando:', command, 'é scroll?', command === 'scroll');
    
    const presentation = presentations.get(sessionId);
    
    if (!presentation || !presentation.remoteClients.includes(socket.id)) {
      console.log('❌ Sessão não encontrada ou cliente não autorizado');
      return;
    }

    console.log('✅ Sessão válida, processando comando:', command);

    // Processar comandos de scroll sincronizado
    if (command === 'scroll-sync') {
      console.log('📱 Processando scroll-sync para host:', presentation.hostSocket);
      // Enviar comando de scroll para o host
      socket.to(presentation.hostSocket).emit('remote-command', {
        command: 'scroll-sync',
        scrollPosition,
        fromClient: socket.id
      });
      
      // Sincronizar com outros remotes
      socket.to(`presentation-${sessionId}`).emit('scroll-sync', {
        scrollPosition
      });
      return;
    }

    // Atualizar slide atual se necessário
    if (command === 'goto' && slideIndex !== undefined) {
      presentation.currentSlide = slideIndex;
    } else if (command === 'next') {
      presentation.currentSlide = Math.min(presentation.currentSlide + 1, presentation.totalSlides - 1);
    } else if (command === 'previous') {
      presentation.currentSlide = Math.max(presentation.currentSlide - 1, 0);
    }
    // Para scroll, presenter, focus não alteramos currentSlide - apenas passamos o comando

    console.log('📡 Enviando comando para host:', presentation.hostSocket);
    
    const commandData = {
      command,
      slideIndex: presentation.currentSlide,
      scrollDirection,
      toggle,
      fromClient: socket.id
    };
    console.log('📦 Dados do comando sendo enviado:', commandData);

    // Enviar comando para o host
    socket.to(presentation.hostSocket).emit('remote-command', commandData);

    if (command === 'scroll') {
      console.log(`🖱️ Comando de scroll ${scrollDirection} enviado para host`);
    }

    // Sincronizar com outros remotes apenas para navegação de slides
    if (command !== 'scroll' && command !== 'presenter' && command !== 'focus') {
      socket.to(`presentation-${sessionId}`).emit('sync-slide', {
        currentSlide: presentation.currentSlide,
        totalSlides: presentation.totalSlides
      });
    }

    console.log(`🎮 Comando remoto: ${command} | Slide: ${presentation.currentSlide}`);
  });

  // Atualizar informações da apresentação (enviado pelo host)
  socket.on('update-presentation', ({ sessionId, currentSlide, totalSlides }) => {
    const presentation = presentations.get(sessionId);
    
    if (!presentation || presentation.hostSocket !== socket.id) {
      return;
    }

    presentation.currentSlide = currentSlide;
    presentation.totalSlides = totalSlides;

    // Sincronizar com todos os controles remotos
    socket.to(`presentation-${sessionId}`).emit('sync-slide', {
      currentSlide,
      totalSlides
    });
  });

  // Lidar com desconexões
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);

    // Encontrar e limpar apresentações órfãs
    for (const [sessionId, presentation] of presentations.entries()) {
      if (presentation.hostSocket === socket.id) {
        // Host desconectou - encerrar apresentação
        io.to(`presentation-${sessionId}`).emit('presentation-ended');
        presentations.delete(sessionId);
        console.log(`📺 Apresentação ${sessionId} encerrada (host desconectou)`);
      } else {
        // Remover cliente remoto da lista
        const index = presentation.remoteClients.indexOf(socket.id);
        if (index > -1) {
          presentation.remoteClients.splice(index, 1);
          
          // Notificar host sobre desconexão
          socket.to(presentation.hostSocket).emit('remote-disconnected', {
            clientId: socket.id,
            totalRemotes: presentation.remoteClients.length
          });
        }
      }
    }
  });
});

// API de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas específicas para React Router (SPA)
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath);
});

app.get('/app', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath);
});

app.get('/landing', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath);
});

app.get('/remote/:sessionId', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath);
});

// Fallback para outras rotas (sem usar catch-all)
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Serving fallback index.html for:', req.path);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Função para obter IP local
const getLocalIP = () => {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (error) {
    console.log('Não foi possível obter IP local:', error.message);
  }
  return 'localhost';
};

// Iniciar servidor (não em ambientes serverless como Vercel)
const isServerless = process.env.VERCEL || process.env.NETLIFY;
if (!isServerless) {
  server.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 URLs disponíveis:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${localIP}:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`   Produção: ${process.env.BASE_URL || 'Configure BASE_URL'}`);
    }
    console.log(`📲 Controles remotos: /remote/{sessionId}`);
  });
} else {
  console.log('🚫 Ambiente serverless detectado - servidor não inicializado');
}

// Exportar para Vercel
export default app;