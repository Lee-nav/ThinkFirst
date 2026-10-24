import React from 'react';
import { countWords } from '../utils/rules.ts';
import { Check } from 'lucide-react';

interface OutlineViewProps {
  outline: [string, string, string];
  onChangeField: (index: number, value: string) => void;
}

const OUTLINE_SECTIONS = [
  { label: 'Main point', placeholder: 'What do you want to say? Messy notes are fine.' },
  { label: 'Example', placeholder: 'A place, a number, or a name. Messy notes are fine.' },
  { label: 'Counterpoint', placeholder: 'What would someone argue back? Messy notes are fine.' }
];

export const OutlineView: React.FC<OutlineViewProps> = ({ outline, onChangeField }) => {
  return (
    <div className="w-full max-w-[520px] mx-auto pb-28">
      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-4">
        Your outline
      </h2>

      <div className="space-y-3.5">
        {OUTLINE_SECTIONS.map((sec, i) => {
          const words = countWords(outline[i]);
          const isCheck = words >= 3;

          return (
            <div
              key={sec.label}
              className={`relative bg-[var(--card)] border-[1.5px] rounded-[18px] p-4 transition-all ${
                isCheck ? 'border-[var(--line)] shadow-xs' : 'border-[var(--line)]'
              } focus-within:border-[var(--acc)]`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--mut)] font-medium">
                  {sec.label}
                </span>

                {/* Tick mark */}
                {isCheck && (
                  <span
                    className="w-5 h-5 rounded-full bg-[var(--acc)] text-[var(--onacc)] flex items-center justify-center animate-in zoom-in-50"
                    aria-label="Section complete"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                )}
              </div>

              <textarea
                rows={2}
                value={outline[i]}
                onChange={(e) => onChangeField(i, e.target.value)}
                placeholder={sec.placeholder}
                className="w-full bg-transparent border-0 p-0 text-[16px] text-[var(--ink)] placeholder:text-[var(--mut)] outline-none resize-none leading-relaxed"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
