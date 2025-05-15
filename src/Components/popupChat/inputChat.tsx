/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEventHandler, FC, useRef } from 'react';

interface IInputChat {
  onChange: ChangeEventHandler<HTMLInputElement>;
  sendHandler: any;
  Placeholder?: string;
}
export const InputChat: FC<IInputChat> = ({
  onChange,
  sendHandler,
  Placeholder = 'Ask me anything...',
}) => {
  const btnSendRef = useRef<HTMLInputElement>(null);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if Enter key was pressed
    if (event.key === 'Enter') {
      event.preventDefault();
      sendHandler();
      if (btnSendRef.current != null) {
        btnSendRef.current.value = '';
      }
    }
  };
  return (
    <div
      className={
        'flex items-center justify-center rounded-xl py-3 px-2 chat-shadow-box w-full'
      }
    >
      <input
        onKeyDown={handleKeyDown}
        ref={btnSendRef}
        onChange={onChange}
        placeholder={Placeholder}
        className={
          'bg-white w-full text-[12px] text-Text-Secondary pl-2 h-full !border-none !outline-none'
        }
      />
      <img
        onClick={() => {
          sendHandler();
          if (btnSendRef.current) {
            btnSendRef.current.value = '';
          }
        }}
        src={'/icons/send-2.svg'}
        className="cursor-pointer"
      />
    </div>
  );
};
