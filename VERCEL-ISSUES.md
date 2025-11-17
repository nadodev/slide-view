# 🚨 Vercel Socket.IO - Limitações

## ⚠️ Problema com Vercel

A **Vercel tem limitações com WebSockets** (Socket.IO). Para controle remoto funcionar 100%, use:

## ✅ Plataformas Recomendadas

### 1. Railway (Melhor opção)
```bash
# 1. Conecte repositório em railway.app
# 2. Configure variáveis:
NODE_ENV=production
VITE_API_URL=https://sua-app.railway.app
VITE_SOCKET_URL=https://sua-app.railway.app
```

### 2. Render
```bash
# Build Command: npm run build
# Start Command: npm start
```

### 3. Heroku
```bash
# Adicionar Procfile:
web: npm start
```

## 🔧 Deploy Rápido Railway

1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Configure variáveis de ambiente
4. Deploy automático! 🚀

## 📱 Para Vercel (sem controle remoto)

Se quiser usar Vercel mesmo assim (só apresentação):

```bash
npm run build
vercel --prod
```

**Limitação**: Botão "QR Code" não funcionará (WebSockets bloqueados)

## 🎯 Recomendação

Para **experiência completa** com controle remoto:
- ✅ **Railway** (gratuito + fácil)
- ✅ **Render** (gratuito + confiável) 
- ✅ **Heroku** (pago mas estável)

Para **apenas apresentação** (sem celular):
- ✅ **Vercel** (super rápido)
- ✅ **Netlify** (simples)