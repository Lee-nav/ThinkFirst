import React from 'react';
import { WritingType, SavedDraft, QuestionSet } from '../types/index.ts';
import { KeyRound, ChevronRight, BookOpen } from 'lucide-react';

interface HomeViewProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  writingType: WritingType;
  onWritingTypeChange: (type: WritingType) => void;
  unfinishedDraft: SavedDraft | null;
  onResumeDraft: () => void;
  activeQuestionSets: QuestionSet[];
  onSelectSet: (set: QuestionSet) => void;
  onStartThinking: () => void;
  onEnterCodeClick: () => void;
}

const TASK_CHIPS: WritingType[] = ['Essay', 'Report', 'Reflection'];

export const HomeView: React.FC<HomeViewProps> = ({
  topic,
  onTopicChange,
  writingType,
  onWritingTypeChange,
  unfinishedDraft,
  onResumeDraft,
  activeQuestionSets,
  onSelectSet,
  onStartThinking,
  onEnterCodeClick
}) => {
  const isStartDisabled = topic.trim().length < 3;

  return (
    <div className="w-full max-w-[520px] mx-auto pt-2 pb-28">
      {/* Prominent "Enter a code" button (Section 4.2) */}
      <button
        onClick={onEnterCodeClick}
        className="w-full mb-5 p-4 rounded-[20px] bg-[var(--card)] border-2 border-[var(--acc)] hover:bg-[var(--accl)]/50 transition-all flex items-center justify-between cursor-pointer shadow-xs group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[15px] font-semibold text-[var(--ink)] block">
              Enter a code
            </span>
            <span className="text-xs text-[var(--mut)]">
              Answer an assignment from your teacher
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--acc)] group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Resume unfinished work (Zeigarnik Effect) */}
      {unfinishedDraft && !unfinishedDraft.done && (
        <button
          onClick={onResumeDraft}
          className="w-full text-left bg-[var(--accl)] hover:opacity-95 transition-opacity rounded-[20px] p-4.5 mb-5 cursor-pointer block border border-[var(--acc)]/20"
        >
          <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--acc)] font-semibold mb-1">
            Resume
          </div>
          <div className="text-[17px] font-semibold text-[var(--ink)] line-clamp-1 mb-1">
            {unfinishedDraft.topic}
          </div>
          <div className="text-xs text-[var(--mut)] mb-2.5">
            Step {unfinishedDraft.step} of 4 · {unfinishedDraft.type}
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--card)] overflow-hidden">
            <div
              className="h-full bg-[var(--acc)] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(12, unfinishedDraft.step * 25 - 10)}%` }}
            />
          </div>
        </button>
      )}

      {/* Open Class Sets banner for students */}
      {activeQuestionSets.filter((s) => s.status === 'open').length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--mut)] mb-2 flex items-center justify-between">
            <span>Open Question Sets</span>
            <span className="text-[var(--acc)]">
              {activeQuestionSets.filter((s) => s.status === 'open').length} available
            </span>
          </div>
          <div className="space-y-2">
            {activeQuestionSets
              .filter((s) => s.status === 'open')
              .slice(0, 2)
              .map((set) => (
              <button
                key={set.id}
                onClick={() => onSelectSet(set)}
                className="w-full text-left p-3.5 rounded-[18px] bg-[var(--card)] border border-[var(--line)] hover:border-[var(--acc)] transition-colors flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="pr-3">
                  <div className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                    {set.title}
                  </div>
                  <div className="text-xs text-[var(--mut)] line-clamp-1 mt-0.5">
                    Code: <strong className="font-mono text-[var(--ink)]">{set.code}</strong> · {set.type} · {set.timeLimitMinutes || 15}m
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--mut)] group-hover:text-[var(--acc)] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Headline (Instrument Serif) */}
      <h1 className="font-serif text-[42px] leading-[1.08] tracking-tight text-[var(--ink)] mb-6">
        What are you<br />writing about?
      </h1>

      {/* Topic input */}
      <div className="mb-4">
        <label htmlFor="topic-input" className="sr-only">
          Topic
        </label>
        <input
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isStartDisabled) {
              onStartThinking();
            }
          }}
          placeholder="Type your topic"
          autoComplete="off"
          className="w-full h-14 px-5 rounded-[18px] bg-[var(--card)] border-[1.5px] border-[var(--line)] focus:border-[var(--acc)] text-[16px] text-[var(--ink)] placeholder:text-[var(--mut)] outline-none transition-colors shadow-xs"
        />
      </div>

      {/* Task chips (Hick's Law: 3 choices, not ten) */}
      <div className="flex gap-2 flex-wrap mb-6" role="group" aria-label="Writing Type">
        {TASK_CHIPS.map((type) => {
          const isSelected = writingType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onWritingTypeChange(type)}
              aria-pressed={isSelected}
              className={`h-11 px-5 rounded-full text-sm font-medium border-[1.5px] transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] shadow-xs'
                  : 'bg-[var(--card)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--mut)]'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[var(--mut)] text-center">
        ThinkFirst guides your thinking step-by-step. It never writes sentences for you.
      </p>
    </div>
  );
};
