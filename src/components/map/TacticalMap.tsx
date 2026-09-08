import React, { useEffect, useRef, useState } from 'react';
import { EmergencyRequest, RescueTeam, Shelter } from '../../types';
import { DemoRouteOption } from '../../services/demoData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Layers, 
  RotateCcw,
  Navigation,
  AlertTriangle
} from 'lucide-react';

// Fix standard Leaflet default icon issues in bundled environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TacticalMapProps {
  emergencies: EmergencyRequest[];
  teams: RescueTeam[];
  shelters: Shelter[];
  selectedEmergency?: EmergencyRequest;
  selectedTeam?: RescueTeam;
  selectedShelter?: Shelter;
  activeRoute?: DemoRouteOption | null;
  height?: string;
  onSelectEmergency?: (emg: EmergencyRequest) => void;
  onSelectShelter?: (shelter: Shelter) => void;
  interactiveMode?: boolean;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  emergencies,
  teams,
  shelters,
  selectedEmergency,
  selectedTeam,
  selectedShelter,
  activeRoute,
  height = '520px',
  onSelectEmergency,
  onSelectShelter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapError, setMapError] = useState(false);
  const [viewMode, setViewMode] = useState<'osm' | 'tactical'>('osm');

  // Center coordinate around the flood relief operational sector
  const defaultCenter: [number, number] = [16.5150, 80.6400];
  const defaultZoom = 13;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current && viewMode === 'osm') {
      try {
        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          zoomControl: false,
          attributionControl: false
        });

        // Add standard OSM tile layer with fallback handler
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        });

        tileLayer.on('tileerror', () => {
          // If offline or tiles fail, don't crash
          console.warn('Map tiles load issue; graceful fallback maintained.');
        });

        tileLayer.addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Leaflet initialization failed', err);
        setMapError(true);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode]);

  // Update Markers & Routes whenever props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupRef.current || viewMode !== 'osm') return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Plot Shelters
    shelters.forEach((shelter) => {
      const isSelected = selectedShelter?.id === shelter.id;
      const isUnsafe = shelter.safetyStatus === 'Unsafe';
      const isNearlyFull = shelter.safetyStatus === 'Nearly Full';

      const markerBg = isUnsafe ? '#e11d48' : isNearlyFull ? '#d97706' : '#059669';
      const ringBorder = isSelected ? 'border: 3px solid #2563eb; transform: scale(1.15);' : 'border: 2px solid white;';

      const customHtml = `
        <div style="background-color: ${markerBg}; color: white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); ${ringBorder} cursor: pointer;" title="${shelter.name}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        className: 'shelter-marker-icon',
        html: customHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([shelter.latitude, shelter.longitude], { icon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #0f172a;">${shelter.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${shelter.address}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
              <span>Available Capacity:</span>
              <strong style="color: ${shelter.availableCapacity > 50 ? '#059669' : '#e11d48'};">${shelter.availableCapacity} / ${shelter.totalCapacity}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
              <span>Safety Status:</span>
              <span style="font-weight: 600; color: ${isUnsafe ? '#e11d48' : '#059669'};">${shelter.safetyStatus}</span>
            </div>
            <div style="font-size: 10px; color: #475569;">Verification: <strong>${shelter.verificationStatus}</strong></div>
          </div>
        `);

      if (onSelectShelter) {
        marker.on('click', () => onSelectShelter(shelter));
      }
    });

    // 2. Plot Rescue Teams
    teams.forEach((team) => {
      const isSelected = selectedTeam?.id === team.id;
      const isDispatched = team.status === 'Dispatched' || team.status === 'On Scene' || team.status === 'Transporting';

      const customHtml = `
        <div style="background-color: #2563eb; color: white; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: 2px solid white; ${isSelected ? 'outline: 3px solid #f59e0b;' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        className: 'team-marker-icon',
        html: customHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([team.currentLocation.lat, team.currentLocation.lng], { icon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; font-size: 13px; color: #1e3a8a;">${team.teamName}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Lead: ${team.leadName} (${team.membersCount} crew)</div>
            <div style="font-size: 11px; margin-bottom: 4px;">Vehicle: <strong>${team.vehicleType}</strong></div>
            <div style="font-size: 11px;">Status: <strong style="color: ${isDispatched ? '#d97706' : '#059669'};">${team.status}</strong></div>
          </div>
        `);
    });

    // 3. Plot Emergencies / Citizens
    emergencies.forEach((emg) => {
      const isSelected = selectedEmergency?.id === emg.id;
      const isResolved = emg.status === 'Resolved';
      const isCritical = emg.priorityScore >= 80;

      let bgColor = isResolved ? '#10b981' : isCritical ? '#dc2626' : emg.priorityScore >= 60 ? '#f59e0b' : '#3b82f6';

      const customHtml = `
        <div style="position: relative; width: 36px; height: 36px;">
          ${!isResolved && isCritical ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${bgColor}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="position: relative; background-color: ${bgColor}; color: white; border-radius: 9999px; width: 36px; height: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); border: 2.5px solid white; ${isSelected ? 'transform: scale(1.2); box-shadow: 0 0 0 3px #1e293b;' : ''} cursor: pointer;">
            <span style="font-size: 10px; font-weight: 800; line-height: 1;">${emg.priorityScore}</span>
            <span style="font-size: 8px; opacity: 0.9; line-height: 1;">SOS</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'emergency-marker-icon',
        html: customHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([emg.latitude, emg.longitude], { icon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${emg.id}</span>
              <span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 700;">${emg.severity}</span>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #1e293b;">${emg.userName} • ${emg.emergencyType}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${emg.address}</div>
            <div style="font-size: 11px; margin-bottom: 4px;">
              People: <strong>${emg.peopleCount}</strong> (Injured: ${emg.injuredCount})
            </div>
            <div style="font-size: 11px; margin-bottom: 4px;">
              Priority Score: <strong style="color: ${isCritical ? '#dc2626' : '#d97706'};">${emg.priorityScore}/100</strong>
            </div>
            <div style="font-size: 11px;">Status: <strong>${emg.status}</strong></div>
          </div>
        `);

      if (onSelectEmergency) {
        marker.on('click', () => onSelectEmergency(emg));
      }
    });

    // 4. Plot Active Route Polylines (if available)
    if (activeRoute && activeRoute.waypoints.length > 1) {
      let routeColor = '#10b981'; // Safe = green
      let dashArray: string | undefined = undefined;

      if (activeRoute.status === 'Partially Blocked') {
        routeColor = '#f59e0b'; // amber
        dashArray = '8, 8';
      } else if (activeRoute.status === 'Flooded/Blocked') {
        routeColor = '#ef4444'; // red
        dashArray = '6, 6';
      }

      const polyline = L.polyline(activeRoute.waypoints, {
        color: routeColor,
        weight: 6,
        opacity: 0.85,
        dashArray
      }).addTo(layerGroup);

      // Fit map bounds to show full route comfortably
      try {
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      } catch (e) {
        // ignore bounds calculation error
      }
    } else if (selectedEmergency) {
      // Pan smoothly to selected emergency
      map.setView([selectedEmergency.latitude, selectedEmergency.longitude], 14, { animate: true });
    }
  }, [emergencies, teams, shelters, selectedEmergency, selectedTeam, selectedShelter, activeRoute, viewMode, onSelectEmergency, onSelectShelter]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(defaultCenter, defaultZoom);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900">
      {/* Map Control Toolbar Overlay */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <Compass className="w-4 h-4 text-rose-500 animate-spin-slow" />
          <span>Operational Disaster Grid</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Active SOS: <strong className="text-rose-600 dark:text-rose-400">{emergencies.filter(e => e.status !== 'Resolved').length}</strong></span>
          <span>•</span>
          <span>Shelters: <strong className="text-emerald-600 dark:text-emerald-400">{shelters.filter(s => s.safetyStatus === 'Safe').length} Safe</strong></span>
        </div>
      </div>

      {/* Mode Switcher & Re-center button */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'osm' ? 'tactical' : 'osm')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Map Rendering Layer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{viewMode === 'osm' ? 'OSM Layer' : 'Tactical HUD'}</span>
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Body: Leaflet or High-Tech Tactical SVG Vector HUD */}
      {viewMode === 'osm' && !mapError ? (
        <div 
          ref={mapContainerRef} 
          style={{ height, width: '100%' }}
          className="z-10"
        />
      ) : (
        /* Tactical HUD Vector Radar (Zero-failure offline fallback & high-tech view) */
        <div 
          style={{ height }}
          className="relative w-full bg-slate-950 flex items-center justify-center p-6 overflow-hidden select-none"
        >
          {/* Tactical Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute inset-0 border border-emerald-500/10 pointer-events-none" />

          {/* Concentric radar rings */}
          <div className="absolute w-[500px] h-[500px] rounded-full border border-emerald-500/10 animate-pulse pointer-events-none" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-emerald-500/15 pointer-events-none" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/20 pointer-events-none" />

          {/* Sector Coordinate HUD Overlay */}
          <div className="absolute top-12 left-4 text-[11px] font-mono text-emerald-400/70 space-y-0.5">
            <div>REGION: GODAVARI-KRISHNA DELTA FLOOD SECTOR</div>
            <div>COORDINATES: 16.5150° N, 80.6400° E</div>
            <div>STATUS: TACTICAL SYNCHRONIZED VECTOR HUD</div>
          </div>

          {/* Render Vector Nodes positioned relative to coordinate bounding box */}
          <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
            {/* Shelters nodes */}
            {shelters.map((s, idx) => {
              const xPos = 20 + ((s.longitude - 80.61) / 0.06) * 60;
              const yPos = 80 - ((s.latitude - 16.49) / 0.06) * 60;
              const isSelected = selectedShelter?.id === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectShelter?.(s)}
                  style={{ left: `${Math.max(10, Math.min(90, xPos))}%`, top: `${Math.max(15, Math.min(85, yPos))}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 flex flex-col items-center group`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${isSelected ? 'border-sky-400 scale-110 ring-4 ring-sky-500/30' : 'border-white'} ${s.safetyStatus === 'Safe' ? 'bg-emerald-600 text-white' : s.safetyStatus === 'Nearly Full' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-1.5 py-0.5 bg-slate-900/90 text-[10px] font-medium text-slate-200 rounded border border-slate-700 whitespace-nowrap shadow-xs">
                    {s.name.split(' ')[0]} ({s.availableCapacity} open)
                  </span>
                </div>
              );
            })}

            {/* Teams nodes */}
            {teams.map((t) => {
              const xPos = 20 + ((t.currentLocation.lng - 80.61) / 0.06) * 60;
              const yPos = 80 - ((t.currentLocation.lat - 16.49) / 0.06) * 60;
              const isSelected = selectedTeam?.id === t.id;

              return (
                <div
                  key={t.id}
                  style={{ left: `${Math.max(10, Math.min(90, xPos))}%`, top: `${Math.max(15, Math.min(85, yPos))}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-auto"
                >
                  <div className={`w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ${isSelected ? 'ring-4 ring-amber-400' : ''}`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-1.5 py-0.5 bg-blue-950/90 text-[10px] font-medium text-blue-200 rounded border border-blue-800 whitespace-nowrap">
                    {t.teamName.split(' ')[0]}
                  </span>
                </div>
              );
            })}

            {/* Emergencies nodes */}
            {emergencies.map((emg) => {
              const xPos = 20 + ((emg.longitude - 80.61) / 0.06) * 60;
              const yPos = 80 - ((emg.latitude - 16.49) / 0.06) * 60;
              const isSelected = selectedEmergency?.id === emg.id;
              const isResolved = emg.status === 'Resolved';

              return (
                <div
                  key={emg.id}
                  onClick={() => onSelectEmergency?.(emg)}
                  style={{ left: `${Math.max(10, Math.min(90, xPos))}%`, top: `${Math.max(15, Math.min(85, yPos))}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 flex flex-col items-center group z-20"
                >
                  {!isResolved && (
                    <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" />
                  )}
                  <div className={`relative w-9 h-9 rounded-full flex flex-col items-center justify-center shadow-xl border-2 border-white font-bold text-white text-[10px] ${isResolved ? 'bg-emerald-600' : emg.priorityScore >= 80 ? 'bg-rose-600' : emg.priorityScore >= 60 ? 'bg-amber-600' : 'bg-blue-600'} ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''}`}>
                    <span>{emg.priorityScore}</span>
                    <span className="text-[7px] leading-none opacity-80">SOS</span>
                  </div>
                  <span className="mt-1 px-1.5 py-0.5 bg-slate-900/90 text-[10px] font-medium text-rose-300 rounded border border-rose-900/60 whitespace-nowrap">
                    {emg.userName} ({emg.peopleCount}p)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-md">
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block -ml-3.5" />
            <span className="font-semibold">SOS Request (Score 0-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600 inline-block" />
            <span>Rescue Team</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span>Safe Shelter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
            <span>Nearly Full Shelter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
            <span>Unsafe / Inactive</span>
          </div>
        </div>

        {activeRoute && (
          <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            <Navigation className="w-3.5 h-3.5 text-blue-500" />
            <span>Route: <strong>{activeRoute.name}</strong></span>
            <span className="text-slate-400">|</span>
            <span>{activeRoute.distanceKm} km ({activeRoute.etaMinutes} min)</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeRoute.status === 'Safe' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
              {activeRoute.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
