import React, { useState } from 'react';
import { ScreenView } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/auth.ts';
import {
  Moon,
  Sun,
  Download,
  ShieldCheck,
  User as UserIcon,
  GraduationCap,
  School,
  LogOut,
  ChevronDown,
  FileText,
  Users,
  Plus
} from 'lucide-react';

interface HeaderProps {
  currentView: ScreenView;
  draftSecondsRemaining: number;
  isFocusMonitoringActive: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateHome?: () => void;
  onSwitchToTeacherMode?: () => void;
  onSwitchToStudentMode?: () => void;
  activeTeacherTab?: 'sets' | 'submissions';
  onTeacherTabChange?: (tab: 'sets' | 'submissions') => void;
  questionSetsCount?: number;
  submissionsCount?: number;
  unreadFlagsCount?: number;
  onCreateSet?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  draftSecondsRemaining,
  isFocusMonitoringActive,
  theme,
  onToggleTheme,
  canInstallPwa,
  onInstallPwa,
  onOpenAuthModal,
  onNavigateHome,
  onSwitchToTeacherMode,
  onSwitchToStudentMode,
  activeTeacherTab = 'sets',
  onTeacherTabChange,
  questionSetsCount = 0,
  submissionsCount = 0,
  unreadFlagsCount = 0,
  onCreateSet
}) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeRole: UserRole = user?.role || 'student';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showTimer = currentView === 'draft' || currentView === 'question-answers';
  const showAutoSaved = ['outline', 'coach', 'review'].includes(currentView);

  const handleSelectRole = (newRole: UserRole) => {
    if (activeRole === newRole) return;
    switchRole(newRole);
    if (newRole === 'teacher' && onSwitchToTeacherMode) {
      onSwitchToTeacherMode();
    } else if (newRole === 'student' && onSwitchToStudentMode) {
      onSwitchToStudentMode();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--bg)]/95 backdrop-blur-xs border-b border-[var(--line)] transition-colors shadow-xs">
      {/* Primary Top Bar */}
      <div className="max-w-[520px] lg:max-w-[960px] mx-auto px-4 sm:px-5 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onNavigateHome}
            className="font-serif text-[24px] sm:text-[28px] font-normal tracking-tight text-[var(--ink)] hover:text-[var(--acc)] transition-colors cursor-pointer text-left"
          >
            ThinkFirst
          </button>

          {isFocusMonitoringActive && (
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--accl)] text-[var(--acc)] font-medium"
              title="Focus Integrity Active"
            >
              <ShieldCheck className="w-3 h-3" />
              Focus Active
            </span>
          )}
        </div>

        {/* Top Role Pill with One-Click Switcher */}
        <div className="flex items-center bg-[var(--card)] p-0.5 sm:p-1 rounded-full border border-[var(--line)] shadow-xs">
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
              activeRole === 'student'
                ? 'bg-[var(--acc)] text-[var(--onacc)] font-semibold shadow-xs'
                : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
            title="Switch to Student Demo"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Student Demo</span>
            <span className="xs:hidden">Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('teacher')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
              activeRole === 'teacher'
                ? 'bg-[var(--acc)] text-[var(--onacc)] font-semibold shadow-xs'
                : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
            title="Switch to Teacher Demo"
          >
            <School className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Teacher Demo</span>
            <span className="xs:hidden">Teacher</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Status pill */}
          {showTimer && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--mut)] bg-[var(--card)] border border-[var(--line)] px-2.5 py-1 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc)] inline-block animate-pulse" />
              <span className="font-medium text-[var(--ink)]">{formatTime(draftSecondsRemaining)}</span>
            </div>
          )}

          {showAutoSaved && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[var(--mut)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc)] inline-block" />
              <span>Auto-saved</span>
            </div>
          )}

          {/* User Account & Role Badge */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-8 px-2 sm:px-2.5 rounded-full bg-[var(--card)] border border-[var(--line)] hover:border-[var(--acc)] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                {user.role === 'teacher' ? (
                  <School className="w-3.5 h-3.5 text-[var(--acc)]" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-[var(--acc)]" />
                )}
                <span className="max-w-[70px] sm:max-w-[110px] truncate font-medium text-[var(--ink)] hidden sm:inline">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--mut)]" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-10 w-52 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xl p-2 z-50 animate-in fade-in text-xs">
                  <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                    <div className="font-semibold text-[var(--ink)] truncate">{user.fullName}</div>
                    <div className="text-[11px] text-[var(--mut)] truncate">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      const nextRole = activeRole === 'teacher' ? 'student' : 'teacher';
                      handleSelectRole(nextRole);
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[var(--bg)] rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>Switch to {activeRole === 'teacher' ? 'Student' : 'Teacher'}</span>
                    <span className="font-mono text-[10px] uppercase text-[var(--mut)]">Switch</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[var(--ambl)] text-[var(--ambt)] rounded-xl flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="h-8 px-2.5 sm:px-3 rounded-full bg-[var(--card)] hover:bg-[var(--accl)] border border-[var(--line)] hover:border-[var(--acc)] text-xs font-semibold text-[var(--ink)] hover:text-[var(--acc)] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Install PWA button */}
          {canInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="p-1.5 sm:p-2 text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--card)] rounded-full transition-colors cursor-pointer"
              title="Install App"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--card)] rounded-full transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dedicated Teacher Navigation Bar (Visible only when in Teacher Mode) */}
      {activeRole === 'teacher' && (
        <div className="w-full bg-[var(--card)]/80 backdrop-blur-xs border-t border-[var(--line)] px-4 sm:px-5 py-2 transition-colors">
          <div className="max-w-[520px] lg:max-w-[960px] mx-auto flex items-center justify-between gap-2">
            {/* Dedicated Teacher Navigation: Question Sets and Submissions */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  if (onTeacherTabChange) onTeacherTabChange('sets');
                  if (onSwitchToTeacherMode) onSwitchToTeacherMode();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTeacherTab === 'sets'
                    ? 'bg-[var(--card)] text-[var(--ink)] font-semibold shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--ink)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[var(--acc)]" />
                <span>Question Sets</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--accl)] text-[var(--acc)] font-bold">
                  {questionSetsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onTeacherTabChange) onTeacherTabChange('submissions');
                  if (onSwitchToTeacherMode) onSwitchToTeacherMode();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTeacherTab === 'submissions'
                    ? 'bg-[var(--card)] text-[var(--ink)] font-semibold shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--ink)]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[var(--acc)]" />
                <span>Submissions</span>
                {submissionsCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--line)] text-[var(--mut)]">
                    {submissionsCount}
                  </span>
                )}
                {unreadFlagsCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--amb)] text-[var(--onacc)] font-bold animate-pulse">
                    {unreadFlagsCount} flagged
                  </span>
                )}
              </button>
            </div>

            {/* Teacher Quick Action */}
            {onCreateSet && (
              <button
                type="button"
                onClick={onCreateSet}
                className="h-8 px-3 rounded-xl bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs hover:opacity-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Set</span>
                <span className="sm:hidden">New Set</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
