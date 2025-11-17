#!/usr/bin/env node

// Script para build no Railway com otimizações de memória
process.env.NODE_OPTIONS = '--max-old-space-size=2048 --max-semi-space-size=128';

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  console.log('🚀 Iniciando build otimizado para Railway...');
  console.log('📊 Limite de memória: 2GB');
  
  execSync('vite build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=128'
    }
  });
  
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
