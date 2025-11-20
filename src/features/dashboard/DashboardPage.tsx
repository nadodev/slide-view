import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Grid3x3,
    List,
    Star,
    Clock,
    MoreVertical,
    Trash2,
    Copy,
    Edit,
    Play,
    FileText,
} from 'lucide-react';
import { usePresentationsStore, type Presentation } from '@/store/presentationsStore';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'grid' | 'list';
type SortBy = 'recent' | 'name' | 'favorites';

export function DashboardPage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const {
        presentations,
        deletePresentation,
        toggleFavorite,
        duplicatePresentation,
        setCurrentPresentation,
    } = usePresentationsStore();

    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortBy>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Filter and sort presentations
    const filteredPresentations = presentations
        .filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'favorites') {
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
            }
            if (sortBy === 'name') {
                return a.title.localeCompare(b.title);
            }
            // Default: recent
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

    const handleCreateNew = () => {
        navigate('/presentation/new');
    };

    const handleOpenPresentation = (presentation: Presentation) => {
        setCurrentPresentation(presentation.id);
        navigate(`/presentation/edit/${presentation.id}`);
    };

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
            deletePresentation(id);
            toast.success('Apresentação excluída');
            setActiveMenu(null);
        }
    };

    const handleDuplicate = (id: string) => {
        duplicatePresentation(id);
        toast.success('Apresentação duplicada');
        setActiveMenu(null);
    };

    const getSlideCount = (presentation: Presentation) => {
        return presentation.slides?.length || 0;
    };

    return (
        <div className="min-h-screen">
            <main className="mx-auto max-w-7xl px-6 py-12">
                {/* Toolbar */}
                <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Apresentações</h2>
                        <p className="text-white/60">
                            {presentations.length} {presentations.length === 1 ? 'apresentação' : 'apresentações'}
                        </p>
                    </div>

                    <button
                        onClick={handleCreateNew}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 hover:shadow-xl shadow-lg shadow-white/20"
                    >
                        <Plus size={18} />
                        Nova Apresentação
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/80 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar apresentações..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all cursor-pointer"
                        >
                            <option value="recent" className="bg-[#0a0a0a]">Mais recentes</option>
                            <option value="name" className="bg-[#0a0a0a]">Nome (A-Z)</option>
                            <option value="favorites" className="bg-[#0a0a0a]">Favoritos</option>
                        </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/40 hover:text-white/80'
                                }`}
                        >
                            <Grid3x3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/40 hover:text-white/80'
                                }`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {filteredPresentations.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
                            <FileText className="text-white/40" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? 'Nenhuma apresentação encontrada' : 'Nenhuma apresentação ainda'}
                        </h3>
                        <p className="text-white/40 mb-8 max-w-md mx-auto">
                            {searchQuery
                                ? 'Tente buscar com outros termos'
                                : 'Crie sua primeira apresentação para começar a usar o SlideView.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleCreateNew}
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 hover:shadow-lg shadow-white/10"
                            >
                                <Plus size={18} />
                                Criar Apresentação
                            </button>
                        )}
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && filteredPresentations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPresentations.map((presentation) => (
                            <div
                                key={presentation.id}
                                className="group relative bg-[#0a0a0a]/80 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all overflow-hidden hover:shadow-2xl hover:shadow-black/50"
                            >
                                {/* Decorative lines on hover */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Thumbnail */}
                                <div
                                    onClick={() => handleOpenPresentation(presentation)}
                                    className="relative h-48 bg-white/5 cursor-pointer overflow-hidden group-hover:opacity-90 transition-opacity"
                                >
                                    {presentation.thumbnail ? (
                                        <img
                                            src={presentation.thumbnail}
                                            alt={presentation.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-white/5 to-white/[0.02]">
                                            <FileText className="text-white/20 group-hover:text-white/30 transition-colors" size={48} />
                                        </div>
                                    )}

                                    {/* Overlay Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                                            <Edit size={20} className="ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3
                                                onClick={() => handleOpenPresentation(presentation)}
                                                className="text-base font-semibold text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
                                            >
                                                {presentation.title}
                                            </h3>
                                            {presentation.description && (
                                                <p className="text-sm text-white/40 line-clamp-1 mt-1">
                                                    {presentation.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setActiveMenu(activeMenu === presentation.id ? null : presentation.id)
                                                }
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {activeMenu === presentation.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveMenu(null)}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl shadow-black/50 z-20 overflow-hidden py-1">
                                                        <button
                                                            onClick={() => handleOpenPresentation(presentation)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                                        >
                                                            <Edit size={14} />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicate(presentation.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                                        >
                                                            <Copy size={14} />
                                                            Duplicar
                                                        </button>
                                                        <div className="h-px bg-white/5 my-1" />
                                                        <button
                                                            onClick={() => handleDelete(presentation.id, presentation.title)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-white/40 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5">
                                                <FileText size={12} />
                                                {getSlideCount(presentation)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(presentation.updatedAt), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => toggleFavorite(presentation.id)}
                                            className="hover:text-yellow-400 transition-colors"
                                        >
                                            <Star
                                                size={14}
                                                className={
                                                    presentation.isFavorite
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : ''
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && filteredPresentations.length > 0 && (
                    <div className="space-y-3">
                        {filteredPresentations.map((presentation) => (
                            <div
                                key={presentation.id}
                                className="group flex items-center gap-4 p-4 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all"
                            >
                                {/* Thumbnail */}
                                <div
                                    onClick={() => handleOpenPresentation(presentation)}
                                    className="w-24 h-16 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden cursor-pointer"
                                >
                                    {presentation.thumbnail ? (
                                        <img
                                            src={presentation.thumbnail}
                                            alt={presentation.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <FileText className="text-white/20" size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3
                                        onClick={() => handleOpenPresentation(presentation)}
                                        className="text-base font-semibold text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
                                    >
                                        {presentation.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-white/40 mt-1">
                                        <span>{getSlideCount(presentation)} slides</span>
                                        <span>
                                            {formatDistanceToNow(new Date(presentation.updatedAt), {
                                                addSuffix: true,
                                                locale: ptBR,
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleFavorite(presentation.id)}
                                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <Star
                                            size={16}
                                            className={
                                                presentation.isFavorite
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-white/20'
                                            }
                                        />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setActiveMenu(activeMenu === presentation.id ? null : presentation.id)
                                            }
                                            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeMenu === presentation.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setActiveMenu(null)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl shadow-black/50 z-20 overflow-hidden py-1">
                                                    <button
                                                        onClick={() => handleOpenPresentation(presentation)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        <Edit size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(presentation.id)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                                    >
                                                        <Copy size={14} />
                                                        Duplicar
                                                    </button>
                                                    <div className="h-px bg-white/5 my-1" />
                                                    <button
                                                        onClick={() => handleDelete(presentation.id, presentation.title)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                        Excluir
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
