import React from 'react';
import { UserRole } from '../../types';
import { 
  Radio, 
  ShieldAlert, 
  Truck, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Navigation,
  Layers,
  Wifi,
  MessageSquare,
  Database,
  Lock,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Student Innovation – Disaster Management</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              One Emergency. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
                One Connected Response.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Connecting citizens, rescue teams, and safe shelters for faster disaster response. Featuring a multi-tier <strong>SMS Emergency Fallback</strong> and <strong>Offline Queue</strong> when towers collapse.
            </p>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onSelectRole('citizen')}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-950/50 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Request Emergency Help</span>
                <ArrowRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('rescue')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all hover:border-slate-600"
              >
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Rescue Team Login</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('admin')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all hover:border-slate-600"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Tactical Illustration Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-950/80 border border-slate-800 p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span className="text-xs font-mono font-bold text-slate-300">FAIL-SAFE TELEMETRY RADAR</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              {/* Connected Visual Simulation HUD */}
              <div className="relative h-64 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] bg-[size:16px_16px]" />

                {/* Node 1: Citizen SOS */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-rose-950/50">
                      SOS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">RB-2026-00421</div>
                      <div className="text-[10px] text-rose-400 font-mono">Priority: 94/100 (CRITICAL)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    SMS Fallback Armed
                  </span>
                </div>

                {/* Vector Flow Lines with Ping */}
                <div className="relative z-10 my-2 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3 animate-pulse" /> Safe Corridor: 4.2 km (11 min)
                  </span>
                  <span className="text-emerald-400 font-semibold">Route Clear</span>
                </div>

                {/* Node 2: Rescue Team & Shelter */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-200">NDRF Unit 7</div>
                      <div className="text-[9px] text-slate-400">Dispatched</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500" />

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-200">Kaveri Relief Camp</div>
                      <div className="text-[9px] text-emerald-400 font-mono">190 spots open</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-mono">
                Multi-channel synchronization across Internet, SMS, and IndexedDB
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: COMPLETE EMERGENCY COMMUNICATION ARCHITECTURE (Section 18) */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold font-mono">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>3-Tier Resilient Communication Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            "No Internet Should Not Mean No Emergency Preparation"
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            ResQBridge continuously checks connectivity channels and selects the most robust path to reach first responders.
          </p>
        </div>

        {/* Visual Architecture Tree Diagram */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto">
          <div className="min-w-[680px] flex flex-col items-center space-y-4">
            {/* Top Node */}
            <div className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold shadow-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>CITIZEN ACTIVATES SOS (RB-2026-XXXXX)</span>
            </div>

            {/* Splitter */}
            <div className="w-96 h-6 border-l-2 border-r-2 border-t-2 border-slate-700" />

            {/* Two Branches */}
            <div className="w-full grid grid-cols-2 gap-8 text-center">
              {/* Branch 1: Internet */}
              <div className="space-y-3 p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> 1. INTERNET AVAILABLE
                </span>
                <div className="text-[11px] text-slate-300">
                  Direct HTTPS / WebSocket REST API
                </div>
                <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-sm">
                  RESCUE TEAM DASHBOARD (🟢 Internet)
                </div>
              </div>

              {/* Branch 2: No Internet */}
              <div className="space-y-3 p-4 rounded-xl bg-amber-950/20 border border-amber-800/60">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> 2. NO INTERNET (CELLULAR SIGNAL)
                </span>
                <div className="text-[11px] text-slate-300">
                  SMS Fallback to Rescue Gateway (+91 94400 11222)
                </div>
                <div className="px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-[11px] shadow-sm">
                  RESCUE TEAM DASHBOARD (🟠 SMS Fallback)
                </div>

                {/* Sub-branch: If SMS unavailable -> Offline Storage */}
                <div className="pt-3 border-t border-amber-800/50 space-y-2">
                  <span className="text-[10px] text-rose-400 font-bold block">
                    ↓ IF CELLULAR BLACKOUT OCCURS ↓
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-800/60 text-slate-300 text-[11px]">
                    <div className="font-bold text-rose-300 flex items-center justify-center gap-1">
                      <Database className="w-3 h-3" /> 3. INDEXEDDB OFFLINE QUEUE
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Auto-syncs upon connection restoration (🔵 Offline Sync)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Limitations Disclaimer (Section 19) */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Real-World Operational Boundary Disclosure:</strong>
            SMS fallback requires active cellular tower reception. If a disaster area has neither internet nor cellular communication, ResQBridge stores the emergency distress record locally on the device in <strong>IndexedDB</strong> and automatically transmits it the instant a communication channel is detected. ResQBridge never claims to transmit with zero signal; it provides an intelligent, automated failover sequence.
          </div>
        </div>
      </section>

      {/* 2. THE THREE CONNECTED ROLES */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Three Pillars. Zero Information Silos.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ResQBridge breaks communication barriers between victims, field responders, and civil administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1: Citizen */}
          <div 
            onClick={() => onSelectRole('citizen')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-rose-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                1. Citizens in Peril
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Report emergencies in one touch with instant GPS capture. Transmits headcount, injured, and vulnerability data via Internet, SMS, or offline storage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>Open Citizen Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Role 2: Rescue Teams */}
          <div 
            onClick={() => onSelectRole('rescue')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                2. Field Rescue Teams
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Prioritize emergencies with transparent triage scoring. Search SMS Emergency IDs, navigate hazard-safe corridors, and match evacuees with safe shelters.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Open Rescue Command</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Role 3: Admin Command */}
          <div 
            onClick={() => onSelectRole('admin')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                3. Disaster Administration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Monitor system-wide KPIs, track SMS and internet communication telemetry, configure emergency phone gateways, and manage relief supplies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Operational Response Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            How ResQBridge Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From distress trigger to safe shelter accommodation in 4 structured stages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-rose-500">01</span>
              <Radio className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="font-bold text-sm text-white">Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizen triggers the SOS beacon. If data is down, the system prepares a compact SMS payload or saves offline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-amber-500">02</span>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-sm text-white">Prioritize</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ResQBridge Core calculates a transparent 0–100 Priority Score locally before transmission.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-blue-500">03</span>
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-bold text-sm text-white">Rescue</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Highest-priority emergency appears at the top of the nearest battalion queue with safe route navigation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-emerald-500">04</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm text-white">Shelter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              System recommends verified safe shelters matching available space and distance. Shelter capacity updates upon arrival.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INNOVATION HIGHLIGHT SECTION */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-emerald-950/40 border border-slate-800 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Key Architectural Innovation
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            "Priority-Based Rescue + Shelter Capacity Coordination"
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            ResQBridge couples emergency casualty scoring directly with safe route planning and real-time shelter bed capacity tracking across all network conditions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs font-mono">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-rose-500">01</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Emergency Request</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-amber-500">02</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Priority Score</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-blue-500">03</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Team Assignment</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-indigo-500">04</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Distance & ETA</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-purple-500">05</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Safe Route</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-cyan-500">06</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Shelter Matching</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-emerald-500">07</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Capacity Update</div>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="font-extrabold text-emerald-600">08</div>
            <div className="font-bold mt-1 text-slate-800 dark:text-white">Safe Evacuation</div>
          </div>
        </div>
      </section>
    </div>
  );
};
