import { useState, useEffect } from 'react';
import { Search, GitBranch, Lock, Globe, Calendar, Code, Star } from 'lucide-react';
import type { GitHubRepository } from '../utils/github-auth';

interface RepositorySelectorProps {
  repositories: GitHubRepository[];
  selectedRepository: GitHubRepository | null;
  onSelectRepository: (repo: GitHubRepository) => void;
  loading?: boolean;
}

export default function RepositorySelector({
  repositories,
  selectedRepository,
  onSelectRepository,
  loading = false,
}: RepositorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'language'>('updated');
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepository[]>(repositories);

  useEffect(() => {
    let filtered = repositories.filter((repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar repositórios
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'language':
          return (a.language || '').localeCompare(b.language || '');
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredRepos(filtered);
  }, [repositories, searchTerm, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando repositórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar repositórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'updated' | 'name' | 'language')}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        >
          <option value="updated">Mais recentes</option>
          <option value="name">Nome (A-Z)</option>
          <option value="language">Linguagem</option>
        </select>
      </div>

      {/* Lista de repositórios */}
      <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-700 rounded-lg">
        {filteredRepos.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {searchTerm ? 'Nenhum repositório encontrado' : 'Nenhum repositório disponível'}
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => onSelectRepository(repo)}
              className={`p-4 cursor-pointer transition-all hover:bg-slate-700/50 ${
                selectedRepository?.id === repo.id
                  ? 'bg-violet-500/10 border-l-4 border-violet-500'
                  : 'border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-200 truncate">
                      {repo.name}
                    </h3>
                    {repo.private ? (
                      <Lock size={14} className="text-orange-400 flex-shrink-0" />
                    ) : (
                      <Globe size={14} className="text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                    {repo.description || 'Sem descrição'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <Code size={12} />
                        <span>{repo.language}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <GitBranch size={12} />
                      <span>{repo.default_branch}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedRepository?.id === repo.id && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Repositório selecionado */}
      {selectedRepository && (
        <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
          <h4 className="font-semibold text-violet-300 mb-2">Repositório Selecionado</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-200 font-medium">{selectedRepository.full_name}</p>
              <p className="text-sm text-slate-400">Branch: {selectedRepository.default_branch}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div className="flex items-center gap-1">
                {selectedRepository.private ? <Lock size={12} /> : <Globe size={12} />}
                <span>{selectedRepository.private ? 'Privado' : 'Público'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}