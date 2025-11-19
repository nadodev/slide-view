import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para lidar com callback do GitHub OAuth
 */
export default function GitHubCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem('github_oauth_state');

      // Verificar se há erro
      const error = urlParams.get('error');
      if (error) {
        console.error('GitHub OAuth Error:', error);
        if (window.opener) {
          window.opener.postMessage(
            { type: 'github-auth-error', error },
            window.location.origin
          );
          window.close();
        } else {
          navigate('/?error=github_auth_failed');
        }
        return;
      }

      // Verificar state para prevenir CSRF
      if (!code || !state || state !== storedState) {
        console.error('Invalid OAuth callback');
        if (window.opener) {
          window.opener.postMessage(
            { type: 'github-auth-error', error: 'Invalid state' },
            window.location.origin
          );
          window.close();
        } else {
          navigate('/?error=invalid_callback');
        }
        return;
      }

      try {
        // Trocar code por access token
        const tokenResponse = await fetch('/api/auth/github/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const { access_token } = await tokenResponse.json();

        // Buscar informações do usuário
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await userResponse.json();

        // Salvar token e dados do usuário
        const authData = {
          token: access_token,
          user: userData,
        };

        localStorage.setItem('github_auth', JSON.stringify(authData));
        localStorage.removeItem('github_oauth_state');

        // Notificar janela pai sobre sucesso
        if (window.opener) {
          window.opener.postMessage(
            { type: 'github-auth-success', data: authData },
            window.location.origin
          );
          
          // Disparar evento customizado
          const event = new CustomEvent('github-auth-success', {
            detail: authData,
          });
          window.opener.dispatchEvent(event);
          
          window.close();
        } else {
          // Se não é popup, redirecionar para home
          navigate('/?success=github_auth');
        }
      } catch (error) {
        console.error('GitHub authentication failed:', error);
        
        if (window.opener) {
          window.opener.postMessage(
            { type: 'github-auth-error', error: error instanceof Error ? error.message : 'Unknown error' },
            window.location.origin
          );
          window.close();
        } else {
          navigate('/?error=auth_failed');
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400">Finalizando autenticação...</p>
      </div>
    </div>
  );
}
