import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institute Brand & Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-400 text-slate-950 font-bold text-sm">
                C
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                ClubSphere — IIIT Naya Raipur
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              The centralized student governance and extracurricular portal of Dr. SPM International Institute of Information Technology, Naya Raipur (Chhattisgarh).
            </p>
            <div className="text-xs text-slate-500 pt-1">
              Sector 24, Near Purkhoti Muktangan, Atal Nagar, Nava Raipur, Chhattisgarh — 493661
            </div>
          </div>

          {/* Col 2: Navigation Mirror */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Explore Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Societies Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Campus Events & Fests
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="hover:text-amber-400 transition-colors"
                >
                  SAC Circulars & Notices
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('matcher')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Interactive Club Matcher
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('venues')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Campus Activity Venues
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Institute Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Institute Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.iiitnr.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Official IIIT-NR Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sac.iiitnr.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Student Activity Center (SAC)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">Academic Calendar 2026-27</span>
              </li>
              <li>
                <span className="text-slate-500">Student Code of Conduct</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © 2026 Dr. SPM IIIT Naya Raipur. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Student Council</span>
            <span aria-hidden="true">·</span>
            <span>Technical Board</span>
            <span aria-hidden="true">·</span>
            <span>Cultural Board</span>
            <span aria-hidden="true">·</span>
            <span>Sports Board</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
