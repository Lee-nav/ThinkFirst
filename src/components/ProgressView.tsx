import React from 'react';
import { SavedDraft } from '../types/index.ts';

interface ProgressViewProps {
  history: SavedDraft[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ history }) => {
  const finishedCount = history.length;
  const avgPercent = finishedCount
    ? Math.round(
        history.reduce((acc, h) => acc + (h.result?.percentYourWords ?? 90), 0) / finishedCount
      )
    : 0;
  const totalWords = history.reduce(
    (acc, h) => acc + (h.result?.studentWords ?? 0),
    0
  );

  return (
    <div className="w-full max-w-[520px] mx-auto pt-4 pb-28">
      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-6">
        Progress
      </h2>

      {finishedCount > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-[18px] bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <span className="font-serif text-[36px] leading-tight text-[var(--ink)] block">
                {finishedCount}
              </span>
              <span className="text-[10.5px] font-mono tracking-wider uppercase text-[var(--mut)]">
                Finished
              </span>
            </div>

            <div className="p-4 rounded-[18px] bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <span className="font-serif text-[36px] leading-tight text-[var(--acc)] block">
                {avgPercent}%
              </span>
              <span className="text-[10.5px] font-mono tracking-wider uppercase text-[var(--mut)]">
                Your words
              </span>
            </div>

            <div className="p-4 rounded-[18px] bg-[var(--card)] border border-[var(--line)] shadow-xs">
              <span className="font-serif text-[36px] leading-tight text-[var(--ink)] block">
                {totalWords}
              </span>
              <span className="text-[10.5px] font-mono tracking-wider uppercase text-[var(--mut)]">
                Words
              </span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-[var(--card)] border border-[var(--line)]">
            <h3 className="text-sm font-semibold text-[var(--ink)] mb-2">
              Writing Independence
            </h3>
            <p className="text-xs text-[var(--mut)] leading-relaxed">
              ThinkFirst measures how much of your drafts come directly from your own thoughts rather than passive generation. Keep your percent above 80% to build resilient thinking habits.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-[20px] bg-[var(--card)] border border-[var(--line)] text-center">
          <p className="text-sm text-[var(--mut)] mb-0">
            Nothing to show yet. Finish a piece and your numbers appear here.
          </p>
        </div>
      )}
    </div>
  );
};
