import React from 'react';
import { NetworkSimulationMode, UserRole } from '../../types';
import { useResQBridge } from '../../hooks/useResQBridge';
import { 
  Radio, 
  ShieldAlert, 
  Truck, 
  Building, 
  Home, 
  RotateCcw,
  Sparkles,
  User,
  Wifi,
  MessageSquare,
  Database
} from 'lucide-react';
import { useToast } from './Toast';

interface NavbarProps {
  currentView: 'home' | 'citizen' | 'rescue' | 'admin';
  onNavigate: (view: 'home' | 'citizen' | 'rescue' | 'admin') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { state, actions, currentUser, communicationConfig } = useResQBridge();
  const toast = useToast();

  const activeEmergenciesCount = state.emergencies.filter(e => e.status !== 'Resolved').length;
  const criticalCount = state.emergencies.filter(e => e.status !== 'Resolved' && e.priorityScore >= 80).length;

  const handleRoleChange = (role: UserRole) => {
    actions.setRole(role);
    onNavigate(role);
    toast.info(`Switched to ${role.toUpperCase()}`, `Operating with ${role} permissions.`);
  };

  const handleResetDemo = () => {
    actions.resetToDemoData();
    toast.success('Simulation Data Reset', 'Restored initial disaster response scenario with fresh timestamps.');
  };

  const handleModeChange = (mode: NetworkSimulationMode) => {
    actions.setCommunicationMode(mode);
    if (mode === 'force_internet') {
      toast.success('Simulation Mode: Internet Active', 'Distress calls will transmit via direct backend API.');
      // trigger sync if pending
      actions.syncAllOfflineEmergencies();
    } else if (mode === 'force_sms') {
      toast.warning('Simulation Mode: SMS Fallback', 'Internet tower down. Cellular SMS fallback activated.');
    } else if (mode === 'force_offline') {
      toast.error('Simulation Mode: Complete Blackout', 'No internet & no signal. Requests will save to IndexedDB.');
    } else {
      toast.info('Simulation Mode: Auto-Detect', 'Following standard device connectivity.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                  ResQ<span className="text-rose-500">Bridge</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Disaster Ops
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block leading-none mt-0.5">
                Priority-Based Rescue + SMS Emergency Fallback System
              </p>
            </div>
          </div>

          {/* Navigation Role Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Overview</span>
            </button>

            <button
              onClick={() => handleRoleChange('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'citizen'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Citizen SOS</span>
            </button>

            <button
              onClick={() => handleRoleChange('rescue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentView === 'rescue'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>Rescue Team</span>
              {activeEmergenciesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {activeEmergenciesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentView === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Admin Hub</span>
              {criticalCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
              )}
            </button>
          </nav>

          {/* Right Action Tools: Simulation Switcher & Persona */}
          <div className="flex items-center gap-2">
            {/* Quick Network Scenario Selector */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-[11px] font-mono">
              <span className="text-slate-400 px-1 text-[10px]">Net:</span>
              <select
                value={communicationConfig.communicationMode}
                onChange={(e) => handleModeChange(e.target.value as NetworkSimulationMode)}
                className="bg-slate-900 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] border border-slate-700 focus:outline-hidden"
                title="Toggle simulated network condition for Test A, Test B, or Test C"
              >
                <option value="auto">Auto-Detect</option>
                <option value="force_internet">🟢 Test A: Internet</option>
                <option value="force_sms">🟠 Test B: SMS Fallback</option>
                <option value="force_offline">🔴 Test C: Offline Blackout</option>
              </select>
            </div>

            {/* Active User Persona Pill */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-200 transition-colors"
              title="Click to switch persona or sign in"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-900 rounded text-slate-400 uppercase">
                {currentUser.role}
              </span>
            </button>

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
              title="Reset simulation dataset with fresh timestamps"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
