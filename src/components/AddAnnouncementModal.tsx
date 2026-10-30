import React, { useState } from 'react';
import { X, Bell, Calendar, Sparkles, AlertTriangle, ShieldCheck, FileText, Send } from 'lucide-react';
import { Announcement, Club, AdminSession, AppUser, SUPER_ADMIN_EMAIL } from '../types';

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubs: Club[];
  adminSession: AdminSession | null;
  currentUser: AppUser | null;
  isSuperAdmin: boolean;
  onAddAnnouncement: (announcement: Announcement) => void;
  preSelectedClubId?: string;
}

export const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({
  isOpen,
  onClose,
  clubs,
  adminSession,
  currentUser,
  isSuperAdmin,
  onAddAnnouncement,
  preSelectedClubId,
}) => {
  // Determine default source
  const defaultSource = () => {
    if (preSelectedClubId) {
      const c = clubs.find((x) => x.id === preSelectedClubId);
      if (c) return c.name;
    }
    if (adminSession) {
      const c = clubs.find((x) => x.id === adminSession.clubId);
      return c ? c.name : adminSession.adminName;
    }
    if (isSuperAdmin) {
      return 'SAC Student Activity Center';
    }
    return clubs[0]?.name || 'SAC Student Activity Center';
  };

  const [title, setTitle] = useState('');
  const [source, setSource] = useState(defaultSource());
  const [sourceType, setSourceType] = useState<'sac' | 'club' | 'council'>('club');
  const [category, setCategory] = useState<'Event' | 'Recruitment' | 'Results' | 'Policy' | 'Grant'>('Event');
  const [isUrgent, setIsUrgent] = useState(false);
  const [summary, setSummary] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [actionUrlText, setActionUrlText] = useState('Explore Events Calendar');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Announcement title is required';
    if (!source.trim()) errs.source = 'Issuing authority or club name is required';
    if (!summary.trim() || summary.length < 15) {
      errs.summary = 'Please provide a summary (at least 15 characters)';
    }
    if (!fullContent.trim() || fullContent.length < 30) {
      errs.fullContent = 'Please provide full statement & details (at least 30 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      source: source.trim(),
      sourceType: isSuperAdmin && source.includes('SAC') ? 'sac' : 'club',
      date: dateStr,
      isUrgent,
      summary: summary.trim(),
      fullContent: fullContent.trim(),
      actionUrlText: category === 'Recruitment' ? 'Go to Recruitment Form' : 'Explore Events Calendar',
      category,
    };

    onAddAnnouncement(newAnnouncement);
    // Reset form
    setTitle('');
    setSummary('');
    setFullContent('');
    setIsUrgent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 text-white shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">
                Broadcast Notice to Notice Board
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-amber-400 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Publish event updates, venue adjustments, schedules, or recruitment bulletins to the campus community.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Notice Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notice / Bulletin Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Hack-O-Fiesta 2026: Team Registration Deadline Extended & Problem Statements Live"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors"
            />
            {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Row: Issuing Club & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Issuing Authority / Society *
              </label>
              {isSuperAdmin ? (
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none cursor-pointer"
                >
                  <option value="SAC Student Activity Center">SAC Student Activity Center (Official)</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.acronym})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={source}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs outline-none cursor-not-allowed"
                />
              )}
              {errors.source && <p className="text-[11px] text-red-400 mt-1">{errors.source}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notice Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none cursor-pointer"
              >
                <option value="Event">Event Updates & Schedule</option>
                <option value="Recruitment">Recruitment & Induction</option>
                <option value="Results">Competition Results</option>
                <option value="Policy">SAC Directive & Policy</option>
                <option value="Grant">Project Grants & Budget</option>
              </select>
            </div>
          </div>

          {/* Urgency Priority Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Mark as High-Priority / Urgent Bulletin</div>
                <div className="text-[11px] text-slate-400">
                  Displays a prominent red priority badge on the student notice board.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Executive Summary (Card Preview) *
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief 1-2 sentence overview visible directly on the notice card..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors"
            />
            {errors.summary && <p className="text-[11px] text-red-400 mt-0.5">{errors.summary}</p>}
          </div>

          {/* Full Statement & Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Statement, Event Instructions & Venue Details *
            </label>
            <textarea
              rows={5}
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              placeholder="Provide comprehensive details including dates, reporting times, required equipment, Discord/WhatsApp links, and contact leads..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none transition-colors leading-relaxed"
            />
            {errors.fullContent && <p className="text-[11px] text-red-400 mt-0.5">{errors.fullContent}</p>}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast to Notice Board</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
