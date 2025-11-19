import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from '@/features/landing';
import { Presentation } from '@/features/presentation';
import { GitHubAuthCallback } from '@/features/github';
import { RemoteControl } from '@/features/remote-control';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Presentation />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/app" element={<Presentation />} />
          <Route path="/remote/:sessionId" element={<RemoteControl />} />
          <Route path="/github/callback" element={<GitHubAuthCallback />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
