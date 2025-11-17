# GitHub OAuth Integration Setup

## Configuração da Aplicação OAuth no GitHub

Para usar a integração com GitHub, você precisa criar uma aplicação OAuth no GitHub:

### 1. Criar OAuth App no GitHub

1. Acesse https://github.com/settings/applications/new
2. Preencha os campos:
   - **Application name**: `Slide View App`
   - **Homepage URL**: `http://localhost:5173` (ou seu domínio em produção)
   - **Authorization callback URL**: `http://localhost:5173/auth/github/callback`
3. Clique em "Register application"
4. Copie o `Client ID` e `Client Secret`

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais:
   ```env
   VITE_GITHUB_CLIENT_ID=seu_client_id_aqui
   VITE_GITHUB_CLIENT_SECRET=seu_client_secret_aqui
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
   ```

### 3. Funcionalidades Implementadas

- **Login OAuth**: Autenticação usando conta GitHub
- **Seleção de Repositórios**: Interface visual para escolher repositórios
- **Pull/Push**: Sincronização bidirecional de arquivos .md
- **Filtros**: Pesquisa e ordenação de repositórios
- **Preview**: Visualização de arquivos antes da sincronização

### 4. Como Usar

1. No EditPanel, clique no botão "GitHub"
2. Faça login com sua conta GitHub
3. Selecione o repositório desejado
4. Configure branch e caminho (opcional)
5. Use "Pull" para baixar arquivos ou "Push" para enviar

### 5. Segurança em Produção

⚠️ **IMPORTANTE**: Em produção, nunca exponha `CLIENT_SECRET` no frontend!

Implemente um backend que:
- Mantenha o `CLIENT_SECRET` em segredo
- Processe o código OAuth e retorne apenas o token
- Gerencie refresh tokens quando necessário

### 6. Permissões Necessárias

A aplicação solicita as seguintes permissões (scopes):
- `repo`: Acesso a repositórios públicos e privados
- `user:email`: Acesso ao email do usuário

### 7. Limitações

- Rate limits da API do GitHub (5000 requisições/hora para usuários autenticados)
- Tokens OAuth expiram e podem precisar de refresh
- Arquivos muito grandes podem ter problemas de performance