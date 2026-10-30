import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Compass,
  Users,
  Award,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { AppUser, SUPER_ADMIN_EMAIL } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [signInError, setSignInError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sign Up fields
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: 'CSE',
    batch: '2026',
    password: '',
    confirmPassword: '',
  });
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});

  // Helper to read stored registered users
  const getStoredUsers = (): AppUser[] => {
    try {
      const stored = localStorage.getItem('clubsphere_auth_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveStoredUsers = (users: AppUser[]) => {
    try {
      localStorage.setItem('clubsphere_auth_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setSignInError('Please enter your email address');
      return;
    }
    if (!signInPassword) {
      setSignInError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const isSuper = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
      const users = getStoredUsers();
      let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!matchedUser) {
        if (isSuper) {
          // Provision super admin user
          matchedUser = {
            id: 'admin-super-vivek',
            name: 'Vivek Kumar',
            email: SUPER_ADMIN_EMAIL,
            rollNumber: 'NR2026-ADMIN',
            branch: 'CSE',
            batch: '2026',
            role: 'super_admin',
            isAdmin: true,
            avatarColor: '#f59e0b',
            createdAt: new Date().toISOString(),
          };
          users.push(matchedUser);
          saveStoredUsers(users);
        } else {
          setSignInError('Account not found with this email. Please check your credentials or Sign Up.');
          return;
        }
      }

      onLoginSuccess(matchedUser);
    }, 350);
  };

  // Sign Up Handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!signUpForm.name.trim()) errs.name = 'Full name is required';
    if (!signUpForm.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!signUpForm.rollNumber.trim()) errs.rollNumber = 'Roll number is required (e.g., 260101)';
    if (!signUpForm.password) {
      errs.password = 'Password is required';
    } else if (signUpForm.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setSignUpErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const cleanEmail = signUpForm.email.trim().toLowerCase();
      const users = getStoredUsers();

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        setSignUpErrors({ email: 'An account with this email already exists' });
        return;
      }

      const isSuper = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
      const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        name: signUpForm.name.trim(),
        email: cleanEmail,
        rollNumber: signUpForm.rollNumber.trim().toUpperCase(),
        branch: signUpForm.branch,
        batch: signUpForm.batch,
        role: isSuper ? 'super_admin' : 'student',
        isAdmin: isSuper,
        avatarColor: isSuper ? '#f59e0b' : randomColor,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveStoredUsers(users);
      onLoginSuccess(newUser);
    }, 350);
  };

  // Quick 1-click Super Admin login
  const handleQuickSuperAdmin = () => {
    const superUser: AppUser = {
      id: 'admin-super-vivek',
      name: 'Vivek Kumar',
      email: SUPER_ADMIN_EMAIL,
      rollNumber: 'NR2026-ADMIN',
      branch: 'CSE',
      batch: '2026',
      role: 'super_admin',
      isAdmin: true,
      avatarColor: '#f59e0b',
      createdAt: new Date().toISOString(),
    };
    const users = getStoredUsers();
    if (!users.some((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
      users.push(superUser);
      saveStoredUsers(users);
    }
    onLoginSuccess(superUser);
  };

  // Quick 1-click Student login
  const handleQuickStudent = () => {
    const studentUser: AppUser = {
      id: 'student-demo-rahul',
      name: 'Rahul Sharma',
      email: 'rahul.cse26@iiitnr.edu.in',
      rollNumber: '26010142',
      branch: 'CSE',
      batch: '2026',
      role: 'student',
      isAdmin: false,
      avatarColor: '#3b82f6',
      createdAt: new Date().toISOString(),
    };
    const users = getStoredUsers();
    if (!users.some((u) => u.email.toLowerCase() === studentUser.email.toLowerCase())) {
      users.push(studentUser);
      saveStoredUsers(users);
    }
    onLoginSuccess(studentUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Gradients & Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Bar Brand */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <span className="font-extrabold text-slate-950 text-lg tracking-wider">CS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">ClubSphere</span>
                <span className="text-[10px] font-mono uppercase bg-amber-400/15 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                  SAC IIIT-NR
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Student Activity Center • International Institute of Information Technology Naya Raipur
              </p>
            </div>
          </div>

          <button
            onClick={onContinueAsGuest}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-850 transition-colors font-medium shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Continue as Guest</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Login / Sign Up Showcase */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Campus Highlights & SAC Context */}
          <div className="lg:col-span-5 flex flex-col space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Year 2026 Portal Active</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Welcome to <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                  ClubSphere IIIT-NR
                </span>
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                The unified portal for Student Clubs, Fests, Technical Workshops, and Recruitment at IIIT Naya Raipur. Log in to explore societies, manage memberships, or access authorized administration.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">12+ Registered Societies</h4>
                  <p className="text-xs text-slate-400">Technical (TSOC), Cultural (Igniters), Sports, E-Cell & Social wings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-indigo-400/10 text-indigo-400 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Interactive Events & Calendar</h4>
                  <p className="text-xs text-slate-400">Hackathons, cultural nights, athletic meets with 1-click registration.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Role-Based SAC Administration</h4>
                  <p className="text-xs text-slate-400">
                    Super admin control assigned to <span className="text-amber-300 font-mono text-[11px] font-semibold">{SUPER_ADMIN_EMAIL}</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <span>Instant 1-Click Access</span>
                <span className="text-[10px] text-amber-400 lowercase">(no typing required)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleQuickSuperAdmin}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all group shadow-sm hover:border-amber-400/50"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1">
                      <span>Super Admin</span>
                    </div>
                    <div className="text-[11px] text-amber-300/80 truncate font-mono">Vivek Kumar</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleQuickStudent}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all group shadow-sm hover:border-blue-500/50"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    🎓
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-blue-300">Student Demo</div>
                    <div className="text-[11px] text-blue-300/80 truncate font-mono">Batch 2026 (1st Yr)</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Sign In / Sign Up Form Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative">
              
              {/* Card Header with Mode Toggle */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'signin' ? 'Sign In to Your Account' : 'Register as Student'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {mode === 'signin'
                      ? 'Access club recruitment, event passes & bookmarks'
                      : 'Create your IIIT Naya Raipur campus student profile'}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setSignInError('');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      mode === 'signin'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setSignUpErrors({});
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      mode === 'signup'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Mode: Sign In Form */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  {signInError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{signInError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="e.g., kumarvivek802125@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm placeholder-slate-500 transition-colors outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Super Admin access is granted to <span className="text-amber-400 font-mono font-semibold">{SUPER_ADMIN_EMAIL}</span>.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInPassword('admin123');
                          if (!signInEmail) setSignInEmail(SUPER_ADMIN_EMAIL);
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        Auto-fill Admin Pass
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm placeholder-slate-500 transition-colors outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400/20"
                      />
                      <span>Remember this session</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmail(SUPER_ADMIN_EMAIL);
                        setSignInPassword('admin123');
                      }}
                      className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      Fill Vivek Kumar
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Verifying credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to ClubSphere</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode: Sign Up Form */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={signUpForm.name}
                          onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                          placeholder="e.g., Vivek Kumar"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder-slate-500 outline-none"
                        />
                      </div>
                      {signUpErrors.name && (
                        <p className="text-[11px] text-rose-400 mt-1">{signUpErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="email"
                          value={signUpForm.email}
                          onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                          placeholder="student@iiitnr.edu.in"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder-slate-500 outline-none"
                        />
                      </div>
                      {signUpErrors.email && (
                        <p className="text-[11px] text-rose-400 mt-1">{signUpErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        value={signUpForm.rollNumber}
                        onChange={(e) => setSignUpForm({ ...signUpForm, rollNumber: e.target.value })}
                        placeholder="e.g., 260101"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder-slate-500 outline-none uppercase font-mono"
                      />
                      {signUpErrors.rollNumber && (
                        <p className="text-[11px] text-rose-400 mt-1">{signUpErrors.rollNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Branch
                      </label>
                      <select
                        value={signUpForm.branch}
                        onChange={(e) => setSignUpForm({ ...signUpForm, branch: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                      >
                        <option value="CSE">CSE (Computer Science)</option>
                        <option value="DSAI">DSAI (Data Science & AI)</option>
                        <option value="ECE">ECE (Electronics & Comm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Batch (Year)
                      </label>
                      <select
                        value={signUpForm.batch}
                        onChange={(e) => setSignUpForm({ ...signUpForm, batch: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs outline-none"
                      >
                        <option value="2026">1st Year (Batch of 2026)</option>
                        <option value="2025">2nd Year (Batch of 2025)</option>
                        <option value="2024">3rd Year (Batch of 2024)</option>
                        <option value="2023">4th Year (Batch of 2023)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        placeholder="At least 6 chars"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder-slate-500 outline-none"
                      />
                      {signUpErrors.password && (
                        <p className="text-[11px] text-rose-400 mt-1">{signUpErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs placeholder-slate-500 outline-none"
                      />
                      {signUpErrors.confirmPassword && (
                        <p className="text-[11px] text-rose-400 mt-1">{signUpErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Signing up with email <strong>{SUPER_ADMIN_EMAIL}</strong> automatically confers Super Admin privileges.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Creating Profile...</span>
                    ) : (
                      <>
                        <span>Create Student Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Guest Explore Option */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Just exploring campus activities?{' '}
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="text-amber-400 hover:text-amber-300 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Browse as Guest Visitor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-sm py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ClubSphere • Student Activity Center (SAC) • IIIT Naya Raipur</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Batch 2026 1st Year Edition</span>
            <span>•</span>
            <span className="font-mono text-amber-400/80">Authorized Admin: kumarvivek802125@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
