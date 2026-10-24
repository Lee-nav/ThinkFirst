import React from 'react';
import { SavedDraft } from '../types/index.ts';
import { countWords } from '../utils/rules.ts';
import { ChevronRight, Clock, CheckCircle } from 'lucide-react';

interface DraftsViewProps {
  currentDraft: SavedDraft | null;
  history: SavedDraft[];
  onResumeDraft: (draft: SavedDraft) => void;
}

export const DraftsView: React.FC<DraftsViewProps> = ({
  currentDraft,
  history,
  onResumeDraft
}) => {
  const hasCurrent = currentDraft && currentDraft.topic && !currentDraft.done;

  return (
    <div className="w-full max-w-[520px] mx-auto pt-4 pb-28">
      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-4">
        Drafts
      </h2>

      <div className="space-y-3">
        {/* In-progress piece */}
        {hasCurrent && (
          <button
            onClick={() => onResumeDraft(currentDraft)}
            className="w-full text-left p-4 rounded-[18px] bg-[var(--card)] border-[1.5px] border-[var(--acc)] hover:bg-[var(--card)]/90 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div>
              <div className="text-[17px] font-semibold text-[var(--ink)] line-clamp-1 mb-1">
                {currentDraft.topic}
              </div>
              <div className="text-xs text-[var(--mut)] flex items-center gap-2">
                <span className="text-[var(--acc)] font-medium">In progress</span>
                <span>·</span>
                <span>{currentDraft.type}</span>
                <span>·</span>
                <span>{countWords(currentDraft.draft)} words</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--acc)] group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Finished pieces */}
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onResumeDraft(item)}
            className="w-full text-left p-4 rounded-[18px] bg-[var(--card)] border border-[var(--line)] hover:border-[var(--mut)] transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div>
              <div className="text-[17px] font-semibold text-[var(--ink)] line-clamp-1 mb-1">
                {item.topic}
              </div>
              <div className="text-xs text-[var(--mut)] flex items-center gap-2">
                <span className="flex items-center gap-1 text-[var(--acc)]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Done
                </span>
                <span>·</span>
                <span>{item.result?.percentYourWords ?? 90}% your words</span>
                <span>·</span>
                <span>{countWords(item.draft)} words</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--mut)] group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}

        {!hasCurrent && history.length === 0 && (
          <p className="text-sm text-[var(--mut)] pt-2">
            Nothing here yet. Start with a topic to create your first piece.
          </p>
        )}
      </div>
    </div>
  );
};
