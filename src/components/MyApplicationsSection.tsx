import React from 'react';
import { ClubApplication, AppUser } from '../types';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Award,
  Video,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MyApplicationsSectionProps {
  applications: ClubApplication[];
  currentUser?: AppUser | null;
  allSystemApplicationsCount?: number;
  onWithdrawApplication: (appId: string) => void;
  onApplyNew: () => void;
  onGoToAdminPortal?: () => void;
}

export const MyApplicationsSection: React.FC<MyApplicationsSectionProps> = ({
  applications,
  currentUser,
  allSystemApplicationsCount = 0,
  onWithdrawApplication,
  onApplyNew,
  onGoToAdminPortal,
}) => {
  const isSuperAdmin = currentUser?.isAdmin || currentUser?.role === 'super_admin';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" />
            <span>Student Application Registry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            My Club Applications & Status
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {currentUser ? (
              <span>
                Tracking personal submissions for <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}).
              </span>
            ) : (
              <span>Track your personal recruitment dockets and interview schedules.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSuperAdmin && onGoToAdminPortal && (
            <button
              onClick={onGoToAdminPortal}
              className="px-3.5 py-2 text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Review Applicant Roster ({allSystemApplicationsCount})</span>
            </button>
          )}

          <button
            onClick={onApplyNew}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            Submit Application
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="mt-8 space-y-6">
          {/* If Super Admin, show explicit clarification about candidate applications vs personal applications */}
          {isSuperAdmin ? (
            <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Super Administrator Notice
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {currentUser?.email}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    No Personal Applications Submitted by Vivek Kumar
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    This "My Applications" tab only shows applications submitted by your own account.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <UserCheck className="h-4 w-4" />
                    <span>Candidate Applications (e.g., Rahul Kumar)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Student applications submitted to clubs (including candidate submissions like Rahul Kumar) are located in the <strong>Club Admin Portal</strong> under the <strong>"Applications & Inductions"</strong> tab.
                  </p>
                  {allSystemApplicationsCount > 0 && (
                    <div className="mt-2 text-[11px] font-semibold text-emerald-400">
                      There {allSystemApplicationsCount === 1 ? 'is' : 'are'} currently {allSystemApplicationsCount} student candidate {allSystemApplicationsCount === 1 ? 'application' : 'applications'} awaiting administrative review.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Administrative Actions</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      As Super Admin, you can review statements of purpose, schedule auditions, and induct candidates directly into any student club.
                    </p>
                  </div>

                  {onGoToAdminPortal && (
                    <button
                      onClick={onGoToAdminPortal}
                      className="mt-3 w-full py-2.5 px-3 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Open Club Admin Portal to Review Candidates</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
              <Clock className="mx-auto h-10 w-10 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">No active club applications found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                You haven't submitted any recruitment forms yet. Browse our student societies and submit your induction application.
              </p>
              <button
                onClick={onApplyNew}
                className="mt-5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                Apply to a Club
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition-all hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-amber-400 font-bold tabular-nums">{app.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>Submitted on {app.submittedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{app.year}</span>
                  </div>

                  <h4 className="text-lg font-bold text-white">
                    {app.clubName}
                  </h4>

                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-medium">Domain: </span>
                    <span className="font-semibold text-slate-200">{app.subDomain}</span>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 text-xs text-slate-300 max-w-3xl">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                      Statement of Interest:
                    </div>
                    <p className="line-clamp-2">{app.statementOfPurpose}</p>
                  </div>

                  {app.experienceOrAchievements && (
                    <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 text-xs text-slate-300 max-w-3xl">
                      <div className="text-[10px] text-amber-400/90 uppercase font-semibold mb-1 flex items-center gap-1.5">
                        <Award className="h-3 w-3" />
                        <span>Previous Experience & Achievements:</span>
                      </div>
                      <p className="line-clamp-2 text-slate-300">{app.experienceOrAchievements}</p>
                    </div>
                  )}

                  {app.videoUrl && (
                    <div className="flex items-center gap-2 text-xs pt-0.5">
                      <span className="text-slate-500 font-medium">Video Attached:</span>
                      <a
                        href={app.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline font-mono text-[11px]"
                      >
                        <Video className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="truncate max-w-xs">{app.videoUrl}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Under Review</span>
                  </div>

                  <button
                    onClick={() => onWithdrawApplication(app.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Withdraw this application"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
