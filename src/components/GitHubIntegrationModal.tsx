import { useState, useEffect } from 'react';
import { X, Github, LogOut, RefreshCw, Download, Upload, Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  initiateGitHubAuth,
  getAuthState,
  logoutGitHub,
  fetchUserRepositories,
  validateToken,
  type GitHubUser,
  type GitHubRepository,
  type GitHubAuthState,
} from '../utils/github-auth';
import { fetchFilesFromGitHub, pushFilesToGitHub, type GitHubConfig, type GitHubFile } from '../utils/github';
import RepositorySelector from './RepositorySelector';

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesLoaded: (files: any[]) => void;
  currentFiles?: any[];
}

export default function GitHubIntegrationModal({
  isOpen,
  onClose,
  onFilesLoaded,
  currentFiles = [],
}: GitHubIntegrationModalProps) {
  const [authState, setAuthState] = useState<GitHubAuthState>(getAuthState());
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [repositoriesLoading, setRepositoriesLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedPath, setSelectedPath] = useState('');
  const [operation, setOperation] = useState<'pull' | 'push' | null>(null);

  // Escutar eventos de autenticação
  useEffect(() => {
    const handleAuthSuccess = (event: CustomEvent) => {
      setAuthState({
        isAuthenticated: true,
        user: event.detail.user,
        token: event.detail.token,
      });
      toast.success('Login realizado com sucesso!');
      loadRepositories(event.detail.token);
    };

    const handleAuthLogout = () => {
      setAuthState({ isAuthenticated: false, user: null, token: null });
      setRepositories([]);
      setSelectedRepository(null);
      toast.info('Logout realizado');
    };

    window.addEventListener('github-auth-success', handleAuthSuccess as EventListener);
    window.addEventListener('github-auth-logout', handleAuthLogout as EventListener);

    return () => {
      window.removeEventListener('github-auth-success', handleAuthSuccess as EventListener);
      window.removeEventListener('github-auth-logout', handleAuthLogout as EventListener);
    };
  }, []);

  // Carregar repositórios ao autenticar
  useEffect(() => {
    if (authState.isAuthenticated && authState.token && repositories.length === 0) {
      loadRepositories(authState.token);
    }
  }, [authState.isAuthenticated, authState.token, repositories.length]);

  // Validar token ao abrir modal
  useEffect(() => {
    if (isOpen && authState.isAuthenticated && authState.token) {
      validateUserToken();
    }
  }, [isOpen, authState.isAuthenticated, authState.token]);

  const validateUserToken = async () => {
    if (!authState.token) return;
    
    const isValid = await validateToken(authState.token);
    if (!isValid) {
      logoutGitHub();
      toast.error('Token expirado. Faça login novamente.');
    }
  };

  const loadRepositories = async (token: string) => {
    setRepositoriesLoading(true);
    try {
      const repos = await fetchUserRepositories(token);
      setRepositories(repos);
    } catch (error) {
      console.error('Erro ao carregar repositórios:', error);
      toast.error('Erro ao carregar repositórios');
    } finally {
      setRepositoriesLoading(false);
    }
  };

  const handleLogin = () => {
    initiateGitHubAuth();
  };

  const handleLogout = () => {
    logoutGitHub();
  };

  const handlePullFiles = async () => {
    if (!selectedRepository || !authState.token) {
      toast.error('Selecione um repositório primeiro');
      return;
    }

    setLoading(true);
    setOperation('pull');

    try {
      const config: GitHubConfig = {
        token: authState.token,
        owner: selectedRepository.owner.login,
        repo: selectedRepository.name,
        branch: selectedBranch,
        path: selectedPath,
      };

      const files = await fetchFilesFromGitHub(config);

      if (files.length === 0) {
        toast.warning('Nenhum arquivo .md encontrado no repositório');
        return;
      }

      // Converter para formato esperado
      const convertedFiles = files.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        content: file.content,
      }));

      onFilesLoaded(convertedFiles);
      toast.success(`${files.length} arquivo(s) carregado(s) do GitHub`);
      onClose();
    } catch (error: any) {
      console.error('Erro ao fazer pull:', error);
      toast.error(`Erro: ${error.message || 'Falha ao buscar arquivos'}`);
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };

  const handlePushFiles = async () => {
    if (!selectedRepository || !authState.token) {
      toast.error('Selecione um repositório primeiro');
      return;
    }

    if (currentFiles.length === 0) {
      toast.error('Nenhum arquivo para enviar');
      return;
    }

    setLoading(true);
    setOperation('push');

    try {
      const config: GitHubConfig = {
        token: authState.token,
        owner: selectedRepository.owner.login,
        repo: selectedRepository.name,
        branch: selectedBranch,
        path: selectedPath,
      };

      const files: GitHubFile[] = currentFiles.map(file => ({
        name: file.name.endsWith('.md') ? file.name : `${file.name}.md`,
        content: file.content,
      }));

      await pushFilesToGitHub(config, files, 'Update slides from slide-view app');
      
      toast.success('Arquivos enviados com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao fazer push:', error);
      toast.error(`Erro: ${error.message || 'Falha ao enviar arquivos'}`);
    } finally {
      setLoading(false);
      setOperation(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Github className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-semibold text-slate-100">Integração GitHub</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!authState.isAuthenticated ? (
            /* Tela de Login */
            <div className="text-center py-12">
              <Github className="w-16 h-16 text-violet-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-100 mb-4">
                Conecte-se ao GitHub
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Faça login com sua conta GitHub para acessar seus repositórios e 
                sincronizar seus slides automaticamente.
              </p>
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                <Github className="w-5 h-5 inline mr-2" />
                Fazer Login com GitHub
              </button>
            </div>
          ) : (
            /* Interface Principal */
            <div className="space-y-6">
              {/* Usuário Logado */}
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={authState.user?.avatar_url}
                    alt={authState.user?.name || 'Avatar'}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-slate-200 font-medium">
                      {authState.user?.name || authState.user?.login}
                    </p>
                    <p className="text-slate-400 text-sm">@{authState.user?.login}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadRepositories(authState.token!)}
                    disabled={repositoriesLoading}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Recarregar repositórios"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${repositoriesLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Seletor de Repositório */}
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-4">
                  Selecionar Repositório
                </h4>
                <RepositorySelector
                  repositories={repositories}
                  selectedRepository={selectedRepository}
                  onSelectRepository={setSelectedRepository}
                  loading={repositoriesLoading}
                />
              </div>

              {/* Configurações */}
              {selectedRepository && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        placeholder={selectedRepository.default_branch}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Caminho (opcional)
                      </label>
                      <input
                        type="text"
                        value={selectedPath}
                        onChange={(e) => setSelectedPath(e.target.value)}
                        placeholder="slides, docs, etc."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              {selectedRepository && (
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={handlePullFiles}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && operation === 'pull' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Pull (Baixar)
                  </button>
                  
                  <button
                    onClick={handlePushFiles}
                    disabled={loading || currentFiles.length === 0}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && operation === 'push' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Push ({currentFiles.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}