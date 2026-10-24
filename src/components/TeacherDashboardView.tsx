import React, { useState, useEffect } from 'react';
import {
  QuestionSet,
  StudentSession,
  TeacherNotification,
  TeacherReviewState
} from '../types/index.ts';
import { formatDuration } from '../utils/rules.ts';
import {
  Plus,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  ArrowLeft,
  Download,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Bell,
  Lock,
  Unlock,
  Search
} from 'lucide-react';

interface TeacherDashboardViewProps {
  questionSets: QuestionSet[];
  onCreateSet: () => void;
  onSelectSet: (set: QuestionSet) => void;
  onOpenQRCode: (set: QuestionSet) => void;
  onDuplicateSet: (setId: string) => Promise<void>;
  onToggleSetStatus: (setId: string, nextStatus: 'open' | 'closed') => Promise<void>;
  onRegenerateCode: (setId: string) => Promise<string | void>;
  onInspectStudent: (session: StudentSession, set?: QuestionSet | null) => void;
  notifications: TeacherNotification[];
  selectedSet: QuestionSet | null;
  setSessions: StudentSession[];
  allSessions?: StudentSession[];
  onBackToSetsList: () => void;
  onExportSetCSV: (set: QuestionSet, sessions: StudentSession[]) => void;
  onReopenStudentSession: (sessionId: string) => Promise<void>;
  activeTeacherTab?: 'sets' | 'submissions';
  onTeacherTabChange?: (tab: 'sets' | 'submissions') => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  questionSets,
  onCreateSet,
  onSelectSet,
  onOpenQRCode,
  onDuplicateSet,
  onToggleSetStatus,
  onRegenerateCode,
  onInspectStudent,
  notifications,
  selectedSet,
  setSessions,
  allSessions = [],
  onBackToSetsList,
  onExportSetCSV,
  onReopenStudentSession,
  activeTeacherTab = 'sets',
  onTeacherTabChange
}) => {
  const [sectionFilter, setSectionFilter] = useState('all');
  const [selectedSetFilter, setSelectedSetFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'submitted' | 'over_time' | 'in_progress'>('all');
  const [sortField, setSortField] = useState<'name' | 'recordedStart' | 'duration' | 'words' | 'status'>('recordedStart');
  const [sortAsc, setSortAsc] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [confirmingRegenSetId, setConfirmingRegenSetId] = useState<string | null>(null);
  const [isRegeneratingSetId, setIsRegeneratingSetId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleConfirmRegenerate = async (setId: string) => {
    setIsRegeneratingSetId(setId);
    try {
      await onRegenerateCode(setId);
      setConfirmingRegenSetId(null);
    } finally {
      setIsRegeneratingSetId(null);
    }
  };

  // If a set is selected, show its results table
  if (selectedSet) {
    const sections = Array.from(new Set(setSessions.map((s) => s.section))).filter(Boolean);

    let filtered = setSessions.filter((s) => {
      if (sectionFilter === 'all') return true;
      return s.section === sectionFilter;
    });

    filtered.sort((a, b) => {
      let comp = 0;
      if (sortField === 'name') comp = a.fullName.localeCompare(b.fullName);
      else if (sortField === 'recordedStart') comp = a.recordedStartAt - b.recordedStartAt;
      else if (sortField === 'duration') comp = (a.durationSeconds || 0) - (b.durationSeconds || 0);
      else if (sortField === 'words') comp = a.wordsWrittenPercent - b.wordsWrittenPercent;
      else if (sortField === 'status') comp = a.status.localeCompare(b.status);
      return sortAsc ? comp : -comp;
    });

    return (
      <div className="w-full max-w-[520px] lg:max-w-[960px] mx-auto pt-4 pb-28">
        {/* Navigation & header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToSetsList}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            All Question Sets
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQRCode(selectedSet)}
              className="h-9 px-3 rounded-xl bg-[var(--card)] border border-[var(--line)] hover:border-[var(--acc)] text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[var(--acc)]" />
              <span>{selectedSet.code}</span>
            </button>

            {confirmingRegenSetId === selectedSet.id ? (
              <div className="flex items-center gap-1.5 p-1 px-2 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] animate-in fade-in">
                <span className="text-[11px] font-medium text-[var(--ambt)]">Regen code?</span>
                <button
                  onClick={() => handleConfirmRegenerate(selectedSet.id)}
                  disabled={isRegeneratingSetId === selectedSet.id}
                  className="px-2 py-0.5 rounded-lg bg-[var(--acc)] text-[var(--onacc)] text-[11px] font-bold cursor-pointer"
                >
                  {isRegeneratingSetId === selectedSet.id ? '...' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmingRegenSetId(null)}
                  className="px-2 py-0.5 rounded-lg bg-[var(--card)] text-[11px] text-[var(--mut)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingRegenSetId(selectedSet.id)}
                className="h-9 px-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] hover:border-[var(--acc)] text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Regenerate access code"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[var(--acc)]" />
                <span className="hidden sm:inline">Regen Code</span>
              </button>
            )}

            <button
              onClick={() => onToggleSetStatus(selectedSet.id, selectedSet.status === 'open' ? 'closed' : 'open')}
              className={`h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                selectedSet.status === 'open'
                  ? 'bg-[var(--card)] border-[var(--line)] hover:border-[var(--amb)] text-[var(--ink)]'
                  : 'bg-[var(--accl)] border-[var(--acc)] text-[var(--acc)] font-semibold'
              }`}
            >
              {selectedSet.status === 'open' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-[var(--ambt)]" />
                  <span>Close Set</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-[var(--acc)]" />
                  <span>Reopen Set</span>
                </>
              )}
            </button>

            <button
              onClick={() => onExportSetCSV(selectedSet, filtered)}
              className="h-9 px-3 rounded-xl bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--acc)] font-medium">
              {selectedSet.type} Set · Code: {selectedSet.code}
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                selectedSet.status === 'open'
                  ? 'bg-[var(--accl)] text-[var(--acc)]'
                  : 'bg-[var(--line)] text-[var(--mut)]'
              }`}
            >
              {selectedSet.status}
            </span>
          </div>

          <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-1">
            {selectedSet.title}
          </h2>

          <div className="text-xs text-[var(--mut)] flex items-center gap-3">
            <span>Limit: {selectedSet.timeLimitMinutes || 15} mins</span>
            <span>·</span>
            <span>{setSessions.length} total submissions</span>
          </div>
        </div>

        {/* Filters and controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--mut)]" />
            <span className="text-xs font-mono text-[var(--mut)]">Section:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none cursor-pointer"
            >
              <option value="all">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--mut)]" />
            <span className="text-xs font-mono text-[var(--mut)]">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] outline-none cursor-pointer"
            >
              <option value="recordedStart">Start Time</option>
              <option value="name">Student Name</option>
              <option value="duration">Duration</option>
              <option value="words">Words %</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="h-8 px-2 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs font-mono text-[var(--mut)] cursor-pointer"
            >
              {sortAsc ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Results Table (Section 3.3) */}
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)]/40 text-[10.5px] font-mono tracking-wider uppercase text-[var(--mut)]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-3">Section</th>
                  <th className="py-3 px-3">Declared Start</th>
                  <th className="py-3 px-3">Recorded Start</th>
                  <th className="py-3 px-3">Finished</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Words %</th>
                  <th className="py-3 px-4 text-right">Focus</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const declaredTime = s.declaredTime || s.declaredDateTime;
                  const recordedStartTimeStr = new Date(s.recordedStartAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const finishedTimeStr = s.finishedAt
                    ? new Date(s.finishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const isAmberBar = s.wordsWrittenPercent < 70;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onInspectStudent(s, selectedSet)}
                      className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--bg)]/50 transition-colors cursor-pointer group"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                          {s.fullName}
                        </div>
                        {s.studentNote && (
                          <div className="text-[10px] text-[var(--mut)] italic truncate max-w-[120px]">
                            "{s.studentNote}"
                          </div>
                        )}
                      </td>

                      {/* Section */}
                      <td className="py-3 px-3 font-mono text-[var(--mut)]">
                        {s.section}
                      </td>

                      {/* Declared Start + Time Mismatch note */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[var(--ink)] block">{declaredTime}</span>
                        {s.isTimeMismatch && (
                          <span
                            className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[var(--ambl)] text-[var(--ambt)] border border-[var(--amb)] font-semibold"
                            title="Declared time differs from server time by >10 min"
                          >
                            Time mismatch
                          </span>
                        )}
                      </td>

                      {/* Recorded Start */}
                      <td className="py-3 px-3 font-mono text-[var(--mut)]">
                        {recordedStartTimeStr}
                      </td>

                      {/* Finished */}
                      <td className="py-3 px-3 font-mono text-[var(--mut)]">
                        {finishedTimeStr}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 font-mono text-[var(--ink)]">
                        {s.durationSeconds ? formatDuration(s.durationSeconds) : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10.5px] px-2 py-0.5 rounded-full capitalize ${
                            s.status === 'submitted'
                              ? 'bg-[var(--accl)] text-[var(--acc)] font-medium'
                              : s.status === 'over_time'
                              ? 'bg-[var(--ambl)] text-[var(--ambt)] font-semibold'
                              : 'bg-[var(--line)] text-[var(--mut)]'
                          }`}
                        >
                          {s.status === 'over_time' ? 'Over time' : s.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Words Written % */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-2 rounded-full bg-[var(--line)] overflow-hidden">
                            <div
                              className={`h-full ${isAmberBar ? 'bg-[var(--amb)]' : 'bg-[var(--acc)]'}`}
                              style={{ width: `${s.wordsWrittenPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[var(--mut)]">
                            {s.wordsWrittenPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Focus Flag Chip */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {s.focusFlagLevel === 'flagged' ? (
                            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--amb)] text-[var(--onacc)] shadow-xs">
                              Flagged
                            </span>
                          ) : s.focusFlagLevel === 'notice' ? (
                            <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full border border-[var(--amb)] text-[var(--ambt)]">
                              Notice
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--accl)] text-[var(--acc)]">
                              Clear
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--mut)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-[var(--mut)]">
                      No students have started or submitted this set yet. Share code{' '}
                      <strong>{selectedSet.code}</strong> with your class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Submissions & Integrity Log Overview
  if (activeTeacherTab === 'submissions' && !selectedSet) {
    const combinedSessions = allSessions.length > 0 ? allSessions : setSessions;
    const sections = Array.from(new Set(combinedSessions.map((s) => s.section))).filter(Boolean);

    const displaySessions = combinedSessions.filter((s) => {
      if (selectedSetFilter !== 'all' && s.setId !== selectedSetFilter) return false;
      if (sectionFilter !== 'all' && s.section !== sectionFilter) return false;
      if (statusFilter === 'flagged' && s.focusFlagLevel !== 'flagged') return false;
      if (statusFilter === 'submitted' && s.status !== 'submitted') return false;
      if (statusFilter === 'over_time' && s.status !== 'over_time') return false;
      if (statusFilter === 'in_progress' && s.status !== 'in_progress') return false;
      if (studentSearch.trim() && !s.fullName.toLowerCase().includes(studentSearch.toLowerCase().trim())) {
        return false;
      }
      return true;
    });

    displaySessions.sort((a, b) => {
      let comp = 0;
      if (sortField === 'name') comp = a.fullName.localeCompare(b.fullName);
      else if (sortField === 'recordedStart') comp = a.recordedStartAt - b.recordedStartAt;
      else if (sortField === 'duration') comp = (a.durationSeconds || 0) - (b.durationSeconds || 0);
      else if (sortField === 'words') comp = a.wordsWrittenPercent - b.wordsWrittenPercent;
      else if (sortField === 'status') comp = a.status.localeCompare(b.status);
      return sortAsc ? comp : -comp;
    });

    const totalSubmissions = combinedSessions.length;
    const flaggedCount = combinedSessions.filter((s) => s.focusFlagLevel === 'flagged').length;
    const mismatchesCount = combinedSessions.filter((s) => s.isTimeMismatch).length;
    const completedCount = combinedSessions.filter((s) => s.status === 'submitted').length;

    const exportCombinedCSV = () => {
      const dummySet: QuestionSet = {
        id: 'all',
        teacherId: 'all',
        title: 'All_Question_Sets',
        code: 'ALL',
        type: 'Report',
        prompts: [],
        sectionsAllowed: [],
        focusMonitoring: true,
        timeUpRule: 'over_time',
        coachEnabled: true,
        status: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onExportSetCSV(dummySet, displaySessions);
    };

    return (
      <div className="w-full max-w-[520px] lg:max-w-[960px] mx-auto pt-4 pb-28">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-serif text-[30px] sm:text-[32px] font-normal leading-tight text-[var(--ink)] m-0">
              Submissions &amp; Integrity
            </h2>
            <p className="text-xs text-[var(--mut)] mt-0.5">
              Review real-time student writing progress, verified start timestamps, and focus integrity audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCombinedCSV}
              disabled={displaySessions.length === 0}
              className="h-9 px-3.5 rounded-xl bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <div className="text-[11px] font-mono uppercase text-[var(--mut)]">Total Sessions</div>
            <div className="text-2xl font-mono font-bold text-[var(--ink)] mt-0.5">{totalSubmissions}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <div className="text-[11px] font-mono uppercase text-[var(--mut)]">Completed</div>
            <div className="text-2xl font-mono font-bold text-[var(--acc)] mt-0.5">{completedCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <div className="text-[11px] font-mono uppercase text-[var(--mut)]">Flagged Help</div>
            <div className="text-2xl font-mono font-bold text-[var(--ambt)] mt-0.5">{flaggedCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
            <div className="text-[11px] font-mono uppercase text-[var(--mut)]">Time Mismatches</div>
            <div className="text-2xl font-mono font-bold text-[var(--ink)] mt-0.5">{mismatchesCount}</div>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4 p-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-xs">
          {/* Question Set Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-[var(--mut)]">Set:</span>
            <select
              value={selectedSetFilter}
              onChange={(e) => setSelectedSetFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] cursor-pointer"
            >
              <option value="all">All Question Sets</option>
              {questionSets.map((qs) => (
                <option key={qs.id} value={qs.id}>
                  {qs.title} ({qs.code})
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-[var(--mut)]">Section:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] cursor-pointer"
            >
              <option value="all">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-[var(--mut)]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="flagged">Flagged Only</option>
              <option value="submitted">Submitted</option>
              <option value="over_time">Over Time</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          {/* Search by student name */}
          <div className="flex-1 min-w-[150px] relative">
            <Search className="w-3.5 h-3.5 text-[var(--mut)] absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--mut)]"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)]/40 text-[10.5px] font-mono tracking-wider uppercase text-[var(--mut)]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Set</th>
                  <th className="py-3 px-3">Section</th>
                  <th className="py-3 px-3">Start Time</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Words %</th>
                  <th className="py-3 px-4 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody>
                {displaySessions.map((s) => {
                  const setObj = questionSets.find((q) => q.id === s.setId);
                  const recordedStartTimeStr = new Date(s.recordedStartAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const isAmberBar = s.wordsWrittenPercent < 70;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onInspectStudent(s, setObj || null)}
                      className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--bg)]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors">
                          {s.fullName}
                        </div>
                        {s.studentNote && (
                          <div className="text-[10px] text-[var(--mut)] italic truncate max-w-[140px]">
                            "{s.studentNote}"
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-[var(--ink)] truncate max-w-[120px] block">
                          {setObj?.title || s.setId}
                        </span>
                        {setObj?.code && (
                          <span className="text-[10px] font-mono text-[var(--mut)]">
                            {setObj.code}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[var(--mut)]">{s.section}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[var(--ink)] block">{recordedStartTimeStr}</span>
                        {s.isTimeMismatch && (
                          <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[var(--ambl)] text-[var(--ambt)] border border-[var(--amb)] font-semibold">
                            Time mismatch
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[var(--ink)]">
                        {s.durationSeconds ? formatDuration(s.durationSeconds) : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10.5px] px-2 py-0.5 rounded-full capitalize ${
                            s.status === 'submitted'
                              ? 'bg-[var(--accl)] text-[var(--acc)] font-medium'
                              : s.status === 'over_time'
                              ? 'bg-[var(--ambl)] text-[var(--ambt)] font-semibold'
                              : 'bg-[var(--line)] text-[var(--mut)]'
                          }`}
                        >
                          {s.status === 'over_time' ? 'Over time' : s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-2 rounded-full bg-[var(--line)] overflow-hidden">
                            <div
                              className={`h-full ${isAmberBar ? 'bg-[var(--amb)]' : 'bg-[var(--acc)]'}`}
                              style={{ width: `${s.wordsWrittenPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-[var(--mut)]">
                            {s.wordsWrittenPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {s.focusFlagLevel === 'flagged' ? (
                            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--amb)] text-[var(--onacc)] shadow-xs">
                              Flagged
                            </span>
                          ) : s.focusFlagLevel === 'notice' ? (
                            <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full border border-[var(--amb)] text-[var(--ambt)]">
                              Notice
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--accl)] text-[var(--acc)]">
                              Clear
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--mut)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {displaySessions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[var(--mut)]">
                      No matching student submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Question Sets List Overview
  return (
    <div className="w-full max-w-[520px] lg:max-w-[800px] mx-auto pt-4 pb-28">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-[32px] font-normal leading-tight text-[var(--ink)] m-0">
            Question Sets
          </h2>
          <p className="text-xs text-[var(--mut)] mt-0.5">
            Manage your question sets, access codes, and student time records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications bell */}
          <button
            onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
            className="relative p-2.5 rounded-full bg-[var(--card)] border border-[var(--line)] text-[var(--mut)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="Focus integrity notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--amb)] text-[var(--onacc)] text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={onCreateSet}
            className="h-10 px-4 rounded-full bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            Create Set
          </button>
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotificationsDrawer && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--card)] border border-[var(--amb)] shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[var(--ambt)]">
              <ShieldAlert className="w-4 h-4 text-[var(--amb)]" />
              Focus Outside Help Notifications ({notifications.length})
            </div>
            <button
              onClick={() => setShowNotificationsDrawer(false)}
              className="text-xs text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs flex justify-between items-start"
              >
                <div>
                  <span className="font-semibold text-[var(--ink)] block">
                    {n.studentName} ({n.section})
                  </span>
                  <span className="text-[var(--mut)] block text-[11px] mb-1">
                    {n.setTitle}
                  </span>
                  {/* Two numbers that matter most: Times left & Time away */}
                  <div className="font-mono text-[11px] font-semibold text-[var(--ambt)]">
                    Times left: {n.timesLeft} · Time away: {formatDuration(n.secondsAway)}
                  </div>
                  {n.textAddedOrPasted && (
                    <span className="text-[10px] text-[var(--mut)] block mt-0.5">
                      Text was added or pasted after returning.
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[var(--mut)] shrink-0">
                  {new Date(n.latestLeaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {notifications.length === 0 && (
              <p className="text-xs text-[var(--mut)] py-2 text-center">
                No students flagged for possible outside help.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Question Sets List */}
      <div className="space-y-3.5">
        {questionSets.map((set) => {
          const isOpen = set.status === 'open';

          return (
            <div
              key={set.id}
              className="p-5 rounded-[22px] bg-[var(--card)] border border-[var(--line)] hover:border-[var(--mut)] transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div
                  onClick={() => onSelectSet(set)}
                  className="flex-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--acc)] font-semibold">
                      {set.type}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        isOpen ? 'bg-[var(--accl)] text-[var(--acc)]' : 'bg-[var(--line)] text-[var(--mut)]'
                      }`}
                    >
                      {set.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-[22px] leading-tight text-[var(--ink)] group-hover:text-[var(--acc)] transition-colors mb-1">
                    {set.title}
                  </h3>

                  <p className="text-xs text-[var(--mut)] line-clamp-1 mb-2">
                    {set.prompts[0]}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[var(--mut)] font-mono">
                    <span>{set.timeLimitMinutes || 15}m limit</span>
                    <span>·</span>
                    <span>{set.submissionCount || 0} submissions</span>
                  </div>
                </div>

                {/* Access Code Box */}
                <div className="shrink-0 text-right">
                  <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-center mb-1.5">
                    <span className="block text-[10px] font-mono uppercase text-[var(--mut)]">
                      Code
                    </span>
                    <span className="font-mono text-lg font-bold text-[var(--ink)] tracking-widest block">
                      {set.code}
                    </span>
                  </div>

                  {confirmingRegenSetId === set.id ? (
                    <div className="p-2 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] text-right animate-in fade-in space-y-1">
                      <p className="text-[10px] text-[var(--ambt)] font-medium">Invalidate {set.code}?</p>
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleConfirmRegenerate(set.id)}
                          disabled={isRegeneratingSetId === set.id}
                          className="px-2 py-0.5 rounded-md bg-[var(--acc)] text-[var(--onacc)] text-[10px] font-bold cursor-pointer"
                        >
                          {isRegeneratingSetId === set.id ? '...' : 'Regen'}
                        </button>
                        <button
                          onClick={() => setConfirmingRegenSetId(null)}
                          className="px-2 py-0.5 rounded-md bg-[var(--card)] text-[10px] text-[var(--mut)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleCopyCode(set.code, set.id)}
                        className="p-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--line)] text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCodeId === set.id ? <Check className="w-3.5 h-3.5 text-[var(--acc)]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onOpenQRCode(set)}
                        className="p-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--line)] text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
                        title="Show QR Code & Access Details"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmingRegenSetId(set.id)}
                        className="p-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--line)] text-[var(--mut)] hover:text-[var(--acc)] cursor-pointer"
                        title="Regenerate code"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-[var(--line)] mt-3 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectSet(set)}
                  className="font-semibold text-[var(--acc)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Results &amp; Student Times ({set.submissionCount || 0})
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 text-[var(--mut)]">
                  <button
                    onClick={() => onDuplicateSet(set.id)}
                    className="hover:text-[var(--ink)] cursor-pointer"
                  >
                    Duplicate
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => onToggleSetStatus(set.id, isOpen ? 'closed' : 'open')}
                    className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                      isOpen ? 'text-[var(--ambt)] hover:underline' : 'text-[var(--acc)] hover:underline'
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Close Set</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Reopen Set</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {questionSets.length === 0 && (
          <div className="p-8 rounded-[24px] bg-[var(--card)] border border-[var(--line)] text-center">
            <p className="text-sm text-[var(--mut)] mb-3">
              No question sets created yet.
            </p>
            <button
              onClick={onCreateSet}
              className="h-10 px-4 rounded-full bg-[var(--acc)] text-[var(--onacc)] text-xs font-semibold cursor-pointer"
            >
              Create your first set
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
