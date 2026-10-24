import React, { useState } from 'react';
import { QuestionSet } from '../types/index.ts';
import { X, Copy, Check, RefreshCw, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  questionSet: QuestionSet;
  onClose: () => void;
  onRegenerateCode: (setId: string) => Promise<string | void>;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  questionSet,
  onClose,
  onRegenerateCode
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isConfirmingRegen, setIsConfirmingRegen] = useState(false);
  const [regenSuccessCode, setRegenSuccessCode] = useState<string | null>(null);

  const fullUrl = `${window.location.origin}/?code=${questionSet.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(questionSet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConfirmRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newCode = await onRegenerateCode(questionSet.id);
      setIsConfirmingRegen(false);
      if (typeof newCode === 'string') {
        setRegenSuccessCode(newCode);
        setTimeout(() => setRegenSuccessCode(null), 3000);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[24px] max-w-sm w-full p-6 shadow-2xl text-center">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--mut)]">
            Student Access Code
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-serif text-2xl font-normal text-[var(--ink)] mb-1">
          {questionSet.title}
        </h3>
        <p className="text-xs text-[var(--mut)] mb-6">
          Share this 6-character code with your students.
        </p>

        {/* Large Code Display */}
        <div className="p-4 rounded-2xl bg-[var(--bg)] border-2 border-[var(--line)] mb-4">
          <div className="font-mono text-4xl font-bold tracking-[0.25em] text-[var(--ink)] mb-2">
            {questionSet.code}
          </div>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--acc)] hover:underline cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Code Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Visual SVG QR representation */}
        <div className="w-36 h-36 mx-auto mb-4 bg-white p-2.5 rounded-2xl border border-[var(--line)] shadow-inner flex flex-col items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--ink)]" fill="currentColor">
            {/* Clean stylized QR Pattern */}
            <rect x="5" y="5" width="25" height="25" fill="#17181C" />
            <rect x="10" y="10" width="15" height="15" fill="#FFFFFF" />
            <rect x="13" y="13" width="9" height="9" fill="#17181C" />

            <rect x="70" y="5" width="25" height="25" fill="#17181C" />
            <rect x="75" y="10" width="15" height="15" fill="#FFFFFF" />
            <rect x="78" y="13" width="9" height="9" fill="#17181C" />

            <rect x="5" y="70" width="25" height="25" fill="#17181C" />
            <rect x="10" y="75" width="15" height="15" fill="#FFFFFF" />
            <rect x="13" y="78" width="9" height="9" fill="#17181C" />

            {/* Data matrix nodes */}
            <rect x="36" y="8" width="6" height="6" />
            <rect x="46" y="8" width="6" height="6" />
            <rect x="56" y="8" width="6" height="6" />
            <rect x="36" y="24" width="6" height="6" />
            <rect x="48" y="24" width="6" height="6" />
            <rect x="8" y="38" width="6" height="6" />
            <rect x="20" y="38" width="6" height="6" />
            <rect x="36" y="40" width="12" height="12" fill="#1F7A5C" />
            <rect x="56" y="40" width="6" height="6" />
            <rect x="72" y="40" width="8" height="6" />
            <rect x="86" y="40" width="6" height="6" />
            <rect x="40" y="60" width="8" height="8" />
            <rect x="60" y="60" width="8" height="8" />
            <rect x="78" y="60" width="8" height="8" />
            <rect x="40" y="78" width="8" height="8" />
            <rect x="60" y="78" width="8" height="8" />
            <rect x="78" y="78" width="8" height="8" />
          </svg>
        </div>

        {regenSuccessCode && (
          <div className="mb-3 py-1.5 px-3 rounded-xl bg-[var(--accl)] text-[var(--acc)] text-xs font-mono font-medium animate-in fade-in">
            ✓ New code active: {regenSuccessCode}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full h-11 rounded-xl bg-[var(--accl)] text-[var(--acc)] hover:bg-[var(--acc)] hover:text-[var(--onacc)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copied!' : 'Copy Direct Student Link'}
          </button>

          {isConfirmingRegen ? (
            <div className="p-3 rounded-2xl bg-[var(--bg)] border border-[var(--amb)] text-left animate-in fade-in space-y-2">
              <div className="text-[11px] font-medium text-[var(--ambt)]">
                Regenerate code? The old code will stop working for new students. Ongoing sessions remain safe.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmRegenerate}
                  disabled={isRegenerating}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Regenerating...' : 'Yes, Generate New'}
                </button>
                <button
                  onClick={() => setIsConfirmingRegen(false)}
                  disabled={isRegenerating}
                  className="py-1.5 px-3 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingRegen(true)}
              className="w-full py-2 text-[11.5px] text-[var(--mut)] hover:text-[var(--ink)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-[var(--acc)]" />
              <span>Regenerate code (invalidates old code)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
