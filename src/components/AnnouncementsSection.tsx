import React, { useState } from 'react';
import { Announcement } from '../types';
import { Bell, ArrowRight, ShieldAlert, X } from 'lucide-react';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onOpenRecruitment: () => void;
  onOpenEvents: () => void;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  onOpenRecruitment,
  onOpenEvents,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const filtered = announcements.filter((ann) => {
    if (activeFilter === 'all') return true;
    return ann.category.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Student Activity Center (SAC)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Official Notices & Bulletins
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Live circulars, recruitment timelines, audition venues, and student grant approvals verified by the Institute SAC Council.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {['all', 'Recruitment', 'Event', 'Grant'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                activeFilter === cat
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Bulletins' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="mt-8 space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            onClick={() => setSelectedAnnouncement(ann)}
            className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5">
                {/* Clean unboxed metadata with dot separators */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-amber-400">{ann.source}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{ann.date}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{ann.category}</span>
                  {ann.isUrgent && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Urgent Notice
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl line-clamp-2">
                  {ann.summary}
                </p>
              </div>

              <div className="sm:self-center shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnouncement(ann);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors"
                >
                  <span>Read Notice</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Notice Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 text-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute right-4 top-4 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-amber-400">{selectedAnnouncement.source}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedAnnouncement.date}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedAnnouncement.category}</span>
            </div>

            <h2 className="text-xl font-bold text-white mt-2">
              {selectedAnnouncement.title}
            </h2>

            <div className="mt-6 rounded-lg border border-slate-800/80 bg-slate-950/60 p-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Executive Circular Summary
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedAnnouncement.summary}
              </p>
            </div>

            <div className="mt-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Statement & Instructions
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.fullContent}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-800 pt-5">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>

              {selectedAnnouncement.category === 'Recruitment' ? (
                <button
                  onClick={() => {
                    setSelectedAnnouncement(null);
                    onOpenRecruitment();
                  }}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                >
                  Go to Recruitment Form
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedAnnouncement(null);
                    onOpenEvents();
                  }}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                >
                  Explore Events Calendar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
