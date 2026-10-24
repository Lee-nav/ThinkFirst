import React from 'react';
import { StudentSession, QuestionSet } from '../types/index.ts';
import { formatDuration } from '../utils/rules.ts';
import { ShieldAlert, CheckCircle2, AlertTriangle, X, Clock, HelpCircle, RefreshCw } from 'lucide-react';

interface FocusTimelineModalProps {
  session: StudentSession;
  questionSet?: QuestionSet | null;
  onClose: () => void;
  onReviewStateChange: (sessionId: string, state: 'reviewed_ok' | 'concern') => void;
  onReopenSession?: (sessionId: string) => Promise<void>;
}

export const FocusTimelineModal: React.FC<FocusTimelineModalProps> = ({
  session,
  questionSet,
  onClose,
  onReviewStateChange,
  onReopenSession
}) => {
  const recordedStartStr = new Date(session.recordedStartAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const finishedStr = session.finishedAt
    ? new Date(session.finishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'In progress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[24px] max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--amb)]" />
            <h3 className="font-serif text-2xl font-normal text-[var(--ink)]">
              {session.fullName} · {session.section}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--mut)] hover:text-[var(--ink)] rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview card */}
        <div className="mb-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--ink)] space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-sm block">{questionSet?.title || 'Assignment'}</span>
              <span className="text-[var(--mut)]">
                Status: <strong className="capitalize">{session.status.replace('_', ' ')}</strong> · {session.wordsWrittenPercent}% student words
              </span>
            </div>
            <span
              className={`font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                session.focusFlagLevel === 'flagged'
                  ? 'bg-[var(--amb)] text-[var(--onacc)]'
                  : session.focusFlagLevel === 'notice'
                  ? 'border border-[var(--amb)] text-[var(--ambt)]'
                  : 'bg-[var(--accl)] text-[var(--acc)]'
              }`}
            >
              {session.focusFlagLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--line)]/60 text-[11.5px] font-mono">
            <div>
              <span className="text-[var(--mut)] block text-[10px] uppercase">Declared Start</span>
              <span className="font-semibold">{session.declaredTime || session.declaredDateTime}</span>
              {session.isTimeMismatch && (
                <span className="block text-[9.5px] text-[var(--ambt)] font-bold">
                  Time mismatch ({session.mismatchMinutes || 10}m gap)
                </span>
              )}
            </div>

            <div>
              <span className="text-[var(--mut)] block text-[10px] uppercase">Recorded Start</span>
              <span className="font-semibold">{recordedStartStr}</span>
            </div>

            <div>
              <span className="text-[var(--mut)] block text-[10px] uppercase">Finished Time</span>
              <span className="font-semibold">{finishedStr}</span>
            </div>

            <div>
              <span className="text-[var(--mut)] block text-[10px] uppercase">Duration</span>
              <span className="font-semibold">{session.durationSeconds ? formatDuration(session.durationSeconds) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Two numbers that matter most: Times left & Time away */}
        <div className="mb-4 p-3 rounded-xl bg-[var(--ambl)] border border-[var(--amb)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[var(--ambt)] font-bold block">
              Focus Summary
            </span>
            <div className="font-mono text-sm font-bold text-[var(--ink)]">
              Times left: {session.focusTimesLeft} · Time away: {formatDuration(session.focusSecondsAway)}
            </div>
          </div>
          {session.focusTimesLeft > 0 && (
            <span className="text-xs text-[var(--ambt)] font-medium">
              Possible outside help
            </span>
          )}
        </div>

        {/* Student Note */}
        {session.studentNote && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--mut)] font-semibold block mb-1">
              Student Note:
            </span>
            <p className="m-0 text-[var(--ink)] italic leading-relaxed">
              "{session.studentNote}"
            </p>
          </div>
        )}

        {/* Events list */}
        <div className="mb-4">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--mut)] mb-2 font-medium">
            Recorded Integrity Events
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {session.events && session.events.length > 0 ? (
              session.events.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--line)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--mut)]" />
                    <span className="text-[var(--ink)]">
                      {evt.type === 'left' && `Left writing page for ${evt.secondsAway}s`}
                      {evt.type === 'returned' &&
                        (evt.wordsAddedAfterReturn
                          ? `Returned & added ${evt.wordsAddedAfterReturn} words in <15s`
                          : 'Returned to page')}
                      {evt.type === 'paste' && `Pasted ${evt.wordsPasted} words at once`}
                      {evt.type === 'second_session' && 'Second simultaneous session detected'}
                      {evt.type === 'note' && `Student note: "${evt.noteText}"`}
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] text-[var(--mut)] shrink-0">
                    {new Date(evt.serverTime || evt.deviceTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--mut)] py-2">
                No leave events recorded. Student remained on the page throughout.
              </p>
            )}
          </div>
        </div>

        {/* Student answers/draft if available */}
        {session.draft && (
          <div className="mb-4 p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs">
            <span className="font-mono text-[10px] uppercase text-[var(--mut)] font-semibold block mb-1">
              Student Draft Text
            </span>
            <p className="text-[var(--ink)] leading-relaxed whitespace-pre-wrap m-0 font-sans">
              {session.draft}
            </p>
          </div>
        )}

        {session.answers && Object.keys(session.answers).length > 0 && (
          <div className="mb-4 p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs space-y-2">
            <span className="font-mono text-[10px] uppercase text-[var(--mut)] font-semibold block">
              Student Answers
            </span>
            {Object.entries(session.answers).map(([key, val]) => (
              <div key={key} className="pt-1 border-t border-[var(--line)]/50 first:border-0 first:pt-0">
                <span className="font-mono text-[10.5px] text-[var(--mut)] block">Prompt {Number(key) + 1}:</span>
                <p className="text-[var(--ink)] m-0 leading-relaxed font-sans">{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Privacy Note */}
        <div className="mb-5 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-start gap-2 text-[11px] text-[var(--mut)]">
          <HelpCircle className="w-4 h-4 text-[var(--mut)] shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed">
            Flags indicate possible outside help based on page absence or burst pasting. They do not prove cheating or affect grades automatically.
          </p>
        </div>

        {/* Review & Reopen Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReviewStateChange(session.id, 'reviewed_ok');
                onClose();
              }}
              className={`flex-1 h-12 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                session.reviewState === 'reviewed_ok'
                  ? 'bg-[var(--acc)] text-[var(--onacc)]'
                  : 'bg-[var(--accl)] text-[var(--acc)] hover:bg-[var(--acc)] hover:text-[var(--onacc)]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Reviewed OK
            </button>

            <button
              onClick={() => {
                onReviewStateChange(session.id, 'concern');
                onClose();
              }}
              className={`flex-1 h-12 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                session.reviewState === 'concern'
                  ? 'bg-[var(--amb)] text-[var(--onacc)]'
                  : 'bg-[var(--ambl)] text-[var(--ambt)] hover:bg-[var(--amb)] hover:text-[var(--onacc)]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Mark Concern
            </button>
          </div>

          {onReopenSession && (session.status === 'submitted' || session.status === 'over_time') && (
            <button
              onClick={() => {
                onReopenSession(session.id);
                onClose();
              }}
              className="w-full py-2.5 text-xs text-[var(--mut)] hover:text-[var(--ink)] flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reopen / Allow Retake
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
