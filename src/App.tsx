import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/features/landing';
import { Presentation } from '@/features/presentation';
import { RemoteControl } from '@/features/remote-control';
import { GitHubAuthCallback } from '@/features/github';
import { Toaster } from '@/shared/components/ui';
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
