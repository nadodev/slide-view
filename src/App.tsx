import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from '@/features/landing';

import { GitHubAuthCallback } from '@/features/github';
import { RemoteControl } from '@/features/remote-control';
import { LoginPage, RegisterPage, ProtectedRoute } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import NewPresentationPage from "@/features/presentation/NewPresentationPage";
import EditorPage from "@/features/presentation/EditorPage";
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/presentation/new" element={<NewPresentationPage />} />
          </Route>

          <Route path="/presentation/edit/:id" element={<EditorPage />} />

          <Route path="/remote/:sessionId" element={<RemoteControl />} />
          <Route path="/github/callback" element={<GitHubAuthCallback />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
