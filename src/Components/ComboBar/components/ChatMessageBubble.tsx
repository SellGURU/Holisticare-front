import { MoonLoader } from 'react-spinners';
import { useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import SvgIcon from '../../../utils/svgIcon';
import { readJson } from '../../../utils/safeStorage';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import { formatChatTime } from './chatDateUtils';
import {
  canDeleteChatMessage,
  canReactToChatMessage,
  CHAT_REACTION_EMOJIS,
  isCoachMessage,
  messageDomId,
  replyPreviewTitle,
} from './chatMessageUtils';
import type { ChatMessage } from './chatTypes';

function formatText(text: string) {
  const boldedText = text.replace(
    /\*(.*?)\*/g,
    (_match, p1) => `<strong>${p1}</strong>`,
  );
  return boldedText.split('\n').map((line, index) => (
    <span key={index}>
      <span dangerouslySetInnerHTML={{ __html: line }} />
      <br />
    </span>
  ));
}

export function ChatMessageBubble({
  message,
  onReply,
  onDelete,
  onReact,
  onRetry,
  onJumpToReply,
  onImageClick,
  highlighted,
  layout = 'compact',
}: {
  message: ChatMessage;
  onReply: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
  onRetry?: (message: ChatMessage) => void;
  onJumpToReply?: (conversationId: number) => void;
  onImageClick?: (image: string) => void;
  highlighted?: boolean;
  layout?: 'compact' | 'wide';
}) {
  const coach = isCoachMessage(message);
  const time = formatChatTime(message.timestamp);
  const avatarName = message.name || (coach ? 'Coach' : 'Client');
  const avatarSrc = coach
    ? readJson<{ selectedImage?: string }>('brandInfoData', {})?.selectedImage ||
      `https://ui-avatars.com/api/?name=${avatarName}`
    : `https://ui-avatars.com/api/?name=${avatarName}`;
  const columnWidth =
    layout === 'wide'
      ? 'w-[min(100%-48px,500px)]'
      : 'w-[min(100%-38px,232px)]';

  return (
    <div
      id={messageDomId(message.conversation_id)}
      data-conversation-id={message.conversation_id}
      className={`group flex items-start gap-2 my-3 min-w-0 w-full rounded-xl transition-colors ${
        highlighted ? 'bg-[#005F731A] ring-1 ring-[#005F73]/30' : ''
      } ${coach ? 'justify-end' : 'justify-start'}`}
    >
      {!coach && (
        <img
          className="rounded-full w-[30px] h-[30px] min-w-[30px] border border-gray-50"
          src={avatarSrc}
          alt=""
        />
      )}
      <div
        className={`relative pt-1 flex min-w-0 ${columnWidth} flex-col ${
          coach ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`flex w-full min-w-0 items-center gap-1 ${
            coach ? 'justify-end' : 'justify-start'
          }`}
        >
          {coach ? (
            <>
              <p className="shrink-0 text-xs text-Text-Quadruple">{time}</p>
              <h1 className="min-w-0 truncate text-Text-Primary TextStyle-Headline-6">
                {message.name}
              </h1>
            </>
          ) : (
            <>
              <h1 className="min-w-0 truncate text-Text-Primary TextStyle-Headline-6">
                {message.name}
              </h1>
              <p className="shrink-0 text-xs text-Text-Quadruple">{time}</p>
            </>
          )}
        </div>

        {message.reported && (
          <>
            <img
              data-tooltip-id={`${message.conversation_id}-flag`}
              className="absolute -left-5 top-5 cursor-pointer"
              src="/icons/flag-2.svg"
              alt=""
            />
            <Tooltip id={`${message.conversation_id}-flag`}>
              This response was reported by the client.
            </Tooltip>
          </>
        )}

        {message.reply_preview && (
          <button
            type="button"
            onClick={() =>
              message.reply_preview &&
              onJumpToReply?.(message.reply_preview.conversation_id)
            }
            className="w-full min-w-0 mt-1 mb-0.5 text-left rounded-lg border-l-2 border-[#005F73] bg-[#005F7314] px-2 py-1 cursor-pointer hover:bg-[#005F7326]"
            aria-label={`Go to message from ${message.reply_preview.name || 'the original sender'}`}
          >
            <p className="text-[10px] text-[#005F73] font-medium truncate">
              {replyPreviewTitle(message.reply_preview)}
            </p>
            <p className="text-[11px] text-Text-Secondary line-clamp-2 break-words">
              {message.reply_preview.deleted
                ? 'This message was deleted'
                : message.reply_preview.message_text}
            </p>
          </button>
        )}

        {!!message.images?.length && (
          <div className="mt-1 flex flex-row gap-2">
            {message.images.map((image, index) => (
              <img
                key={`${message.conversation_id}-img-${index}`}
                src={image}
                alt=""
                className="h-32 w-32 cursor-pointer object-contain hover:opacity-90"
                onClick={() => onImageClick?.(image)}
              />
            ))}
          </div>
        )}

        <div
          className={`flex w-full min-w-0 items-end gap-1 ${
            coach ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.isSending && (
            <span aria-label="Sending" className="shrink-0">
              <MoonLoader color="#383838" size={12} />
            </span>
          )}
          {message.recipient && coach && !message.deleted && (
            <span className="shrink-0" title={'Seen by the ' + message.name}>
              <SvgIcon src="/icons/tick-green.svg" color="#8a8a8a" />
            </span>
          )}
          <div
            className={`min-w-0 max-w-full px-4 py-2 text-justify mt-1 text-xs break-words [overflow-wrap:anywhere] ${
              message.deleted
                ? 'bg-backgroundColor-Main border border-dashed border-Gray-50 text-Text-Quadruple italic rounded-[20px]'
                : coach
                  ? 'bg-[#005F7340] border border-Gray-50 text-Text-Primary rounded-[20px] rounded-tr-none'
                  : 'bg-backgroundColor-Main border border-Gray-50 text-Text-Primary rounded-bl-[20px] rounded-br-[20px] rounded-tr-[20px]'
            }`}
          >
            {message.deleted
              ? 'This message was deleted'
              : formatText(message.message_text || '')}
          </div>
        </div>

        {!message.deleted && !message.isSending && (
          <div
            className={`mt-1 flex w-full min-w-0 items-center gap-1 ${
              coach ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <ChatMessageActions
              message={message}
              alignEnd={coach}
              onReply={onReply}
              onDelete={onDelete}
              onReact={onReact}
            />
            {(message.reactions?.length ?? 0) > 0 && (
              <div className="flex min-w-0 flex-wrap items-center gap-1">
                {message.reactions?.map((reaction) => {
                  const chipClass = `shrink-0 px-1.5 py-0.5 rounded-full text-[11px] border ${
                    reaction.mine
                      ? 'bg-[#005F731A] border-[#005F73] text-Text-Primary'
                      : 'bg-white border-Gray-50 text-Text-Secondary'
                  }`;
                  return canReactToChatMessage(message) ? (
                    <button
                      key={reaction.emoji}
                      type="button"
                      onClick={() => onReact(message, reaction.emoji)}
                      className={chipClass}
                      aria-label={`${reaction.emoji} ${reaction.count}`}
                    >
                      {reaction.emoji} {reaction.count}
                    </button>
                  ) : (
                    <span
                      key={reaction.emoji}
                      className={chipClass}
                      aria-label={`${reaction.emoji} ${reaction.count}`}
                    >
                      {reaction.emoji} {reaction.count}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {message.sendFailed && (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="mt-1 text-[11px] text-red-500 underline"
          >
            Couldn’t send. Retry
          </button>
        )}
      </div>
      {coach && (
        <img
          className="rounded-full w-[30px] min-w-[30px] min-h-[30px] border border-gray-50 h-[30px]"
          src={avatarSrc}
          alt=""
        />
      )}
    </div>
  );
}

function ChatMessageActions({
  message,
  alignEnd,
  onReply,
  onDelete,
  onReact,
}: {
  message: ChatMessage;
  alignEnd?: boolean;
  onReply: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const canDelete = canDeleteChatMessage(message);
  const canReact = canReactToChatMessage(message);

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmDelete(false);
  };

  useModalAutoClose({
    refrence: menuRef,
    buttonRefrence: buttonRef,
    close: closeMenu,
    enabled: menuOpen,
  });

  return (
    <div className="relative shrink-0 self-center">
      <div ref={buttonRef}>
        <button
          type="button"
          onClick={() => {
            setMenuOpen((open) => !open);
            setConfirmDelete(false);
          }}
          className="w-6 h-6 rounded-full flex items-center justify-center text-Text-Quadruple hover:bg-Gray-50"
          aria-label="Message actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <img src="/icons/more.svg" alt="" className="w-4 h-4 rotate-90" />
        </button>
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={`absolute z-30 bottom-8 w-[196px] rounded-xl border border-Gray-50 bg-white shadow-200 py-1 ${
            alignEnd ? 'right-0' : 'left-0'
          }`}
        >
          {canReact && (
            <div className="flex items-center justify-between px-2 py-1" role="group" aria-label="React">
              {CHAT_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="h-7 w-7 rounded-full text-sm hover:bg-[#005F730F]"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeMenu();
                    onReact(message, emoji);
                  }}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            role="menuitem"
            className="w-full text-left px-3 py-1.5 text-[11px] text-Text-Primary hover:bg-[#005F730F]"
            onClick={() => {
              onReply(message);
              closeMenu();
            }}
          >
            Reply
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full text-left px-3 py-1.5 text-[11px] text-Text-Primary hover:bg-[#005F730F]"
            onClick={async () => {
              const text = (message.message_text || '').trim();
              if (text && navigator.clipboard?.writeText) {
                try {
                  await navigator.clipboard.writeText(text);
                } catch {
                  // clipboard can be blocked in insecure contexts
                }
              }
              closeMenu();
            }}
          >
            Copy
          </button>
          {canDelete && !confirmDelete && (
            <button
              type="button"
              role="menuitem"
              className="w-full text-left px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          )}
          {canDelete && confirmDelete && (
            <div className="px-3 py-1.5 flex items-center justify-between gap-2" role="group" aria-label="Confirm delete">
              <button
                type="button"
                className="text-[11px] text-red-500 font-medium"
                onClick={() => {
                  onDelete(message);
                  closeMenu();
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                className="text-[11px] text-Text-Quadruple"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
