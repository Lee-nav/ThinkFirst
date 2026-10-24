/**
 * Type definitions for ThinkFirst
 */

export type WritingType = 'Essay' | 'Report' | 'Reflection' | 'Question';

export type ScreenView =
  | 'landing'
  | 'home'
  | 'enter-code'
  | 'assignment-notice'
  | 'student-details'
  | 'outline'
  | 'coach'
  | 'draft'
  | 'question-answers'
  | 'review'
  | 'summary'
  | 'receipt'
  | 'drafts'
  | 'progress'
  | 'teacher'
  | 'teacher-set-detail'
  | 'teacher-create-set';

export type FocusFlagLevel = 'clear' | 'notice' | 'flagged';
export type TeacherReviewState = 'unreviewed' | 'reviewed_ok' | 'concern';
export type QuestionSetStatus = 'draft' | 'open' | 'closed';
export type StudentSessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'over_time';

export interface ChatMessage {
  id: string;
  role: 'student' | 'coach' | 'refusal';
  text: string;
  timestamp: number;
}

export interface FocusEvent {
  id: string;
  sessionId: string;
  setId?: string;
  type: 'left' | 'returned' | 'paste' | 'burst' | 'second_session' | 'note';
  step: number;
  serverTime: number;
  deviceTime: number;
  secondsAway?: number;
  wordsPasted?: number;
  wordsAddedAfterReturn?: number;
  noteText?: string;
  isLate?: boolean;
}

export interface FocusStatus {
  level: FocusFlagLevel;
  leavesCount: number;
  totalSecondsAway: number;
  largestPasteWords: number;
  wordsAddedAfterReturn: number;
  reasons: string[];
  reviewState: TeacherReviewState;
  studentNote?: string;
  secondSessionDetected?: boolean;
}

export interface QuestionSet {
  id: string;
  teacherId: string;
  teacherEmail?: string;
  teacherName?: string;
  title: string;
  type: 'Report' | 'Reflection' | 'Question';
  prompts: string[];
  instructions?: string;
  timeLimitMinutes?: number; // optional, default 15
  openAt?: string; // ISO or date string
  closeAt?: string;
  sectionsAllowed: string[]; // empty means student types their own
  focusMonitoring: boolean; // default true
  timeUpRule: 'over_time' | 'auto_submit'; // default 'over_time'
  coachEnabled: boolean; // default true
  status: QuestionSetStatus;
  code: string; // 6-char access code
  createdAt: number;
  updatedAt: number;
  submissionCount?: number;
}

export interface StudentSession {
  id: string;
  setId: string;
  fullName: string;
  section: string;
  declaredDateTime: string; // user typed e.g. "2026-10-24 2:05 PM"
  declaredDate: string;
  declaredTime: string;
  declaredTimeZone: string;
  recordedStartAt: number; // server timestamp
  finishedAt?: number; // server timestamp
  deviceFinishTime?: number;
  durationSeconds?: number;
  isOverTime: boolean;
  isLateSync: boolean;
  isTimeMismatch: boolean;
  mismatchMinutes?: number;
  answers: Record<string, string>; // for Question type: promptIndex -> answer
  outline: [string, string, string];
  chat: ChatMessage[];
  coachStage: number;
  draft: string;
  step: number;
  wordsWrittenPercent: number;
  studentWords: number;
  suggestionWords: number;
  pastedWords: number;
  status: StudentSessionStatus;
  focusTimesLeft: number;
  focusSecondsAway: number;
  focusFlagLevel: FocusFlagLevel;
  studentNote?: string;
  reviewState: TeacherReviewState;
  events?: FocusEvent[];
  updatedAt: number;
}

export interface TeacherNotification {
  id: string;
  sessionId: string;
  setId: string;
  setTitle: string;
  studentName: string;
  section: string;
  timesLeft: number;
  secondsAway: number;
  textAddedOrPasted: boolean;
  latestLeaveTime: number;
  timestamp: number;
  read: boolean;
}

export interface SessionResult {
  percentYourWords: number;
  studentWords: number;
  suggestionWords: number;
  pastedWords: number;
  totalWords: number;
  minutes: number;
  hintsUsed: number;
  focusStatus: FocusStatus;
}

export interface SavedDraft {
  id: string;
  topic: string;
  type: WritingType;
  assignmentId?: string;
  setId?: string;
  outline: [string, string, string];
  chat: ChatMessage[];
  coachStage: number;
  draft: string;
  step: number;
  startTime: number;
  hintsUsed: number;
  suggestionWords: number;
  pastedWords: number;
  done: boolean;
  result?: SessionResult;
  isSharedWithTeacher: boolean;
  updatedAt: number;
}
