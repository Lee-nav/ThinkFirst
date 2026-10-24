import React, { useState } from 'react';
import { QuestionSet } from '../types/index.ts';
import { X, Plus, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

interface CreateQuestionSetModalProps {
  onClose: () => void;
  onCreate: (set: Partial<QuestionSet>, publishNow: boolean) => Promise<void>;
}

export const CreateQuestionSetModal: React.FC<CreateQuestionSetModalProps> = ({
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Report' | 'Reflection' | 'Question'>('Report');
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [sectionsAllowedText, setSectionsAllowedText] = useState('');
  const [focusMonitoring, setFocusMonitoring] = useState(true);
  const [timeUpRule, setTimeUpRule] = useState<'over_time' | 'auto_submit'>('over_time');
  const [coachEnabled, setCoachEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPrompt = () => {
    setPrompts([...prompts, '']);
  };

  const handlePromptChange = (index: number, val: string) => {
    const next = [...prompts];
    next[index] = val;
    setPrompts(next);
  };

  const handleRemovePrompt = (index: number) => {
    if (prompts.length <= 1) return;
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (publishNow: boolean) => {
    if (!title.trim()) return;
    const cleanPrompts = prompts.map((p) => p.trim()).filter(Boolean);
    if (cleanPrompts.length === 0) cleanPrompts.push(title.trim());

    const sections = sectionsAllowedText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    await onCreate(
      {
        title: title.trim(),
        type,
        prompts: cleanPrompts,
        instructions: instructions.trim(),
        timeLimitMinutes: Number(timeLimitMinutes) || 15,
        openAt,
        closeAt,
        sectionsAllowed: sections,
        focusMonitoring,
        timeUpRule,
        coachEnabled,
        status: publishNow ? 'open' : 'draft'
      },
      publishNow
    );
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[24px] max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
          <h3 className="font-serif text-2xl font-normal text-[var(--ink)]">
            Create Question Set
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--mut)] hover:text-[var(--ink)] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Essay 2: Clean Water Access in Our City"
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--ink)] outline-none focus:border-[var(--acc)]"
            />
          </div>

          {/* Type Selector (Report, Reflection, Question) */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
              Set Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Report', 'Reflection', 'Question'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`h-10 rounded-xl font-medium border transition-colors cursor-pointer ${
                    type === t
                      ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-semibold'
                      : 'bg-[var(--bg)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--mut)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--mut)] mt-1.5 leading-relaxed">
              {type === 'Question'
                ? 'Shows each prompt with an answer box. Coach asks 1 follow-up question per prompt.'
                : 'Follows the full 4-step ThinkFirst coaching and review flow.'}
            </p>
          </div>

          {/* Prompts list */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono uppercase tracking-wider text-[var(--mut)]">
                {type === 'Question' ? 'Prompts / Questions *' : 'Prompt / Topic *'}
              </label>
              {type === 'Question' && (
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="text-xs text-[var(--acc)] font-medium flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Prompt
                </button>
              )}
            </div>

            <div className="space-y-2">
              {prompts.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <textarea
                    rows={2}
                    value={p}
                    onChange={(e) => handlePromptChange(idx, e.target.value)}
                    placeholder={
                      type === 'Question'
                        ? `Prompt ${idx + 1}: e.g. What is the biggest hurdle to geothermal energy?`
                        : 'e.g. Describe how severe storms affected your local community.'
                    }
                    className="flex-1 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none focus:border-[var(--acc)] resize-none"
                  />
                  {type === 'Question' && prompts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrompt(idx)}
                      className="p-2 text-[var(--mut)] hover:text-red-500 rounded-lg cursor-pointer"
                      title="Remove prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
              Instructions for Students (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Answer in your own words. Include at least one specific example."
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none"
            />
          </div>

          {/* Time limit & Sections Allowed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
                Time Limit (mins)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none"
              />
            </div>

            <div>
              <label className="block font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
                Sections Allowed
              </label>
              <input
                type="text"
                value={sectionsAllowedText}
                onChange={(e) => setSectionsAllowedText(e.target.value)}
                placeholder="e.g. 10-A, 10-B"
                className="w-full h-11 px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none"
              />
            </div>
          </div>

          {/* Time Up Rule */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-[var(--mut)] mb-1">
              When Time is Up
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTimeUpRule('over_time')}
                className={`h-9 rounded-xl text-xs font-medium border cursor-pointer ${
                  timeUpRule === 'over_time'
                    ? 'bg-[var(--card)] border-[var(--acc)] text-[var(--acc)] font-semibold shadow-xs'
                    : 'bg-[var(--bg)] border-[var(--line)] text-[var(--mut)]'
                }`}
              >
                Mark as Over time (default)
              </button>
              <button
                type="button"
                onClick={() => setTimeUpRule('auto_submit')}
                className={`h-9 rounded-xl text-xs font-medium border cursor-pointer ${
                  timeUpRule === 'auto_submit'
                    ? 'bg-[var(--card)] border-[var(--acc)] text-[var(--acc)] font-semibold shadow-xs'
                    : 'bg-[var(--bg)] border-[var(--line)] text-[var(--mut)]'
                }`}
              >
                Auto-submit what is written
              </button>
            </div>
          </div>

          {/* Switches: Focus monitoring & Coach */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <div>
                <span className="font-semibold text-[var(--ink)] block">Focus Monitoring</span>
                <span className="text-[11px] text-[var(--mut)]">Tracks page switches and outside pastes</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={focusMonitoring}
                onClick={() => setFocusMonitoring(!focusMonitoring)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  focusMonitoring ? 'bg-[var(--acc)]' : 'bg-[var(--line)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    focusMonitoring ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <div>
                <span className="font-semibold text-[var(--ink)] block">ThinkFirst Coach</span>
                <span className="text-[11px] text-[var(--mut)]">Guides student without writing text</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={coachEnabled}
                onClick={() => setCoachEnabled(!coachEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  coachEnabled ? 'bg-[var(--acc)]' : 'bg-[var(--line)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    coachEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting || !title.trim()}
              onClick={() => handleSubmit(false)}
              className="h-12 rounded-full border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg)] font-semibold text-xs cursor-pointer disabled:opacity-40"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting || !title.trim()}
              onClick={() => handleSubmit(true)}
              className="h-12 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-xs hover:opacity-95 cursor-pointer shadow-xs disabled:opacity-40"
            >
              Publish &amp; Create Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
