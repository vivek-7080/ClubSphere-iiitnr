import React from 'react';
import { Club } from '../types';
import { Bookmark, ArrowRight, Users, MapPin, ShieldCheck, Trash2 } from 'lucide-react';

interface ClubCardProps {
  club: Club;
  isSaved: boolean;
  onToggleSave: (clubId: string) => void;
  onSelectClub: (club: Club) => void;
  onApplyClub: (club: Club) => void;
  onOpenAdmin?: (club: Club) => void;
  isAdmin?: boolean;
  onRemoveClub?: (club: Club) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({
  club,
  isSaved,
  onToggleSave,
  onSelectClub,
  onApplyClub,
  onOpenAdmin,
  isAdmin = false,
  onRemoveClub,
}) => {
  return (
    <div className="card-tactile-hover group relative flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/60 p-5 hover:border-amber-500/30 hover:bg-slate-900/90">
      <div>
        {/* Top Header: Monogram Avatar + Category Text (NO PILLS) + Save Action */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-bold text-sm text-slate-950 shadow-md group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300 ease-out"
              style={{ backgroundColor: club.accentColor }}
            >
              {club.acronym.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
                {club.name}
              </h3>
              {/* Clean unboxed metadata with dot separators */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{club.categoryLabel}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleSave(club.id)}
            className={`btn-tactile p-1.5 rounded-lg border transition-all ${
              isSaved
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 scale-105'
                : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800'
            }`}
            title={isSaved ? 'Remove from bookmarks' : 'Save club'}
            aria-label={`Bookmark ${club.name}`}
          >
            <Bookmark className={`h-4 w-4 transition-transform duration-200 ${isSaved ? 'fill-amber-400 scale-110' : ''}`} />
          </button>
        </div>

        {/* Tagline & Short Description */}
        <p className="mt-3.5 text-xs font-medium text-amber-300/90 leading-snug">
          "{club.tagline}"
        </p>
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {club.description}
        </p>

        {/* Core Attributes: Unboxed Metadata Grid */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Head (Admin): <strong className="text-white">{club.leads[0]?.name}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span><span className="font-mono tabular-nums text-slate-200 font-semibold">{club.membersCount}</span> active student members</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{club.meetingVenue}</span>
          </div>
        </div>

        {/* Skills Gained: Clean Unboxed Micro-Labels with Slashes */}
        <div className="mt-3.5 text-[11px] text-slate-400">
          <span className="text-slate-500 font-medium">Focus: </span>
          <span>{club.skillsGained.slice(0, 3).join(' / ')}</span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3.5">
        <div className="text-[11px] flex items-center gap-1.5">
          <span className="text-slate-500">Recruitment: </span>
          <span className={`font-semibold inline-flex items-center gap-1 ${
            club.recruitmentStatus === 'Open' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {club.recruitmentStatus === 'Open' && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-subtle-pulse" />
            )}
            {club.recruitmentStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAdmin && (
            <button
              onClick={() => onOpenAdmin(club)}
              className="btn-tactile p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors border border-transparent hover:border-amber-400/20"
              title={`Manage ${club.acronym} as ${club.leads[0]?.name || 'Admin'}`}
              aria-label={`Manage ${club.name}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </button>
          )}

          {isAdmin && onRemoveClub && (
            <button
              onClick={() => onRemoveClub(club)}
              className="btn-tactile p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
              title={`Admin: Remove ${club.name}`}
              aria-label={`Remove ${club.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={() => onSelectClub(club)}
            className="btn-tactile flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800 whitespace-nowrap"
          >
            <span>Overview</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          {club.recruitmentStatus === 'Open' && (
            <button
              onClick={() => onApplyClub(club)}
              className="btn-tactile text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shadow-sm hover:shadow-amber-500/20"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
