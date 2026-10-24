import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/auth.ts';
import { X, GraduationCap, School, Mail, User as UserIcon, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'student',
  initialMode = 'signin',
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [section, setSection] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      const res = await register({
        email: email.trim(),
        fullName: fullName.trim(),
        role,
        section: section.trim()
      });
      setIsSubmitting(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      const res = await login(email.trim(), role);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Sign in failed.');
      }
    }
  };

  const handleQuickTeacherDemo = async () => {
    setIsSubmitting(true);
    await login('elena.reyes@school.edu', 'teacher');
    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleQuickStudentDemo = async () => {
    setIsSubmitting(true);
    await login('ana.lim@student.edu', 'student');
    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] rounded-[28px] bg-[var(--card)] border border-[var(--line)] shadow-2xl p-6 sm:p-7 overflow-hidden text-[var(--ink)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Title Case */}
        <div className="mb-5">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--acc)] font-medium mb-1">
            ThinkFirst Account
          </div>
          <h2 className="font-serif text-[28px] font-normal leading-tight text-[var(--ink)]">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[var(--mut)] mt-1">
            {mode === 'signup'
              ? 'Select your academic role to personalize your workspace.'
              : 'Sign in to access your question sets and verified writing records.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[var(--bg)] p-1 border border-[var(--line)] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[var(--card)] text-[var(--ink)] shadow-xs font-semibold'
                : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--card)] text-[var(--ink)] shadow-xs font-semibold'
                : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role Selection Cards */}
        <div className="mb-4">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === 'student'
                  ? 'border-[var(--acc)] bg-[var(--accl)]/50 ring-1 ring-[var(--acc)]'
                  : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--mut)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-[var(--acc)]' : 'text-[var(--mut)]'}`} />
                {role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--acc)]" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--ink)]">Student</div>
                <div className="text-[10px] text-[var(--mut)] leading-tight mt-0.5">Enter code &amp; draft</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                role === 'teacher'
                  ? 'border-[var(--acc)] bg-[var(--accl)]/50 ring-1 ring-[var(--acc)]'
                  : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--mut)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <School className={`w-4 h-4 ${role === 'teacher' ? 'text-[var(--acc)]' : 'text-[var(--mut)]'}`} />
                {role === 'teacher' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--acc)]" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--ink)]">Teacher</div>
                <div className="text-[10px] text-[var(--mut)] leading-tight mt-0.5">Manage sets &amp; review</div>
              </div>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] text-xs text-[var(--ambt)]">
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mut)]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'teacher' ? 'e.g. Ms. Elena Reyes' : 'e.g. Ana Lim'}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--acc)] text-xs text-[var(--ink)] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mut)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'teacher' ? 'teacher@school.edu' : 'student@school.edu'}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--acc)] text-xs text-[var(--ink)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mut)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--acc)] text-xs text-[var(--ink)] outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && role === 'student' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
                Class Section (Optional)
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. 10-A"
                className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--acc)] text-xs text-[var(--ink)] outline-none"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[var(--acc)] text-[var(--onacc)] font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{mode === 'signup' ? 'Complete Sign Up' : 'Sign In Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Demo Shortcuts */}
        <div className="mt-5 pt-4 border-t border-[var(--line)] text-center">
          <span className="text-[11px] text-[var(--mut)] block mb-2 font-mono">
            Or Jump In With Demo Profiles:
          </span>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={handleQuickTeacherDemo}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--line)] text-[11px] font-medium text-[var(--ink)] hover:border-[var(--acc)] cursor-pointer"
            >
              Demo Teacher (Ms. Reyes)
            </button>
            <button
              type="button"
              onClick={handleQuickStudentDemo}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--line)] text-[11px] font-medium text-[var(--ink)] hover:border-[var(--acc)] cursor-pointer"
            >
              Demo Student (Ana Lim)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
