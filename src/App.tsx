import React, { useState } from 'react';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/home/LandingPage';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { RescueTeamDashboard } from './components/rescue/RescueTeamDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { useResQBridge } from './hooks/useResQBridge';
import { UserRole } from './types';
import { Radio } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { currentUser, actions } = useResQBridge();
  const [currentView, setCurrentView] = useState<'home' | 'citizen' | 'rescue' | 'admin'>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    actions.setRole(role);
    setCurrentView(role);
  };

  const handleNavigate = (view: 'home' | 'citizen' | 'rescue' | 'admin') => {
    if (view !== 'home') {
      actions.setRole(view);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (role: UserRole, userId: string) => {
    actions.setRole(role, userId);
    setCurrentView(role);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Navbar with Auth trigger */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'home' && <LandingPage onSelectRole={handleSelectRole} />}
        {currentView === 'citizen' && <CitizenDashboard />}
        {currentView === 'rescue' && <RescueTeamDashboard />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Role-based Security Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="font-bold text-slate-300">ResQBridge</span>
            <span>• Student Innovation – Disaster Management</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button
              onClick={() => handleNavigate('home')}
              className="hover:text-white transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => handleNavigate('citizen')}
              className="hover:text-white transition-colors"
            >
              Citizen SOS
            </button>
            <button
              onClick={() => handleNavigate('rescue')}
              className="hover:text-white transition-colors"
            >
              Rescue Command
            </button>
            <button
              onClick={() => handleNavigate('admin')}
              className="hover:text-white transition-colors"
            >
              Disaster Admin
            </button>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              Switch Account
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center sm:text-right">
            <span>Project Demo Mode • Not for live 112 emergency calls</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
