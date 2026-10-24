import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, PenTool, Lightbulb, Check } from 'lucide-react';

interface ProofreadingChecklistProps {
  text: string;
  onApplyPrompt?: (suggestion: string) => void;
  className?: string;
}

export interface DiagnosticResult {
  hasCapitalStart: boolean;
  hasEndingPunctuation: boolean;
  hasLongRunOn: boolean;
  longSentencePreview?: string;
  hasPassiveVoice: boolean;
  passiveVoicePhrase?: string;
  hasEvidenceAnchor: boolean;
  hasRepeatedWord: boolean;
  repeatedWordText?: string;
  sentenceCount: number;
  wordCount: number;
}

export function runProofreadingDiagnostics(text: string): DiagnosticResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      hasCapitalStart: false,
      hasEndingPunctuation: false,
      hasLongRunOn: false,
      hasPassiveVoice: false,
      hasEvidenceAnchor: false,
      hasRepeatedWord: false,
      sentenceCount: 0,
      wordCount: 0
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const sentences = trimmed
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.trim().length > 0);

  // 1. Capital start
  const firstChar = trimmed.charAt(0);
  const hasCapitalStart = firstChar === firstChar.toUpperCase() && /[A-Z]/.test(firstChar);

  // 2. Ending punctuation
  const lastChar = trimmed.charAt(trimmed.length - 1);
  const hasEndingPunctuation = ['.', '?', '!', '"', "'"].includes(lastChar);

  // 3. Run-on sentence (> 32 words without punctuation)
  let hasLongRunOn = false;
  let longSentencePreview: string | undefined;
  for (const s of sentences) {
    const sWords = s.split(/\s+/).filter(Boolean);
    if (sWords.length > 32) {
      hasLongRunOn = true;
      longSentencePreview = sWords.slice(0, 8).join(' ') + '...';
      break;
    }
  }

  // 4. Passive voice indicators: is/are/was/were/been/being + past participle ending in 'ed' or 'en'
  const passiveRegex = /\b(is|are|was|were|been|being|be)\s+([a-z]+ed|[a-z]+en)\b/i;
  const passiveMatch = trimmed.match(passiveRegex);
  const hasPassiveVoice = !!passiveMatch;
  const passiveVoicePhrase = passiveMatch ? passiveMatch[0] : undefined;

  // 5. Evidence Anchor (Numbers, percentages, proper names, quotation marks)
  const hasNumber = /\b\d+(\.\d+)?%?\b/.test(trimmed);
  const hasQuotes = /["“][^"”]+["”]/.test(trimmed);
  const hasProperNoun = /\b[A-Z][a-z]{2,}\b/.test(trimmed.slice(1)); // Capitalized word after start
  const hasEvidenceAnchor = hasNumber || hasQuotes || hasProperNoun;

  // 6. Repeated consecutive words (e.g. "the the")
  const repeatedRegex = /\b([a-zA-Z]{2,})\s+\1\b/i;
  const repeatedMatch = trimmed.match(repeatedRegex);
  const hasRepeatedWord = !!repeatedMatch;
  const repeatedWordText = repeatedMatch ? repeatedMatch[0] : undefined;

  return {
    hasCapitalStart,
    hasEndingPunctuation,
    hasLongRunOn,
    longSentencePreview,
    hasPassiveVoice,
    passiveVoicePhrase,
    hasEvidenceAnchor,
    hasRepeatedWord,
    repeatedWordText,
    sentenceCount: sentences.length,
    wordCount: words.length
  };
}

