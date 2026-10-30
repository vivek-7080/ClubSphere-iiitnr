import React, { useState } from 'react';
import { CampusEvent, EventRegistration } from '../types';
import { X, CheckCircle2, Ticket, Calendar, MapPin, User, Mail, School } from 'lucide-react';

interface EventRegistrationModalProps {
  event: CampusEvent | null;
  onClose: () => void;
  onSuccess: (reg: EventRegistration) => void;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    rollNumber: '',
    email: '',
    teamName: '',
    teamSize: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedPass, setConfirmedPass] = useState<EventRegistration | null>(null);

  if (!event) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.applicantName.trim()) errs.applicantName = 'Full name is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Student Roll Number is required (e.g. 23100BT045)';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid IIIT-NR or university email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const registrationId = `NR-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReg: EventRegistration = {
      registrationId,
      eventId: event.id,
      eventTitle: event.title,
      applicantName: formData.applicantName.trim(),
      rollNumber: formData.rollNumber.trim().toUpperCase(),
      email: formData.email.trim(),
      teamName: formData.teamName.trim() || undefined,
      teamSize: parseInt(formData.teamSize) || 1,
      registeredAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setConfirmedPass(newReg);
    onSuccess(newReg);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="animate-scale-in relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 md:p-8 text-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-tactile absolute right-4 top-4 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!confirmedPass ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Ticket className="h-4 w-4" />
              <span>Event Desk Registration</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {event.title}
            </h2>
            <div className="mt-2 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>{event.date} · {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span>{event.venue}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                    placeholder="e.g. Yashvardhan Singhania"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                {errors.applicantName && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.applicantName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 23101004"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 uppercase focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  {errors.rollNumber && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.rollNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Team Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="1">Individual (1)</option>
                    <option value="2">Duo (2 members)</option>
                    <option value="3">Trio (3 members)</option>
                    <option value="4">Quad (4 members)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Institute / University Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@iiitnr.edu.in"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Team Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="e.g. ByteBusters or Team Phoenix"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Registration Confirmed!
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Your delegate pass for {event.title} has been generated.
            </p>

            {/* Visual Digital Pass */}
            <div className="mt-6 rounded-xl border border-dashed border-amber-500/40 bg-slate-950/90 p-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Official Student Pass
                  </span>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">
                    {confirmedPass.registrationId}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>IIIT Naya Raipur</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Participant</div>
                  <div className="font-semibold text-white">{confirmedPass.applicantName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Roll Number</div>
                  <div className="font-mono text-white tabular-nums">{confirmedPass.rollNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Venue</div>
                  <div className="text-slate-300 truncate">{event.venue}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Date</div>
                  <div className="text-slate-300">{event.date}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Verification at entrance with Student ID card</span>
                <span className="font-mono text-emerald-400 font-semibold">VALID</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="w-full px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
