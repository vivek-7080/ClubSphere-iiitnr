import React from 'react';
import { Club } from '../types';
import { X, Users, MapPin, Bookmark, ExternalLink, Mail, CheckCircle2, Award, ShieldCheck, Trash2 } from 'lucide-react';

interface ClubModalProps {
  club: Club | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (clubId: string) => void;
  onApply: (club: Club) => void;
  onOpenAdmin?: (club: Club) => void;
  isAdmin?: boolean;
  onRemoveClub?: (club: Club) => void;
}

export const ClubModal: React.FC<ClubModalProps> = ({
  club,
  onClose,
  isSaved,
  onToggleSave,
  onApply,
  onOpenAdmin,
  isAdmin = false,
  onRemoveClub,
}) => {
  if (!club) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="animate-scale-in relative w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 md:p-8 text-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-black text-slate-950 shadow"
              style={{ backgroundColor: club.accentColor }}
            >
              {club.acronym}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{club.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{club.membersCount} Active Members</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
                {club.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(club.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isSaved ? 'Bookmarked' : 'Bookmark'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tagline Callout */}
        <div className="mt-5 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5">
          <p className="text-sm font-medium text-amber-300">
            "{club.tagline}"
          </p>
        </div>

        {/* Description & Overview */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            About the Society
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {club.description}
          </p>
        </div>

        {/* Activity Venue Strip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-y border-slate-800/80 py-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-500 font-medium">Activity Venue</div>
              <div className="font-medium text-white">{club.meetingVenue}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Users className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-slate-500 font-medium">Community Strength</div>
              <div className="font-medium text-white font-mono tabular-nums">{club.membersCount} Enrolled Students</div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Active Projects & Flagship Events */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Active Projects & Initiatives
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {club.activeProjects.map((proj, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-md border border-slate-800/60">
                  <span className="font-mono text-amber-400 tabular-nums">0{idx + 1}.</span>
                  <span>{proj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              Flagship Events & Fests
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {club.flagshipEvents.map((event, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-md border border-slate-800/60">
                  <span className="font-mono text-cyan-400 tabular-nums">0{idx + 1}.</span>
                  <span>{event}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Student Leadership & Leads */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            Student Coordinators (2026-27)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {club.leads.map((lead, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm text-white">{lead.name}</div>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Club Head (Admin)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-amber-400">{lead.role}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    B.Tech {lead.branch} · Batch {lead.batch}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-900 pt-2">
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{lead.email}</span>
                  </a>
                  {lead.linkedin && (
                    <a 
                      href={lead.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-amber-400 transition-colors ml-auto"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="text-slate-500">Recruitment Status: </span>
            <span className={`font-semibold ${club.recruitmentStatus === 'Open' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {club.recruitmentStatus}
            </span>
            <span className="text-slate-500 ml-2">({club.recruitmentTarget})</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isAdmin && onRemoveClub && (
              <button
                onClick={() => {
                  onClose();
                  onRemoveClub(club);
                }}
                className="btn-tactile flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors whitespace-nowrap"
                title="Admin: Remove Club"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                <span>Remove Club</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin(club);
                }}
                className="btn-tactile flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
                title={`Open Admin Console as ${club.leads[0]?.name || 'Club Head'}`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Admin Console</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onApply(club);
              }}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              Apply to {club.acronym}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
