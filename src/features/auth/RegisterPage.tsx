import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';
import type { RegisterData } from './types';

export function RegisterPage() {
    const navigate = useNavigate();
    const { login, setLoading } = useAuthStore();

    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Nome deve ter no mínimo 2 caracteres';
        }

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Senha deve conter maiúsculas, minúsculas e números';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Você deve aceitar os termos de serviço';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        let strength = 0;

        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Fraca', color: 'bg-red-500' };
        if (strength <= 3) return { strength: 66, label: 'Média', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Forte', color: 'bg-green-500' };
    };

    const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setLoading(true);

        try {
            // TODO: Substituir por chamada real de API quando backend estiver pronto
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock de resposta bem-sucedida
            const mockUser = {
                id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                plan: 'free' as const,
                createdAt: new Date(),
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            login(mockUser, mockToken);

            toast.success('Conta criada com sucesso!', {
                description: `Bem-vindo ao SlideView, ${mockUser.name}!`,
            });

            navigate('/app');
        } catch (error) {
            toast.error('Erro ao criar conta', {
                description: 'Tente novamente mais tarde.',
            });
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        toast.info('Google OAuth', {
            description: 'Integração com Google será implementada em breve!',
        });
    };

    const handleGitHubSignup = () => {
        toast.info('GitHub OAuth', {
            description: 'Integração com GitHub será implementada em breve!',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-violet-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-2xl">
                                <Sparkles className="text-white" size={28} />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                            SlideView
                        </h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Crie sua conta grátis</h2>
                    <p className="text-slate-400">Comece a criar apresentações incríveis em segundos</p>
                </div>

                {/* Form Card */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 rounded-3xl blur-2xl opacity-20"></div>

                    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">
                                    Nome completo
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800 border-2 ${errors.name ? 'border-red-500' : 'border-slate-600'
                                            } rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all`}
                                        placeholder="João Silva"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800 border-2 ${errors.email ? 'border-red-500' : 'border-slate-600'
                                            } rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all`}
                                        placeholder="seu@email.com"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full pl-12 pr-12 py-3 bg-slate-800 border-2 ${errors.password ? 'border-red-500' : 'border-slate-600'
                                            } rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all`}
                                        placeholder="••••••••"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {passwordStrength && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-400">Força da senha:</span>
                                            <span className={`text-xs font-semibold ${passwordStrength.label === 'Forte' ? 'text-green-400' :
                                                    passwordStrength.label === 'Média' ? 'text-yellow-400' :
                                                        'text-red-400'
                                                }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-200 mb-2">
                                    Confirmar senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className={`w-full pl-12 pr-12 py-3 bg-slate-800 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                                            } rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all`}
                                        placeholder="••••••••"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Terms */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex-shrink-0 mt-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.acceptTerms}
                                            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                            className="sr-only peer"
                                            disabled={isSubmitting}
                                        />
                                        <div className={`w-5 h-5 border-2 ${errors.acceptTerms ? 'border-red-500' : 'border-slate-600'
                                            } rounded bg-slate-800 peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all flex items-center justify-center`}>
                                            {formData.acceptTerms && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                                        Eu aceito os{' '}
                                        <Link to="/terms" className="text-violet-400 hover:text-violet-300 underline">
                                            Termos de Serviço
                                        </Link>{' '}
                                        e a{' '}
                                        <Link to="/privacy" className="text-violet-400 hover:text-violet-300 underline">
                                            Política de Privacidade
                                        </Link>
                                    </span>
                                </label>
                                {errors.acceptTerms && (
                                    <p className="mt-2 text-sm text-red-400">{errors.acceptTerms}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-cyan-600 hover:via-fuchsia-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-violet-500/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Criando conta...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Criar conta grátis
                                        <ArrowRight size={20} />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-slate-900 text-slate-400">Ou cadastre-se com</span>
                            </div>
                        </div>

                        {/* Social Signup */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={handleGoogleSignup}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 font-medium transition-all hover:scale-105"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={handleGitHubSignup}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 font-medium transition-all hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-slate-400">
                                Já tem uma conta?{' '}
                                <Link
                                    to="/login"
                                    className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                                >
                                    Fazer login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-2xl mb-1">✨</div>
                        <p className="text-xs text-slate-400">IA Integrada</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-2xl mb-1">🚀</div>
                        <p className="text-xs text-slate-400">100% Grátis</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="text-2xl mb-1">🔒</div>
                        <p className="text-xs text-slate-400">Seguro</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
