# 🔐 Autenticação - SlideView

## 📁 Estrutura

```
src/features/auth/
├── LoginPage.tsx          # Página de login
├── RegisterPage.tsx       # Página de registro
├── ProtectedRoute.tsx     # Componente de proteção de rotas
├── authStore.ts           # Zustand store para auth
├── types.ts               # Tipos TypeScript
└── index.ts               # Exports
```

## 🎨 Features Implementadas

### ✅ Página de Login (`/login`)
- **Design moderno** com gradientes e glassmorphism
- **Validação de formulário** em tempo real
- **Toggle de senha** (mostrar/ocultar)
- **Remember me** checkbox
- **OAuth placeholders** (Google e GitHub)
- **Link para recuperação de senha**
- **Responsivo** e mobile-friendly

### ✅ Página de Registro (`/register`)
- **Validação robusta** de formulário
- **Indicador de força de senha** (Fraca/Média/Forte)
- **Confirmação de senha**
- **Checkbox de termos de serviço**
- **OAuth placeholders** (Google e GitHub)
- **Benefícios visuais** (IA, Grátis, Seguro)

### ✅ Auth Store (Zustand)
- **Persistência** com localStorage
- **Estado global** de autenticação
- **Actions**: login, logout, setUser, setToken
- **Type-safe** com TypeScript

### ✅ Protected Route
- **Guarda de rotas** autenticadas
- **Redirect automático** para /login
- **Loading state** durante verificação

## 🔧 Como Usar

### 1. Rotas já configuradas

```tsx
// Em App.tsx
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
```

### 2. Proteger rotas

```tsx
import { ProtectedRoute } from '@/features/auth';

<Route 
  path="/app" 
  element={
    <ProtectedRoute>
      <Presentation />
    </ProtectedRoute>
  } 
/>
```

### 3. Usar o Auth Store

```tsx
import { useAuthStore } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }
  
  return (
    <div>
      <p>Olá, {user?.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

## 🎯 Próximos Passos (Backend)

### 1. Criar API de Autenticação

```typescript
// src/services/auth/authService.ts
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
  
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },
};
```

### 2. Integrar com Backend

```tsx
// Em LoginPage.tsx, substituir o mock:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  setLoading(true);

  try {
    // Chamar API real
    const response = await authService.login(formData);
    
    if (response.success && response.user && response.token) {
      login(response.user, response.token);
      toast.success('Login realizado com sucesso!');
      navigate('/app');
    } else {
      toast.error(response.error?.message || 'Erro ao fazer login');
    }
  } catch (error) {
    toast.error('Erro ao fazer login');
  } finally {
    setIsSubmitting(false);
    setLoading(false);
  }
};
```

### 3. Implementar OAuth

```tsx
// Google OAuth
const handleGoogleLogin = () => {
  window.location.href = '/api/auth/google';
};

// GitHub OAuth
const handleGitHubLogin = () => {
  window.location.href = '/api/auth/github';
};
```

### 4. Adicionar Refresh Token

```typescript
// src/services/auth/tokenService.ts
export const tokenService = {
  async refreshToken(): Promise<string> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Envia cookies
    });
    const data = await response.json();
    return data.token;
  },
};

// Interceptor para renovar token automaticamente
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await tokenService.refreshToken();
      useAuthStore.getState().setToken(newToken);
      // Retry request
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

## 🎨 Customização

### Cores e Gradientes

```tsx
// Alterar cores principais
className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600"

// Alterar cor de foco
className="focus:ring-violet-500 focus:border-violet-500"
```

### Validação

```tsx
// Adicionar regras customizadas
const validateForm = (): boolean => {
  // Sua lógica aqui
  if (formData.email.endsWith('@empresa.com')) {
    newErrors.email = 'Use email pessoal';
  }
  return Object.keys(newErrors).length === 0;
};
```

## 📊 Tipos

```typescript
interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
```

## 🔒 Segurança

### Implementado
- ✅ Validação client-side
- ✅ Senha oculta por padrão
- ✅ Indicador de força de senha
- ✅ HTTPS ready

### TODO (Backend)
- ⏳ Rate limiting
- ⏳ CSRF tokens
- ⏳ Password hashing (bcrypt)
- ⏳ JWT com expiração
- ⏳ Refresh tokens
- ⏳ 2FA (opcional)

## 🚀 Deploy

As páginas estão prontas para produção. Basta:

1. Configurar variáveis de ambiente:
```env
VITE_API_URL=https://api.slideview.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

2. Build:
```bash
npm run build
```

3. Deploy no Vercel/Netlify/Railway

---

**Status:** ✅ Frontend completo, aguardando backend
**Última atualização:** 19/11/2025
