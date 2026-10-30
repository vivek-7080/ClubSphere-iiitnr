import React, { useState } from 'react';
import { CampusVenue } from '../types';
import { MapPin, Users, Cpu, ShieldCheck } from 'lucide-react';

interface CampusVenuesSectionProps {
  venues: CampusVenue[];
}

export const CampusVenuesSection: React.FC<CampusVenuesSectionProps> = ({ venues }) => {
  const [selectedVenue, setSelectedVenue] = useState<CampusVenue>(venues[0]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Campus Infrastructure & Facilities
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Activity Venues & Laboratories
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          IIIT-NR features dedicated labs, studios, and outdoor staging arenas reserved for student club initiatives and workshops.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Venues Selector List */}
        <div className="lg:col-span-5 space-y-3">
          {venues.map((venue) => {
            const isSelected = selectedVenue.id === venue.id;
            return (
              <button
                key={venue.id}
                onClick={() => setSelectedVenue(venue)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-150 ${
                  isSelected
                    ? 'border-amber-400/80 bg-slate-900 shadow-md'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-400 font-bold tabular-nums">
                    {venue.code}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-500" />
                    <span className="font-mono tabular-nums">{venue.capacity}</span> seats
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  {venue.name}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  {venue.building} · {venue.floor}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Venue Spotlight */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono font-semibold text-amber-400">{selectedVenue.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedVenue.building}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {selectedVenue.name}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-500 font-medium">Capacity</div>
                <div className="font-mono text-xl font-bold text-white tabular-nums">
                  {selectedVenue.capacity}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm text-slate-300 leading-relaxed">
              {selectedVenue.description}
            </p>

            {/* Primary Clubs Associated */}
            <div className="mt-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Primary Societies Hosted
              </h5>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                {selectedVenue.primaryClubs.map((clubName, idx) => (
                  <span 
                    key={idx}
                    className="border border-slate-800 bg-slate-950 px-3 py-1.5 rounded-lg text-slate-200"
                  >
                    {clubName}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment & Specifications */}
            <div className="mt-6 border-t border-slate-800/80 pt-5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                Specialized Hardware & Audio/Visual Rig
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedVenue.equipment.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Notice */}
          <div className="mt-8 rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Venue slots require prior slot approval from the Faculty In-Charge and SAC General Secretary.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
