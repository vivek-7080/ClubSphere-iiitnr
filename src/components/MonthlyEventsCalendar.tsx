import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CampusEvent } from '../types';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Trophy,
  Users,
  Bookmark,
  CheckCircle2,
  Download,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

interface MonthlyEventsCalendarProps {
  events: CampusEvent[];
  savedEventIds: string[];
  registeredEventIds: string[];
  onToggleSaveEvent: (eventId: string) => void;
  onRegisterEvent: (event: CampusEvent) => void;
}

// Category color mappings
const CATEGORY_COLORS: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  technical: {
    dot: 'bg-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
  },
  cultural: {
    dot: 'bg-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
  },
  sports: {
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  },
  entrepreneurship: {
    dot: 'bg-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
  social: {
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
  },
};

// Format Date to YYYY-MM-DD in local time
function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if a date falls within event range
function isDateInEvent(dateStr: string, event: CampusEvent): boolean {
  const start = event.startDate;
  const end = event.endDate || event.startDate;
  return dateStr >= start && dateStr <= end;
}

export const MonthlyEventsCalendar: React.FC<MonthlyEventsCalendarProps> = ({
  events,
  savedEventIds,
  registeredEventIds,
  onToggleSaveEvent,
  onRegisterEvent,
}) => {
  // Default to November 2026 (the prime fest/hackathon month at IIIT-NR)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 10, 7)); // Nov 7, 2026
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(new Date(2026, 10, 1));
  const [showAllMonthEvents, setShowAllMonthEvents] = useState<boolean>(false);

  const selectedDateStr = useMemo(() => toISODateString(selectedDate), [selectedDate]);

  // Map of date string -> events on that day
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CampusEvent[]>();
    events.forEach((evt) => {
      // Loop from start to end date
      const startParts = evt.startDate.split('-').map(Number);
      const endParts = (evt.endDate || evt.startDate).split('-').map(Number);
      const cur = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

      while (cur <= end) {
        const key = toISODateString(cur);
        const existing = map.get(key) || [];
        existing.push(evt);
        map.set(key, existing);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  // Events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return eventsByDate.get(selectedDateStr) || [];
  }, [eventsByDate, selectedDateStr]);

  // Events for the active month currently viewed
  const eventsForActiveMonth = useMemo(() => {
    const activeYear = activeMonthDate.getFullYear();
    const activeMonth = activeMonthDate.getMonth();
    return events.filter((evt) => {
      const parts = evt.startDate.split('-').map(Number);
      const evtStart = new Date(parts[0], parts[1] - 1, parts[2]);
      const endParts = (evt.endDate || evt.startDate).split('-').map(Number);
      const evtEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);

      const monthStart = new Date(activeYear, activeMonth, 1);
      const monthEnd = new Date(activeYear, activeMonth + 1, 0);

      return evtStart <= monthEnd && evtEnd >= monthStart;
    });
  }, [events, activeMonthDate]);

  // Quick jump presets
  const monthPresets = [
    { label: 'Oct 2026', date: new Date(2026, 9, 24), badge: 'CTF & Android' },
    { label: 'Nov 2026', date: new Date(2026, 10, 7), badge: 'Hackathon & Aaroh' },
    { label: 'Dec 2026', date: new Date(2026, 11, 4), badge: 'E-Summit & Arts' },
    { label: 'Jan 2027', date: new Date(2027, 0, 15), badge: 'Sports Olympiad' },
  ];

  const handleDateChange = (val: CalendarValue) => {
    if (val instanceof Date) {
      setSelectedDate(val);
      setShowAllMonthEvents(false);
    }
  };

  const generateICS = (evt: CampusEvent) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ClubSphere IIIT Naya Raipur//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      `LOCATION:${evt.venue}`,
      `DTSTART:${evt.startDate.replace(/-/g, '')}T090000Z`,
      `DTEND:${(evt.endDate || evt.startDate).replace(/-/g, '')}T180000Z`,
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
    <div className="mt-6 space-y-6">
      {/* Month Quick Jump Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Quick Jump to Season:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {monthPresets.map((preset) => {
            const isCurrentMonth =
              activeMonthDate.getFullYear() === preset.date.getFullYear() &&
              activeMonthDate.getMonth() === preset.date.getMonth();
            return (
              <button
                key={preset.label}
                onClick={() => {
                  setSelectedDate(preset.date);
                  setActiveMonthDate(preset.date);
                  setShowAllMonthEvents(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border ${
                  isCurrentMonth
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isCurrentMonth ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calendar + Day Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Calendar Component (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Interactive Monthly View</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full">
                  Click any date
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dates with dots indicate scheduled campus fests, workshops, or competitions.
              </p>
            </div>
            <button
              onClick={() => setShowAllMonthEvents(!showAllMonthEvents)}
              className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                showAllMonthEvents
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                  : 'text-slate-300 bg-slate-800/80 border-slate-700 hover:text-white'
              }`}
            >
              {showAllMonthEvents ? 'Viewing Month List' : 'View Full Month List'}
            </button>
          </div>

          {/* react-calendar custom container */}
          <div className="club-calendar-wrapper">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              activeStartDate={activeMonthDate}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) setActiveMonthDate(activeStartDate);
              }}
              minDetail="month"
              next2Label={null}
              prev2Label={null}
              tileClassName={({ date, view }) => {
                if (view !== 'month') return null;
                const dateStr = toISODateString(date);
                const hasEvents = eventsByDate.has(dateStr);
                const isSelected = dateStr === selectedDateStr;
                return [
                  hasEvents ? 'has-event-tile' : '',
                  isSelected ? 'selected-event-tile' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
              }}
              tileContent={({ date, view }) => {
                if (view !== 'month') return null;
                const dateStr = toISODateString(date);
                const dayEvents = eventsByDate.get(dateStr);

                if (!dayEvents || dayEvents.length === 0) return null;

                return (
                  <div className="mt-1 flex items-center justify-center gap-1 flex-wrap max-w-[40px] mx-auto">
                    {dayEvents.slice(0, 3).map((evt, idx) => {
                      const col = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.technical;
                      return (
                        <span
                          key={`${evt.id}-${idx}`}
                          className={`h-1.5 w-1.5 rounded-full ${col.dot} ring-1 ring-slate-950`}
                          title={`${evt.clubAcronym}: ${evt.title}`}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] font-bold text-amber-400 leading-none">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>

          {/* Color Legend */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Category Key:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Technical
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400"></span> Cultural
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Sports
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span> E-Cell
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400"></span> Social / NSS
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Date or Month Details (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">
                  {showAllMonthEvents ? 'Full Month Schedule' : 'Daily Schedule'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {showAllMonthEvents
                    ? `${eventsForActiveMonth.length} activities in ${activeMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                    : `${eventsForSelectedDate.length} activity on this date`}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {showAllMonthEvents
                  ? activeMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </h3>
            </div>

            {/* List of events */}
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {(showAllMonthEvents ? eventsForActiveMonth : eventsForSelectedDate).length > 0 ? (
                (showAllMonthEvents ? eventsForActiveMonth : eventsForSelectedDate).map((evt) => {
                  const isSaved = savedEventIds.includes(evt.id);
                  const isRegistered = registeredEventIds.includes(evt.id);
                  const col = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.technical;
                  const percentFilled = Math.min(
                    100,
                    Math.round((evt.seatsRegistered / evt.seatsTotal) * 100)
                  );

                  return (
                    <div
                      key={evt.id}
                      className="card-tactile-hover rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 hover:bg-slate-950/90"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className={`font-semibold ${col.text}`}>{evt.clubAcronym}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">{evt.category}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">{evt.mode}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                            {evt.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => onToggleSaveEvent(evt.id)}
                          className={`btn-tactile p-1 rounded-md border transition-all shrink-0 ${
                            isSaved
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 scale-105'
                              : 'border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={isSaved ? 'Saved' : 'Bookmark'}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-amber-400 shrink-0" />
                          <span className="text-slate-200 font-medium">{evt.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                          <span className="truncate">{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                        {evt.prizePool && (
                          <div className="flex items-center gap-2 text-amber-300 font-medium">
                            <Trophy className="h-3 w-3 text-amber-400 shrink-0" />
                            <span>{evt.prizePool}</span>
                          </div>
                        )}
                      </div>

                      {/* Capacity Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5 text-slate-500" />
                            <span>Seats</span>
                          </span>
                          <span className="font-mono text-slate-300">
                            {evt.seatsRegistered}/{evt.seatsTotal} ({percentFilled}%)
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${percentFilled > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5">
                        <button
                          onClick={() => generateICS(evt)}
                          className="btn-tactile p-1.5 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-md transition-colors"
                          title="Download Calendar (.ics) reminder"
                        >
                          <Download className="h-3 w-3" />
                        </button>

                        {isRegistered ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Registered</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onRegisterEvent(evt)}
                            className="btn-tactile px-3 py-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-6 text-center">
                  <CalendarIcon className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-300">
                    No club activities on this day
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    Try picking a highlighted date with indicator dots, or browse all activities for{' '}
                    {activeMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => setShowAllMonthEvents(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 rounded-lg transition-colors"
                    >
                      View All {eventsForActiveMonth.length} Events This Month
                    </button>
                    {events.length > 0 && (
                      <button
                        onClick={() => {
                          // Jump to first upcoming event
                          const parts = events[0].startDate.split('-').map(Number);
                          const firstEvtDate = new Date(parts[0], parts[1] - 1, parts[2]);
                          setSelectedDate(firstEvtDate);
                          setActiveMonthDate(firstEvtDate);
                        }}
                        className="text-xs text-slate-400 hover:text-white inline-flex items-center justify-center gap-1"
                      >
                        <span>Jump to next event: {events[0].title}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
