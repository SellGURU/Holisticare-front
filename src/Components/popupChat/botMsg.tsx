import { useEffect, useState } from 'react';

export const BotMsg = ({
  msg,
  time,
  isTyping = false,
}: {
  msg: string;
  time: number;
  isTyping?: boolean;
}) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : msg);
  const [isDone, setIsDone] = useState(!isTyping);

  useEffect(() => {
    if (!isTyping) return;

    let i = 0;
    const chars = msg.split('');

    const typeNext = () => {
      if (i < chars.length) {
        const char = chars[i];
        setDisplayedText((prev) => prev + char);
        i++;

        // ChatGPT-like pauses
        let delay = 25;
        if (/[.,]/.test(char)) delay = 100;
        if (/[!?]/.test(char)) delay = 180;
        if (char === '\n') delay = 250;
        if (char === '…') delay = 250;

        setTimeout(typeNext, delay);
      } else {
        setIsDone(true);
      }
    };

    typeNext();
  }, [msg, isTyping]);

  return (
    <div className="flex items-start justify-start gap-1">
      <div>
        <img
          className="rounded-full w-[30px] h-[30px]"
          src="/images/chat/Float Button.svg"
          alt="AI Avatar"
        />
      </div>

      <div className="pt-2">
        <div className="flex items-start gap-1">
          <h1 className="text-Text-Primary TextStyle-Headline-6">AI Copilot</h1>
          <p className="text-xs text-Text-Secondary">
            {new Date(time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
        </div>

        <div className="w-[213px] h-fit p-2 text-Text-Primary TextStyle-Body-2 bg-backgroundColor-Main border border-Gray-50 leading-loose rounded-bl-[20px] rounded-br-[20px] rounded-tr-[20px]">
          <p>
            {displayedText}
            {isTyping && !isDone && (
              <span className="inline-block w-[3px] h-[12px] bg-Text-Primary animate-pulse ml-[2px] rounded-sm"></span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
