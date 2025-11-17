import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Presentation from './components/Presentation';
import { RemoteControl } from './components/RemoteControl';
import GitHubAuthCallback from './components/GitHubAuthCallback';
import { Toaster } from './components/ui/sonner';
import { JSX } from 'react';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Presentation />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/app" element={<Presentation />} />
        <Route path="/remote/:sessionId" element={<RemoteControl />} />
        <Route path="/auth/github/callback" element={<GitHubAuthCallback />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
