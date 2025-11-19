// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
    createdAt: Date;
}

export interface AuthError {
    field?: string;
    message: string;
}

export interface AuthResponse {
    success: boolean;
    user?: AuthUser;
    token?: string;
    error?: AuthError;
}
