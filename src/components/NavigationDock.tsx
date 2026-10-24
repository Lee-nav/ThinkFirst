import React from 'react';
import { ScreenView } from '../types/index.ts';
import { PenLine, FileText, PieChart, Users, Sparkles } from 'lucide-react';

interface NavigationDockProps {
  currentView: ScreenView;
  onSelectTab: (view: ScreenView) => void;
  ctaContent?: React.ReactNode;
  unreadTeacherFlagsCount?: number;
  userRole?: 'teacher' | 'student';
}

export const NavigationDock: React.FC<NavigationDockProps> = ({
  currentView,
  onSelectTab,
  ctaContent,
  unreadTeacherFlagsCount = 0,
  userRole = 'student'
}) => {
  // Hide navigation dock on the landing page for uncluttered editorial presence
  if (currentView === 'landing') {
    return null;
  }

  // Teachers use the dedicated top teacher bar for navigation
  if (userRole === 'teacher') {
    if (!ctaContent) return null;
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg)]/95 backdrop-blur-xs border-t border-[var(--line)] pb-[env(safe-area-inset-bottom,0px)] shadow-lg transition-colors">
        <div className="max-w-[520px] mx-auto px-5 pt-3 pb-3">
          {ctaContent}
        </div>
      </div>
    );
  }

  // Determine which tab is considered active
  const isWriteActive = ['home', 'outline', 'coach', 'draft', 'review', 'summary', 'assignment-notice', 'student-details', 'question-answers', 'enter-code'].includes(
    currentView
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg)]/95 backdrop-blur-xs border-t border-[var(--line)] pb-[env(safe-area-inset-bottom,0px)] shadow-lg transition-colors">
      <div className="max-w-[520px] mx-auto">
        {/* Dynamic primary CTA slot */}
        {ctaContent && <div className="px-5 pt-3 pb-2">{ctaContent}</div>}

        {/* Student-only bottom tab bar */}
        <nav className="grid grid-cols-3" aria-label="Student Navigation">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[58px] transition-colors cursor-pointer ${
              isWriteActive ? 'text-[var(--acc)] font-medium' : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
            aria-current={isWriteActive ? 'page' : undefined}
          >
            <PenLine className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] font-sans">Write</span>
          </button>

          <button
            onClick={() => onSelectTab('drafts')}
            className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[58px] transition-colors cursor-pointer ${
              currentView === 'drafts' ? 'text-[var(--acc)] font-medium' : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
            aria-current={currentView === 'drafts' ? 'page' : undefined}
          >
            <FileText className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] font-sans">Drafts</span>
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[58px] transition-colors cursor-pointer ${
              currentView === 'progress' ? 'text-[var(--acc)] font-medium' : 'text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
            aria-current={currentView === 'progress' ? 'page' : undefined}
          >
            <PieChart className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] font-sans">Progress</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
