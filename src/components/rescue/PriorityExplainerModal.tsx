import React from 'react';
import { Modal } from '../common/Modal';
import { PRIORITY_MODEL_DISCLAIMER } from '../../services/priorityCalculator';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Heart, 
  Baby, 
  Smile, 
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';

interface PriorityExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityExplainerModal: React.FC<PriorityExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ResQBridge Priority Triage Scoring Model"
      subtitle="Transparent algorithmic triage system ensuring critical lives are rescued first."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs">
        {/* Innovation callout */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2 font-bold text-sm mb-1 text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4" />
            Transparent, Objective Emergency Ordering
          </div>
          <p className="leading-relaxed">
            Unlike chaotic manual phone calls, ResQBridge normalizes multivariable danger factors into a standardized <strong>0–100 Priority Score</strong>. Rescue teams instantly see who is in the greatest peril.
          </p>
        </div>

        {/* Scoring Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Triage Dimension</th>
                <th className="p-3">Weight Factor</th>
                <th className="p-3">Calculation Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Base Severity
                </td>
                <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">10 to 50 pts</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  Critical = 50, High = 35, Medium = 20, Low = 10
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  People Count
                </td>
                <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">+5 pts / person</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  5 points per trapped person (capped at 25 points maximum contribution)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Injured People
                </td>
                <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">+10 pts / person</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  10 points per injured victim (capped at 30 points maximum contribution)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Baby className="w-3.5 h-3.5 text-amber-500" />
                  Children
                </td>
                <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">+5 pts / child</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  5 points per child at the scene (capped at 15 points)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smile className="w-3.5 h-3.5 text-indigo-500" />
                  Elderly & Vulnerable
                </td>
                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">+5 to +7 pts</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  +5 pts per elderly, +7 pts per disabled/non-ambulatory person
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Waiting Time Escalation
                </td>
                <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">+1 pt / 3 min</td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  Increases score continuously while incident is unresolved (prevents backlog starvation)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Priority Tiers */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Priority Tier Classification
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200">
              <span className="font-extrabold block text-sm">80 – 100</span>
              <span className="text-[10px] font-bold">CRITICAL</span>
            </div>
            <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
              <span className="font-extrabold block text-sm">60 – 79</span>
              <span className="text-[10px] font-bold">HIGH</span>
            </div>
            <div className="p-2.5 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200">
              <span className="font-extrabold block text-sm">40 – 59</span>
              <span className="text-[10px] font-bold">MEDIUM</span>
            </div>
            <div className="p-2.5 rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200">
              <span className="font-extrabold block text-sm">0 – 39</span>
              <span className="text-[10px] font-bold">LOW</span>
            </div>
          </div>
        </div>

        {/* Mandatory Project Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
          <strong>Transparency Notice:</strong> {PRIORITY_MODEL_DISCLAIMER}
        </div>
      </div>
    </Modal>
  );
};
