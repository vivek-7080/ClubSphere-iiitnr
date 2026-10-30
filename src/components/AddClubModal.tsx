import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, MapPin, Mail, User, ShieldCheck } from 'lucide-react';
import { Club, ClubCategory } from '../types';

interface AddClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClub: (newClub: Club) => void;
}

const PRESET_COLORS = [
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const AddClubModal: React.FC<AddClubModalProps> = ({
  isOpen,
  onClose,
  onAddClub,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    category: 'technical' as ClubCategory,
    tagline: '',
    description: '',
    meetingVenue: 'Student Activity Center (SAC) Lab 102',
    leadName: '',
    leadEmail: '',
    leadBranch: 'CSE',
    leadBatch: '2026',
    accentColor: '#f59e0b',
    skillsGained: 'System Design, Team Leadership, Technical Innovation',
    flagshipEvents: 'Annual Hackathon, Innovation Summit',
    recruitmentStatus: 'Open' as 'Open' | 'Auditions Scheduled' | 'Closed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Club name is required';
    if (!formData.acronym.trim()) errs.acronym = 'Acronym is required';
    if (!formData.tagline.trim()) errs.tagline = 'Tagline is required';
    if (!formData.description.trim() || formData.description.length < 20) {
      errs.description = 'Description must be at least 20 characters';
    }
    if (!formData.leadName.trim()) errs.leadName = 'Club Head (Admin) name is required';
    if (!formData.leadEmail.trim() || !formData.leadEmail.includes('@')) {
      errs.leadEmail = 'Valid email for Club Head is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getCategoryLabel = (cat: ClubCategory): string => {
    switch (cat) {
      case 'technical':
        return 'Technical & Software Development';
      case 'cultural':
        return 'Cultural & Performing Arts';
      case 'sports':
        return 'Athletics & Competitive Gaming';
      case 'entrepreneurship':
        return 'Entrepreneurship & Startups';
      case 'social':
        return 'Social Welfare & Community';
      default:
        return 'Student Society';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const clubId = formData.acronym.toLowerCase().replace(/[^a-z0-9]/g, '') || `club-${Date.now()}`;

    const newClub: Club = {
      id: clubId,
      name: formData.name.trim(),
      acronym: formData.acronym.trim().toUpperCase(),
      category: formData.category,
      categoryLabel: getCategoryLabel(formData.category),
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      membersCount: 1, // Starts with club head
      meetingVenue: formData.meetingVenue.trim() || 'SAC Hall',
      leads: [
        {
          name: formData.leadName.trim(),
          role: 'Club Head & Founder',
          branch: formData.leadBranch,
          batch: formData.leadBatch,
          email: formData.leadEmail.trim().toLowerCase(),
          isAdmin: true,
        },
      ],
      flagshipEvents: formData.flagshipEvents
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      skillsGained: formData.skillsGained
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      recruitmentStatus: formData.recruitmentStatus,
      recruitmentTarget: 'Open to B.Tech & PG Students',
      activeProjects: ['Initial Society Launch & First Project Sprint'],
      socialLinks: {},
      accentColor: formData.accentColor,
    };

    onAddClub(newClub);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="animate-scale-in relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-tactile absolute right-4 top-4 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Super Admin Control · Society Registration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          Add New Student Society
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Charter a new student club under IIIT Naya Raipur SAC. This will immediately display in the directory and calendar.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Club Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Artificial Intelligence Research Guild"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              {errors.name && <p className="mt-1 text-[11px] text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Acronym *
              </label>
              <input
                type="text"
                value={formData.acronym}
                onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                placeholder="e.g. AIRG"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none uppercase font-mono"
              />
              {errors.acronym && <p className="mt-1 text-[11px] text-red-400">{errors.acronym}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Domain Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ClubCategory })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="technical">Technical & Dev</option>
                <option value="cultural">Cultural & Arts</option>
                <option value="sports">Athletics & Esports</option>
                <option value="entrepreneurship">E-Cell & Startups</option>
                <option value="social">Social & Outreach</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recruitment Status
              </label>
              <select
                value={formData.recruitmentStatus}
                onChange={(e) => setFormData({ ...formData, recruitmentStatus: e.target.value as any })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="Auditions Scheduled">Auditions Scheduled</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tagline (Motto) *
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Pioneering deep learning and robotics solutions"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            {errors.tagline && <p className="mt-1 text-[11px] text-red-400">{errors.tagline}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Objectives *
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the mission, projects, and activities students will participate in..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            {errors.description && <p className="mt-1 text-[11px] text-red-400">{errors.description}</p>}
          </div>

          {/* Club Head / Admin Info */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <User className="h-3.5 w-3.5" />
              <span>Designated Club Head (Lead Admin)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Club Head Name *
                </label>
                <input
                  type="text"
                  value={formData.leadName}
                  onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                  placeholder="e.g. Aryan Mehra"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                {errors.leadName && <p className="mt-1 text-[11px] text-red-400">{errors.leadName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Club Head Email *
                </label>
                <input
                  type="email"
                  value={formData.leadEmail}
                  onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                  placeholder="e.g. aryan.m@iiitnr.edu.in"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                {errors.leadEmail && <p className="mt-1 text-[11px] text-red-400">{errors.leadEmail}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Department / Branch
                </label>
                <select
                  value={formData.leadBranch}
                  onChange={(e) => setFormData({ ...formData, leadBranch: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="CSE">CSE</option>
                  <option value="DSAI">DSAI</option>
                  <option value="ECE">ECE</option>
                  <option value="PG">Postgraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Academic Batch
                </label>
                <select
                  value={formData.leadBatch}
                  onChange={(e) => setFormData({ ...formData, leadBatch: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="2026">1st Year (2026)</option>
                  <option value="2025">2nd Year (2025)</option>
                  <option value="2024">3rd Year (2024)</option>
                  <option value="2023">4th Year (2023)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Venue
              </label>
              <input
                type="text"
                value={formData.meetingVenue}
                onChange={(e) => setFormData({ ...formData, meetingVenue: e.target.value })}
                placeholder="e.g. Lab 102, SAC"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Accent Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="h-9 w-10 cursor-pointer rounded-lg border border-slate-800 bg-transparent"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, accentColor: c })}
                      className="h-5 w-5 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Skills Gained (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skillsGained}
              onChange={(e) => setFormData({ ...formData, skillsGained: e.target.value })}
              placeholder="e.g. PyTorch, Robotics, Autonomous Flight, Linux"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Charter Club & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
