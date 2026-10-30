import React, { useState, useMemo, useEffect } from 'react';
import { Club, AdminSession, SUPER_ADMIN_EMAIL } from '../types';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ChevronDown,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';

interface AdminLoginPageProps {
  clubs: Club[];
  initialSelectedClubId?: string;
  onLoginSuccess: (session: AdminSession) => void;
  onCancel: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  clubs,
  initialSelectedClubId,
  onLoginSuccess,
  onCancel,
}) => {
  // Selected club to authenticate for
  const [selectedClubId, setSelectedClubId] = useState<string>(
    initialSelectedClubId || clubs[0]?.id || 'tsoc'
  );

  const selectedClub = useMemo(() => {
    return clubs.find((c) => c.id === selectedClubId) || clubs[0];
  }, [clubs, selectedClubId]);

  // Designated club head
  const clubHead = useMemo(() => {
    return selectedClub?.leads?.[0] || {
      name: 'Club Head',
      role: 'President / Lead',
      branch: 'CSE',
      batch: '2025',
      email: `${selectedClub.id}.head@iiitnr.edu.in`,
    };
  }, [selectedClub]);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync email when club changes
  useEffect(() => {
    if (clubHead?.email) {
      setEmail(clubHead.email);
      setPassword('admin123'); // Standard demo passkey for easy access
      setErrorMessage(null);
    }
  }, [clubHead]);

  // Handle Login submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const headEmail = (clubHead.email || '').toLowerCase();

    // Verify email matches the designated club head
    if (!cleanEmail) {
      setErrorMessage('Please enter the Club Head official institute email.');
      return;
    }

    if (cleanEmail !== headEmail) {
      setErrorMessage(
        `Access Denied: "${cleanEmail}" is not the registered head for ${selectedClub.name}. Only ${clubHead.name} (${clubHead.email}) can log in as admin for this club.`
      );
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Please provide the security passkey (default: admin123).');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      const session: AdminSession = {
        clubId: selectedClub.id,
        adminName: clubHead.name,
        adminEmail: clubHead.email,
        adminRole: clubHead.role || 'Club Head & Admin',
        loginTimestamp: Date.now(),
      };

      if (rememberMe) {
        localStorage.setItem('clubsphere_admin_session', JSON.stringify(session));
      }

      onLoginSuccess(session);
    }, 400);
  };

  // Quick 1-click login for demo / test
  const handleQuickDemoLogin = (targetClub: Club) => {
    setSelectedClubId(targetClub.id);
    const head = targetClub.leads?.[0];
    if (!head) return;

    setEmail(head.email);
    setPassword('admin123');

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const session: AdminSession = {
        clubId: targetClub.id,
        adminName: head.name,
        adminEmail: head.email,
        adminRole: head.role || 'Club Head & Admin',
        loginTimestamp: Date.now(),
      };
      if (rememberMe) {
        localStorage.setItem('clubsphere_admin_session', JSON.stringify(session));
      }
      onLoginSuccess(session);
    }, 350);
  };

  const handleSuperAdminDirectLogin = () => {
    setEmail(SUPER_ADMIN_EMAIL);
    setPassword('admin123');
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const session: AdminSession = {
        clubId: selectedClub.id,
        adminName: 'Vivek Kumar',
        adminEmail: SUPER_ADMIN_EMAIL,
        adminRole: 'Super Administrator',
        loginTimestamp: Date.now(),
      };
      if (rememberMe) {
        localStorage.setItem('clubsphere_admin_session', JSON.stringify(session));
      }
      onLoginSuccess(session);
    }, 300);
  };

  return (
    <div className="min-h-[80vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Student Portal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Login Form */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Top highlight bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 transition-colors"
            style={{ backgroundColor: selectedClub.accentColor }}
          />

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>ClubSphere Society Governance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Club Admin Portal Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Admin access is exclusive to <strong className="text-amber-400">{SUPER_ADMIN_EMAIL}</strong> and designated society heads.
          </p>

          {/* Super Admin Quick Access Pill */}
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white">Super Admin Access</div>
                  <div className="text-[11px] text-amber-300 font-mono truncate">{SUPER_ADMIN_EMAIL}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSuperAdminDirectLogin}
                className="btn-tactile shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
              >
                1-Click Login
              </button>
            </div>
          </div>

          {/* Club Target Selection */}
          <div className="mt-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Society to Administer
            </label>
            <div className="relative">
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm font-semibold text-white transition-colors focus:border-amber-400 focus:outline-none"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.acronym}) — Head: {c.leads?.[0]?.name || 'Admin'}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Selected Club Head Verification Box */}
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-start gap-3.5">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-sm text-slate-950 shadow-md"
                style={{ backgroundColor: selectedClub.accentColor }}
              >
                {clubHead.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Designated Administrator
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Authorized Head
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate mt-0.5">
                  {clubHead.name}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {clubHead.role} · B.Tech {clubHead.branch} (Batch of {clubHead.batch})
                </div>
                <div className="text-xs text-amber-400 font-mono mt-1 flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{clubHead.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Club Head Institute Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name.club@iiitnr.edu.in"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                  required
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Admin Passkey / Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Demo Passkey: <code className="text-amber-400 font-mono font-bold">admin123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator passkey"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                  required
                />
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember session on this device</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setEmail(clubHead.email);
                  setPassword('admin123');
                }}
                className="text-amber-400 hover:underline font-semibold"
              >
                Auto-fill Head Credentials
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="btn-tactile w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg hover:shadow-amber-400/20 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Log In as {selectedClub.acronym} Admin</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(selectedClub)}
                className="btn-tactile w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
                title="Log in immediately with verified credentials"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>1-Click Test Login</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Security Policy & Quick Club Switchers */}
        <div className="md:col-span-5 space-y-6">
          {/* Segregation Information Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              <Lock className="h-4 w-4" />
              <span>Session Isolation Policy</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Strict Per-Club Segregation
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              To safeguard society autonomy, ClubSphere enforces rigid access isolation:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">No Multi-Club Leaks:</strong> Once authenticated, you can only manage the roster and roles of <strong className="text-amber-400">{selectedClub.name}</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Mandatory Re-Authentication:</strong> No admin can access or modify another club without logging out and entering that club head's credentials.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Head Authority:</strong> Only the primary student lead has permission to onboard members and appoint domain roles.
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Select Any Club Head (For Testers / Demo) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Quick Login by Society ({clubs.length})</span>
              </div>
              <span className="text-[10px] text-amber-400/80 font-medium">Click to test</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {clubs.map((c) => {
                const head = c.leads?.[0];
                const isCurrent = c.id === selectedClub.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(c)}
                    className={`btn-tactile w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs hover:translate-x-1 ${
                      isCurrent
                        ? 'border-amber-400/40 bg-amber-400/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.accentColor }}
                      />
                      <div className="truncate">
                        <div className="font-bold text-white truncate">
                          {c.acronym} <span className="font-normal text-slate-400 text-[11px]">· {c.name}</span>
                        </div>
                        <div className="text-[11px] text-amber-400/90 truncate">
                          Admin: {head?.name || 'Head'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Login →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
