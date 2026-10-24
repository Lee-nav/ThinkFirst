import React from 'react';
import { formatDuration } from '../utils/rules.ts';
import { CheckCircle2, ShieldAlert, ShieldCheck, Clock, Download, ArrowLeft } from 'lucide-react';

interface ReceiptData {
  id: string;
  fullName: string;
  section: string;
  setTitle: string;
  code: string;
  recordedStartAt: number;
  finishedAt: number;
  durationSeconds: number;
  durationFormatted: string;
  timeLimitMinutes?: number;
  withinLimit: boolean;
  focusTimesLeft: number;
  focusSecondsAway: number;
  focusFlagLevel: string;
  wordsWrittenPercent: number;
  isFlagged: boolean;
}

interface ReceiptViewProps {
  receipt: ReceiptData;
  onDone: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt, onDone }) => {
  const startTimeStr = new Date(receipt.recordedStartAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const finishTimeStr = new Date(receipt.finishedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateStr = new Date(receipt.finishedAt).toLocaleDateString();

  return (
    <div className="w-full max-w-[520px] mx-auto pt-4 pb-28">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-[34px] leading-tight text-[var(--ink)] mb-1">
          Submission Receipt
        </h1>
        <p className="text-xs text-[var(--mut)]">
          You can take a screenshot of this receipt for your records.
        </p>
      </div>

      {/* Official Receipt Card */}
      <div className="bg-[var(--card)] border-2 border-[var(--line)] rounded-[24px] p-6 shadow-md mb-6 relative overflow-hidden">
        {/* Receipt Header */}
        <div className="border-b border-[var(--line)] pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-serif text-2xl font-bold text-[var(--ink)] block">
                ThinkFirst
              </span>
              <span className="text-[11px] font-mono text-[var(--mut)] uppercase tracking-wider">
                Official Time Record
              </span>
            </div>
            <span className="text-sm font-mono font-bold px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)]">
              {receipt.code}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3.5 text-xs text-[var(--ink)]">
          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Student</span>
            <span className="font-semibold">{receipt.fullName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Section</span>
            <span className="font-mono font-medium">{receipt.section}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Assignment</span>
            <span className="font-medium text-right max-w-[240px] truncate">{receipt.setTitle}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Date</span>
            <span className="font-mono">{dateStr}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Start Time</span>
            <span className="font-mono">{startTimeStr}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Finish Time</span>
            <span className="font-mono font-semibold">{finishTimeStr}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Duration</span>
            <div className="text-right">
              <span className="font-mono font-bold block">{receipt.durationFormatted}</span>
              <span
                className={`text-[10.5px] font-mono font-medium ${
                  receipt.withinLimit ? 'text-[var(--acc)]' : 'text-[var(--ambt)]'
                }`}
              >
                {receipt.withinLimit
                  ? `Within limit (${receipt.timeLimitMinutes || 15}m)`
                  : 'Over time'}
              </span>
            </div>
          </div>

          <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
            <span className="text-[var(--mut)]">Words Independence</span>
            <span className="font-mono font-bold text-[var(--acc)]">
              {receipt.wordsWrittenPercent}% student words
            </span>
          </div>

          {/* Focus Summary */}
          <div className="pt-2">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--mut)] block mb-1.5 font-semibold">
              Focus Integrity Summary
            </span>
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {receipt.isFlagged ? (
                  <ShieldAlert className="w-4 h-4 text-[var(--amb)]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[var(--acc)]" />
                )}
                <div>
                  <span className="font-semibold block text-[11.5px]">
                    {receipt.focusTimesLeft} {receipt.focusTimesLeft === 1 ? 'leave' : 'leaves'} (
                    {formatDuration(receipt.focusSecondsAway)} away)
                  </span>
                  <span className="text-[10.5px] text-[var(--mut)]">
                    {receipt.isFlagged
                      ? 'Flagged for possible outside help'
                      : 'Integrity verified clear'}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  receipt.isFlagged
                    ? 'bg-[var(--amb)] text-[var(--onacc)]'
                    : 'bg-[var(--accl)] text-[var(--acc)]'
                }`}
              >
                {receipt.isFlagged ? 'Flagged' : 'Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* Flag Notice Warning if Flagged */}
        {receipt.isFlagged && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] text-[11px] text-[var(--ink)] leading-relaxed">
            <strong className="text-[var(--ambt)] block font-semibold mb-0.5">Notice:</strong>
            A focus notice regarding page leaves was automatically reported to your teacher along with your start and finish times.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={onDone}
          className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};