export const ProofreadingChecklist: React.FC<ProofreadingChecklistProps> = ({
  text,
  onApplyPrompt,
  className = ''
}) => {
  const diag = useMemo(() => runProofreadingDiagnostics(text), [text]);

  // Scoring heuristic out of 100
  const score = useMemo(() => {
    if (diag.wordCount === 0) return 0;
    let s = 40;
    if (diag.hasCapitalStart) s += 15;
    if (diag.hasEndingPunctuation) s += 15;
    if (!diag.hasLongRunOn) s += 10;
    if (!diag.hasRepeatedWord) s += 10;
    if (diag.hasEvidenceAnchor) s += 10;
    return Math.min(100, s);
  }, [diag]);

  return (
    <div className={`rounded-2xl bg-[var(--card)] border border-[var(--line)] p-4 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[var(--acc)]" />
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ink)]">
            Proofreading &amp; Clarity Checklist
          </h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[var(--mut)]">Clarity Score:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md ${
              score >= 80
                ? 'bg-[var(--accl)] text-[var(--acc)]'
                : score >= 50
                ? 'bg-[var(--ambl)] text-[var(--ambt)]'
                : 'bg-[var(--line)] text-[var(--mut)]'
            }`}
          >
            {score}/100
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5 text-xs">
        {/* Capital start */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {diag.hasCapitalStart ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-[var(--line)] bg-[var(--bg)]" />
            )}
          </div>
          <div className="flex-1">
            <span className={`font-medium ${diag.hasCapitalStart ? 'text-[var(--ink)]' : 'text-[var(--mut)]'}`}>
              Capitalize First Letter of Sentence
            </span>
            {!diag.hasCapitalStart && diag.wordCount > 0 && (
              <p className="text-[11px] text-[var(--ambt)] mt-0.5 font-serif italic">
                Socratic Tip: Begin with an uppercase letter to signal a new independent thought.
              </p>
            )}
          </div>
        </div>

        {/* Ending Punctuation */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {diag.hasEndingPunctuation ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-[var(--line)] bg-[var(--bg)]" />
            )}
          </div>
          <div className="flex-1">
            <span className={`font-medium ${diag.hasEndingPunctuation ? 'text-[var(--ink)]' : 'text-[var(--mut)]'}`}>
              Conclude With Strong Punctuation (., ?, !)
            </span>
            {!diag.hasEndingPunctuation && diag.wordCount > 0 && (
              <p className="text-[11px] text-[var(--ambt)] mt-0.5 font-serif italic">
                Socratic Tip: End your thought with a period or question mark so the reader knows where to pause.
              </p>
            )}
          </div>
        </div>

        {/* Run-On Sentence Guard */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {!diag.hasLongRunOn ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[var(--ambt)]" />
            )}
          </div>
          <div className="flex-1">
            <span className={`font-medium ${!diag.hasLongRunOn ? 'text-[var(--ink)]' : 'text-[var(--ambt)] font-semibold'}`}>
              Sentence Clarity &amp; Length Control
            </span>
            {diag.hasLongRunOn && (
              <p className="text-[11px] text-[var(--ambt)] mt-0.5 font-serif italic">
                Notice: One of your sentences exceeds 32 words ({diag.longSentencePreview}). Where could you divide it into two punchy claims?
              </p>
            )}
          </div>
        </div>

        {/* Active vs Passive Voice */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {!diag.hasPassiveVoice ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-[var(--amb)] bg-[var(--ambl)] flex items-center justify-center text-[10px] text-[var(--ambt)] font-bold">
                !
              </div>
            )}
          </div>
          <div className="flex-1">
            <span className={`font-medium ${!diag.hasPassiveVoice ? 'text-[var(--ink)]' : 'text-[var(--ink)]'}`}>
              Active Voice &amp; Direct Phrasing
            </span>
            {diag.hasPassiveVoice && (
              <p className="text-[11px] text-[var(--mut)] mt-0.5 font-serif italic">
                Detected passive phrasing: <strong className="font-mono text-[var(--ink)]">"{diag.passiveVoicePhrase}"</strong>. Can you place the actor (who is doing the action) at the front of the sentence?
              </p>
            )}
          </div>
        </div>

        {/* Evidence Anchor */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {diag.hasEvidenceAnchor ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--acc)]" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-[var(--line)] bg-[var(--bg)]" />
            )}
          </div>
          <div className="flex-1">
            <span className={`font-medium ${diag.hasEvidenceAnchor ? 'text-[var(--ink)]' : 'text-[var(--mut)]'}`}>
              Concrete Anchor (Specific Number, Name, or Citation)
            </span>
            {!diag.hasEvidenceAnchor && diag.wordCount >= 10 && (
              <p className="text-[11px] text-[var(--mut)] mt-0.5 font-serif italic">
                Socratic Tip: Ground your argument with a real location, statistic, or named example.
              </p>
            )}
          </div>
        </div>

        {/* Repeated Words Check */}
        {diag.hasRepeatedWord && (
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[var(--ambl)] border border-[var(--amb)]">
            <AlertCircle className="w-4 h-4 text-[var(--ambt)] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[var(--ambt)]">
              Accidental repetition detected: <strong>"{diag.repeatedWordText}"</strong>. Remove duplicate word.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
