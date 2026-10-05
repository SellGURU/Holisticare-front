/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useRef, useState } from 'react';
import {
  canSendChatText,
  shouldSendOnEnter,
} from '../ComboBar/components/chatMessageUtils';

interface IInputChat {
  onChange: (event: { target: { value: string } }) => void;
  sendHandler: any;
  Placeholder?: string;
  value?: string;
  disabled?: boolean;
  isSending?: boolean;
  error?: string | null;
  onRetry?: () => void;
  replyingTo?: { name: string; text: string } | null;
  onCancelReply?: () => void;
}

export const InputChat: FC<IInputChat> = ({
  onChange,
  sendHandler,
  Placeholder = 'Ask me anything...',
  value,
  disabled,
  isSending,
  error,
  onRetry,
  replyingTo,
  onCancelReply,
}) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState('');
  const currentValue = isControlled ? value : innerValue;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    resize();
  }, [currentValue]);

  const clearUncontrolled = () => {
    if (!isControlled) {
      setInnerValue('');
    }
  };

  const trySend = () => {
    if (disabled || !canSendChatText(currentValue, isSending)) {
      return;
    }
    sendHandler();
    clearUncontrolled();
  };

  return (
    <div className="w-full">
      {replyingTo && (
        <div className="mb-2 flex items-start justify-between rounded-lg border border-Gray-50 bg-[#005F730F] px-3 py-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-[#005F73]">
              Replying to {replyingTo.name || 'message'}
            </p>
            <p className="text-[11px] text-Text-Secondary line-clamp-2">
              {replyingTo.text}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="ml-2 text-[11px] text-Text-Quadruple"
            aria-label="Cancel reply"
          >
            Cancel
          </button>
        </div>
      )}
      {error && (
        <div className="mb-2 flex items-center justify-between text-[11px] text-red-500">
          <span>{error}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="underline">
              Retry
            </button>
          )}
        </div>
      )}
      <div className="flex items-end justify-center rounded-xl py-3 px-2 chat-shadow-box w-full">
        <textarea
          ref={textareaRef}
          rows={1}
          value={currentValue}
          disabled={disabled}
          onChange={(event) => {
            if (!isControlled) {
              setInnerValue(event.target.value);
            }
            onChange(event);
          }}
          onKeyDown={(event) => {
            if (shouldSendOnEnter(event)) {
              event.preventDefault();
              trySend();
            }
          }}
          placeholder={Placeholder}
          aria-label={Placeholder}
          className="bg-white w-full text-[12px] text-Text-Secondary pl-2 !border-none !outline-none resize-none max-h-[120px] leading-5"
        />
        <button
          type="button"
          onClick={trySend}
          disabled={disabled || !canSendChatText(currentValue, isSending)}
          aria-label="Send message"
          className="shrink-0 disabled:opacity-40"
        >
          <img src="/icons/send-2.svg" alt="" className="cursor-pointer" />
        </button>
      </div>
    </div>
  );
};
