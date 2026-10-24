import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { QuestionSet, StudentSession, FocusEvent } from '../types/index.ts';
import { normalizeAccessCode } from '../utils/rules.ts';
import firebaseConfig from '../../firebase-applet-config.json';

const STORAGE_SETS_KEY = 'thinkfirst_firestore_sets_v1';
const STORAGE_SESSIONS_KEY = 'thinkfirst_firestore_sessions_v1';

// Initial default question sets
export const INITIAL_QUESTION_SETS: QuestionSet[] = [
  {
    id: 'set-climate-report',
    teacherId: 'teacher-reyes',
    teacherEmail: 'elena.reyes@school.edu',
    teacherName: 'Ms. Elena Reyes',
    title: 'Essay 1: Climate Impact in Our Province',
    type: 'Report',
    prompts: [
      'How is changing weather or climate hurting families or farmers in our province, and what local action can reduce this harm?'
    ],
    instructions: 'Support your claims with at least one local example. Do not use AI generators.',
    timeLimitMinutes: 15,
    openAt: '',
    closeAt: '',
    sectionsAllowed: ['10-A', '10-B', '10-C'],
    focusMonitoring: true,
    timeUpRule: 'over_time',
    coachEnabled: true,
    status: 'open',
    code: 'CLIM88',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    submissionCount: 5
  },
  {
    id: 'set-quarterly-refl',
    teacherId: 'teacher-reyes',
    teacherEmail: 'elena.reyes@school.edu',
    teacherName: 'Ms. Elena Reyes',
    title: 'Quarterly Reflection: AI and Learning Habits',
    type: 'Reflection',
    prompts: [
      'Reflect on how using digital tools has changed how deeply you think when completing schoolwork.'
    ],
    instructions: 'Be honest and reflective. Write from personal experience.',
    timeLimitMinutes: 20,
    openAt: '',
    closeAt: '',
    sectionsAllowed: ['10-A', '10-B'],
    focusMonitoring: true,
    timeUpRule: 'over_time',
    coachEnabled: true,
    status: 'open',
    code: 'REFL24',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    submissionCount: 3
  },
  {
    id: 'set-renewable-questions',
    teacherId: 'teacher-reyes',
    teacherEmail: 'elena.reyes@school.edu',
    teacherName: 'Ms. Elena Reyes',
    title: 'Module 3: Renewable Energy Policy',
    type: 'Question',
    prompts: [
      'What is the primary obstacle to expanding solar grids in rural municipalities?',
      'How does geothermal energy compare with hydro in terms of environmental impact?',
      'Propose one municipal incentive to encourage commercial solar panel adoption.'
    ],
    instructions: 'Answer each prompt in 2-4 sentences in your own words.',
    timeLimitMinutes: 25,
    openAt: '',
    closeAt: '',
    sectionsAllowed: [],
    focusMonitoring: true,
    timeUpRule: 'over_time',
    coachEnabled: true,
    status: 'open',
    code: 'POLI95',
    createdAt: Date.now() - 21600000,
    updatedAt: Date.now() - 21600000,
    submissionCount: 2
  }
];

