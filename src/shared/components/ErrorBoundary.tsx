import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Log para serviço de monitoramento (Sentry, LogRocket, etc.)
        this.props.onError?.(error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Algo deu errado
                            </h2>

                            <p className="text-slate-400 mb-6">
                                Ocorreu um erro inesperado. Tente recarregar a página.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="w-full mb-6 text-left">
                                    <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                                        Detalhes do erro
                                    </summary>
                                    <pre className="mt-2 p-4 bg-slate-900 rounded-lg text-xs text-red-400 overflow-auto max-h-40">
                                        {this.state.error.toString()}
                                        {this.state.error.stack && `\n\n${this.state.error.stack}`}
                                    </pre>
                                </details>
                            )}

                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Recarregar Página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
