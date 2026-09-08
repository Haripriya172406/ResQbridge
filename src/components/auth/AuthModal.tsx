import React, { useState } from 'react';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../services/demoData';
import { Modal } from '../common/Modal';
import { ShieldAlert, Truck, Building2, Lock, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '../common/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, userId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const demoAccounts = [
    {
      role: 'citizen' as UserRole,
      user: DEMO_USERS[0], // Ramesh Varma
      icon: ShieldAlert,
      badge: 'Civilian Distress Beacon',
      color: 'border-rose-500 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      role: 'rescue' as UserRole,
      user: DEMO_USERS[3], // Vikram Rao (NDRF Unit 7)
      icon: Truck,
      badge: 'Field Rescue Commander',
      color: 'border-blue-500 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      role: 'admin' as UserRole,
      user: DEMO_USERS[4], // District Collectorate Ops
      icon: Building2,
      badge: 'Disaster Control Operations',
      color: 'border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  const handleQuickDemoLogin = (role: UserRole, userId: string, name: string) => {
    onLogin(role, userId);
    toast.success('Logged In Successfully', `Welcome, ${name} (${role.toUpperCase()})`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Match mock account or default for role
    const matchedUser = DEMO_USERS.find(u => u.role === selectedRole) || DEMO_USERS[0];
    onLogin(selectedRole, matchedUser.id);
    toast.success('Authentication Verified', `Operating with ${selectedRole.toUpperCase()} credentials.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Role-Based Security Authentication"
      subtitle="Access role-restricted command dashboards with verified credentials."
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Quick Demo Personas */}
        <div>
          <span className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            1-Click Pre-configured Demo Accounts
          </span>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickDemoLogin(item.role, item.user.id, item.user.name)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 group shadow-2xs`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.user.name}</span>
                        <span className="text-[10px] font-mono opacity-70">({item.role.toUpperCase()})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.badge} • {item.user.email}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            Or Sign In With Custom Role
          </span>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Operating Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['citizen', 'rescue', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    selectedRole === r
                      ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Email / Phone
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. officer@resqbridge.gov.in"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Security Passcode / Token
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md transition-all"
            >
              Authenticate & Launch
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
