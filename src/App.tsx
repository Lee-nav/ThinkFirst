/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WritingType,
  ScreenView,
  ChatMessage,
  SavedDraft,
  SessionResult,
  QuestionSet,
  StudentSession,
  TeacherNotification,
  FocusStatus
} from './types/index.ts';
import {
  countWords,
  calculateScore,
  isRefusalTrigger,
  normalizeAccessCode,
  formatDuration
} from './utils/rules.ts';
import { useFocusIntegrity } from './hooks/useFocusIntegrity.ts';
import { Header } from './components/Header.tsx';
import { NavigationDock } from './components/NavigationDock.tsx';
import { StepProgressBar } from './components/StepProgressBar.tsx';
import { AssignmentNoticeModal } from './components/AssignmentNoticeModal.tsx';
import { HomeView } from './components/HomeView.tsx';
import { EnterCodeView } from './components/EnterCodeView.tsx';
import { StudentDetailsView } from './components/StudentDetailsView.tsx';
import { OutlineView } from './components/OutlineView.tsx';
import { CoachView } from './components/CoachView.tsx';
import { DraftView } from './components/DraftView.tsx';
import { QuestionAnswersView } from './components/QuestionAnswersView.tsx';
import { ReviewView } from './components/ReviewView.tsx';
import { SummaryView } from './components/SummaryView.tsx';
import { ReceiptView } from './components/ReceiptView.tsx';
import { DraftsView } from './components/DraftsView.tsx';
import { ProgressView } from './components/ProgressView.tsx';
import { TeacherDashboardView } from './components/TeacherDashboardView.tsx';
import { FocusTimelineModal } from './components/FocusTimelineModal.tsx';
import { CreateQuestionSetModal } from './components/CreateQuestionSetModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { LandingPageView } from './components/LandingPageView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { UserRole } from './types/auth.ts';
import { firestoreService } from './services/firestoreService.ts';

