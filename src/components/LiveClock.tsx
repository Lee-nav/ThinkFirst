import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

interface LiveClockProps {
  label?: string;
  showSeconds?: boolean;
  className?: string;
}

export const LiveClock: React.FC<LiveClockProps> = ({
  label = 'Official Start Time',
  showSeconds = true,
  className = ''
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateFormatted = time.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className={`p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--mut)] flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-[var(--acc)]" />
          {label}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--acc)] bg-[var(--accl)] px-2 py-0.5 rounded-full font-medium">
          <ShieldCheck className="w-3 h-3" />
          Live Verified
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
          {pad(displayHours)}:{pad(minutes)}
          {showSeconds && (
            <span className="text-[var(--acc)] text-2xl sm:text-3xl font-semibold">
              :{pad(seconds)}
            </span>
          )}
        </div>
        <span className="font-mono text-sm sm:text-base font-semibold text-[var(--mut)]">
          {ampm}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--mut)] font-mono border-t border-[var(--line)]/60 pt-2">
        <span>{dateFormatted}</span>
        <span className="truncate max-w-[150px]">{timeZoneName}</span>
      </div>
    </div>
  );
};
