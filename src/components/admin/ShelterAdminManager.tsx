import React, { useState } from 'react';
import { Shelter, ShelterSafetyStatus, ShelterVerificationStatus } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Building2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Phone, 
  MapPin, 
  Check, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface ShelterAdminManagerProps {
  shelters: Shelter[];
  onAddShelter: (s: Omit<Shelter, 'id' | 'lastVerified'>) => void;
  onUpdateShelter: (s: Shelter) => void;
  onDeleteShelter: (id: string) => void;
  onToggleSafety: (id: string, status: ShelterSafetyStatus) => void;
  onSetVerification: (id: string, status: ShelterVerificationStatus) => void;
}

export const ShelterAdminManager: React.FC<ShelterAdminManagerProps> = ({
  shelters,
  onAddShelter,
  onUpdateShelter,
  onDeleteShelter,
  onToggleSafety,
  onSetVerification,
}) => {
  const toast = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);

  // Form fields for Add/Edit
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(16.5150);
  const [lng, setLng] = useState(80.6400);
  const [totalCapacity, setTotalCapacity] = useState(400);
  const [occupiedCapacity, setOccupiedCapacity] = useState(50);
  const [safetyStatus, setSafetyStatus] = useState<ShelterSafetyStatus>('Safe');
  const [verificationStatus, setVerificationStatus] = useState<ShelterVerificationStatus>('Verified');
  const [facilitiesStr, setFacilitiesStr] = useState('Clean Water, Kitchen, Medical Bay');
  const [contactPerson, setContactPerson] = useState('Officer In Charge');
  const [contactPhone, setContactPhone] = useState('+91 94400 11223');
  const [accessibilityNotes, setAccessibilityNotes] = useState('Wheelchair ramp and generator backup installed.');

  const openAddModal = () => {
    setName('');
    setAddress('High Ground Sector, Bypass Ring Rd');
    setLat(16.5220);
    setLng(80.6350);
    setTotalCapacity(500);
    setOccupiedCapacity(0);
    setSafetyStatus('Safe');
    setVerificationStatus('Verified');
    setFacilitiesStr('Clean Water, Kitchen, Medical Bay, Backup Power');
    setContactPerson('Camp Officer');
    setContactPhone('+91 94400 99887');
    setAccessibilityNotes('Elevated plinth, accessible entry ramp.');
    setEditingShelter(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (s: Shelter) => {
    setEditingShelter(s);
    setName(s.name);
    setAddress(s.address);
    setLat(s.latitude);
    setLng(s.longitude);
    setTotalCapacity(s.totalCapacity);
    setOccupiedCapacity(s.occupiedCapacity);
    setSafetyStatus(s.safetyStatus);
    setVerificationStatus(s.verificationStatus);
    setFacilitiesStr(s.facilities.join(', '));
    setContactPerson(s.contactPerson);
    setContactPhone(s.contactPhone);
    setAccessibilityNotes(s.accessibilityNotes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const facilities = facilitiesStr.split(',').map(f => f.trim()).filter(Boolean);
    const availableCapacity = Math.max(0, totalCapacity - occupiedCapacity);

    if (editingShelter) {
      onUpdateShelter({
        ...editingShelter,
        name,
        address,
        latitude: lat,
        longitude: lng,
        totalCapacity,
        occupiedCapacity,
        availableCapacity,
        safetyStatus,
        verificationStatus,
        facilities,
        contactPerson,
        contactPhone,
        accessibilityNotes,
        lastVerified: new Date().toISOString().replace('T', ' ').slice(0, 16)
      });
      toast.success('Shelter Updated', `${name} parameters updated successfully.`);
    } else {
      onAddShelter({
        name,
        address,
        latitude: lat,
        longitude: lng,
        totalCapacity,
        occupiedCapacity,
        availableCapacity,
        safetyStatus,
        verificationStatus,
        facilities,
        contactPerson,
        contactPhone,
        accessibilityNotes
      });
      toast.success('Shelter Registered', `${name} added to live relief registry.`);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Disaster Relief Shelter Command & Verification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage physical shelter sites, verify structural safety, and control capacity ceilings
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Shelter</span>
        </button>
      </div>

      {/* Shelter Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3">Shelter Name & Address</th>
              <th className="p-3">Safety Status</th>
              <th className="p-3">Verification</th>
              <th className="p-3">Occupancy</th>
              <th className="p-3">Facilities & Contact</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {shelters.map((s) => {
              const occupancyPct = Math.round((s.occupiedCapacity / s.totalCapacity) * 100);

              return (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{s.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {s.address}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      GPS: {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                    </div>
                  </td>

                  {/* Safety Status Dropdown/Toggle */}
                  <td className="p-3">
                    <select
                      value={s.safetyStatus}
                      onChange={(e) => {
                        const val = e.target.value as ShelterSafetyStatus;
                        onToggleSafety(s.id, val);
                        toast.info(`Safety status updated to ${val} for ${s.name}`);
                      }}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden ${
                        s.safetyStatus === 'Safe'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.safetyStatus === 'Nearly Full'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      <option value="Safe">Safe</option>
                      <option value="Nearly Full">Nearly Full</option>
                      <option value="Full">Full</option>
                      <option value="Unsafe">Unsafe</option>
                    </select>
                  </td>

                  {/* Verification Status */}
                  <td className="p-3">
                    <select
                      value={s.verificationStatus}
                      onChange={(e) => {
                        const val = e.target.value as ShelterVerificationStatus;
                        onSetVerification(s.id, val);
                        toast.info(`Verification status: ${val} for ${s.name}`);
                      }}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Needs Reverification">Needs Reverification</option>
                      <option value="Unsafe">Unsafe</option>
                    </select>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Verified: {s.lastVerified}
                    </div>
                  </td>

                  {/* Occupancy Bar */}
                  <td className="p-3">
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {s.occupiedCapacity} / {s.totalCapacity} ({occupancyPct}%)
                    </div>
                    <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {s.availableCapacity} available
                    </span>
                  </td>

                  {/* Facilities & Contact */}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-xs mb-1">
                      {s.facilities.map((f) => (
                        <span key={f} className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Phone className="w-2.5 h-2.5" />
                      {s.contactPerson} ({s.contactPhone})
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Shelter Parameters"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove shelter "${s.name}" from active disaster registry?`)) {
                            onDeleteShelter(s.id);
                            toast.error('Shelter Removed', `${s.name} decommissioned.`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Decommission Shelter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Shelter Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingShelter ? `Edit Shelter: ${editingShelter.name}` : 'Register New Disaster Shelter'}
        subtitle="Manage shelter parameters, capacity ceilings, and verification criteria."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shelter Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kaveri Community Center"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Physical Location Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, area, landmarks..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Capacity
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Occupied
              </label>
              <input
                type="number"
                min="0"
                max={totalCapacity}
                value={occupiedCapacity}
                onChange={(e) => setOccupiedCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 16.515)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 80.64)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Safety Status
              </label>
              <select
                value={safetyStatus}
                onChange={(e) => setSafetyStatus(e.target.value as ShelterSafetyStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Safe">Safe</option>
                <option value="Nearly Full">Nearly Full</option>
                <option value="Full">Full</option>
                <option value="Unsafe">Unsafe</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Verification Status
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as ShelterVerificationStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Needs Reverification">Needs Reverification</option>
                <option value="Unsafe">Unsafe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Facilities (Comma-separated)
            </label>
            <input
              type="text"
              value={facilitiesStr}
              onChange={(e) => setFacilitiesStr(e.target.value)}
              placeholder="Drinking Water, Community Kitchen, Medical Aid, Solar Power"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Accessibility Notes
            </label>
            <input
              type="text"
              value={accessibilityNotes}
              onChange={(e) => setAccessibilityNotes(e.target.value)}
              placeholder="e.g. Ground floor ramp available, high clearance road access"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
            >
              {editingShelter ? 'Save Changes' : 'Register Shelter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
