import React, { useState } from 'react';
import { RequirementPriority, RequirementStatus, UrgentRequirement } from '../../types';
import { Modal } from '../common/Modal';
import { 
  PackageCheck, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  Sparkles
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface UrgentRequirementsManagerProps {
  requirements: UrgentRequirement[];
  onAddRequirement: (req: Omit<UrgentRequirement, 'id' | 'reportedTime'>) => void;
  onUpdateStatus: (id: string, status: RequirementStatus) => void;
  onDeleteRequirement: (id: string) => void;
}

const CATEGORIES = [
  'Food & Water',
  'Medical',
  'Rescue Gear',
  'Sanitation & Shelter',
  'Logistics'
] as const;

export const UrgentRequirementsManager: React.FC<UrgentRequirementsManagerProps> = ({
  requirements,
  onAddRequirement,
  onUpdateStatus,
  onDeleteRequirement,
}) => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Form State
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<RequirementPriority>('Urgent');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Food & Water');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !quantity.trim() || !location.trim()) {
      toast.error('Missing Details', 'Please complete item, quantity, and location.');
      return;
    }

    onAddRequirement({
      item,
      quantity,
      location,
      priority,
      status: 'Urgent',
      category,
      notes
    });

    toast.success('Urgent Requirement Broadcasted', `${item} requisition dispatched to relief suppliers.`);
    setIsModalOpen(false);
    setItem('');
    setQuantity('');
    setLocation('');
    setNotes('');
  };

  const filteredRequirements = requirements.filter((r) => {
    if (filterCategory === 'All') return true;
    return r.category === filterCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-500" />
            Urgent Relief Supply & Logistics Requisition
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate life-saving supplies: clean water, rations, medicine, rescue boats, and bedding
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post Requirement</span>
          </button>
        </div>
      </div>

      {/* Grid of Supply Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRequirements.map((req) => {
          const isFulfilled = req.status === 'Fulfilled';
          const isInProgress = req.status === 'In Progress';
          const isUrgent = req.status === 'Urgent';

          return (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isFulfilled
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 opacity-75'
                  : isUrgent
                  ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/20 shadow-xs'
                  : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {req.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : req.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {req.item}
                </h4>

                <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  Qty: {req.quantity}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{req.location}</span>
                </p>

                {req.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 italic bg-white/60 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{req.notes}"
                  </p>
                )}
              </div>

              {/* Status Stepper Toolbar */}
              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <select
                  value={req.status}
                  onChange={(e) => {
                    const next = e.target.value as RequirementStatus;
                    onUpdateStatus(req.id, next);
                    toast.info(`Supply updated to "${next}"`);
                  }}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-hidden ${
                    isFulfilled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : isInProgress
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Fulfilled">Fulfilled</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {req.reportedTime.split(' ')[1]}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteRequirement(req.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Requisition Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Urgent Supply Requirement"
        subtitle="Dispatch emergency supply requirement to logistics hubs and NGO relief teams."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supply Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Item Name
            </label>
            <input
              type="text"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="e.g. Inflatable Boats, Pediatric Antibiotics, Drinking Water Cans"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Required
              </label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500 Cans, 4 Units, 200 Kits"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequirementPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Destination Relief Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kaveri Relief Camp, Sector 4 Staging Base"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Operational Notes / Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for urgency, delivery constraints, vehicle clearance..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md"
            >
              Broadcast Requisition
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