const STORAGE_KEY = 'thinkfirst_v3';
const HINT_SENTENCE_STARTERS = [
  'One reason this matters is',
  'For example, in my town',
  'This shows that',
  'Some people disagree because'
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Authentication state
  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('student');
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');

  // Navigation & Screen View
  const [currentView, setCurrentView] = useState<ScreenView>('landing');
  const [step, setStep] = useState<number>(1);

  // Active question set & student session state
  const [activeQuestionSets, setActiveQuestionSets] = useState<QuestionSet[]>([]);
  const [activeSetForStudent, setActiveSetForStudent] = useState<QuestionSet | null>(null);
  const [activeStudentSession, setActiveStudentSession] = useState<StudentSession | null>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);

  // Personal session state
  const [sessionId, setSessionId] = useState<string>(() => `sess-${Date.now()}`);
  const [topic, setTopic] = useState<string>('');
  const [writingType, setWritingType] = useState<WritingType>('Essay');
  const [outline, setOutline] = useState<[string, string, string]>(['', '', '']);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [coachStage, setCoachStage] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [draftText, setDraftText] = useState<string>('');
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [draftSecondsRemaining, setDraftSecondsRemaining] = useState<number>(900); // default 15 mins
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [suggestionWords, setSuggestionWords] = useState<number>(0);
  const [pastedWords, setPastedWords] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [isShared, setIsShared] = useState<boolean>(false);

  // User role & strict role isolation
  const userRole: UserRole = user?.role || 'student';

  // Teacher dashboard state
  const [selectedSetForTeacher, setSelectedSetForTeacher] = useState<QuestionSet | null>(null);
  const [teacherSetSessions, setTeacherSetSessions] = useState<StudentSession[]>([]);
  const [allTeacherSessions, setAllTeacherSessions] = useState<StudentSession[]>([]);
  const [activeTeacherTab, setActiveTeacherTab] = useState<'sets' | 'submissions'>('sets');
  const [teacherNotifications, setTeacherNotifications] = useState<TeacherNotification[]>([]);
  const [selectedSessionForTimeline, setSelectedSessionForTimeline] = useState<StudentSession | null>(null);
  const [isCreateSetOpen, setIsCreateSetOpen] = useState<boolean>(false);
  const [qrCodeSet, setQrCodeSet] = useState<QuestionSet | null>(null);

  // Strict role view guard: students cannot view teacher dashboard
  useEffect(() => {
    if (userRole === 'student' && currentView === 'teacher') {
      setCurrentView('home');
    }
  }, [userRole, currentView]);

  // Saved drafts history
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [initialUrlCode, setInitialUrlCode] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Fetch initial sets, notifications, and all sessions from Firestore & backend
  const refreshQuestionSets = useCallback(async () => {
    try {
      const sets = await firestoreService.getQuestionSets();
      if (Array.isArray(sets) && sets.length > 0) {
        setActiveQuestionSets(sets);
      }
      fetch('/api/sets')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setActiveQuestionSets(data);
        })
        .catch(() => {});
    } catch {}
  }, []);

  const refreshAllTeacherSessions = useCallback(async () => {
    try {
      const sessions = await firestoreService.getAllStudentSessions();
      if (Array.isArray(sessions) && sessions.length > 0) {
        setAllTeacherSessions(sessions);
      }
      fetch('/api/teacher/all-sessions')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setAllTeacherSessions(data);
        })
        .catch(() => {});
    } catch {}
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/notifications');
      const data = await res.json();
      if (Array.isArray(data)) setTeacherNotifications(data);
    } catch {}
  }, []);

  useEffect(() => {
    refreshQuestionSets();
    refreshNotifications();
    refreshAllTeacherSessions();

    // Check for direct access code in URL query string (e.g. ?code=CLIM88)
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
      setInitialUrlCode(normalizeAccessCode(codeParam));
      setCurrentView('enter-code');
    }

    // Load local storage session history
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.savedDrafts)) {
          setSavedDrafts(parsed.savedDrafts);
        }
      }
    } catch {}

    // PWA beforeinstallprompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [refreshQuestionSets, refreshNotifications]);

  const saveStateToStorage = useCallback((drafts: SavedDraft[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedDrafts: drafts }));
    } catch {}
  }, []);

  // When teacher selects a question set, fetch its student sessions
  useEffect(() => {
    if (!selectedSetForTeacher) return;
    // Immediate fallback from allTeacherSessions so Vercel deployment shows submissions instantly
    const matching = allTeacherSessions.filter((s) => s.setId === selectedSetForTeacher.id);
    setTeacherSetSessions(matching);

    fetch(`/api/sets/${selectedSetForTeacher.id}/sessions`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTeacherSetSessions(data);
      })
      .catch(() => {});
  }, [selectedSetForTeacher, allTeacherSessions]);

  // Focus Integrity tracking hook
  const isFocusMonitoringActive =
    (activeSetForStudent?.focusMonitoring ?? false) &&
    ['outline', 'coach', 'draft', 'question-answers', 'review'].includes(currentView);

  const {
    events: focusEvents,
    focusStatus,
    recentReturnSeconds,
    dismissReturnBanner,
    recordPaste,
    addStudentNote
  } = useFocusIntegrity({
    sessionId: activeStudentSession?.id || sessionId,
    studentName: activeStudentSession?.fullName || 'You',
    enabled: isFocusMonitoringActive,
    step,
    currentDraftText: draftText,
    onFlagChange: (newStatus) => {
      if (newStatus.level === 'flagged') {
        showToast('Notice: Leaving the page has been flagged for your teacher');
        refreshNotifications();
      }
    }
  });

  // Timed session countdown
  useEffect(() => {
    let timer: any = null;
    if (
      (currentView === 'draft' || currentView === 'question-answers') &&
      activeStudentSession
    ) {
      timer = setInterval(() => {
        setDraftSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Time limit reached
            if (activeSetForStudent?.timeUpRule === 'auto_submit') {
              handleSubmitActiveSession();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentView, activeStudentSession, activeSetForStudent]);

  const navigateTo = (view: ScreenView) => {
    if (userRole === 'student' && view === 'teacher') {
      showToast('Teacher Dashboard is only accessible in Teacher mode.');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student Flow Handlers
  const handleCodeVerified = (set: QuestionSet) => {
    setActiveSetForStudent(set);
    navigateTo('assignment-notice');
  };

  const handleStartSessionWithDetails = (session: StudentSession) => {
    firestoreService.saveStudentSession(session);
    setAllTeacherSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
    setActiveStudentSession(session);
    setSessionId(session.id);
    setTopic(activeSetForStudent?.title || '');
    setWritingType(activeSetForStudent?.type || 'Report');
    setOutline(['', '', '']);
    setChat([]);
    setCoachStage(0);
    setDraftText('');
    setQuestionAnswers({});
    setStep(1);
    setHintsUsed(0);
    setSuggestionWords(0);
    setPastedWords(0);
    setDraftSecondsRemaining((activeSetForStudent?.timeLimitMinutes || 15) * 60);

    // Route to appropriate answering screen based on set type
    if (activeSetForStudent?.type === 'Question') {
      navigateTo('question-answers');
    } else {
      navigateTo('outline');
    }
  };

  const handleSubmitActiveSession = async () => {
    const currentSessionId = activeStudentSession?.id || sessionId;
    const isLateSync = !navigator.onLine;
    const serverFinishTime = Date.now();
    const durationSec = Math.max(
      1,
      Math.round((serverFinishTime - (activeStudentSession?.recordedStartAt || Date.now() - 900000)) / 1000)
    );
    const targetSet = activeSetForStudent;
    const isOver = durationSec > (targetSet?.timeLimitMinutes || 15) * 60;

    if (activeStudentSession) {
      const updatedSess: StudentSession = {
        ...activeStudentSession,
        finishedAt: serverFinishTime,
        durationSeconds: durationSec,
        isOverTime: isOver,
        status: isOver ? 'over_time' : 'submitted',
        answers: questionAnswers,
        draft: draftText,
        outline,
        wordsWrittenPercent: sessionResult?.percentYourWords || 92,
        focusTimesLeft: focusStatus.leavesCount,
        focusSecondsAway: focusStatus.totalSecondsAway,
        focusFlagLevel: focusStatus.level,
        updatedAt: serverFinishTime
      };
      await firestoreService.saveStudentSession(updatedSess);
      setAllTeacherSessions((prev) => [updatedSess, ...prev.filter((s) => s.id !== updatedSess.id)]);
    }

    try {
      const response = await fetch(`/api/sessions/${currentSessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceFinishTime: Date.now(),
          isLateSync,
          answers: questionAnswers,
          draft: draftText,
          outline
        })
      });

      const data = await response.json();
      if (data.receipt) {
        setSubmissionReceipt(data.receipt);
        navigateTo('receipt');
        refreshQuestionSets();
        return;
      }
    } catch {}

    // Local fallback receipt if offline or on Vercel static deployment
    const receiptFallback = {
      id: currentSessionId,
      fullName: activeStudentSession?.fullName || 'You',
      section: activeStudentSession?.section || 'General',
      setTitle: activeSetForStudent?.title || 'Assignment',
      code: activeSetForStudent?.code || '',
      recordedStartAt: activeStudentSession?.recordedStartAt || Date.now() - 900000,
      finishedAt: Date.now(),
      durationSeconds: durationSec,
      durationFormatted: formatDuration(durationSec),
      timeLimitMinutes: activeSetForStudent?.timeLimitMinutes || 15,
      withinLimit: !isOver,
      focusTimesLeft: focusStatus.leavesCount,
      focusSecondsAway: focusStatus.totalSecondsAway,
      focusFlagLevel: focusStatus.level,
      wordsWrittenPercent: sessionResult?.percentYourWords || 92,
      isFlagged: focusStatus.level === 'flagged'
    };
    setSubmissionReceipt(receiptFallback);
    navigateTo('receipt');
  };

  // Personal mode start thinking
  const handleStartPersonalThinking = () => {
    if (topic.trim().length < 3) return;
    setActiveSetForStudent(null);
    setActiveStudentSession(null);
    setSessionId(`sess-${Date.now()}`);
    setOutline(['', '', '']);
    setChat([]);
    setCoachStage(0);
    setDraftText('');
    setStep(1);
    setStartTime(0);
    setDraftSecondsRemaining(900);
    setHintsUsed(0);
    setSuggestionWords(0);
    setPastedWords(0);
    setIsDone(false);
    setSessionResult(null);
    setIsShared(false);
    navigateTo('outline');
  };

  // Coach interaction
  const handleSendMessage = async (studentMessage: string) => {
    const studentMsgObj: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'student',
      text: studentMessage,
      timestamp: Date.now()
    };

    const nextChat = [...chat, studentMsgObj];
    setChat(nextChat);
    setIsTyping(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || activeSetForStudent?.title,
          mainPoint: outline[0],
          chatHistory: nextChat,
          studentMessage,
          stage: coachStage
        })
      });

      const data = await response.json();
      setIsTyping(false);

      const isRefusal = data.isRefusal;
      const replyText = data.reply || 'What is one specific detail you can share?';

      setChat((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: isRefusal ? 'refusal' : 'coach',
          text: replyText,
          timestamp: Date.now()
        }
      ]);

      if (!isRefusal && countWords(studentMessage) >= 3 && coachStage < 2) {
        setCoachStage((prev) => prev + 1);
      }
    } catch {
      setTimeout(() => {
        setIsTyping(false);
        if (isRefusalTrigger(studentMessage)) {
          setChat((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              role: 'refusal',
              text: 'In one sentence, what do you want to say?',
              timestamp: Date.now()
            }
          ]);
        } else {
          setChat((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              role: 'coach',
              text: 'What is one example that proves it? Name a place, a number, or a person.',
              timestamp: Date.now()
            }
          ]);
          setCoachStage((prev) => Math.min(2, prev + 1));
        }
      }, 350);
    }
  };

  // Insert Hint
  const handleInsertHint = (target: 'coach' | 'draft') => {
    const starter = HINT_SENTENCE_STARTERS[hintsUsed % HINT_SENTENCE_STARTERS.length];
    const starterWords = countWords(starter);
    setHintsUsed((prev) => prev + 1);
    setSuggestionWords((prev) => prev + starterWords);

    if (target === 'coach') {
      const msgInput = document.getElementById('msg-input') as HTMLInputElement | null;
      if (msgInput) {
        msgInput.value = (msgInput.value.trim() ? msgInput.value.trim() + ' ' : '') + starter + ' ';
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.focus();
      }
    } else {
      setDraftText((prev) => (prev.trim() ? prev.trim() + ' ' : '') + starter + ' ');
      const draftEl = document.getElementById('draft-textarea');
      draftEl?.focus();
    }
  };

  const handleFinishAndSummarize = () => {
    // If inside a teacher assignment, submit and show receipt
    if (activeStudentSession) {
      handleSubmitActiveSession();
      return;
    }

    const outlineWords = countWords(outline.join(' '));
    const studentChatWords = chat
      .filter((m) => m.role === 'student')
      .reduce((acc, m) => acc + countWords(m.text), 0);
    const draftWords = countWords(draftText);

    const score = calculateScore({
      outlineWords,
      studentChatWords,
      draftWords,
      hintWords: suggestionWords,
      pastedWords
    });

    const elapsedMinutes = Math.max(1, Math.round((Date.now() - (startTime || Date.now())) / 60000));

    const result: SessionResult = {
      percentYourWords: score.percentYourWords,
      studentWords: score.studentWords,
      suggestionWords: score.suggestionWords,
      pastedWords: score.pastedWords,
      totalWords: score.totalWords,
      minutes: elapsedMinutes,
      hintsUsed,
      focusStatus
    };

    setSessionResult(result);
    setIsDone(true);
    setStep(5);
    navigateTo('summary');
  };

  // Teacher actions with direct Firestore & offline persistence
  const handleCreateNewSet = async (setData: Partial<QuestionSet>, publishNow: boolean) => {
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let autoCode = '';
      for (let i = 0; i < 6; i++) autoCode += chars.charAt(Math.floor(Math.random() * chars.length));

      const newSet: QuestionSet = {
        id: setData.id || `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        teacherId: user?.id || 'teacher-reyes',
        teacherEmail: user?.email || 'elena.reyes@school.edu',
        teacherName: user?.fullName || 'Ms. Elena Reyes',
        title: setData.title || 'Untitled Question Set',
        type: setData.type || 'Report',
        prompts: setData.prompts && setData.prompts.length > 0 ? setData.prompts : [setData.title || 'Assignment Prompt'],
        instructions: setData.instructions || '',
        timeLimitMinutes: setData.timeLimitMinutes || 15,
        openAt: setData.openAt || '',
        closeAt: setData.closeAt || '',
        sectionsAllowed: setData.sectionsAllowed || [],
        focusMonitoring: setData.focusMonitoring ?? true,
        timeUpRule: setData.timeUpRule || 'over_time',
        coachEnabled: setData.coachEnabled ?? true,
        status: publishNow ? 'open' : 'draft',
        code: setData.code || autoCode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        submissionCount: 0
      };

      // 1. Direct Firestore & local cache persistence (works on Vercel and offline)
      await firestoreService.saveQuestionSet(newSet);
      setActiveQuestionSets((prev) => [newSet, ...prev.filter((s) => s.id !== newSet.id)]);

      // 2. Background sync to Node server if running
      try {
        fetch('/api/sets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSet)
        }).catch(() => {});
      } catch {}

      showToast(publishNow ? `Set published! Access code: ${newSet.code}` : 'Draft saved');
    } catch (err) {
      console.error('Failed to save set:', err);
      showToast('Failed to save set');
    }
  };

  const handleDuplicateSet = async (setId: string) => {
    try {
      const source = activeQuestionSets.find((s) => s.id === setId);
      if (!source) return;

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let newCode = '';
      for (let i = 0; i < 6; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));

      const dup = await firestoreService.duplicateQuestionSet(source, newCode);
      setActiveQuestionSets((prev) => [dup, ...prev]);

      fetch(`/api/sets/${setId}/duplicate`, { method: 'POST' }).catch(() => {});
      showToast('Set duplicated');
    } catch {}
  };

  const handleToggleSetStatus = async (setId: string, nextStatus: 'open' | 'closed') => {
    try {
      await firestoreService.updateQuestionSetStatus(setId, nextStatus);
      setActiveQuestionSets((prev) =>
        prev.map((s) => (s.id === setId ? { ...s, status: nextStatus, updatedAt: Date.now() } : s))
      );
      if (selectedSetForTeacher?.id === setId) {
        setSelectedSetForTeacher((prev) => (prev ? { ...prev, status: nextStatus, updatedAt: Date.now() } : null));
      }

      fetch(`/api/sets/${setId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      }).catch(() => {});
      showToast(`Set marked as ${nextStatus}`);
    } catch {}
  };

  const handleRegenerateCode = async (setId: string) => {
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let newCode = '';
      for (let i = 0; i < 6; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));

      try {
        const res = await fetch(`/api/sets/${setId}/code/regenerate`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.code) newCode = data.code;
        }
      } catch {}

      await firestoreService.regenerateQuestionSetCode(setId, newCode);

      setActiveQuestionSets((prev) =>
        prev.map((s) => (s.id === setId ? { ...s, code: newCode, updatedAt: Date.now() } : s))
      );
      if (qrCodeSet?.id === setId) {
        setQrCodeSet((prev) => (prev ? { ...prev, code: newCode, updatedAt: Date.now() } : null));
      }
      if (selectedSetForTeacher?.id === setId) {
        setSelectedSetForTeacher((prev) => (prev ? { ...prev, code: newCode, updatedAt: Date.now() } : null));
      }
      showToast(`New code generated: ${newCode}`);
      return newCode;
    } catch {
      showToast('Failed to regenerate code');
    }
  };

  const handleExportSetCSV = (set: QuestionSet, sessions: StudentSession[]) => {
    const headers =
      'Name,Section,Declared start,Recorded start,Finished,Duration,Status,Words written %,Focus,Student Note\n';
    const rows = sessions
      .map((s) => {
        const declared = s.declaredTime || s.declaredDateTime;
        const recorded = new Date(s.recordedStartAt).toLocaleTimeString();
        const finished = s.finishedAt ? new Date(s.finishedAt).toLocaleTimeString() : 'In progress';
        const dur = s.durationSeconds ? formatDuration(s.durationSeconds) : '—';
        return `"${s.fullName}","${s.section}","${declared}","${recorded}","${finished}","${dur}","${s.status}",${s.wordsWrittenPercent}%,"${s.focusFlagLevel}","${s.studentNote || ''}"`;
      })
      .join('\n');

    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.title.replace(/\s+/g, '_')}_Results.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV report exported');
  };

  const handleReopenStudentSession = async (sessionIdToReopen: string) => {
    try {
      const allSessions = await firestoreService.getAllStudentSessions();
      const target = allSessions.find((s) => s.id === sessionIdToReopen);
      if (target) {
        const updated: StudentSession = { ...target, status: 'in_progress', updatedAt: Date.now() };
        await firestoreService.saveStudentSession(updated);
        setAllTeacherSessions((prev) => prev.map((s) => (s.id === sessionIdToReopen ? updated : s)));
        setTeacherSetSessions((prev) => prev.map((s) => (s.id === sessionIdToReopen ? updated : s)));
      }
      fetch(`/api/teacher/sessions/${sessionIdToReopen}/reopen`, { method: 'POST' }).catch(() => {});
      showToast('Session reopened for student');
    } catch {}
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      // 1. Delete associated student sessions from Firestore & local storage
      const deletedSessionsCount = await firestoreService.deleteSessionsForSet(setId);
      // 2. Delete question set from Firestore & local storage
      await firestoreService.deleteQuestionSet(setId);

      // 3. Update React states
      setActiveQuestionSets((prev) => prev.filter((s) => s.id !== setId));
      setAllTeacherSessions((prev) => prev.filter((s) => s.setId !== setId));
      setTeacherSetSessions((prev) => prev.filter((s) => s.setId !== setId));
      setTeacherNotifications((prev) => prev.filter((n) => n.setId !== setId));

      // 4. Reset selected set views if currently pointing to deleted set
      if (selectedSetForTeacher?.id === setId) {
        setSelectedSetForTeacher(null);
      }
      if (activeSetForStudent?.id === setId) {
        setActiveSetForStudent(null);
      }

      // 5. Background sync to Node server
      fetch(`/api/sets/${setId}`, { method: 'DELETE' }).catch(() => {});

      showToast(
        deletedSessionsCount > 0
          ? `Question set and ${deletedSessionsCount} submission${deletedSessionsCount === 1 ? '' : 's'} deleted`
          : 'Question set deleted'
      );
    } catch (err) {
      console.error('Failed to delete question set:', err);
      showToast('Failed to delete question set');
    }
  };

  // Primary CTA content for NavigationDock
  let primaryCtaContent: React.ReactNode = null;

  if (currentView === 'home') {
    primaryCtaContent = (
      <button
        onClick={handleStartPersonalThinking}
        disabled={topic.trim().length < 3}
        className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] disabled:bg-[var(--line)] disabled:text-[var(--mut)] cursor-pointer disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-xs"
      >
        Start thinking
      </button>
    );
  } else if (currentView === 'outline') {
    const isOutlineValid = countWords(outline[0]) >= 3 && countWords(outline[1]) >= 3;
    primaryCtaContent = (
      <div>
        <button
          onClick={() => {
            setStep(2);
            if (chat.length === 0) {
              setChat([
                {
                  id: `msg-${Date.now()}`,
                  role: 'coach',
                  text: `Your main point: “${outline[0].trim()}”. Why should your reader care?`,
                  timestamp: Date.now()
                }
              ]);
            }
            navigateTo('coach');
          }}
          disabled={!isOutlineValid}
          className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] disabled:bg-[var(--line)] disabled:text-[var(--mut)] cursor-pointer disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-xs"
        >
          Continue
        </button>
        {!isOutlineValid && (
          <p className="text-center text-xs text-[var(--mut)] mt-1.5">
            Add your own words to unlock
          </p>
        )}
      </div>
    );
  } else if (currentView === 'coach' && coachStage >= 2) {
    primaryCtaContent = (
      <button
        onClick={() => navigateTo('draft')}
        className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] cursor-pointer transition-transform active:scale-[0.98] shadow-xs"
      >
        Open draft
      </button>
    );
  } else if (currentView === 'draft') {
    const isDraftValid = countWords(draftText) >= 8;
    primaryCtaContent = (
      <button
        onClick={() => {
          setStep(3);
          navigateTo('review');
        }}
        disabled={!isDraftValid}
        className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] disabled:bg-[var(--line)] disabled:text-[var(--mut)] cursor-pointer disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-xs"
      >
        Check my draft
      </button>
    );
  } else if (currentView === 'review') {
    primaryCtaContent = (
      <div className="space-y-1.5">
        <button
          onClick={handleFinishAndSummarize}
          className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] cursor-pointer transition-transform active:scale-[0.98] shadow-xs"
        >
          {activeStudentSession ? 'Submit to teacher' : 'See my summary'}
        </button>
        <button
          onClick={() => navigateTo('draft')}
          className="w-full py-1 text-sm font-medium text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer text-center"
        >
          Edit draft
        </button>
      </div>
    );
  } else if (currentView === 'summary') {
    primaryCtaContent = (
      <div className="space-y-1.5">
        <button
          onClick={() => {
            setIsShared(true);
            showToast('Shared with your teacher');
          }}
          disabled={isShared}
          className="w-full h-14 rounded-full bg-[var(--acc)] text-[var(--onacc)] font-semibold text-[17px] disabled:bg-[var(--line)] disabled:text-[var(--mut)] cursor-pointer disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-xs"
        >
          {isShared ? 'Shared with teacher ✓' : 'Share with teacher'}
        </button>
        <button
          onClick={() => {
            setTopic('');
            setOutline(['', '', '']);
            setChat([]);
            setCoachStage(0);
            setDraftText('');
            setIsDone(false);
            setStep(1);
            navigateTo('home');
          }}
          className="w-full py-1 text-sm font-medium text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer text-center"
        >
          Write another
        </button>
      </div>
    );
  }

  const unreadTeacherFlagsCount = teacherNotifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased selection:bg-[var(--accl)] selection:text-[var(--acc)]">
      {/* Toast Notification */}
      <div
        role="status"
        className={`fixed left-1/2 top-16 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {toastMessage}
      </div>

      {/* Main Top Header */}
      <Header
        currentView={currentView}
        draftSecondsRemaining={draftSecondsRemaining}
        isFocusMonitoringActive={isFocusMonitoringActive}
        theme={theme}
        onToggleTheme={toggleTheme}
        canInstallPwa={!!deferredPrompt}
        onInstallPwa={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            setDeferredPrompt(null);
          }
        }}
        onOpenAuthModal={() => {
          setAuthDefaultRole('student');
          setAuthInitialMode('signin');
          setIsAuthModalOpen(true);
        }}
        onNavigateHome={() => navigateTo('landing')}
        onSwitchToTeacherMode={() => {
          setCurrentView('teacher');
          refreshAllTeacherSessions();
        }}
        onSwitchToStudentMode={() => {
          setCurrentView('home');
        }}
        activeTeacherTab={activeTeacherTab}
        onTeacherTabChange={setActiveTeacherTab}
        questionSetsCount={activeQuestionSets.length}
        submissionsCount={allTeacherSessions.length}
        unreadFlagsCount={unreadTeacherFlagsCount}
        onCreateSet={() => setIsCreateSetOpen(true)}
      />

      {/* Main App Container */}
      <main className={`mx-auto px-5 pt-4 ${currentView === 'landing' ? 'max-w-[880px]' : 'max-w-[520px] lg:max-w-[760px]'}`}>
        {/* Step Progress Bar when in ThinkFirst writing flow */}
        {['outline', 'coach', 'draft', 'review', 'summary'].includes(currentView) && (
          <StepProgressBar step={step} />
        )}

        {/* View Routing */}
        {currentView === 'landing' && (
          <LandingPageView
            onEnterCode={() => navigateTo('enter-code')}
            onTeacherLogin={() => {
              if (user?.role === 'teacher') {
                navigateTo('teacher');
              } else {
                setAuthDefaultRole('teacher');
                setAuthInitialMode('signin');
                setIsAuthModalOpen(true);
              }
            }}
            onStudentStart={() => navigateTo('home')}
            onExploreDemo={() => navigateTo('home')}
          />
        )}

        {currentView === 'home' && (
          <HomeView
            topic={topic}
            onTopicChange={setTopic}
            writingType={writingType}
            onWritingTypeChange={setWritingType}
            unfinishedDraft={null}
            onResumeDraft={() => navigateTo('outline')}
            activeQuestionSets={activeQuestionSets}
            onSelectSet={(set) => {
              setActiveSetForStudent(set);
              navigateTo('assignment-notice');
            }}
            onStartThinking={handleStartPersonalThinking}
            onEnterCodeClick={() => navigateTo('enter-code')}
          />
        )}

        {currentView === 'enter-code' && (
          <EnterCodeView
            initialCode={initialUrlCode}
            onCodeVerified={handleCodeVerified}
            onBack={() => navigateTo('home')}
          />
        )}

        {currentView === 'assignment-notice' && activeSetForStudent && (
          <AssignmentNoticeModal
            questionSet={activeSetForStudent}
            onContinue={() => navigateTo('student-details')}
            onCancel={() => navigateTo('home')}
          />
        )}

        {currentView === 'student-details' && activeSetForStudent && (
          <StudentDetailsView
            questionSet={activeSetForStudent}
            onSessionStarted={handleStartSessionWithDetails}
            onBack={() => navigateTo('assignment-notice')}
          />
        )}

        {currentView === 'question-answers' && activeSetForStudent && activeStudentSession && (
          <QuestionAnswersView
            questionSet={activeSetForStudent}
            session={activeStudentSession}
            onUpdateAnswers={(ans) => setQuestionAnswers(ans)}
            onSubmit={handleSubmitActiveSession}
          />
        )}

        {currentView === 'outline' && (
          <OutlineView
            outline={outline}
            onChangeField={(idx, val) => {
              setOutline((prev) => {
                const next: [string, string, string] = [...prev];
                next[idx] = val;
                return next;
              });
            }}
          />
        )}

        {currentView === 'coach' && (
          <CoachView
            chat={chat}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onInsertHint={() => handleInsertHint('coach')}
            stage={coachStage}
          />
        )}

        {currentView === 'draft' && (
          <DraftView
            draftText={draftText}
            onChangeDraft={setDraftText}
            onPasteText={(pasted) => {
              const words = countWords(pasted);
              if (words >= 30) {
                setPastedWords((prev) => prev + words);
                recordPaste(words);
                showToast(`Pasted ${words} words (counted as external)`);
              }
            }}
            onInsertHint={() => handleInsertHint('draft')}
            recentReturnSeconds={recentReturnSeconds}
            onDismissReturnBanner={dismissReturnBanner}
            focusStatus={focusStatus}
            onSaveStudentNote={addStudentNote}
          />
        )}

        {currentView === 'review' && <ReviewView draftText={draftText} />}

        {currentView === 'summary' && sessionResult && (
          <SummaryView
            result={sessionResult}
            isShared={isShared}
            onShareWithTeacher={() => {
              setIsShared(true);
              showToast('Shared with teacher ✓');
            }}
            onWriteAnother={() => {
              setTopic('');
              setOutline(['', '', '']);
              setChat([]);
              setCoachStage(0);
              setDraftText('');
              setIsDone(false);
              setStep(1);
              navigateTo('home');
            }}
            events={focusEvents}
          />
        )}

        {currentView === 'receipt' && submissionReceipt && (
          <ReceiptView
            receipt={submissionReceipt}
            onDone={() => navigateTo('home')}
          />
        )}

        {currentView === 'drafts' && (
          <DraftsView
            currentDraft={null}
            history={savedDrafts.filter((d) => d.done)}
            onResumeDraft={() => navigateTo('outline')}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView history={savedDrafts.filter((d) => d.done)} />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboardView
            questionSets={activeQuestionSets}
            onCreateSet={() => setIsCreateSetOpen(true)}
            onSelectSet={(set) => setSelectedSetForTeacher(set)}
            onOpenQRCode={(set) => setQrCodeSet(set)}
            onDuplicateSet={handleDuplicateSet}
            onToggleSetStatus={handleToggleSetStatus}
            onRegenerateCode={handleRegenerateCode}
            onInspectStudent={(sess, set) => setSelectedSessionForTimeline(sess)}
            notifications={teacherNotifications}
            selectedSet={selectedSetForTeacher}
            setSessions={teacherSetSessions}
            allSessions={allTeacherSessions}
            onBackToSetsList={() => setSelectedSetForTeacher(null)}
            onExportSetCSV={handleExportSetCSV}
            onReopenStudentSession={handleReopenStudentSession}
            onDeleteSet={handleDeleteSet}
            activeTeacherTab={activeTeacherTab}
            onTeacherTabChange={setActiveTeacherTab}
          />
        )}
      </main>

      {/* Bottom Navigation Dock */}
      <NavigationDock
        currentView={currentView}
        onSelectTab={navigateTo}
        ctaContent={primaryCtaContent}
        unreadTeacherFlagsCount={unreadTeacherFlagsCount}
        userRole={userRole}
      />

      {/* Teacher Focus Timeline Modal */}
      {selectedSessionForTimeline && (
        <FocusTimelineModal
          session={selectedSessionForTimeline}
          questionSet={selectedSetForTeacher}
          onClose={() => setSelectedSessionForTimeline(null)}
          onReviewStateChange={async (sessId, state) => {
            try {
              await fetch('/api/teacher/review-flag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: sessId, reviewState: state })
              });
              setTeacherSetSessions((prev) =>
                prev.map((s) => (s.id === sessId ? { ...s, reviewState: state } : s))
              );
              showToast(`Marked as ${state === 'reviewed_ok' ? 'Reviewed OK' : 'Concern'}`);
            } catch {}
          }}
          onReopenSession={handleReopenStudentSession}
        />
      )}

      {/* Create Question Set Modal */}
      {isCreateSetOpen && (
        <CreateQuestionSetModal
          onClose={() => setIsCreateSetOpen(false)}
          onCreate={handleCreateNewSet}
        />
      )}

      {/* Access Code & QR Code Modal */}
      {qrCodeSet && (
        <QRCodeModal
          questionSet={qrCodeSet}
          onClose={() => setQrCodeSet(null)}
          onRegenerateCode={handleRegenerateCode}
        />
      )}

      {/* Role-Governed Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authDefaultRole}
        initialMode={authInitialMode}
        onSuccess={() => {
          if (authDefaultRole === 'teacher') {
            navigateTo('teacher');
          } else {
            navigateTo('home');
          }
        }}
      />
    </div>
  );
}
