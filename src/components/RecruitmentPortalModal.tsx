import React, { useState, useEffect } from 'react';
import { Club, ClubApplication, AppUser } from '../types';
import {
  X,
  CheckCircle2,
  Send,
  School,
  User,
  Mail,
  Phone,
  FileText,
  Sparkles,
  Award,
  Video,
  ExternalLink,
} from 'lucide-react';
import { CelebrationEffect } from './CelebrationEffect';

interface RecruitmentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubs: Club[];
  preSelectedClubId?: string;
  onApplicationSubmit: (application: ClubApplication) => void;
  onViewApplications?: () => void;
  currentUser?: AppUser | null;
}

export const RecruitmentPortalModal: React.FC<RecruitmentPortalModalProps> = ({
  isOpen,
  onClose,
  clubs,
  preSelectedClubId,
  onApplicationSubmit,
  onViewApplications,
  currentUser,
}) => {
  const [selectedClubId, setSelectedClubId] = useState<string>(preSelectedClubId || clubs[0]?.id || '');
  const [formData, setFormData] = useState({
    applicantName: '',
    rollNumber: '',
    email: '',
    phone: '',
    branch: 'CSE',
    year: '1st Year (Batch of 2026)',
    subDomain: '',
    statementOfPurpose: '',
    experienceOrAchievements: '',
    videoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedApp, setSubmittedApp] = useState<ClubApplication | null>(null);

  useEffect(() => {
    if (preSelectedClubId) {
      setSelectedClubId(preSelectedClubId);
    }
  }, [preSelectedClubId]);

  // Auto-populate when user is signed in
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData((prev) => ({
        ...prev,
        applicantName: currentUser.name || prev.applicantName,
        email: currentUser.email || prev.email,
        rollNumber: currentUser.rollNumber || prev.rollNumber,
        branch: currentUser.branch || prev.branch,
        year: currentUser.batch
          ? currentUser.batch === '2026'
            ? '1st Year (Batch of 2026)'
            : `${currentUser.batch} Batch`
          : prev.year,
      }));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const currentClub = clubs.find((c) => c.id === selectedClubId) || clubs[0];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.applicantName.trim()) errs.applicantName = 'Full name is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Student Roll number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid institute email is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errs.phone = '10-digit phone number is required';
    }
    if (!formData.subDomain.trim()) errs.subDomain = 'Specific area or role is required';
    if (!formData.statementOfPurpose.trim() || formData.statementOfPurpose.length < 20) {
      errs.statementOfPurpose = 'Please provide at least 20 characters explaining your interest';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const appId = `APP-2026-${currentClub.acronym.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: ClubApplication = {
      id: appId,
      applicantName: formData.applicantName.trim(),
      rollNumber: formData.rollNumber.trim().toUpperCase(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      branch: formData.branch,
      year: formData.year,
      clubId: currentClub.id,
      clubName: currentClub.name,
      subDomain: formData.subDomain.trim(),
      statementOfPurpose: formData.statementOfPurpose.trim(),
      experienceOrAchievements: formData.experienceOrAchievements.trim() || undefined,
      videoUrl: formData.videoUrl.trim() || undefined,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Received',
    };

    setSubmittedApp(newApp);
    onApplicationSubmit(newApp);
  };

  const handleResetAndClose = () => {
    setSubmittedApp(null);
    setFormData({
      applicantName: '',
      rollNumber: '',
      email: '',
      phone: '',
      branch: 'CSE',
      year: '1st Year (Batch of 2026)',
      subDomain: '',
      statementOfPurpose: '',
      experienceOrAchievements: '',
      videoUrl: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={handleResetAndClose}
    >
      <div 
        className="animate-scale-in relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 md:p-8 text-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleResetAndClose}
          className="btn-tactile absolute right-4 top-4 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!submittedApp ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Send className="h-3.5 w-3.5" />
              <span>SAC Centralized Club Induction 2026-27</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Apply to Join a Campus Society
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Applications are reviewed directly by the Faculty Advisor and Core Leadership Team of the selected club.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Club Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Society / Club *
                </label>
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/90 py-2.5 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.acronym}) — {c.categoryLabel}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Recruitment: <strong className="text-emerald-400">{currentClub.recruitmentStatus}</strong></span>
                  <span>Target: {currentClub.recruitmentTarget}</span>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      placeholder="e.g. Samarth Agrawal"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {errors.applicantName && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.applicantName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Institute Roll Number *
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 26101002"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 uppercase focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {errors.rollNumber && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.rollNumber}</p>
                  )}
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Institute Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@iiitnr.edu.in"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile / WhatsApp Contact *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Academic Branch & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Academic Branch
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="DSAI">Data Science & AI (DSAI)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="Postgraduate">M.Tech / PhD Scholar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="1st Year (Batch of 2026)">1st Year (Batch of 2026)</option>
                    <option value="2nd Year (Batch of 2025)">2nd Year (Batch of 2025)</option>
                    <option value="3rd Year (Batch of 2024)">3rd Year (Batch of 2024)</option>
                    <option value="4th Year (Batch of 2023)">4th Year (Batch of 2023)</option>
                  </select>
                </div>
              </div>

              {/* Preferred Domain */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specific Sub-Domain / Role of Interest *
                </label>
                <input
                  type="text"
                  value={formData.subDomain}
                  onChange={(e) => setFormData({ ...formData, subDomain: e.target.value })}
                  placeholder="e.g. Competitive Programming, Robotics Firmware, Vocals, Stage Acting, UI/UX"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                {errors.subDomain && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.subDomain}</p>
                )}
              </div>

              {/* Statement of Purpose */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Statement of Interest / Why do you want to join {currentClub.acronym}? *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                  <textarea
                    rows={3}
                    value={formData.statementOfPurpose}
                    onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
                    placeholder="Describe your previous experience, relevant coursework, self-taught projects, or creative aspirations..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                {errors.statementOfPurpose && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.statementOfPurpose}</p>
                )}
              </div>

              {/* Previous Experience or Achievements */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Previous Experience or Achievements (Optional)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                  <textarea
                    rows={2}
                    value={formData.experienceOrAchievements}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceOrAchievements: e.target.value })
                    }
                    placeholder="e.g. Previous hackathons, school/college clubs, sports tournaments, music/drama performances, or key accomplishments..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Video Option */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Video Option (Optional)
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    <span>Audition / Demo / Reel</span>
                  </span>
                </div>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/... or Google Drive video link (Unlisted/Public)"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  If you want to add a video, paste a link to your audition reel, theatre monologue, music clip, sports highlights, or project walkthrough.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Submission Receipt with subtle celebratory particle burst */
          <div className="relative text-center py-4 overflow-hidden">
            <CelebrationEffect />

            {/* Glowing animated halo behind checkmark */}
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center mb-3">
              <div 
                className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-50 pointer-events-none" 
                style={{ animationDuration: '1.4s', animationIterationCount: 2 }}
              />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 transition-transform duration-300 scale-100 animate-in zoom-in-75">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            </div>

            {/* Rewarding celebration header */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Application Submitted Successfully</span>
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Welcome to the {submittedApp.clubName} Candidate Cohort!
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Your application docket has been registered with the Faculty Advisor and Student Coordinators.
            </p>

            <div className="mt-6 rounded-xl border border-dashed border-emerald-500/40 bg-slate-950/90 p-5 text-left relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Application Docket ID
                  </span>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">
                    {submittedApp.id}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>{submittedApp.submittedAt}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Target Club</div>
                  <div className="font-semibold text-white">{submittedApp.clubName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Domain</div>
                  <div className="text-white">{submittedApp.subDomain}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Applicant</div>
                  <div className="text-white">{submittedApp.applicantName} ({submittedApp.rollNumber})</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Status</div>
                  <div className="font-semibold text-emerald-400">Under Review</div>
                </div>

                {submittedApp.experienceOrAchievements && (
                  <div className="col-span-2 pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Previous Experience / Achievements
                    </div>
                    <div className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                      {submittedApp.experienceOrAchievements}
                    </div>
                  </div>
                )}

                {submittedApp.videoUrl && (
                  <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        Video Demonstration
                      </div>
                      <div className="text-amber-400 text-xs truncate max-w-xs font-mono">
                        {submittedApp.videoUrl}
                      </div>
                    </div>
                    <a
                      href={submittedApp.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md hover:bg-amber-500/20 shrink-0"
                    >
                      <Video className="h-3 w-3" />
                      <span>Watch</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 relative z-10">
              <button
                onClick={() => {
                  handleResetAndClose();
                  onViewApplications?.();
                }}
                className="w-full px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                Done & View My Applications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
