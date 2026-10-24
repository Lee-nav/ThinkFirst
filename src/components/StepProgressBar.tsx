import React from 'react';

interface StepProgressBarProps {
  step: number; // 1 to 4, or 5 for Complete
}

const STEPS = ['Outline', 'Draft', 'Revise', 'Summary'];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({ step }) => {
  const isComplete = step > 4;

  return (
    <div className="w-full mb-6 pt-1">
      <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--mut)] mb-1.5 font-medium">
        {isComplete ? 'Complete' : `Step ${step} of 4`}
      </div>

      {/* 4 segments */}
      <div className="grid grid-cols-4 gap-1.5 mb-1.5">
        {STEPS.map((_, i) => {
          let fillWidth = '0%';
          if (step > i + 1 || isComplete) {
            fillWidth = '100%';
          } else if (step === i + 1) {
            fillWidth = '50%';
          }
          return (
            <div
              key={i}
              className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden"
              role="progressbar"
              aria-valuenow={parseInt(fillWidth, 10)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[var(--acc)] transition-all duration-500 ease-out"
                style={{ width: fillWidth }}
              />
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono tracking-wider uppercase text-[var(--mut)]">
        {STEPS.map((name, i) => (
          <span
            key={name}
            className={`transition-colors ${
              step >= i + 1 || isComplete ? 'text-[var(--ink)] font-semibold' : 'text-[var(--mut)]'
            }`}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};
