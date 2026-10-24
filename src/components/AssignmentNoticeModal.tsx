import React from 'react';
import { QuestionSet } from '../types/index.ts';
import { ShieldCheck, CheckCircle2, Clock, Eye } from 'lucide-react';

interface AssignmentNoticeModalProps {
  questionSet: QuestionSet;
  onContinue: () => void;
  onCancel: () => void;
}

export const AssignmentNoticeModal: React.FC<AssignmentNoticeModalProps> = ({
  questionSet,
  onContinue,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[24px] max-w-md w-full p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--acc)] font-medium mb-1">
          {questionSet.type} Assignment · Code: {questionSet.code}
        </div>

        <h2 className="font-serif text-[28px] leading-tight text-[var(--ink)] mb-1">
          {questionSet.title}
        </h2>

        <p className="text-xs text-[var(--mut)] mb-3">
          Teacher: <strong>{questionSet.teacherName || 'Ms. Elena Reyes'}</strong>
        </p>

        {questionSet.instructions && (
          <p className="text-xs text-[var(--ink)] font-medium mb-4 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
            {questionSet.instructions}
          </p>
        )}

        <div className="space-y-3 mb-6 text-[13px] text-[var(--mut)] leading-relaxed">
          {questionSet.focusMonitoring && (
            <div className="flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-[var(--acc)] shrink-0 mt-0.5" />
              <p className="m-0">
                <strong className="text-[var(--ink)]">Focus integrity is active:</strong> Leaving this page is recorded (time and duration), not what you do elsewhere.
              </p>
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--acc)] shrink-0 mt-0.5" />
            <p className="m-0">
              We do <strong>not</strong> record your camera, microphone, other websites, or keystrokes.
            </p>
          </div>

          {questionSet.timeLimitMinutes && (
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[var(--acc)] shrink-0 mt-0.5" />
              <p className="m-0">
                Time limit: <strong>{questionSet.timeLimitMinutes} minutes</strong> once you enter your details and start.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onContinue}
            className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            Continue
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-sm font-medium text-[var(--mut)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            Cancel and return
          </button>
        </div>
      </div>
    </div>
  );
};
