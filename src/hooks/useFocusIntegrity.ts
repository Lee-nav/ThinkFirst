import { useEffect, useRef, useState, useCallback } from 'react';
import { FocusEvent, FocusStatus } from '../types/index.ts';
import { countWords, evaluateFocusStatus } from '../utils/rules.ts';

interface UseFocusIntegrityOptions {
  sessionId: string;
  studentName?: string;
  enabled: boolean;
  step: number;
  currentDraftText: string;
  onReturnNotice?: (seconds: number) => void;
  onFlagChange?: (status: FocusStatus) => void;
}

export function useFocusIntegrity({
  sessionId,
  studentName = 'You',
  enabled,
  step,
  currentDraftText,
  onReturnNotice,
  onFlagChange
}: UseFocusIntegrityOptions) {
  const [events, setEvents] = useState<FocusEvent[]>([]);
  const [focusStatus, setFocusStatus] = useState<FocusStatus>({
    level: 'clear',
    leavesCount: 0,
    totalSecondsAway: 0,
    largestPasteWords: 0,
    wordsAddedAfterReturn: 0,
    reasons: [],
    reviewState: 'unreviewed'
  });
  const [recentReturnSeconds, setRecentReturnSeconds] = useState<number | null>(null);

  const lastVisibleTimestampRef = useRef<number>(Date.now());
  const isCurrentlyAwayRef = useRef<boolean>(false);
  const leaveStartTimeRef = useRef<number | null>(null);
  const draftWordsAtReturnRef = useRef<number>(countWords(currentDraftText));
  const returnTimestampRef = useRef<number | null>(null);
  const heartBeatIntervalRef = useRef<any>(null);

  // Send event helper with sendBeacon fallback
  const recordEvent = useCallback(
    (eventData: Partial<FocusEvent>) => {
      const serverTime = Date.now();
      const newEvt: FocusEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId,
        type: eventData.type || 'left',
        step,
        serverTime,
        deviceTime: serverTime,
        secondsAway: eventData.secondsAway,
        wordsPasted: eventData.wordsPasted,
        wordsAddedAfterReturn: eventData.wordsAddedAfterReturn,
        noteText: eventData.noteText,
        isLate: !navigator.onLine
      };

      setEvents((prev) => {
        const next = [...prev, newEvt];
        const newStatus = evaluateFocusStatus(next);
        setFocusStatus(newStatus);
        if (onFlagChange) {
          onFlagChange(newStatus);
        }
        return next;
      });

      // Send to server
      const payload = JSON.stringify({
        sessionId,
        studentName,
        event: newEvt
      });

      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/focus-events', blob);
        } catch {
          fetch('/api/focus-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          }).catch(() => {});
        }
      } else {
        fetch('/api/focus-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        }).catch(() => {});
      }
    },
    [sessionId, studentName, step, onFlagChange]
  );

  // Detect leaves and returns
  const handleLeave = useCallback(() => {
    if (!enabled || isCurrentlyAwayRef.current) return;
    isCurrentlyAwayRef.current = true;
    leaveStartTimeRef.current = lastVisibleTimestampRef.current;
  }, [enabled]);

  const handleReturn = useCallback(() => {
    if (!enabled || !isCurrentlyAwayRef.current) return;
    isCurrentlyAwayRef.current = false;
    const now = Date.now();
    const leaveStart = leaveStartTimeRef.current || now;
    const awaySeconds = Math.round((now - leaveStart) / 1000);
    leaveStartTimeRef.current = null;
    lastVisibleTimestampRef.current = now;

    // Per brief: count a leave only when the student is away for 3 seconds or more
    if (awaySeconds >= 3) {
      recordEvent({
        type: 'left',
        secondsAway: awaySeconds
      });
      setRecentReturnSeconds(awaySeconds);
      if (onReturnNotice) {
        onReturnNotice(awaySeconds);
      }

      // Track words added within 15s after returning
      returnTimestampRef.current = now;
      draftWordsAtReturnRef.current = countWords(currentDraftText);
    }
  }, [enabled, currentDraftText, recordEvent, onReturnNotice]);

  // Check words added after returning
  useEffect(() => {
    if (!returnTimestampRef.current) return;
    const elapsedSec = (Date.now() - returnTimestampRef.current) / 1000;
    if (elapsedSec <= 15) {
      const currentWords = countWords(currentDraftText);
      const added = Math.max(0, currentWords - draftWordsAtReturnRef.current);
      if (added >= 30) {
        // Record burst after return
        recordEvent({
          type: 'returned',
          wordsAddedAfterReturn: added
        });
        returnTimestampRef.current = null; // trigger once
      }
    } else {
      returnTimestampRef.current = null;
    }
  }, [currentDraftText, recordEvent]);

  // Setup event listeners for tab-switch detection
  useEffect(() => {
    if (!enabled) return;

    // Save timestamp every 2 seconds while page is visible
    heartBeatIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        lastVisibleTimestampRef.current = Date.now();
      }
    }, 2000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    const onBlur = () => {
      handleLeave();
    };

    const onFocus = () => {
      handleReturn();
    };

    const onPageHide = () => {
      handleLeave();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pagehide', onPageHide);

    // Multi-session detection using BroadcastChannel
    try {
      const channel = new BroadcastChannel(`thinkfirst_session_${sessionId}`);
      channel.postMessage({ type: 'ping', time: Date.now() });
      channel.onmessage = (msg) => {
        if (msg.data?.type === 'ping') {
          channel.postMessage({ type: 'pong' });
          recordEvent({ type: 'second_session' });
        } else if (msg.data?.type === 'pong') {
          recordEvent({ type: 'second_session' });
        }
      };
      return () => {
        channel.close();
        clearInterval(heartBeatIntervalRef.current);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('pagehide', onPageHide);
      };
    } catch {
      return () => {
        clearInterval(heartBeatIntervalRef.current);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('pagehide', onPageHide);
      };
    }
  }, [enabled, sessionId, handleLeave, handleReturn, recordEvent]);

  const addStudentNote = useCallback(
    (note: string) => {
      recordEvent({
        type: 'note',
        noteText: note
      });
      setFocusStatus((prev) => ({
        ...prev,
        studentNote: note
      }));
    },
    [recordEvent]
  );

  const recordPaste = useCallback(
    (pastedWordCount: number) => {
      recordEvent({
        type: 'paste',
        wordsPasted: pastedWordCount
      });
    },
    [recordEvent]
  );

  const dismissReturnBanner = useCallback(() => {
    setRecentReturnSeconds(null);
  }, []);

  return {
    events,
    focusStatus,
    recentReturnSeconds,
    dismissReturnBanner,
    recordPaste,
    addStudentNote
  };
}
