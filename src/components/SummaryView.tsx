import React, { useEffect, useState } from 'react';
import { SessionResult, FocusEvent } from '../types/index.ts';
import { ShieldCheck, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface SummaryViewProps {
  result: SessionResult;
  isShared: boolean;
  onShareWithTeacher: (includeDraftText: boolean) => void;
  onWriteAnother: () => void;
  events?: FocusEvent[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  result,
  isShared,
  onShareWithTeacher,
  onWriteAnother,
  events = []
}) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [includeDraftText, setIncludeDraftText] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const targetPct = result.percentYourWords;

  // Animate count-up center number and SVG ring
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setAnimatedPercent(Math.round(progress * targetPct));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [targetPct]);

  // Circumference for r=80 is 2 * PI * 80 ~= 502.65
  const circumference = 502.65;
  const greenStrokeDash = (animatedPercent / 100) * circumference;

  return (
    <div className="w-full max-w-[520px] mx-auto pb-32">
      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-4 text-center">
        Summary
      </h2>

      {/* SVG Ring Chart (Peak-End Rule) */}
      <div className="relative w-56 h-56 mx-auto mb-4">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden="true">
          {/* Amber background ring for suggestions & external words */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--amb)"
            strokeWidth="20"
            className="opacity-70"
          />
          {/* Green progress ring for student words */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--acc)"
            strokeWidth="20"
            strokeDasharray={`${greenStrokeDash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-75 ease-out"
          />
        </svg>

        {/* Center count-up percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-[56px] leading-none font-normal text-[var(--ink)]">
            {animatedPercent}%
          </span>
          <span className="text-xs font-sans text-[var(--mut)] mt-1">your words</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 text-xs text-[var(--mut)] mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--acc)] inline-block" />
          Your words ({result.studentWords}w)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--amb)] inline-block" />
          Suggestions &amp; external ({result.suggestionWords + result.pastedWords}w)
        </span>
      </div>

      {/* Thinking Complete Card */}
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-5 mb-4 shadow-xs">
        <div className="text-[17px] font-semibold text-[var(--ink)] mb-1">
          Thinking complete
        </div>
        <div className="text-xs text-[var(--mut)] font-mono">
          {result.studentWords} words written · {result.minutes} min · {result.hintsUsed} hints used
        </div>

        {/* Focus Integrity Row */}
        <div className="mt-4 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--mut)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--acc)]" />
              Focus Integrity
            </span>
            <span
              className={`font-mono font-medium px-2 py-0.5 rounded-full text-[11px] ${
                result.focusStatus.level === 'flagged'
                  ? 'bg-[var(--ambl)] text-[var(--ambt)] border border-[var(--amb)]'
                  : result.focusStatus.level === 'notice'
                  ? 'border border-[var(--amb)] text-[var(--ambt)]'
                  : 'bg-[var(--accl)] text-[var(--acc)]'
              }`}
            >
              {result.focusStatus.level === 'flagged'
                ? 'Flagged'
                : result.focusStatus.level === 'notice'
                ? 'Notice'
                : 'Clear'}
            </span>
          </div>

          <div className="text-[11px] text-[var(--mut)] mt-1 flex justify-between">
            <span>{result.focusStatus.leavesCount} leaves</span>
            <span>{result.focusStatus.totalSecondsAway}s away total</span>
          </div>

          {result.focusStatus.studentNote && (
            <div className="mt-2 text-xs p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]">
              <span className="font-semibold text-[var(--mut)] block text-[10px] uppercase font-mono mb-0.5">Your Note:</span>
              {result.focusStatus.studentNote}
            </div>
          )}

          {/* Student event timeline toggle */}
          {events.length > 0 && (
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="mt-3 text-xs text-[var(--acc)] font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showTimeline ? 'Hide your focus timeline' : 'View your focus timeline'}
            </button>
          )}

          {showTimeline && (
            <div className="mt-2.5 space-y-1.5 text-xs font-mono text-[var(--mut)] p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              {events.map((evt, i) => (
                <div key={i} className="flex justify-between py-0.5 border-b border-[var(--line)]/50 last:border-0">
                  <span className="capitalize">{evt.type === 'left' ? `Left for ${evt.secondsAway}s` : evt.type}</span>
                  <span className="text-[10px]">{new Date(evt.deviceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Closing positive feedback message */}
      <p className="text-center text-sm text-[var(--mut)] mb-6">
        {result.percentYourWords >= 80
          ? 'You wrote it. The thinking was yours.'
          : 'Good work. Next time, try fewer hints and outside pastes.'}
      </p>

      {/* Privacy choice: Share draft text option (default false per Section 7/12) */}
      <div className="mb-4 p-3.5 rounded-xl bg-[var(--card)] border border-[var(--line)]">
        <label className="flex items-center gap-2.5 text-xs text-[var(--ink)] cursor-pointer">
          <input
            type="checkbox"
            checked={includeDraftText}
            onChange={(e) => setIncludeDraftText(e.target.checked)}
            className="w-4 h-4 rounded text-[var(--acc)] focus:ring-[var(--acc)]"
          />
          <span>Include my draft text when sharing with teacher (optional)</span>
        </label>
      </div>
    </div>
  );
};
