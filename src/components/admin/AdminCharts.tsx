import React from 'react';
import { EmergencyRequest, RescueTeam, Shelter } from '../../types';

interface AdminChartsProps {
  emergencies: EmergencyRequest[];
  shelters: Shelter[];
  teams: RescueTeam[];
}

export const AdminCharts: React.FC<AdminChartsProps> = ({ emergencies, shelters, teams }) => {
  // 1. Emergencies by Type count
  const typeCounts: Record<string, number> = {};
  emergencies.forEach(e => {
    typeCounts[e.emergencyType] = (typeCounts[e.emergencyType] || 0) + 1;
  });

  // 2. Emergencies by Severity
  const severityCounts = {
    Critical: emergencies.filter(e => e.severity === 'Critical').length,
    High: emergencies.filter(e => e.severity === 'High').length,
    Medium: emergencies.filter(e => e.severity === 'Medium').length,
    Low: emergencies.filter(e => e.severity === 'Low').length,
  };

  // 3. Overall Shelter Occupancy
  const totalShelterCap = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalShelterOccupied = shelters.reduce((acc, s) => acc + s.occupiedCapacity, 0);
  const overallOccupancyPct = totalShelterCap > 0 ? Math.round((totalShelterOccupied / totalShelterCap) * 100) : 0;

  // 4. Team Workload
  const activeTeams = teams.filter(t => !t.availability || t.status !== 'Available').length;
  const availableTeams = teams.filter(t => t.availability && t.status === 'Available').length;

  const maxTypeCount = Math.max(1, ...Object.values(typeCounts));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Chart 1: Emergencies by Type */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Incidents by Type
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">Breakdown of reported hazards</p>
        </div>

        <div className="space-y-2">
          {Object.entries(typeCounts).map(([type, count]) => {
            const pct = Math.round((count / maxTypeCount) * 100);
            return (
              <div key={type} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{type}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Emergencies by Severity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Severity Distribution
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">Triage casualty severity split</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Critical</span>
            <span className="text-2xl font-black font-mono text-rose-700 dark:text-rose-300 block">
              {severityCounts.Critical}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-center">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">High</span>
            <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300 block">
              {severityCounts.High}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/40 text-center">
            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase">Medium</span>
            <span className="text-2xl font-black font-mono text-yellow-700 dark:text-yellow-300 block">
              {severityCounts.Medium}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-center">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Low</span>
            <span className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300 block">
              {severityCounts.Low}
            </span>
          </div>
        </div>
      </div>

      {/* Chart 3: Shelter Occupancy Meter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Total Shelter Occupancy
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">Aggregate regional capacity</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {overallOccupancyPct}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {totalShelterOccupied} / {totalShelterCap} spots
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallOccupancyPct > 85 ? 'bg-rose-500' : overallOccupancyPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${overallOccupancyPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Available: {totalShelterCap - totalShelterOccupied}</span>
            <span>Occupied: {totalShelterOccupied}</span>
          </div>
        </div>
      </div>

      {/* Chart 4: Rescue Team Workload */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Rescue Fleet Workload
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">Field crew deployment status</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Available for Dispatch
            </span>
            <strong className="font-mono text-emerald-600 dark:text-emerald-400">{availableTeams} Units</strong>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              Actively Deployed
            </span>
            <strong className="font-mono text-amber-600 dark:text-amber-400">{activeTeams} Units</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
