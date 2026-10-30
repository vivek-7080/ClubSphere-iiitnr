import React, { useState } from 'react';
import { CampusEvent } from '../types';
import {
  Calendar,
  LayoutGrid,
  MapPin,
  Clock,
  Trophy,
  Users,
  Bookmark,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { MonthlyEventsCalendar } from './MonthlyEventsCalendar';

interface EventsSectionProps {
  events: CampusEvent[];
  savedEventIds: string[];
  registeredEventIds: string[];
  onToggleSaveEvent: (eventId: string) => void;
  onRegisterEvent: (event: CampusEvent) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  savedEventIds,
  registeredEventIds,
  onToggleSaveEvent,
  onRegisterEvent,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'cards'>('calendar');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = filterCategory === 'all' || evt.category === filterCategory;
    const matchesMode = filterMode === 'all' || evt.mode.toLowerCase() === filterMode.toLowerCase();
    return matchesCategory && matchesMode;
  });

  const generateICS = (evt: CampusEvent) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ClubSphere IIIT Naya Raipur//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      `LOCATION:${evt.venue}`,
      `DTSTART:20261107T123000Z`,
      `DTEND:20261109T023000Z`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Campus Calendar & Competitions
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Flagship Events & Workshops
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Live registration desks for national hackathons, cultural fests, sports olympiads, and guest speaker series at IIIT-NR.
          </p>
        </div>

        {/* Filter Controls (Segmented functional buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {['all', 'technical', 'cultural', 'sports', 'entrepreneurship'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Types' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {['all', 'in-person', 'hybrid', 'online'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                  filterMode === mode
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'all' ? 'All Modes' : mode}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'calendar'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Monthly Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditional View: Monthly Calendar vs Cards Grid */}
      {viewMode === 'calendar' ? (
        <MonthlyEventsCalendar
          events={filteredEvents}
          savedEventIds={savedEventIds}
          registeredEventIds={registeredEventIds}
          onToggleSaveEvent={onToggleSaveEvent}
          onRegisterEvent={onRegisterEvent}
        />
      ) : (
        <>
          {/* Events Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => {
              const isSaved = savedEventIds.includes(evt.id);
              const isRegistered = registeredEventIds.includes(evt.id);
              const percentFilled = Math.min(100, Math.round((evt.seatsRegistered / evt.seatsTotal) * 100));

              return (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90"
                >
                  <div>
                    {/* Meta header: Clean unboxed metadata with dot separators */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-amber-400">{evt.clubAcronym}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>{evt.clubName}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>{evt.mode}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
                          {evt.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => onToggleSaveEvent(evt.id)}
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                          isSaved
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save event'}
                      >
                        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Event Schedule Info */}
                    <div className="mt-4 space-y-2 border-y border-slate-800/80 py-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-200 font-medium">{evt.date}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span>{evt.time}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>

                      {evt.prizePool && (
                        <div className="flex items-center gap-2.5 text-amber-300 font-medium">
                          <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>Prize Pool: {evt.prizePool}</span>
                        </div>
                      )}
                    </div>

                    {/* Seats Capacity Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span>Capacity</span>
                        </span>
                        <span className="font-mono tabular-nums text-slate-300">
                          {evt.seatsRegistered} / {evt.seatsTotal} ({percentFilled}% full)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            percentFilled > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-3.5 text-[11px] text-slate-400">
                      <span className="text-slate-500">Focus: </span>
                      <span>{evt.tags.join(' · ')}</span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500">Deadline: </span>
                      <span className="font-medium text-slate-300">{evt.registrationDeadline}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => generateICS(evt)}
                        className="p-2 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-lg transition-colors"
                        title="Download Calendar (.ics) reminder"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>

                      {isRegistered ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Registered</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onRegisterEvent(evt)}
                          className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
              <p className="text-sm">No campus events match the selected filters.</p>
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setFilterMode('all');
                }}
                className="mt-3 text-xs text-amber-400 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
