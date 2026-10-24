import React from 'react';
import {
  GraduationCap,
  School,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  PenTool,
  CheckCircle2,
  FileCheck2,
  Award,
  ChevronRight,
  Lock
} from 'lucide-react';

interface LandingPageViewProps {
  onEnterCode: () => void;
  onTeacherLogin: () => void;
  onStudentStart: () => void;
  onExploreDemo: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterCode,
  onTeacherLogin,
  onStudentStart,
  onExploreDemo
}) => {
  return (
    <div className="w-full max-w-[840px] mx-auto pt-6 pb-28 text-[var(--ink)]">
      {/* Editorial Title Case Hero */}
      <section className="text-center mb-14 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--line)] shadow-xs mb-5 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-[var(--acc)] animate-pulse" />
          <span className="text-xs font-mono font-medium text-[var(--ink)] tracking-wider uppercase">
            Academic Integrity · Socratic Thinking Partner
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--ink)] leading-[1.12] mb-5 max-w-[700px] mx-auto">
          Do The Thinking First.
          <span className="block italic text-[var(--acc)] font-normal">
            Cultivate Genuine Writing Voice.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--mut)] max-w-[560px] mx-auto leading-relaxed mb-8">
          ThinkFirst equips students with Socratic inquiry and real-time grammar diagnostics—guiding thought structure and proofreading without ghostwriting drafts.
        </p>

        {/* Confirmed Decision: Split Primary Call-To-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-[460px] mx-auto mb-10">
          <button
            onClick={onEnterCode}
            className="w-full sm:w-auto flex-1 h-13 px-6 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Enter Student Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onTeacherLogin}
            className="w-full sm:w-auto flex-1 h-13 px-6 rounded-full bg-[var(--card)] border-[1.5px] border-[var(--line)] hover:border-[var(--acc)] text-[var(--ink)] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <School className="w-4 h-4 text-[var(--acc)]" />
            <span>Teacher Portal</span>
          </button>
        </div>

        {/* Live Integrity Micro-Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-[var(--mut)] border-t border-b border-[var(--line)] py-3 px-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--acc)]" />
            <span>Zero AI Ghostwriting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--acc)]" />
            <span>Automated Live Clock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-[var(--acc)]" />
            <span>Socratic Grammar Scaffolding</span>
          </div>
        </div>
      </section>

      {/* Core Educational Pillars (Formatted strictly in Title Case) */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--ink)] mb-2">
            Designed For Deep Thought And Academic Honesty
          </h2>
          <p className="text-xs text-[var(--mut)] max-w-[480px] mx-auto">
            Traditional AI writes for students. ThinkFirst asks questions that compel students to formulate and refine their own ideas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center mb-4">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[var(--ink)] mb-1.5">
                Interactive Proofreading &amp; Clarity
              </h3>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                Heuristic checks flag run-on clauses, missing capitalizations, and passive phrasing, prompting students with actionable revision strategies.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center text-[11px] font-mono text-[var(--acc)] font-medium">
              <span>Socratic Rules Engine</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[var(--ink)] mb-1.5">
                Built-In Live Time Verification
              </h3>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                Eliminates manual start time manipulation. Built-in digital clock tracks active seconds and pairs with server synchronization.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center text-[11px] font-mono text-[var(--acc)] font-medium">
              <span>Second-Level Precision</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center mb-4">
                <School className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[var(--ink)] mb-1.5">
                Teacher Set Controls &amp; Closure
              </h3>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                Instructors generate 6-character access codes, view focus timelines, review integrity alerts, and close or reopen assignments instantly.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center text-[11px] font-mono text-[var(--acc)] font-medium">
              <span>On-Demand Set Management</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Socratic Grammar & Critical Thinking Interactive Showcase */}
      <section className="p-6 sm:p-8 rounded-[28px] bg-[var(--card)] border border-[var(--line)] shadow-sm mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--line)]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--acc)] font-semibold mb-1">
              Live Pedagogy In Action
            </div>
            <h3 className="font-serif text-2xl text-[var(--ink)]">
              "What Are You Writing About?" Deconstruction
            </h3>
          </div>
          <button
            onClick={onStudentStart}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-[var(--accl)] text-[var(--acc)] hover:bg-[var(--acc)] hover:text-[var(--onacc)] transition-colors cursor-pointer"
          >
            Try Freeform Thinking →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Socratic Coach Example */}
          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)]">
            <div className="text-[11px] font-mono uppercase text-[var(--mut)] font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--acc)]" />
              <span>Socratic Coaching Exchange</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)]">
                <span className="font-mono text-[10px] text-[var(--mut)] uppercase block font-semibold">Student Draft</span>
                <p className="text-[var(--ink)] mt-0.5">"Renewable energy is super important because it helps everyone and reduces carbon emissions a lot everywhere."</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--accl)] text-[var(--acc)] border border-[var(--acc)]/20">
                <span className="font-mono text-[10px] text-[var(--acc)] uppercase block font-semibold">Coach Feedback (No Ghostwriting)</span>
                <p className="text-[var(--ink)] mt-0.5 font-serif italic">"You noted it reduces carbon emissions a lot. Name one specific municipality or industry where this difference is most noticeable."</p>
              </div>
            </div>
          </div>

          {/* Grammar & Proofreading Checklist Example */}
          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)]">
            <div className="text-[11px] font-mono uppercase text-[var(--mut)] font-semibold mb-2 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-[var(--acc)]" />
              <span>Clarity &amp; Mechanics Checklist</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
                <span>Capitalization of initial statement</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--ink)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
                <span>Sentence length control (under 32 words)</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--ambt)]">
                <div className="w-4 h-4 rounded-full border border-[var(--amb)] bg-[var(--ambl)] flex items-center justify-center text-[10px] font-bold">!</div>
                <span>Prompt: Transform passive phrasing to active voice</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--mut)]">
                <div className="w-4 h-4 rounded-full border border-[var(--line)]" />
                <span>Anchor with concrete statistic or location</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="text-center p-8 rounded-[28px] bg-[var(--card)] border border-[var(--line)] shadow-xs">
        <h3 className="font-serif text-3xl text-[var(--ink)] mb-2">
          Ready To Begin?
        </h3>
        <p className="text-xs text-[var(--mut)] max-w-[420px] mx-auto mb-6">
          Enter an assignment code from your instructor or sign in to configure new question sets.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[400px] mx-auto">
          <button
            onClick={onEnterCode}
            className="w-full sm:w-auto flex-1 h-12 px-6 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-sm cursor-pointer shadow-xs"
          >
            Enter Access Code
          </button>
          <button
            onClick={onTeacherLogin}
            className="w-full sm:w-auto flex-1 h-12 px-6 rounded-full bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--acc)] text-[var(--ink)] font-semibold text-sm cursor-pointer"
          >
            Sign In / Sign Up
          </button>
        </div>
      </section>
    </div>
  );
};
