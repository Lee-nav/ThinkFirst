import React from 'react';
import { splitSentences, generateSentenceFeedback } from '../utils/rules.ts';

interface ReviewViewProps {
  draftText: string;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ draftText }) => {
  const sentences = splitSentences(draftText);

  let previousSentence = '';
  const sentenceItems = sentences.map((sentence) => {
    const feedback = generateSentenceFeedback(sentence, previousSentence);
    previousSentence = sentence;
    return {
      sentence,
      feedback,
      isClear: !feedback
    };
  });

  const clearCount = sentenceItems.filter((s) => s.isClear).length;

  return (
    <div className="w-full max-w-[520px] mx-auto pb-32">
      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-1">
        Review
      </h2>

      <p className="text-sm text-[var(--mut)] mb-6">
        {clearCount} of {sentences.length} {sentences.length === 1 ? 'sentence' : 'sentences'} clear
      </p>

      {/* Vertical connected timeline (Uniform Connectedness) */}
      <div className="relative pl-8 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2.5 before:bottom-3 before:w-[2px] before:bg-[var(--line)]">
        {sentenceItems.map((item, idx) => {
          const hasFeedback = !item.isClear;

          return (
            <div key={idx} className="relative group">
              {/* Dot on timeline */}
              <span
                className={`absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[var(--bg)] transition-colors ${
                  hasFeedback ? 'bg-[var(--amb)]' : 'bg-[var(--acc)]'
                }`}
              />

              {/* Connecting amber line down to feedback card if needs work */}
              {hasFeedback && (
                <span className="absolute -left-[26px] top-4 bottom-[-10px] w-[2px] bg-[var(--amb)]" />
              )}

              {/* Sentence text block */}
              <div
                className={`p-3 rounded-xl transition-all ${
                  hasFeedback
                    ? 'bg-[var(--ambl)] text-[var(--ink)] font-normal'
                    : 'bg-[var(--card)] border border-[var(--line)] text-[var(--ink)]'
                }`}
              >
                <p className="text-[15px] leading-relaxed m-0">{item.sentence}</p>
              </div>

              {/* Connected Feedback Card */}
              {hasFeedback && (
                <div className="mt-2.5 p-3 rounded-xl bg-[var(--card)] border-[1.5px] border-[var(--amb)] shadow-xs animate-in fade-in">
                  <span className="block text-[10.5px] font-mono tracking-wider uppercase text-[var(--ambt)] font-semibold mb-1">
                    Feedback
                  </span>
                  <p className="text-[14px] font-semibold text-[var(--ink)] m-0">
                    {item.feedback}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {sentences.length === 0 && (
          <p className="text-sm text-[var(--mut)]">No sentences written yet in your draft.</p>
        )}
      </div>
    </div>
  );
};
