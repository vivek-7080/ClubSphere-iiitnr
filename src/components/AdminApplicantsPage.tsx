import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Video,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  UserCheck,
  UserPlus,
  Trash2,
  ArrowRight,
  Download,
  Mail,
  Phone,
  GraduationCap,
  ChevronDown,
  X,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Club, ClubApplication, AppUser, AdminSession, SUPER_ADMIN_EMAIL } from '../types';

interface AdminApplicantsPageProps {
  clubs: Club[];
  applications: ClubApplication[];
  currentUser: AppUser | null;
  adminSession: AdminSession | null;
  isSuperAdmin: boolean;
  onInductApplication: (app: ClubApplication, role: string) => void;
  onUpdateApplicationStatus: (appId: string, status: ClubApplication['status'], slotTime?: string) => void;
  onDeleteApplication: (appId: string) => void;
  onSwitchToClubAdmin: (clubId: string) => void;
  onSeedDemoApplicants?: () => void;
  onOpenAuthModal: () => void;
}

export const AdminApplicantsPage: React.FC<AdminApplicantsPageProps> = ({
  clubs,
  applications,
  currentUser,
  adminSession,
  isSuperAdmin,
  onInductApplication,
  onUpdateApplicationStatus,
  onDeleteApplication,
  onSwitchToClubAdmin,
  onSeedDemoApplicants,
  onOpenAuthModal,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Modals state
  const [inductingApp, setInductingApp] = useState<ClubApplication | null>(null);
  const [inductRole, setInductRole] = useState<string>('Core Member');
  const [customRole, setCustomRole] = useState<string>('');

  const [schedulingApp, setSchedulingApp] = useState<ClubApplication | null>(null);
  const [slotDate, setSlotDate] = useState<string>('2026-11-02');
  const [slotTime, setSlotTime] = useState<string>('17:30');
  const [slotVenue, setSlotVenue] = useState<string>('SAC Room 204 / Google Meet');

  const [deletingApp, setDeletingApp] = useState<ClubApplication | null>(null);

  // Check overall admin permission
  const hasAdminAccess = isSuperAdmin || !!adminSession;

  // Filtered applications based on active permissions and user filters
  const visibleApplications = useMemo(() => {
    return applications.filter((app) => {
      // If user is a club head (not super admin), restrict to their assigned club
      if (!isSuperAdmin && adminSession) {
        if (app.clubId !== adminSession.clubId) return false;
      }

      // Club filter
      if (selectedClubFilter !== 'all' && app.clubId !== selectedClubFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) {
        return false;
      }

      // Batch filter
      if (selectedBatchFilter !== 'all') {
        if (!app.year.toLowerCase().includes(selectedBatchFilter.toLowerCase())) {
          return false;
        }
      }

      // Branch filter
      if (selectedBranchFilter !== 'all' && app.branch !== selectedBranchFilter) {
        return false;
      }

      // Search query (name, roll, email, subdomain, SOP)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = app.applicantName.toLowerCase().includes(q);
        const matchesRoll = app.rollNumber.toLowerCase().includes(q);
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesSubDomain = app.subDomain.toLowerCase().includes(q);
        const matchesClub = app.clubName.toLowerCase().includes(q);
        const matchesSOP = app.statementOfPurpose.toLowerCase().includes(q);
        return matchesName || matchesRoll || matchesEmail || matchesSubDomain || matchesClub || matchesSOP;
      }

      return true;
    });
  }, [
    applications,
    isSuperAdmin,
    adminSession,
    selectedClubFilter,
    selectedStatusFilter,
    selectedBatchFilter,
    selectedBranchFilter,
    searchQuery,
  ]);

  // Overall metrics
  const totalCount = applications.length;
  const receivedCount = applications.filter((a) => a.status === 'Received').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview Scheduled' || a.status === 'Audition Slot').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;

  // CSV Export
  const handleExportCSV = () => {
    if (visibleApplications.length === 0) return;

    const headers = ['Applicant Name', 'Email', 'Roll Number', 'Branch', 'Batch', 'Club Applied', 'Sub-Domain', 'Status', 'Submitted Date', 'Video Link'];
    const rows = visibleApplications.map((app) => [
      `"${app.applicantName}"`,
      `"${app.email}"`,
      `"${app.rollNumber}"`,
      `"${app.branch}"`,
      `"${app.year}"`,
      `"${app.clubName}"`,
      `"${app.subDomain}"`,
      `"${app.status}"`,
      `"${app.submittedAt}"`,
      `"${app.videoUrl || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IIITNR_Club_Applicants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Induct Action
  const handleConfirmInduct = () => {
    if (!inductingApp) return;
    const finalRole = inductRole === 'Other' && customRole.trim() ? customRole.trim() : inductRole;
    onInductApplication(inductingApp, finalRole);
    setInductingApp(null);
    setCustomRole('');
  };

  // Handle Schedule Interview
  const handleConfirmSchedule = () => {
    if (!schedulingApp) return;
    const slotString = `${slotDate} at ${slotTime} (${slotVenue})`;
    onUpdateApplicationStatus(schedulingApp.id, 'Interview Scheduled', slotString);
    setSchedulingApp(null);
  };

  // If unauthenticated or student lacking admin authorization
  if (!hasAdminAccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in">
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/95 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <Lock className="h-8 w-8" />
          </div>
          <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded border border-amber-400/20">
            Administrator Access Required
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-3">
            Campus Applicant Roster Portal
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Reviewing student recruitment dossiers, interviewing candidates, and inducting members is reserved for authorized Club Administrators and Super Admin:
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-amber-400 font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>{SUPER_ADMIN_EMAIL}</span>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Log In with Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Student Recruitment Registry</span>
            </span>
            <span className="text-slate-600">•</span>
            {isSuperAdmin ? (
              <span className="bg-amber-400/15 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                Super Admin Access ({currentUser?.email || SUPER_ADMIN_EMAIL})
              </span>
            ) : (
              <span className="bg-emerald-400/15 text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                {adminSession?.adminName} • {adminSession?.clubId?.toUpperCase()} Administration
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Applicant Roster & Induction Review
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Evaluate candidate dossiers across IIIT Naya Raipur societies, inspect statements of purpose, preview audition videos, and induct new members.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onSeedDemoApplicants && (
            <button
              type="button"
              onClick={onSeedDemoApplicants}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              title="Add sample candidate applications (Rahul Kumar, Priya Patel, etc.)"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
              <span>Seed Demo Applicants</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={visibleApplications.length === 0}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Export CSV ({visibleApplications.length})</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs font-semibold text-slate-400">Total Applicants</div>
          <div className="mt-1 text-2xl font-extrabold text-white font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all societies</div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-xs font-semibold text-amber-400">Under Review</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-300 font-mono">{receivedCount}</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">Pending evaluation</div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="text-xs font-semibold text-blue-400">Interviews Scheduled</div>
          <div className="mt-1 text-2xl font-extrabold text-blue-300 font-mono">{interviewCount}</div>
          <div className="text-[11px] text-blue-400/80 mt-0.5">Audition slots assigned</div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-xs font-semibold text-emerald-400">Inducted & Shortlisted</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-300 font-mono">{shortlistedCount}</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Added to club roster</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, roll number, email, or domain..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Club Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedClubFilter}
              onChange={(e) => setSelectedClubFilter(e.target.value)}
              disabled={!isSuperAdmin && !!adminSession}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors cursor-pointer disabled:opacity-60"
            >
              <option value="all">All Societies (Global)</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.acronym})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Received">Received / Under Review</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Shortlisted">Inducted / Shortlisted</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="DSAI">DSAI</option>
              <option value="ECE">ECE</option>
            </select>
          </div>
        </div>

        {/* Filter Quick-Pills & Batch Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
            <span className="font-semibold text-slate-500 mr-1">Batch:</span>
            {['all', '2026', '2025', '2024'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBatchFilter(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedBatchFilter === b
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {b === 'all' ? 'All Batches' : b === '2026' ? '1st Year (2026)' : `${b} Batch`}
              </button>
            ))}
          </div>

          <div className="text-slate-400 text-xs">
            Showing <strong className="text-amber-400 font-mono">{visibleApplications.length}</strong> of{' '}
            <span className="font-mono">{applications.length}</span> candidates
          </div>
        </div>
      </div>

      {/* Applications Roster Feed */}
      <div className="mt-8">
        {visibleApplications.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            <Clock className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white">No candidate applications matched your filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery || selectedClubFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'Try clearing some search terms or resetting filters to see all candidates.'
                : 'No student recruitment forms have been submitted yet.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(searchQuery || selectedClubFilter !== 'all' || selectedStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClubFilter('all');
                    setSelectedStatusFilter('all');
                    setSelectedBatchFilter('all');
                    setSelectedBranchFilter('all');
                  }}
                  className="px-4 py-2 text-xs font-bold text-amber-400 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
                >
                  Reset All Filters
                </button>
              )}

              {onSeedDemoApplicants && applications.length === 0 && (
                <button
                  onClick={onSeedDemoApplicants}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                >
                  Seed Demo Candidate Applications
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 transition-all hover:border-slate-700 hover:bg-slate-900 shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Dossier Details */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-amber-400 font-bold tabular-nums">
                        {app.id}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                        {app.clubName}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">Submitted {app.submittedAt}</span>
                    </div>

                    {/* Applicant Profile */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                        {app.applicantName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white tracking-tight">
                            {app.applicantName}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {app.rollNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="text-slate-300 font-medium">{app.branch}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">{app.year}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-semibold">Role/Domain: <span className="text-white">{app.subDomain}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                      <a
                        href={`mailto:${app.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-mono">{app.email}</span>
                      </a>
                      {app.phone && (
                        <a
                          href={`tel:${app.phone}`}
                          className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-mono">{app.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Statement of Purpose */}
                    <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-850 text-xs text-slate-300">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1 tracking-wider">
                        Statement of Purpose & Motivation:
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{app.statementOfPurpose}</p>
                    </div>

                    {/* Experience & Achievements */}
                    {app.experienceOrAchievements && (
                      <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-850 text-xs text-slate-300">
                        <div className="text-[10px] text-amber-400/90 uppercase font-semibold mb-1 flex items-center gap-1.5 tracking-wider">
                          <Award className="h-3.5 w-3.5 text-amber-400" />
                          <span>Previous Experience & Achievements:</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{app.experienceOrAchievements}</p>
                      </div>
                    )}

                    {/* Demo / Audition Video */}
                    {app.videoUrl && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="text-slate-400 font-medium">Audition / Work Video:</span>
                        <a
                          href={app.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 text-xs font-semibold transition-colors"
                        >
                          <Video className="h-3.5 w-3.5 text-amber-400" />
                          <span>Watch Video Portfolio</span>
                          <ExternalLink className="h-3 w-3 ml-0.5" />
                        </a>
                      </div>
                    )}

                    {/* Scheduled Slot if exists */}
                    {app.slotTime && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
                        <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
                        <span><strong>Interview Scheduled:</strong> {app.slotTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status & Administrative Actions */}
                  <div className="shrink-0 flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0 min-w-[200px]">
                    {/* Status Pill */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : app.status === 'Interview Scheduled' || app.status === 'Audition Slot'
                            ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setInductingApp(app)}
                        className="w-full px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Induct to Club</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSchedulingApp(app)}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        <span>Schedule Slot</span>
                      </button>

                      {/* Status Toggle Quick Button */}
                      {app.status === 'Received' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateApplicationStatus(app.id, 'Interview Scheduled')}
                          className="w-full px-3 py-1.5 text-[11px] text-slate-400 hover:text-blue-300 transition-colors text-center"
                        >
                          Mark as Interviewed
                        </button>
                      ) : app.status === 'Interview Scheduled' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateApplicationStatus(app.id, 'Shortlisted')}
                          className="w-full px-3 py-1.5 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors text-center"
                        >
                          Mark as Shortlisted
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setDeletingApp(app)}
                        className="w-full flex items-center justify-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors pt-1"
                        title="Remove or reject application"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Archive Application</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: INDUCT APPLICANT */}
      {inductingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Induct into {inductingApp.clubName}
                </h3>
              </div>
              <button
                onClick={() => setInductingApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>Candidate: <strong className="text-white">{inductingApp.applicantName}</strong></div>
              <div>Roll Number: <span className="font-mono text-amber-400">{inductingApp.rollNumber}</span></div>
              <div>Branch & Batch: <span className="text-slate-200">{inductingApp.branch} ({inductingApp.year})</span></div>
              <div>Applied Domain: <span className="text-slate-200">{inductingApp.subDomain}</span></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Society Role
                </label>
                <select
                  value={inductRole}
                  onChange={(e) => setInductRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                >
                  <option value="Core Member">Core Member</option>
                  <option value="Technical Associate">Technical Associate</option>
                  <option value="Sub-Domain Lead">Sub-Domain Lead</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                  <option value="Creative & Media Head">Creative & Media Head</option>
                  <option value="Executive Officer">Executive Officer</option>
                  <option value="Other">Custom Role...</option>
                </select>
              </div>

              {inductRole === 'Other' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Role Title
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g., Lead AI Researcher"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInductingApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInduct}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md"
              >
                Confirm Induction & Add to Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE INTERVIEW SLOT */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Schedule Interview / Audition Slot
                </h3>
              </div>
              <button
                onClick={() => setSchedulingApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>Candidate: <strong className="text-white">{schedulingApp.applicantName}</strong></div>
              <div>Society: <span className="text-amber-400 font-semibold">{schedulingApp.clubName}</span></div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Venue / Meeting Link
                </label>
                <input
                  type="text"
                  value={slotVenue}
                  onChange={(e) => setSlotVenue(e.target.value)}
                  placeholder="e.g., SAC Room 204 or Google Meet link"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSchedulingApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md"
              >
                Confirm Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE / ARCHIVE CONFIRMATION */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Archive Application?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove the application from <strong className="text-white">{deletingApp.applicantName}</strong> for <strong className="text-white">{deletingApp.clubName}</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteApplication(deletingApp.id);
                  setDeletingApp(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
