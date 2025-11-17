import fs from 'fs';
import path from 'path';

// Criar pasta dist se não existir
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copiar server.js
fs.copyFileSync('server.js', 'dist/server.js');

// Ler package.json original
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Criar package.json simplificado para produção
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  type: 'module',
  scripts: {
    start: 'node server.js'
  },
  dependencies: {
    express: pkg.dependencies.express,
    'socket.io': pkg.dependencies['socket.io'],
    uuid: pkg.dependencies.uuid,
    dotenv: pkg.dependencies.dotenv
  }
};

// Salvar package.json na pasta dist
fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));

console.log('✅ Arquivos de produção copiados para dist/');
console.log('📁 Conteúdo: server.js, package.json');
console.log('🚀 Para rodar: cd dist && npm install && npm start');