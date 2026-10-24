import React, { useState } from 'react';
import { QuestionSet } from '../types/index.ts';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteQuestionSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  questionSet: QuestionSet | null;
  submissionCount: number;
}

export const DeleteQuestionSetModal: React.FC<DeleteQuestionSetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  questionSet,
  submissionCount
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !questionSet) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[24px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="delete-modal-title" className="font-serif text-xl font-normal text-[var(--ink)]">
              Delete Question Set?
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--acc)] font-semibold block mb-0.5">
              {questionSet.type} · Code: {questionSet.code}
            </span>
            <h4 className="font-serif text-lg font-medium text-[var(--ink)] leading-snug">
              {questionSet.title}
            </h4>
          </div>

          {submissionCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300 leading-relaxed">
              <strong className="block font-semibold mb-1">
                Caution: {submissionCount} Student Submission{submissionCount === 1 ? '' : 's'} Will Be Deleted
              </strong>
              Deleting this set will permanently remove the question set, all student draft answers, start/finish timestamps, and focus integrity timeline logs. This action cannot be undone.
            </div>
          ) : (
            <p className="text-xs text-[var(--mut)] leading-relaxed">
              Are you sure you want to delete this question set? This action will permanently remove it and invalidate access code{' '}
              <strong className="text-[var(--ink)] font-mono">{questionSet.code}</strong>.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 px-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--card)] text-xs font-semibold text-[var(--ink)] cursor-pointer disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Set & Submissions'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
