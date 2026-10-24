import React, { useState } from 'react';
import { QuestionSet, StudentSession } from '../types/index.ts';
import { LiveClock } from './LiveClock.tsx';
import { User, Calendar, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

interface StudentDetailsViewProps {
  questionSet: QuestionSet;
  onSessionStarted: (session: StudentSession) => void;
  onBack: () => void;
}

export const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({
  questionSet,
  onSessionStarted,
  onBack
}) => {
  const [fullName, setFullName] = useState('');
  const [section, setSection] = useState(
    questionSet.sectionsAllowed && questionSet.sectionsAllowed.length > 0
      ? questionSet.sectionsAllowed[0]
      : ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name (first and last) is required.');
      return;
    }
    if (!section.trim()) {
      setErrorMsg('Class section is required.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setId: questionSet.id,
          fullName: fullName.trim(),
          section: section.trim(),
          declaredDate: todayStr,
          declaredTime: formattedTime,
          declaredTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to start session.');
        setIsSubmitting(false);
        return;
      }

      onSessionStarted(data);
    } catch {
      setErrorMsg('Network error. Check connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pt-4 pb-28">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--mut)] hover:text-[var(--ink)] mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-2 text-[11px] font-mono tracking-wider uppercase text-[var(--acc)] font-medium">
        {questionSet.type} · Code: {questionSet.code}
      </div>

      <h1 className="font-serif text-[34px] leading-tight text-[var(--ink)] mb-2">
        Student Verification
      </h1>

      <p className="text-xs text-[var(--mut)] mb-5">
        Confirm your student identity for <strong>{questionSet.title}</strong>.
      </p>

      {/* Built-in Live Clock Display (Auto-stamps time and seconds without manual typing) */}
      <div className="mb-6">
        <LiveClock label="Built-In System Clock" showSeconds={true} />
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[var(--mut)] px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--acc)] shrink-0" />
          <span>Start time is automatically captured with second-level accuracy.</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] text-xs text-[var(--ink)] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[var(--ambt)] shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--mut)] mb-1.5">
            Full Name (First and Last) *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maria Santos"
              autoComplete="name"
              className="w-full h-13 px-4 rounded-xl bg-[var(--card)] border-[1.5px] border-[var(--line)] focus:border-[var(--acc)] text-sm text-[var(--ink)] outline-none"
            />
          </div>
        </div>

        {/* Section */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--mut)] mb-1.5">
            Class Section *
          </label>
          {questionSet.sectionsAllowed && questionSet.sectionsAllowed.length > 0 ? (
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full h-13 px-4 rounded-xl bg-[var(--card)] border-[1.5px] border-[var(--line)] focus:border-[var(--acc)] text-sm text-[var(--ink)] outline-none cursor-pointer"
            >
              {questionSet.sectionsAllowed.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. 10-A or Newton"
              className="w-full h-13 px-4 rounded-xl bg-[var(--card)] border-[1.5px] border-[var(--line)] focus:border-[var(--acc)] text-sm text-[var(--ink)] outline-none"
            />
          )}
        </div>

        {/* Informative transparency notice */}
        <p className="text-[11.5px] text-[var(--mut)] leading-relaxed italic bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)]">
          When you press <strong>Begin Assignment</strong>, your session will be locked to this browser and your focus integrity will be transparently verified.
        </p>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Starting...' : 'Begin Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};
