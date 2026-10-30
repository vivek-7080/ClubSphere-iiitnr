import React from 'react';
import { Bookmark, Sparkles, UserCheck, ShieldCheck, LogOut, User, LogIn, Users } from 'lucide-react';
import { AdminSession, AppUser } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bookmarksCount: number;
  openBookmarks: () => void;
  openApplicationModal: () => void;
  applicationsCount: number;
  totalApplicantsCount?: number;
  adminSession?: AdminSession | null;
  onAdminLogout?: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onLogoutUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bookmarksCount,
  openBookmarks,
  openApplicationModal,
  applicationsCount,
  totalApplicantsCount = 0,
  adminSession,
  onAdminLogout,
  currentUser,
  onOpenAuth,
  onLogoutUser,
}) => {
  const isStudentUser = Boolean(currentUser && !currentUser.isAdmin && !adminSession);
  const showAdminOption = !isStudentUser;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('explore')}
          className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-lg shadow-sm group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300 ease-out">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 group-hover:text-amber-400 transition-colors">
              ClubSphere
            </span>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              IIIT Naya Raipur
            </span>
          </div>
        </button>

        {/* Zone 2: Nav Links (Clean single-line text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'explore'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            Clubs Directory
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'events'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            Events & Fests
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'announcements'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            Notice Board
          </button>
          <button
            onClick={() => setActiveTab('matcher')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'matcher'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Club Matcher
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'venues'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'hover:text-white'
            }`}
          >
            Campus Venues
          </button>
          {showAdminOption && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Club Admin</span>
              {adminSession && (
                <span className="flex h-2 w-2 relative" title={`Logged in: ${adminSession.adminName}`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>
          )}
          {(currentUser?.isAdmin || adminSession) && (
            <button
              onClick={() => setActiveTab('applicants')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'applicants'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span>Applicants</span>
              {totalApplicantsCount > 0 && (
                <span className="font-mono tabular-nums text-[11px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                  {totalApplicantsCount}
                </span>
              )}
            </button>
          )}
          {applicationsCount > 0 && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1 ${
                activeTab === 'applications'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>My Applications</span>
              <span className="font-mono tabular-nums text-xs bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded">
                {applicationsCount}
              </span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Account / Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
                title={`Account: ${currentUser.email}`}
              >
                <div 
                  className="flex h-5 w-5 items-center justify-center rounded font-bold text-[10px] text-slate-950"
                  style={{ backgroundColor: currentUser.avatarColor || (currentUser.isAdmin ? '#f59e0b' : '#38bdf8') }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-white max-w-[90px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.isAdmin && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-950 bg-amber-400 px-1 py-0.2 rounded">
                    Admin
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={onLogoutUser}
                className="text-slate-500 hover:text-red-400 transition-colors ml-0.5"
                title="Sign out of account"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-tactile flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sign In / Register</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          <button
            onClick={openBookmarks}
            className="btn-tactile flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors whitespace-nowrap"
            title="View saved clubs and events"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Saved</span>
            <span className="font-mono tabular-nums text-xs text-amber-400 font-semibold">
              {bookmarksCount}
            </span>
          </button>

          <button
            onClick={openApplicationModal}
            className="btn-tactile px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm hover:shadow-amber-500/20 whitespace-nowrap shrink-0"
          >
            Join a Club
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-900 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-400 gap-4 no-scrollbar">
        <button
          onClick={() => setActiveTab('explore')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'explore' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Clubs
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'events' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'announcements' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Notices
        </button>
        <button
          onClick={() => setActiveTab('matcher')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'matcher' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Club Matcher
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'venues' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Venues
        </button>
        {showAdminOption && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'admin' ? 'text-amber-400 font-semibold' : ''}`}
          >
            <ShieldCheck className="h-3 w-3 text-amber-400" />
            <span>Admin</span>
            {currentUser?.isAdmin && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
            )}
          </button>
        )}
        {(currentUser?.isAdmin || adminSession) && (
          <button
            onClick={() => setActiveTab('applicants')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeTab === 'applicants' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Users className="h-3 w-3 text-amber-400" />
            <span>Applicants</span>
            {totalApplicantsCount > 0 && (
              <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full font-bold">
                {totalApplicantsCount}
              </span>
            )}
          </button>
        )}
        {applicationsCount > 0 && (
          <button
            onClick={() => setActiveTab('applications')}
            className={`whitespace-nowrap shrink-0 ${activeTab === 'applications' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Applications ({applicationsCount})
          </button>
        )}
      </div>
    </header>
  );
};
