import React from 'react';
import { DemoRouteOption } from '../../services/demoData';
import { ShieldAlert, ShieldCheck, AlertTriangle, Clock, MapPin, ArrowRight } from 'lucide-react';

interface RouteDisplayProps {
  title: string;
  fromName: string;
  toName: string;
  routes: DemoRouteOption[];
  selectedRouteId: string;
  onSelectRoute: (route: DemoRouteOption) => void;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({
  title,
  fromName,
  toName,
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{title}</span>
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{fromName}</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{toName}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isSafe = route.status === 'Safe';
          const isPartiallyBlocked = route.status === 'Partially Blocked';

          let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
          let StatusIcon = ShieldCheck;

          if (isPartiallyBlocked) {
            statusBg = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
            StatusIcon = AlertTriangle;
          } else if (!isSafe) {
            statusBg = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
            StatusIcon = ShieldAlert;
          }

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {route.name}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {route.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {route.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-900 dark:text-white">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{route.etaMinutes} min</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {route.distanceKm} km
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 pt-2 border-t border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Active on Tactical GPS Map
                  </span>
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                    SELECTED
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
