import React, { useState } from 'react';
import { countWords } from '../utils/rules.ts';
import { FocusStatus } from '../types/index.ts';
import { AlertCircle, Info, Send, Check } from 'lucide-react';

interface DraftViewProps {
  draftText: string;
  onChangeDraft: (text: string) => void;
  onPasteText: (pastedText: string) => void;
  onInsertHint: () => void;
  recentReturnSeconds: number | null;
  onDismissReturnBanner: () => void;
  focusStatus: FocusStatus;
  onSaveStudentNote: (note: string) => void;
}

export const DraftView: React.FC<DraftViewProps> = ({
  draftText,
  onChangeDraft,
  onPasteText,
  onInsertHint,
  recentReturnSeconds,
  onDismissReturnBanner,
  focusStatus,
  onSaveStudentNote
}) => {
  const [noteInput, setNoteInput] = useState(focusStatus.studentNote || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const wordCount = countWords(draftText);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      onPasteText(text);
    }
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    onSaveStudentNote(noteInput.trim());
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-28">
      {/* Calm Return Banner (Section 10: does not block writing) */}
      {recentReturnSeconds !== null && recentReturnSeconds >= 3 && (
        <div className="mb-4 p-3.5 rounded-[18px] bg-[var(--ambl)] border border-[var(--amb)] text-[var(--ink)] flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-[var(--ambt)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--ambt)]">
                You left this page for {recentReturnSeconds} seconds.
              </span>{' '}
              This is recorded. Keep writing in your own words.
            </div>
          </div>
          <button
            onClick={onDismissReturnBanner}
            className="text-xs text-[var(--mut)] hover:text-[var(--ink)] shrink-0 font-medium px-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Flagged Status Banner with optional 200-char note input */}
      {focusStatus.level === 'flagged' && (
        <div className="mb-4 p-4 rounded-[18px] bg-[var(--card)] border border-[var(--amb)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--ambt)] font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-[var(--amb)]" />
            Focus Notice
          </div>
          <p className="text-xs text-[var(--ink)] mb-3 leading-relaxed">
            This session was flagged for possible outside help and your teacher was notified. You can add an explanation note.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={200}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add explanation note (e.g. Wi-Fi dropped, dictionary check)..."
              className="flex-1 h-10 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] outline-none focus:border-[var(--amb)]"
            />
            <button
              onClick={handleSaveNote}
              disabled={!noteInput.trim() || noteSaved}
              className="h-10 px-3 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-xs font-medium cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              {noteSaved ? <Check className="w-3.5 h-3.5" /> : 'Save'}
            </button>
          </div>
          {noteSaved && (
            <p className="text-[11px] text-[var(--acc)] mt-1 font-mono">Note recorded for your teacher.</p>
          )}
        </div>
      )}

      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-4">
        Draft
      </h2>

      {/* Main draft textarea */}
      <div className="relative bg-[var(--card)] border-[1.5px] border-[var(--line)] focus-within:border-[var(--acc)] rounded-[20px] p-4.5 transition-colors shadow-xs">
        <label htmlFor="draft-textarea" className="sr-only">
          Draft paragraph
        </label>
        <textarea
          id="draft-textarea"
          rows={10}
          value={draftText}
          onChange={(e) => onChangeDraft(e.target.value)}
          onPaste={handlePaste}
          placeholder="Write your first paragraph here. Your words only."
          className="w-full bg-transparent border-0 p-0 text-[16px] text-[var(--ink)] placeholder:text-[var(--mut)] outline-none resize-none leading-relaxed min-h-[220px]"
        />

        {/* Word count and hint action row */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] mt-3">
          <span className="text-xs font-mono text-[var(--mut)]" id="draft-word-count">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>

          <button
            type="button"
            onClick={onInsertHint}
            className="text-xs font-mono text-[var(--mut)] hover:text-[var(--ink)] transition-colors px-2 py-1 rounded cursor-pointer"
          >
            Hint
          </button>
        </div>
      </div>
    </div>
  );
};