export const INITIAL_STUDENT_SESSIONS: StudentSession[] = [
  {
    id: 'sess-ana',
    setId: 'set-climate-report',
    fullName: 'Ana Lim',
    section: '10-A',
    declaredDateTime: '2026-10-24 9:00 AM',
    declaredDate: '2026-10-24',
    declaredTime: '9:00 AM',
    declaredTimeZone: 'Asia/Manila',
    recordedStartAt: Date.now() - 1320000,
    finishedAt: Date.now() - 1200000,
    durationSeconds: 1320,
    isOverTime: false,
    isLateSync: false,
    isTimeMismatch: false,
    mismatchMinutes: 2,
    answers: {},
    outline: ['Climate impact on fishing', 'Sea temperature rise', 'Alternative livelihood'],
    chat: [],
    coachStage: 2,
    draft: 'Rising sea temperatures have driven fish further out from our coastline. Small artisanal boats cannot venture that far safely.',
    step: 4,
    wordsWrittenPercent: 92,
    studentWords: 145,
    suggestionWords: 12,
    pastedWords: 0,
    status: 'submitted',
    focusTimesLeft: 0,
    focusSecondsAway: 0,
    focusFlagLevel: 'clear',
    reviewState: 'reviewed_ok',
    events: [],
    updatedAt: Date.now() - 1200000
  },
  {
    id: 'sess-dan',
    setId: 'set-climate-report',
    fullName: 'Dan Santos',
    section: '10-B',
    declaredDateTime: '2026-10-24 8:40 AM',
    declaredDate: '2026-10-24',
    declaredTime: '8:40 AM',
    declaredTimeZone: 'Asia/Manila',
    recordedStartAt: Date.now() - 600000,
    finishedAt: Date.now() - 60000,
    durationSeconds: 540,
    isOverTime: false,
    isLateSync: false,
    isTimeMismatch: true,
    mismatchMinutes: 30,
    answers: {},
    outline: ['Drought impacts yield', 'Dam levels drop', 'Imports needed'],
    chat: [],
    coachStage: 2,
    draft: 'Severe dry spells drastically reduce rice harvests across the central plains.',
    step: 3,
    wordsWrittenPercent: 61,
    studentWords: 68,
    suggestionWords: 8,
    pastedWords: 52,
    status: 'submitted',
    focusTimesLeft: 1,
    focusSecondsAway: 42,
    focusFlagLevel: 'flagged',
    studentNote: 'My internet disconnected and I had to reconnect my browser window.',
    reviewState: 'unreviewed',
    events: [],
    updatedAt: Date.now() - 60000
  }
];

// Initialize Firebase App & Firestore
let firestoreDb: any = null;

try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (firebaseConfig.firestoreDatabaseId) {
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (e) {
  console.warn('[ThinkFirst] Firestore init warning, using local cache:', e);
}

// Local cache helpers for resilient offline-first execution
function getCachedSets(): QuestionSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_SETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...INITIAL_QUESTION_SETS];
}

function saveCachedSets(sets: QuestionSet[]): void {
  try {
    localStorage.setItem(STORAGE_SETS_KEY, JSON.stringify(sets));
  } catch {}
}

function getCachedSessions(): StudentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...INITIAL_STUDENT_SESSIONS];
}

