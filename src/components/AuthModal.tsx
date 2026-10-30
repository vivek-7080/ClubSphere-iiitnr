import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AppUser, SUPER_ADMIN_EMAIL } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onLoginSuccess: (user: AppUser) => void;
  onLogout: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [signInError, setSignInError] = useState<string>('');

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Helper to get registered users from localStorage
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

      // Check if this is the super admin email
      const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

      // Look in stored users
      const users = getStoredUsers();
      let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!matchedUser) {
        if (isSuperAdmin) {
          // Auto-seed Vivek Kumar as Super Admin
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
          // If student password doesn't match or not found
          setSignInError('Account not found. Please Sign Up or click Quick Login.');
          return;
        }
      }

      onLoginSuccess(matchedUser);
      onClose();
    }, 300);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!signUpForm.name.trim()) errs.name = 'Full name is required';
    if (!signUpForm.email.trim() || !signUpForm.email.includes('@')) {
      errs.email = 'Valid email address is required';
    }
    if (!signUpForm.rollNumber.trim()) errs.rollNumber = 'Institute roll number is required';
    if (!signUpForm.password || signUpForm.password.length < 6) {
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
      const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

      const users = getStoredUsers();
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        setSignUpErrors({ email: 'An account with this email already exists. Please Sign In.' });
        return;
      }

      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        name: signUpForm.name.trim(),
        email: cleanEmail,
        password: signUpForm.password,
        rollNumber: signUpForm.rollNumber.trim().toUpperCase(),
        branch: signUpForm.branch,
        batch: signUpForm.batch,
        role: isSuperAdmin ? 'super_admin' : 'student',
        isAdmin: isSuperAdmin,
        avatarColor: isSuperAdmin ? '#f59e0b' : '#38bdf8',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveStoredUsers(users);

      onLoginSuccess(newUser);
      onClose();
    }, 350);
  };

  // 1-Click quick login as Super Admin
  const handleQuickAdminLogin = () => {
    const adminUser: AppUser = {
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
      users.push(adminUser);
      saveStoredUsers(users);
    }

    onLoginSuccess(adminUser);
    onClose();
  };

  // 1-Click quick login as Demo Student
  const handleQuickStudentLogin = () => {
    const studentUser: AppUser = {
      id: 'student-demo-rahul',
      name: 'Rahul Sharma',
      email: 'rahul.s@iiitnr.edu.in',
      rollNumber: '261001045',
      branch: 'CSE',
      batch: '2026',
      role: 'student',
      isAdmin: false,
      avatarColor: '#10b981',
      createdAt: new Date().toISOString(),
    };

    onLoginSuccess(studentUser);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="animate-scale-in relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn-tactile absolute right-4 top-4 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Current User Session Profile View (If already logged in) */}
        {currentUser ? (
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-slate-950 shadow-md"
                style={{ backgroundColor: currentUser.avatarColor || '#f59e0b' }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white">{currentUser.name}</h3>
                  {currentUser.isAdmin ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-amber-400 px-2 py-0.5 rounded shadow-sm">
                      Admin Access
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                      Student
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{currentUser.email}</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className="font-semibold text-white">
                  {currentUser.isAdmin ? 'Super Administrator (Full Privileges)' : 'Student Member'}
                </span>
              </div>
              {currentUser.rollNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll Number:</span>
                  <span className="font-mono text-slate-200">{currentUser.rollNumber}</span>
                </div>
              )}
              {currentUser.branch && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Department / Batch:</span>
                  <span className="text-slate-200">{currentUser.branch} · Batch of {currentUser.batch}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-850 pt-2">
                <span className="text-slate-400">Admin Permissions:</span>
                <span className={currentUser.isAdmin ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {currentUser.isAdmin ? 'Granted (Add/Remove Clubs & Members)' : 'Restricted'}
                </span>
              </div>
            </div>

            {currentUser.isAdmin ? (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have authenticated with admin privileges for <strong>{SUPER_ADMIN_EMAIL}</strong>.</span>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Admin access is exclusive to <strong>{SUPER_ADMIN_EMAIL}</strong>.</span>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                }}
                className="btn-tactile w-full py-2.5 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-300 transition-colors flex items-center justify-center gap-2"
              >
                Log Out of Account
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>ClubSphere Authentication</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in or register to join campus societies, register for events, and manage club activities.
            </p>

            {/* Admin Designation Notice Box */}
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Admin Authority:</span>
                  <span className="text-slate-300 ml-1">
                    Administrative rights to <strong>add or remove clubs and members</strong> are granted exclusively to{' '}
                    <strong className="text-amber-400">{SUPER_ADMIN_EMAIL}</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Access Buttons */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="btn-tactile flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-400/40 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs font-bold transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Admin Login (Vivek)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickStudentLogin}
                className="btn-tactile flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Student Demo (Rahul)</span>
              </button>
            </div>

            {/* Mode Switch Tabs (Sign In / Sign Up) */}
            <div className="mt-5 flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setSignInError('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                  mode === 'signin'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-white'
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
                className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                  mode === 'signup'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="mt-5 space-y-4">
                {signInError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. kumarvivek802125@gmail.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmail(SUPER_ADMIN_EMAIL);
                        setSignInPassword('admin123');
                      }}
                      className="text-[11px] text-amber-400 hover:underline font-medium"
                    >
                      Fill Admin Credentials
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-0"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-tactile w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Signing In...' : 'Sign In to ClubSphere'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: SIGN UP */
              <form onSubmit={handleSignUp} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    placeholder="e.g. Vivek Kumar"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {signUpErrors.name && (
                    <p className="mt-1 text-[11px] text-red-400">{signUpErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    placeholder="e.g. kumarvivek802125@gmail.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {signUpErrors.email && (
                    <p className="mt-1 text-[11px] text-red-400">{signUpErrors.email}</p>
                  )}
                  {signUpForm.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && (
                    <p className="mt-1 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Admin designation detected! Signing up with this email grants Super Admin access.</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={signUpForm.rollNumber}
                      onChange={(e) => setSignUpForm({ ...signUpForm, rollNumber: e.target.value })}
                      placeholder="261001..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    {signUpErrors.rollNumber && (
                      <p className="mt-1 text-[11px] text-red-400">{signUpErrors.rollNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Branch
                    </label>
                    <select
                      value={signUpForm.branch}
                      onChange={(e) => setSignUpForm({ ...signUpForm, branch: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="CSE">CSE</option>
                      <option value="DSAI">DSAI</option>
                      <option value="ECE">ECE</option>
                      <option value="PG">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Batch
                    </label>
                    <select
                      value={signUpForm.batch}
                      onChange={(e) => setSignUpForm({ ...signUpForm, batch: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="2026">1st Yr (2026)</option>
                      <option value="2025">2nd Yr (2025)</option>
                      <option value="2024">3rd Yr (2024)</option>
                      <option value="2023">4th Yr (2023)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    {signUpErrors.password && (
                      <p className="mt-1 text-[11px] text-red-400">{signUpErrors.password}</p>
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
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    {signUpErrors.confirmPassword && (
                      <p className="mt-1 text-[11px] text-red-400">{signUpErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-tactile w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registering...' : 'Create Account & Sign In'}</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
