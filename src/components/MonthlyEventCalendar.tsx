import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CampusEvent } from '../types';
import { Calendar as CalendarIcon, MapPin, Clock, Trophy, Users, Bookmark, ChevronRight, CheckCircle2, Download, Sparkles } from 'lucide-react';

interface MonthlyEventCalendarProps {
  events: CampusEvent[];
  savedEventIds: string[];
  registeredEventIds: string[];
  onToggleSaveEvent: (eventId: string) => void;
  onRegisterEvent: (event: CampusEvent) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export const MonthlyEventCalendar: React.FC<MonthlyEventCalendarProps> = ({
  events,
  savedEventIds,
  registeredEventIds,
  onToggleSaveEvent,
  onRegisterEvent,
}) => {
  // Default to November 2026 which has flagship events Hack-O-Fiesta, RoboSprint, Aaroh, LAN Cup
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 10, 7)); // November 7, 2026
  const [activeMonth, setActiveMonth] = useState<Date>(new Date(2026, 10, 1));

  // Pre-calculate date map for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CampusEvent[]>();

    events.forEach((evt) => {
      // Parse start and end date
      const start = new Date(evt.startDate + 'T00:00:00');
      const end = evt.endDate ? new Date(evt.endDate + 'T00:00:00') : start;

      const current = new Date(start);
      while (current <= end) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        const existing = map.get(key) || [];
        existing.push(evt);
        map.set(key, existing);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [events]);

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDayEvents = eventsByDate.get(selectedDateKey) || [];

  // Tile content to render event indicator dots
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const key = formatDateKey(date);
    const dayEvents = eventsByDate.get(key);

    if (!dayEvents || dayEvents.length === 0) return null;

    return (
      <div className="flex items-center justify-center gap-1 mt-1">
        {dayEvents.slice(0, 3).map((evt, idx) => {
          let dotColor = 'bg-amber-400';
          if (evt.category === 'cultural') dotColor = 'bg-pink-400';
          if (evt.category === 'sports') dotColor = 'bg-emerald-400';
          if (evt.category === 'social') dotColor = 'bg-cyan-400';
          if (evt.category === 'entrepreneurship') dotColor = 'bg-orange-400';

          return (
            <span
              key={idx}
              className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
              title={`${evt.clubAcronym}: ${evt.title}`}
            />
          );
        })}
        {dayEvents.length > 3 && (
          <span className="text-[9px] text-slate-400 font-bold leading-none">+</span>
        )}
      </div>
    );
  };

  // Tile class names for active days
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const key = formatDateKey(date);
    const hasEvents = eventsByDate.has(key);
    return hasEvents ? 'has-events font-semibold' : '';
  };

  const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const jumpToMonth = (year: number, monthIndex: number) => {
    const newDate = new Date(year, monthIndex, 1);
    setActiveMonth(newDate);
    setSelectedDate(newDate);
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
    <div className="mt-8 space-y-6">
      {/* Month Fast-Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CalendarIcon className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Jump to Academic Term:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: 'October 2026', y: 2026, m: 9 },
            { label: 'November 2026 (Fest Month)', y: 2026, m: 10 },
            { label: 'December 2026', y: 2026, m: 11 },
            { label: 'January 2027 (Khel Utsav)', y: 2027, m: 0 },
          ].map((item, idx) => {
            const isCurrent =
              activeMonth.getFullYear() === item.y && activeMonth.getMonth() === item.m;
            return (
              <button
                key={idx}
                onClick={() => jumpToMonth(item.y, item.m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Date's Activities on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Box */}
        <div className="lg:col-span-6 xl:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Monthly Activity Calendar</h3>
            </div>
            <div className="text-[11px] text-slate-400">
              Click any date to see lineup
            </div>
          </div>

          <div className="clubsphere-calendar-wrapper">
            <Calendar
              value={selectedDate}
              onChange={(value: Value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                } else if (Array.isArray(value) && value[0]) {
                  setSelectedDate(value[0]);
                }
              }}
              activeStartDate={activeMonth}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) setActiveMonth(activeStartDate);
              }}
              tileContent={tileContent}
              tileClassName={tileClassName}
              prev2Label={null}
              next2Label={null}
              minDetail="month"
            />
          </div>

          {/* Color Legend */}
          <div className="mt-5 border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Technical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              <span>Cultural & Arts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Athletics & Esports</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              <span>E-Cell</span>
            </div>
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-xl min-h-[480px]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Agenda for Selected Date
                </span>
                <h4 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {formattedSelectedDate}
                </h4>
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event scheduled' : 'events scheduled'}
              </div>
            </div>

            {/* Events on Selected Date */}
            <div className="mt-5 space-y-4">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((evt) => {
                  const isSaved = savedEventIds.includes(evt.id);
                  const isRegistered = registeredEventIds.includes(evt.id);

                  return (
                    <div
                      key={evt.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 transition-all hover:border-slate-700 hover:bg-slate-950"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-bold text-amber-400">{evt.clubAcronym}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span>{evt.clubName}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span>{evt.mode}</span>
                          </div>
                          <h5 className="text-base font-bold text-white mt-1">
                            {evt.title}
                          </h5>
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

                      <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {evt.description}
                      </p>

                      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-900 pt-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="text-slate-300 truncate">{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 truncate">{evt.venue}</span>
                        </div>
                      </div>

                      {evt.prizePool && (
                        <div className="mt-2 text-xs text-amber-300 font-medium flex items-center gap-1.5">
                          <Trophy className="h-3.5 w-3.5 text-amber-400" />
                          <span>Prize Pool: {evt.prizePool}</span>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                        <div className="text-[11px] text-slate-500">
                          Capacity: <span className="font-mono text-slate-300 tabular-nums">{evt.seatsRegistered}/{evt.seatsTotal}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => generateICS(evt)}
                            className="p-1.5 text-slate-400 hover:text-white border border-slate-800 bg-slate-900 rounded-lg transition-colors"
                            title="Download calendar (.ics)"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          {isRegistered ? (
                            <div className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Registered</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => onRegisterEvent(evt)}
                              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                            >
                              Register Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-slate-400">
                  <CalendarIcon className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    No club activities scheduled for this date.
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Select any highlighted date on the calendar (e.g. October 24, November 7, November 14, November 21, December 4) to inspect scheduled events.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDate(new Date(2026, 10, 7));
                      setActiveMonth(new Date(2026, 10, 1));
                    }}
                    className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                  >
                    <span>View Hack-O-Fiesta v6.0 (Nov 7)</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Notice on Bottom */}
          <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Official SAC event schedule synced</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Real-Time Desk Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
