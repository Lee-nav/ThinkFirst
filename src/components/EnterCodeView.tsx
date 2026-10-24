import React, { useState, useEffect, useRef } from 'react';
import { normalizeAccessCode } from '../utils/rules.ts';
import { QuestionSet } from '../types/index.ts';
import { firestoreService } from '../services/firestoreService.ts';
import { KeyRound, AlertCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface EnterCodeViewProps {
  initialCode?: string;
  onCodeVerified: (questionSet: QuestionSet) => void;
  onBack: () => void;
}

export const EnterCodeView: React.FC<EnterCodeViewProps> = ({
  initialCode = '',
  onCodeVerified,
  onBack
}) => {
  const [code, setCode] = useState(normalizeAccessCode(initialCode));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Rate limiting: 5 wrong attempts per minute pauses field for 60 seconds
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSecondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutSecondsRemaining((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSecondsRemaining]);

  // If initialCode provided from URL, auto-verify once
  useEffect(() => {
    if (initialCode && normalizeAccessCode(initialCode).length === 6) {
      handleVerify(normalizeAccessCode(initialCode));
    }
  }, [initialCode]);

  const handleVerify = async (codeToVerify: string) => {
    const clean = normalizeAccessCode(codeToVerify);
    if (clean.length < 6 || lockoutSecondsRemaining > 0) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Check direct Firestore service & local cache (works offline and on Vercel)
      const found = await firestoreService.getQuestionSetByCode(clean);
      if (found) {
        if (found.status === 'closed') {
          setErrorMsg('This question set is now closed. Check it with your teacher.');
          setIsLoading(false);
          return;
        }
        onCodeVerified(found);
        return;
      }

      // 2. Check fullstack server endpoint if available
      const response = await fetch(`/api/sets/by-code/${clean}`);
      if (response.ok) {
        const data = await response.json();
        onCodeVerified(data);
        return;
      }

      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockoutSecondsRemaining(60);
        setErrorMsg('Too many tries. Please wait 60 seconds.');
      } else {
        setErrorMsg('This code does not work. Check it with your teacher.');
      }
      setIsLoading(false);
    } catch {
      setErrorMsg('This code does not work. Check it with your teacher.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeAccessCode(e.target.value);
    if (val.length <= 6) {
      setCode(val);
      setErrorMsg(null);
      if (val.length === 6) {
        handleVerify(val);
      }
    }
  };

  const isLocked = lockoutSecondsRemaining > 0;

  return (
    <div className="w-full max-w-[520px] mx-auto pt-6 pb-28">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--mut)] hover:text-[var(--ink)] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="w-12 h-12 rounded-2xl bg-[var(--accl)] text-[var(--acc)] flex items-center justify-center mb-4">
        <KeyRound className="w-6 h-6" />
      </div>

      <h1 className="font-serif text-[38px] leading-tight text-[var(--ink)] mb-2">
        Enter access code
      </h1>
      <p className="text-sm text-[var(--mut)] mb-6">
        Type the 6-character code your teacher gave you. Letters and numbers are not case sensitive.
      </p>

      {/* Code Input Field */}
      <div className="mb-4">
        <label htmlFor="access-code-input" className="sr-only">
          Access Code
        </label>
        <input
          ref={inputRef}
          id="access-code-input"
          type="text"
          value={code}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && code.length === 6) {
              handleVerify(code);
            }
          }}
          disabled={isLocked || isLoading}
          placeholder="e.g. CLIM88"
          autoComplete="off"
          maxLength={6}
          className="w-full h-16 text-center text-3xl font-mono tracking-[0.25em] font-bold uppercase rounded-[20px] bg-[var(--card)] border-2 border-[var(--line)] focus:border-[var(--acc)] text-[var(--ink)] placeholder:text-[var(--mut)]/40 outline-none transition-colors shadow-xs disabled:opacity-50"
        />
      </div>

      {/* Error / Lockout Message */}
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] text-xs text-[var(--ink)] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[var(--ambt)] shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {isLocked && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center gap-2 text-xs font-mono text-[var(--ambt)]">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Locked for {lockoutSecondsRemaining}s due to repeated incorrect tries.</span>
        </div>
      )}

      <button
        onClick={() => handleVerify(code)}
        disabled={code.length < 6 || isLocked || isLoading}
        className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] disabled:bg-[var(--line)] disabled:text-[var(--mut)] cursor-pointer disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-xs flex items-center justify-center gap-2"
      >
        {isLoading ? 'Checking code...' : 'Continue'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
