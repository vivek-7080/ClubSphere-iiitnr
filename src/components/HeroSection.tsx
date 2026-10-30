import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Compass, Calendar, Award, Users, Sparkles, X, ArrowUpRight, Check } from 'lucide-react';
import { Club } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  totalClubs: number;
  totalEvents: number;
  onExploreClick: () => void;
  onMatcherClick: () => void;
  clubs: Club[];
  onSelectClub: (club: Club) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  totalClubs,
  totalEvents,
  onExploreClick,
  onMatcherClick,
  clubs,
  onSelectClub,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close auto-search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category definitions with dynamic counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {
      all: clubs.length,
      technical: 0,
      cultural: 0,
      entrepreneurship: 0,
      sports: 0,
      social: 0,
    };

    clubs.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      }
    });

    return [
      { id: 'all', label: 'All Societies', count: counts.all },
      { id: 'technical', label: 'Technical & Dev', count: counts.technical },
      { id: 'cultural', label: 'Cultural & Arts', count: counts.cultural },
      { id: 'entrepreneurship', label: 'E-Cell & Startups', count: counts.entrepreneurship },
      { id: 'sports', label: 'Athletics & Esports', count: counts.sports },
      { id: 'social', label: 'Social & Outreach', count: counts.social },
    ];
  }, [clubs]);

  // Auto-search suggestions calculation
  const autoSearchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { matchingClubs: [], matchingSkills: [], matchingEvents: [] };

    // 1. Matching clubs
    const matchingClubs = clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.acronym.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q)
    ).slice(0, 4);

    // 2. Matching skills / topics
    const skillsSet = new Set<string>();
    clubs.forEach((c) => {
      c.skillsGained.forEach((s) => {
        if (s.toLowerCase().includes(q)) {
          skillsSet.add(s);
        }
      });
    });
    const matchingSkills = Array.from(skillsSet).slice(0, 3);

    // 3. Matching events
    const eventsSet = new Set<string>();
    clubs.forEach((c) => {
      c.flagshipEvents.forEach((e) => {
        if (e.toLowerCase().includes(q)) {
          eventsSet.add(e);
        }
      });
    });
    const matchingEvents = Array.from(eventsSet).slice(0, 3);

    return { matchingClubs, matchingSkills, matchingEvents };
  }, [searchQuery, clubs]);

  const popularSearches = [
    { label: 'Competitive Programming', query: 'Competitive Programming' },
    { label: 'Autonomous Robotics', query: 'Robotics' },
    { label: 'Ethical Hacking & CTF', query: 'CTF' },
    { label: 'Cappricio Band & Vocals', query: 'Cappricio' },
    { label: 'Club De Theatre Drama', query: 'Theatre' },
    { label: 'Fine Arts & Murals', query: 'Indradhanush' },
    { label: 'Atharv Esports (Valorant/BGMI)', query: 'Esports' },
  ];

  const handleSelectSuggestion = (queryText: string, targetCategory?: string) => {
    setSearchQuery(queryText);
    if (targetCategory) {
      setSelectedCategory(targetCategory);
    } else {
      setSelectedCategory('all');
    }
    setIsFocused(false);
    // Smooth scroll to the clubs directory
    const el = document.getElementById('clubs-directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const hasSuggestions =
    autoSearchSuggestions.matchingClubs.length > 0 ||
    autoSearchSuggestions.matchingSkills.length > 0 ||
    autoSearchSuggestions.matchingEvents.length > 0;

  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-slate-950 py-10 md:py-14">
      {/* Background Graphic Grid */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.07]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
        aria-hidden="true"
      />
      
      {/* Ambient Radial Glow with slow organic pulse */}
      <div 
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl animate-ambient-glow"
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-ambient-glow"
        style={{ animationDelay: '4s' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        {/* Editorial Kicker & Campus Trust Line */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="text-amber-400 font-semibold tracking-wide uppercase text-[11px] shimmer-badge px-2 py-0.5 rounded border border-amber-400/20">
            IIIT Naya Raipur
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Dr. SPM International Institute of Information Technology</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Student Activity Center (SAC)</span>
        </div>

        {/* Hero Headline */}
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
            The Pulse of Innovation, Art & Athletics on Campus.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            A unified student hub for {totalClubs} registered societies, open hackathons, live workshops, recruitment auditions, and campus initiatives at IIIT-NR.
          </p>
        </div>

        {/* Quantitative Proof Strip */}
        <div className="mt-7 grid grid-cols-2 gap-3 border-y border-slate-800/80 py-5 sm:grid-cols-4">
          <div className="p-2 rounded-xl transition-colors hover:bg-slate-900/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span>Registered Societies</span>
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">
              {totalClubs}
            </div>
            <div className="text-[11px] text-slate-500">Across 5 distinct domains</div>
          </div>

          <div className="p-2 rounded-xl transition-colors hover:bg-slate-900/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>Upcoming Campus Events</span>
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">
              {totalEvents}
            </div>
            <div className="text-[11px] text-slate-500">Hackathons, Fests & Trials</div>
          </div>

          <div className="p-2 rounded-xl transition-colors hover:bg-slate-900/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Award className="h-3.5 w-3.5 text-cyan-400" />
              <span>Active Student Members</span>
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">
              1,250+
            </div>
            <div className="text-[11px] text-slate-500">B.Tech, M.Tech & PhD</div>
          </div>

          <div className="p-2 rounded-xl transition-colors hover:bg-slate-900/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Hackathon Prize Pool</span>
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">
              ₹5.35L+
            </div>
            <div className="text-[11px] text-slate-500">Sanctioned this academic term</div>
          </div>
        </div>

        {/* Search Bar & Auto-Search Feature */}
        <div className="mt-7" ref={containerRef}>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsFocused(true);
                }}
                placeholder="Search by club name (TSoC, Cappricio, Atharv), skill (ROS, Dance, Esports), or event..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsFocused(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Auto-Search Dropdown Popover */}
              {isFocused && (
                <div className="animate-scale-in absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-700/80 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-xl max-h-96 overflow-y-auto">
                  {searchQuery.trim().length > 0 ? (
                    <div>
                      {hasSuggestions ? (
                        <div className="space-y-4">
                          {/* Matching Clubs */}
                          {autoSearchSuggestions.matchingClubs.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 px-2">
                                Societies ({autoSearchSuggestions.matchingClubs.length})
                              </div>
                              <div className="space-y-1">
                                {autoSearchSuggestions.matchingClubs.map((club) => (
                                  <button
                                    key={club.id}
                                    onClick={() => handleSelectSuggestion(club.name, club.category)}
                                    className="btn-tactile w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-800/90 group"
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <div
                                        className="h-6 w-6 rounded flex items-center justify-center font-bold text-[10px] text-slate-950 shrink-0 group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: club.accentColor }}
                                      >
                                        {club.acronym.slice(0, 3)}
                                      </div>
                                      <div className="truncate">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate transition-colors">
                                          {club.name}
                                        </div>
                                        <div className="text-[11px] text-slate-400 truncate">
                                          {club.categoryLabel}
                                        </div>
                                      </div>
                                    </div>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Matching Skills */}
                          {autoSearchSuggestions.matchingSkills.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 px-2">
                                Skills & Focus Areas
                              </div>
                              <div className="flex flex-wrap gap-1.5 px-2">
                                {autoSearchSuggestions.matchingSkills.map((skill, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSelectSuggestion(skill)}
                                    className="btn-tactile px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
                                  >
                                    {skill}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Matching Events */}
                          {autoSearchSuggestions.matchingEvents.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5 px-2">
                                Flagship Events
                              </div>
                              <div className="space-y-1">
                                {autoSearchSuggestions.matchingEvents.map((evtName, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSelectSuggestion(evtName)}
                                    className="btn-tactile w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-slate-800/90 text-xs text-slate-300 hover:text-white transition-colors group"
                                  >
                                    <span className="group-hover:text-amber-300 transition-colors">{evtName}</span>
                                    <ArrowUpRight className="h-3 w-3 text-slate-500 group-hover:text-amber-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No direct matches found for "{searchQuery}". Try searching "Coding", "Dance", "Music", "Atharv", or "Murals".
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default state on focus: Quick Discoveries */
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                        Popular Quick Filters
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {popularSearches.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSuggestion(item.query)}
                            className="btn-tactile px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-700/80 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onExploreClick}
                className="btn-tactile flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-3 text-xs sm:text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 whitespace-nowrap shadow-sm hover:shadow-amber-500/20"
              >
                <Compass className="h-4 w-4" />
                <span>Browse All</span>
              </button>
              <button
                onClick={onMatcherClick}
                className="btn-tactile flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Quiz Matcher</span>
              </button>
            </div>
          </div>

          {/* Category Filter Tabs directly below search bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Filter by Society Category:</span>
              <span className="text-[11px] text-amber-400/90 font-medium">Click any tab below to instantly filter clubs</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      // Clear search query if user specifically clicks a domain category to see full list
                      if (searchQuery) setSearchQuery('');
                    }}
                    className={`btn-tactile rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`font-mono text-[11px] tabular-nums rounded px-1.5 py-0.2 transition-colors ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                    {isActive && <Check className="h-3 w-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
