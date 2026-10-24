import React, { useState } from 'react';
import { QuestionSet, StudentSession } from '../types/index.ts';
import { countWords } from '../utils/rules.ts';
import { ProofreadingChecklist } from './ProofreadingChecklist.tsx';
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BookOpen,
  Send,
  PenTool,
  Compass
} from 'lucide-react';

interface QuestionAnswersViewProps {
  questionSet: QuestionSet;
  session: StudentSession;
  onUpdateAnswers: (answers: Record<string, string>) => void;
  onSubmit: () => void;
}

interface ThinkingScaffold {
  mainPoint: string;
  evidence: string;
  counterOrImpact: string;
}

export const QuestionAnswersView: React.FC<QuestionAnswersViewProps> = ({
  questionSet,
  session,
  onUpdateAnswers,
  onSubmit
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(session.answers || {});
  const [scaffolds, setScaffolds] = useState<Record<number, ThinkingScaffold>>({});
  const [activePromptIdx, setActivePromptIdx] = useState<number>(0);
  const [showThinkingScaffold, setShowThinkingScaffold] = useState<Record<number, boolean>>({ 0: true });
  const [coachMessages, setCoachMessages] = useState<Record<number, Array<{ role: 'coach' | 'student'; text: string }>>>({});
  const [coachInputs, setCoachInputs] = useState<Record<number, string>>({});
  const [loadingCoachFor, setLoadingCoachFor] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'answer' | 'checklist' | 'coach'>('answer');

  const prompts =
    questionSet.prompts && questionSet.prompts.length > 0
      ? questionSet.prompts
      : [questionSet.title];

  const handleAnswerChange = (promptIdx: number, text: string) => {
    const updated = { ...answers, [promptIdx]: text };
    setAnswers(updated);
    onUpdateAnswers(updated);
  };

  const handleScaffoldChange = (promptIdx: number, field: keyof ThinkingScaffold, val: string) => {
    setScaffolds((prev) => {
      const current = prev[promptIdx] || { mainPoint: '', evidence: '', counterOrImpact: '' };
      const updated = { ...current, [field]: val };

      // If answer is empty or student is using scaffold, suggest combining them
      return { ...prev, [promptIdx]: updated };
    });
  };

  const handleApplyScaffoldToAnswer = (promptIdx: number) => {
    const sc = scaffolds[promptIdx];
    if (!sc) return;
    const pieces = [sc.mainPoint.trim(), sc.evidence.trim(), sc.counterOrImpact.trim()].filter(Boolean);
    if (pieces.length === 0) return;

    const synthesized = pieces.join(' ');
    handleAnswerChange(promptIdx, synthesized);
  };

  const handleSendCoachQuestion = async (promptIdx: number, customMessage?: string) => {
    const promptText = prompts[promptIdx];
    const currentAnswer = answers[promptIdx] || '';
    const userMsg = customMessage || coachInputs[promptIdx] || 'Can you help me improve the clarity and grammar of my response?';

    if (!userMsg.trim()) return;

    // Append student message
    setCoachMessages((prev) => ({
      ...prev,
      [promptIdx]: [...(prev[promptIdx] || []), { role: 'student', text: userMsg }]
    }));
    setCoachInputs((prev) => ({ ...prev, [promptIdx]: '' }));
    setLoadingCoachFor(promptIdx);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: promptText,
          mainPoint: currentAnswer,
          studentMessage: userMsg,
          stage: 1
        })
      });
      const data = await response.json();
      setCoachMessages((prev) => ({
        ...prev,
        [promptIdx]: [
          ...(prev[promptIdx] || []),
          {
            role: 'coach',
            text: data.reply || 'What is one specific detail or grammar rule you could clarify next?'
          }
        ]
      }));
    } catch {
      setCoachMessages((prev) => ({
        ...prev,
        [promptIdx]: [
          ...(prev[promptIdx] || []),
          {
            role: 'coach',
            text: 'How could you connect your subject and action verb more directly to make the sentence clearer?'
          }
        ]
      }));
    } finally {
      setLoadingCoachFor(null);
    }
  };

  // Quick Socratic grammar coaching prompts
  const quickGrammarPrompts = [
    'Help me proofread for run-on sentences',
    'How do I make my verbs more active?',
    'Is my main idea clearly stated?',
    'What punctuation can strengthen this?'
  ];

  const currentAnswerText = answers[activePromptIdx] || '';
  const currentWordCount = countWords(currentAnswerText);
  const currentScaffold = scaffolds[activePromptIdx] || { mainPoint: '', evidence: '', counterOrImpact: '' };

  const allAnswered = prompts.every((_, idx) => countWords(answers[idx] || '') >= 3);

  return (
    <div className="w-full max-w-[640px] lg:max-w-[760px] mx-auto pt-2 pb-32">
      {/* Set Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--acc)] font-medium">
          {questionSet.type} Set · Code: {questionSet.code}
        </span>
        <span className="text-xs font-mono text-[var(--mut)]">
          Prompt {activePromptIdx + 1} of {prompts.length}
        </span>
      </div>

      <h1 className="font-serif text-[28px] sm:text-[32px] leading-tight text-[var(--ink)] mb-2">
        {questionSet.title}
      </h1>

      {questionSet.instructions && (
        <p className="text-xs text-[var(--mut)] mb-5 p-3 rounded-xl bg-[var(--card)] border border-[var(--line)]">
          {questionSet.instructions}
        </p>
      )}

      {/* Prompt Selector Pills */}
      {prompts.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {prompts.map((_, pIdx) => {
            const hasWords = countWords(answers[pIdx] || '') >= 3;
            const isActive = activePromptIdx === pIdx;
            return (
              <button
                key={pIdx}
                onClick={() => setActivePromptIdx(pIdx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[var(--acc)] text-[var(--onacc)] font-semibold shadow-xs'
                    : hasWords
                    ? 'bg-[var(--accl)] text-[var(--acc)] border border-[var(--acc)]/30'
                    : 'bg-[var(--card)] text-[var(--mut)] border border-[var(--line)]'
                }`}
              >
                <span>Question {pIdx + 1}</span>
                {hasWords && <CheckCircle2 className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Answering Box for Active Prompt */}
      <div className="rounded-[24px] bg-[var(--card)] border border-[var(--line)] p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] font-semibold">
            Prompt {activePromptIdx + 1}
          </span>
          <span className="text-xs font-mono text-[var(--mut)] font-medium">
            {currentWordCount} words written
          </span>
        </div>

        <p className="text-base sm:text-lg font-medium text-[var(--ink)] mb-4 leading-relaxed">
          {prompts[activePromptIdx]}
        </p>

        {/* Section 1: Integrated "What Are You Writing About?" Thinking Scaffold */}
        <div className="mb-5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--acc)]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ink)]">
                What Are You Writing About? — Critical Thinking Scaffold
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setShowThinkingScaffold((prev) => ({
                  ...prev,
                  [activePromptIdx]: !prev[activePromptIdx]
                }))
              }
              className="text-xs font-mono text-[var(--mut)] hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer"
            >
              {showThinkingScaffold[activePromptIdx] ? (
                <>
                  <span>Hide Scaffold</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Show Scaffold</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {showThinkingScaffold[activePromptIdx] && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-[11.5px] text-[var(--mut)] leading-relaxed italic">
                Deconstruct your thoughts before drafting the complete answer:
              </p>

              {/* 1. Main Idea / Claim */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--mut)] mb-1">
                  1. Core Answer / Main Claim
                </label>
                <input
                  type="text"
                  value={currentScaffold.mainPoint}
                  onChange={(e) =>
                    handleScaffoldChange(activePromptIdx, 'mainPoint', e.target.value)
                  }
                  placeholder="In one sentence, what is your direct answer?"
                  className="w-full h-10 px-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none focus:border-[var(--acc)]"
                />
              </div>

              {/* 2. Specific Evidence */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--mut)] mb-1">
                  2. Concrete Evidence / Real Example
                </label>
                <input
                  type="text"
                  value={currentScaffold.evidence}
                  onChange={(e) =>
                    handleScaffoldChange(activePromptIdx, 'evidence', e.target.value)
                  }
                  placeholder="Name a place, statistic, study, or observation."
                  className="w-full h-10 px-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none focus:border-[var(--acc)]"
                />
              </div>

              {/* 3. Impact or Counter-Argument */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--mut)] mb-1">
                  3. Impact / Why This Matters
                </label>
                <input
                  type="text"
                  value={currentScaffold.counterOrImpact}
                  onChange={(e) =>
                    handleScaffoldChange(activePromptIdx, 'counterOrImpact', e.target.value)
                  }
                  placeholder="Why does this matter, or how would you respond to a skeptic?"
                  className="w-full h-10 px-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none focus:border-[var(--acc)]"
                />
              </div>

              {(currentScaffold.mainPoint || currentScaffold.evidence) && (
                <button
                  type="button"
                  onClick={() => handleApplyScaffoldToAnswer(activePromptIdx)}
                  className="text-xs font-medium text-[var(--acc)] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Combine scaffold points into my answer draft
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Tabbed Workspace: Complete Answer Draft vs Proofreading Checklist vs Socratic Coach */}
        <div className="flex border-b border-[var(--line)] mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('answer')}
            className={`pb-2.5 px-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              activeTab === 'answer'
                ? 'border-[var(--acc)] text-[var(--acc)] font-bold'
                : 'border-transparent text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
          >
            My Answer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 px-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-[var(--acc)] text-[var(--acc)] font-bold'
                : 'border-transparent text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Grammar &amp; Proofreading</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coach')}
            className={`pb-2.5 px-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'coach'
                ? 'border-[var(--acc)] text-[var(--acc)] font-bold'
                : 'border-transparent text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Socratic Coach</span>
          </button>
        </div>

        {/* Tab 1: Answer Textarea */}
        {activeTab === 'answer' && (
          <div>
            <textarea
              rows={5}
              value={currentAnswerText}
              onChange={(e) => handleAnswerChange(activePromptIdx, e.target.value)}
              placeholder="Synthesize your complete response here in your own words..."
              className="w-full p-4 text-sm sm:text-base rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--mut)] outline-none focus:border-[var(--acc)] resize-none leading-relaxed"
            />
            <div className="mt-2.5 flex items-center justify-between text-xs text-[var(--mut)]">
              <span>Aim for complete sentences with clear evidence.</span>
              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className="text-[var(--acc)] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Proofread my grammar</span>
                <PenTool className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Proofreading Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <ProofreadingChecklist text={currentAnswerText} />
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex justify-between items-center text-xs">
              <span className="text-[var(--mut)] font-mono">Current draft: {currentWordCount} words</span>
              <button
                type="button"
                onClick={() => setActiveTab('answer')}
                className="text-[var(--acc)] font-medium hover:underline cursor-pointer"
              >
                Return to drafting →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Socratic Grammar & Proofreading Coach */}
        {activeTab === 'coach' && (
          <div className="space-y-4">
            {/* Quick Socratic prompt buttons */}
            <div>
              <span className="block text-[11px] font-mono uppercase text-[var(--mut)] mb-2">
                Ask Coach For Writing &amp; Grammar Scaffolding:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickGrammarPrompts.map((qp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendCoachQuestion(activePromptIdx, qp)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg)] hover:bg-[var(--accl)] border border-[var(--line)] hover:border-[var(--acc)] text-xs text-[var(--ink)] cursor-pointer transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Log */}
            <div className="space-y-2 max-h-56 overflow-y-auto p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              {(coachMessages[activePromptIdx] || []).length === 0 ? (
                <div className="text-center py-4 text-xs text-[var(--mut)]">
                  <Sparkles className="w-5 h-5 mx-auto mb-1.5 text-[var(--acc)] opacity-60" />
                  Your Socratic Coach guides your critical thinking and grammar rules without writing sentences for you. Choose a question above or ask anything!
                </div>
              ) : (
                (coachMessages[activePromptIdx] || []).map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs ${
                      m.role === 'coach'
                        ? 'bg-[var(--card)] text-[var(--ink)] border border-[var(--acc)]/30'
                        : 'bg-[var(--accl)] text-[var(--acc)] font-medium self-end ml-6'
                    }`}
                  >
                    <span className="block font-mono text-[10px] uppercase font-bold text-[var(--mut)] mb-0.5">
                      {m.role === 'coach' ? 'Coach (Guiding Question):' : 'You:'}
                    </span>
                    <p className="m-0 leading-relaxed">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Ask input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={coachInputs[activePromptIdx] || ''}
                onChange={(e) =>
                  setCoachInputs((prev) => ({ ...prev, [activePromptIdx]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendCoachQuestion(activePromptIdx);
                  }
                }}
                placeholder="Ask about grammar, sentence flow, or evidence..."
                className="flex-1 h-10 px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none focus:border-[var(--acc)]"
              />
              <button
                type="button"
                onClick={() => handleSendCoachQuestion(activePromptIdx)}
                disabled={loadingCoachFor === activePromptIdx}
                className="h-10 px-3.5 rounded-xl bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-xs"
              >
                {loadingCoachFor === activePromptIdx ? (
                  '...'
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Between Prompts or Final Submit */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActivePromptIdx((prev) => Math.max(0, prev - 1))}
          disabled={activePromptIdx === 0}
          className="px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] disabled:opacity-30 cursor-pointer"
        >
          Previous Question
        </button>

        {activePromptIdx < prompts.length - 1 ? (
          <button
            type="button"
            onClick={() => setActivePromptIdx((prev) => Math.min(prompts.length - 1, prev + 1))}
            className="px-5 py-2.5 rounded-xl bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold cursor-pointer shadow-xs"
          >
            Next Question
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered}
            className="px-6 py-3 rounded-full bg-[var(--acc)] text-[var(--onacc)] text-sm font-semibold cursor-pointer shadow-xs disabled:opacity-40"
          >
            Submit Question Set
          </button>
        )}
      </div>

      {!allAnswered && (
        <p className="text-center text-xs text-[var(--mut)] mt-3">
          Answer all prompts (at least 3 words) to unlock final submission.
        </p>
      )}
    </div>
  );
};