function saveCachedSessions(sessions: StudentSession[]): void {
  try {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

export const firestoreService = {
  /**
   * Fetch all question sets (combines Firestore and local cache)
   */
  async getQuestionSets(): Promise<QuestionSet[]> {
    const cached = getCachedSets();

    if (!firestoreDb) {
      return cached;
    }

    try {
      const snap = await getDocs(collection(firestoreDb, 'questionSets'));
      if (!snap.empty) {
        const cloudSets: QuestionSet[] = [];
        snap.forEach((docSnap) => {
          cloudSets.push(docSnap.data() as QuestionSet);
        });

        // Merge cloud sets with cached sets, cloud sets taking precedence
        const setMap = new Map<string, QuestionSet>();
        cached.forEach((s) => setMap.set(s.id, s));
        cloudSets.forEach((s) => setMap.set(s.id, s));

        const merged = Array.from(setMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        saveCachedSets(merged);
        return merged;
      } else {
        // Seed default sets to cloud if cloud collection is empty
        for (const set of cached) {
          try {
            await setDoc(doc(firestoreDb, 'questionSets', set.id), set);
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[ThinkFirst] Firestore getQuestionSets offline fallback:', err);
    }

    return cached;
  },

  /**
   * Create or update a question set
   */
  async saveQuestionSet(set: QuestionSet): Promise<QuestionSet> {
    // 1. Optimistically write to local cache
    const current = getCachedSets();
    const existingIdx = current.findIndex((s) => s.id === set.id);
    let updated: QuestionSet[];
    if (existingIdx >= 0) {
      updated = current.map((s) => (s.id === set.id ? set : s));
    } else {
      updated = [set, ...current];
    }
    saveCachedSets(updated);

    // 2. Persist to Firestore if available
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'questionSets', set.id);
        await setDoc(docRef, set, { merge: true });
      } catch (err) {
        console.warn('[ThinkFirst] Firestore saveQuestionSet write failed, saved locally:', err);
      }
    }

    return set;
  },

  /**
   * Update question set status (open or closed)
   */
  async updateQuestionSetStatus(setId: string, nextStatus: 'open' | 'closed'): Promise<void> {
    const current = getCachedSets();
    const updated = current.map((s) => (s.id === setId ? { ...s, status: nextStatus, updatedAt: Date.now() } : s));
    saveCachedSets(updated);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'questionSets', setId);
        await updateDoc(docRef, { status: nextStatus, updatedAt: Date.now() });
      } catch (err) {
        console.warn('[ThinkFirst] Firestore status update failed:', err);
      }
    }
  },

  /**
   * Regenerate 6-character access code for a set
   */
  async regenerateQuestionSetCode(setId: string, newCode: string): Promise<string> {
    const current = getCachedSets();
    const updated = current.map((s) => (s.id === setId ? { ...s, code: newCode, updatedAt: Date.now() } : s));
    saveCachedSets(updated);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'questionSets', setId);
        await updateDoc(docRef, { code: newCode, updatedAt: Date.now() });
      } catch (err) {
        console.warn('[ThinkFirst] Firestore code regeneration failed:', err);
      }
    }

    return newCode;
  },

  /**
   * Duplicate a question set
   */
  async duplicateQuestionSet(source: QuestionSet, newCode: string): Promise<QuestionSet> {
    const dup: QuestionSet = {
      ...source,
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${source.title} (Copy)`,
      code: newCode,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      submissionCount: 0
    };

    await this.saveQuestionSet(dup);
    return dup;
  },

  /**
   * Lookup question set by 6-character code
   */
  async getQuestionSetByCode(code: string): Promise<QuestionSet | null> {
    const clean = normalizeAccessCode(code);
    const cached = getCachedSets();
    const foundInCache = cached.find((s) => normalizeAccessCode(s.code) === clean);

    if (foundInCache) {
      return foundInCache;
    }

    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'questionSets'));
        let found: QuestionSet | null = null;
        snap.forEach((d) => {
          const data = d.data() as QuestionSet;
          if (normalizeAccessCode(data.code) === clean) {
            found = data;
          }
        });
        if (found) {
          saveCachedSets([found, ...cached]);
          return found;
        }
      } catch {}
    }

    return null;
  },

  /**
   * Fetch all student sessions
   */
  async getAllStudentSessions(): Promise<StudentSession[]> {
    const cached = getCachedSessions();

    if (!firestoreDb) {
      return cached;
    }

    try {
      const snap = await getDocs(collection(firestoreDb, 'studentSessions'));
      if (!snap.empty) {
        const cloudSessions: StudentSession[] = [];
        snap.forEach((docSnap) => {
          cloudSessions.push(docSnap.data() as StudentSession);
        });

        const sessionMap = new Map<string, StudentSession>();
        cached.forEach((s) => sessionMap.set(s.id, s));
        cloudSessions.forEach((s) => sessionMap.set(s.id, s));

        const merged = Array.from(sessionMap.values()).sort((a, b) => b.recordedStartAt - a.recordedStartAt);
        saveCachedSessions(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[ThinkFirst] Firestore getAllStudentSessions offline fallback:', err);
    }

    return cached;
  },

  /**
   * Save or start student session
   */
  async saveStudentSession(session: StudentSession): Promise<StudentSession> {
    const current = getCachedSessions();
    const existingIdx = current.findIndex((s) => s.id === session.id);
    let updated: StudentSession[];
    if (existingIdx >= 0) {
      updated = current.map((s) => (s.id === session.id ? session : s));
    } else {
      updated = [session, ...current];
    }
    saveCachedSessions(updated);

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'studentSessions', session.id);
        await setDoc(docRef, session, { merge: true });
      } catch (err) {
        console.warn('[ThinkFirst] Firestore saveStudentSession fallback to local:', err);
      }
    }

    return session;
  },

  /**
   * Record focus event
   */
  async recordFocusEvent(sessionId: string, event: FocusEvent): Promise<void> {
    if (!firestoreDb) return;
    try {
      const docRef = doc(firestoreDb, 'studentSessions', sessionId, 'focusEvents', event.id);
      await setDoc(docRef, event);
    } catch {}
  }
};
