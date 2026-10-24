import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types/index.ts';
import { countWords } from '../utils/rules.ts';
import { ArrowUp, Sparkles } from 'lucide-react';

interface CoachViewProps {
  chat: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onInsertHint: () => void;
  stage: number;
}

export const CoachView: React.FC<CoachViewProps> = ({
  chat,
  isTyping,
  onSendMessage,
  onInsertHint,
  stage
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setInputText('');
    onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-44">
      <h2 className="font-serif text-[30px] font-normal leading-tight text-[var(--ink)] mb-4">
        Coach
      </h2>

      {/* Messages list */}
      <div className="flex flex-col gap-3 min-h-[220px]" aria-live="polite">
        {chat.map((m) => {
          if (m.role === 'refusal') {
            return (
              <div
                key={m.id}
                className="self-start max-w-[88%] p-3.5 rounded-[18px] text-[15px] bg-[var(--ambl)] border-2 border-[var(--amb)] text-[var(--ink)] animate-bubble"
              >
                <b className="block text-[var(--ambt)] font-semibold mb-1">
                  I won’t write it for you.
                </b>
                <p className="m-0 leading-relaxed">{m.text}</p>
              </div>
            );
          }

          if (m.role === 'student') {
            return (
              <div
                key={m.id}
                className="self-end max-w-[84%] px-4 py-2.5 rounded-[18px] text-[15px] bg-[var(--ink)] text-[var(--bg)] font-sans animate-bubble"
              >
                {m.text}
              </div>
            );
          }

          // Coach standard bubble
          return (
            <div
              key={m.id}
              className="self-start max-w-[84%] px-4 py-3 rounded-[18px] text-[15px] bg-[var(--card)] border-[1.5px] border-[var(--line)] text-[var(--ink)] font-sans leading-relaxed shadow-xs animate-bubble"
            >
              {m.text}
            </div>
          );
        })}

        {/* Typing indicator within 400ms (Doherty Threshold) */}
        {isTyping && (
          <div className="self-start flex items-center gap-1 px-4 py-3 rounded-[18px] bg-[var(--card)] border-[1.5px] border-[var(--line)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mut)] typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mut)] typing-dot [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mut)] typing-dot [animation-delay:300ms]" />
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Persistent input bar pinned above navigation dock */}
      <div className="fixed bottom-[74px] left-0 right-0 z-25 bg-[var(--bg)]/95 backdrop-blur-xs py-2 border-t border-[var(--line)]">
        <div className="max-w-[520px] mx-auto px-5 flex items-center gap-2">
          <input
            ref={inputRef}
            id="msg-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type in your own words"
            autoComplete="off"
            className="flex-1 h-[52px] px-4.5 rounded-full bg-[var(--card)] border-[1.5px] border-[var(--line)] focus:border-[var(--acc)] text-[16px] text-[var(--ink)] placeholder:text-[var(--mut)] outline-none shadow-xs"
          />

          <button
            type="button"
            onClick={() => {
              onInsertHint();
              inputRef.current?.focus();
            }}
            className="h-[52px] px-3.5 rounded-full bg-[var(--card)] border-[1.5px] border-[var(--line)] hover:border-[var(--mut)] text-xs font-mono font-medium text-[var(--mut)] cursor-pointer shrink-0"
            title="Insert sentence starter"
          >
            Hint
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-[52px] h-[52px] rounded-full bg-[var(--acc)] text-[var(--onacc)] disabled:bg-[var(--line)] disabled:text-[var(--mut)] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-transform active:scale-95 shrink-0 shadow-xs"
            aria-label="Send message"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
