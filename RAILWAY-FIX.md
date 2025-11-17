# 🔧 Correções para Build no Railway

## Problema
O build estava sendo "Killed" por falta de memória durante o processo de build.

## Soluções Implementadas

### 1. ✅ Otimizações no Vite (`vite.config.js`)
- **Sourcemaps desabilitados** - Reduz uso de memória
- **Paralelismo limitado** - `maxParallelFileOps: 2`
- **Code splitting melhorado** - Chunks menores e mais específicos
- **Minificação com esbuild** - Mais rápido e eficiente

### 2. ✅ Script de Build Otimizado (`scripts/build-railway.js`)
- Limite de memória reduzido para 2GB (mais seguro)
- Configuração de memória otimizada

### 3. ✅ Configuração do Railway (`railway.json`)
- Arquivo de configuração criado para o Railway

## ⚙️ Configuração Adicional no Railway

No painel do Railway, adicione estas **Variáveis de Ambiente**:

1. Vá em **Settings** → **Variables**
2. Adicione:
   - **Nome**: `NODE_OPTIONS`
   - **Valor**: `--max-old-space-size=2048 --max-semi-space-size=128`

## 📝 Comandos de Build

O script `build:railway` agora:
- Usa o script otimizado em `scripts/build-railway.js`
- Configura automaticamente os limites de memória
- Executa o build do Vite de forma eficiente

## 🚀 Próximos Passos

1. **Commit e push** das alterações
2. **Adicione a variável de ambiente** `NODE_OPTIONS` no Railway
3. O deploy deve funcionar agora!

## 🔍 Se ainda houver problemas

Se o build ainda falhar, você pode:

1. **Aumentar o limite de memória** (se o plano do Railway permitir):
   - Mude `2048` para `3072` ou `4096` no script
   
2. **Verificar o plano do Railway**:
   - Planos gratuitos podem ter limites de memória mais baixos
   - Considere fazer upgrade se necessário

3. **Otimizar dependências**:
   - Remover dependências não utilizadas
   - Usar imports dinâmicos para bibliotecas grandes (como Mermaid)

