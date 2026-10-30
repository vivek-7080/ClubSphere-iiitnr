import React from 'react';
import { Club, CampusEvent } from '../types';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedClubs: Club[];
  savedEvents: CampusEvent[];
  onRemoveClub: (clubId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onSelectClub: (club: Club) => void;
  onRegisterEvent: (event: CampusEvent) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  savedClubs,
  savedEvents,
  onRemoveClub,
  onRemoveEvent,
  onSelectClub,
  onRegisterEvent,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="animate-drawer-slide w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-6 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-white">
              <Bookmark className="h-4 w-4 text-amber-400 fill-amber-400" />
              <h3 className="text-base font-bold">Saved Items</h3>
            </div>
            <button
              onClick={onClose}
              className="btn-tactile p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Saved Clubs Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <span>Saved Societies ({savedClubs.length})</span>
            </div>

            {savedClubs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No clubs saved yet. Click the bookmark icon on any club card.</p>
            ) : (
              <div className="space-y-2.5">
                {savedClubs.map((club) => (
                  <div
                    key={club.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div 
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-slate-950"
                        style={{ backgroundColor: club.accentColor }}
                      >
                        {club.acronym}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{club.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{club.categoryLabel}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectClub(club);
                        }}
                        className="p-1.5 text-xs text-slate-300 hover:text-amber-400 transition-colors"
                        title="View club profile"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveClub(club.id)}
                        className="p-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Events Section */}
          <div className="mt-8 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <span>Saved Events ({savedEvents.length})</span>
            </div>

            {savedEvents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No events saved yet. Click the bookmark icon on any event.</p>
            ) : (
              <div className="space-y-2.5">
                {savedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700"
                  >
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{evt.title}</div>
                      <div className="text-[11px] text-slate-400">{evt.clubAcronym} · {evt.date}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => {
                          onClose();
                          onRegisterEvent(evt);
                        }}
                        className="px-2 py-1 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
                      >
                        Register
                      </button>
                      <button
                        onClick={() => onRemoveEvent(evt.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-6">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Close Saved Items
          </button>
        </div>
      </div>
    </div>
  );
};
