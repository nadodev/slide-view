// GitHub OAuth utilities for authentication and repository management

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description?: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  language?: string;
}

export interface GitHubAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

// GitHub OAuth App Configuration
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;

/**
 * Iniciar o fluxo de autenticação OAuth do GitHub
 */
export function initiateGitHubAuth(): void {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('github_oauth_state', state);
  
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'repo user:email');
  authUrl.searchParams.set('state', state);
  
  // Abrir em nova janela para melhor UX
  const popup = window.open(
    authUrl.toString(),
    'github-auth',
    'width=600,height=700,scrollbars=yes,resizable=yes'
  );

  // Escutar mensagens da janela popup
  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }
    
    if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
      popup?.close();
      handleAuthCallback(event.data.code, event.data.state);
    } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
      popup?.close();
      console.error('Erro na autenticação GitHub:', event.data.error);
    }
  });
}

/**
 * Processar callback da autenticação OAuth
 */
async function handleAuthCallback(code: string, state: string): Promise<boolean> {
  const savedState = localStorage.getItem('github_oauth_state');
  
  if (state !== savedState) {
    console.error('Estado OAuth inválido');
    return false;
  }
  
  localStorage.removeItem('github_oauth_state');
  
  try {
    // Trocar o código por um token de acesso
    // Nota: Em produção, isso deveria ser feito no backend por segurança
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (tokenResponse.access_token) {
      localStorage.setItem('github_access_token', tokenResponse.access_token);
      
      // Buscar informações do usuário
      const user = await fetchGitHubUser(tokenResponse.access_token);
      localStorage.setItem('github_user', JSON.stringify(user));
      
      // Disparar evento para atualizar a UI
      window.dispatchEvent(new CustomEvent('github-auth-success', { 
        detail: { user, token: tokenResponse.access_token } 
      }));
      
      return true;
    }
  } catch (error) {
    console.error('Erro ao processar callback OAuth:', error);
  }
  
  return false;
}

/**
 * Trocar código OAuth por token de acesso
 * AVISO: Em produção, isso deve ser feito no backend!
 */
async function exchangeCodeForToken(code: string): Promise<any> {
  // Esta implementação é apenas para desenvolvimento
  // Em produção, você precisaria de um endpoint no seu backend
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET, // NUNCA exponha isso em produção!
      code,
    }),
  });
  
  return await response.json();
}

/**
 * Buscar informações do usuário autenticado
 */
export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar informações do usuário');
  }
  
  return await response.json();
}

/**
 * Buscar repositórios do usuário autenticado
 */
export async function fetchUserRepositories(token: string): Promise<GitHubRepository[]> {
  const repositories: GitHubRepository[] = [];
  let page = 1;
  const perPage = 50;
  
  while (true) {
    const response = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=${perPage}&page=${page}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar repositórios');
    }
    
    const pageRepos = await response.json();
    
    if (pageRepos.length === 0) {
      break;
    }
    
    repositories.push(...pageRepos);
    page++;
    
    // Limitar a 200 repositórios para evitar problemas de performance
    if (repositories.length >= 200) {
      break;
    }
  }
  
  return repositories;
}

/**
 * Obter estado atual da autenticação
 */
export function getAuthState(): GitHubAuthState {
  const token = localStorage.getItem('github_access_token');
  const userJson = localStorage.getItem('github_user');
  
  let user: GitHubUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      localStorage.removeItem('github_user');
    }
  }
  
  return {
    isAuthenticated: !!(token && user),
    user,
    token,
  };
}

/**
 * Fazer logout do GitHub
 */
export function logoutGitHub(): void {
  localStorage.removeItem('github_access_token');
  localStorage.removeItem('github_user');
  localStorage.removeItem('github_oauth_state');
  
  window.dispatchEvent(new CustomEvent('github-auth-logout'));
}

/**
 * Verificar se o token ainda é válido
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    return response.ok;
  } catch {
    return false;
  }
}