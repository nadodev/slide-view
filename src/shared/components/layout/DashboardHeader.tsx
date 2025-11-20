import { LogOut, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

export default function DashboardHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
            {/* Linhas decorativas do header */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-sm" />

            <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
                {/* Linhas verticais laterais */}
                <div className="absolute inset-y-0 left-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="absolute inset-y-0 right-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                <div className="flex items-center gap-8">
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black border border-white/20 shadow-lg shadow-white/10 transition-transform group-hover:scale-105">
                            ▲
                        </div>
                        <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            SlideView
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 ml-4">
                        <Link
                            to="/dashboard"
                            className={`text-sm font-medium transition-colors relative group ${isActive("/dashboard")
                                ? "text-white"
                                : "text-white/60 hover:text-white"
                                }`}
                        >
                            Dashboard
                            {isActive("/dashboard") && (
                                <span className="absolute -bottom-[21px] left-0 w-full h-px bg-gradient-to-r from-blue-400 to-purple-400" />
                            )}
                        </Link>
                        <Link
                            to="/presentation/new"
                            className={`text-sm font-medium transition-colors relative group ${isActive("/presentation/new")
                                ? "text-white"
                                : "text-white/60 hover:text-white"
                                }`}
                        >
                            Nova Apresentação
                            {isActive("/presentation/new") && (
                                <span className="absolute -bottom-[21px] left-0 w-full h-px bg-gradient-to-r from-blue-400 to-purple-400" />
                            )}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase() || <User size={12} />}
                        </div>
                        <span className="text-xs text-white/70 pr-2">
                            {user?.name || "Usuário"}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
