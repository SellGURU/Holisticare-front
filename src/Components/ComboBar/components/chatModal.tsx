import { InputChat } from '../../popupChat/inputChat.tsx';
import { FC } from 'react';
import { ChatDateSeparator } from './ChatDateSeparator';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatPresenceBar } from './ChatPresenceBar';
import { messageListKey } from './chatMessageUtils';
import { useCoachChatThread } from './useCoachChatThread';

interface ChatModalProps {
  memberId: number;
  liveEnabled?: boolean;
}

export const ChatModal: FC<ChatModalProps> = ({
  memberId,
  liveEnabled = true,
}) => {
  const {
    input,
    setInput,
    replyingTo,
    setReplyingTo,
    isSending,
    isLoading,
    isLoadingOlder,
    error,
    highlightedId,
    presence,
    listRef,
    endRef,
    handleScroll,
    handleSend,
    handleDelete,
    handleReact,
    jumpToReply,
    messageData,
    groups,
    empty,
  } = useCoachChatThread({ memberId, liveEnabled });

  return (
    <div className="w-full h-[calc(100vh-130px)] min-h-0 flex flex-col">
      <ChatPresenceBar presence={presence} />
      {isLoading && messageData.length < 1 ? (
        <div className="flex-1 flex items-center justify-center text-[11px] text-Text-Quadruple">
          Loading chat...
        </div>
      ) : empty ? (
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src="/icons/EmptyInbox.svg" alt="" />
            <div className="text-Text-Primary font-medium text-xs">
              No history found.
            </div>
          </div>
          <div className="w-full px-1 pb-2">
            <InputChat
              value={input}
              onChange={(event) => setInput(event.target.value)}
              sendHandler={() => handleSend()}
              isSending={isSending}
              error={error}
              onRetry={() => handleSend()}
              Placeholder="Type a message..."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 min-h-0">
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="w-full flex-1 min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto px-1"
          >
            {isLoadingOlder && (
              <p className="text-center text-[11px] text-Text-Quadruple py-2">
                Loading earlier messages...
              </p>
            )}
            {groups.map((group) => (
              <section key={group.key} aria-label={group.label}>
                <ChatDateSeparator label={group.label} />
                {group.messages.map((message) => (
                  <ChatMessageBubble
                    key={messageListKey(message)}
                    message={message}
                    highlighted={highlightedId === message.conversation_id}
                    onReply={setReplyingTo}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    onRetry={handleSend}
                    onJumpToReply={jumpToReply}
                  />
                ))}
              </section>
            ))}
            <div ref={endRef}></div>
          </div>
          <div className="w-full pt-2">
            <InputChat
              value={input}
              onChange={(event) => setInput(event.target.value)}
              sendHandler={() => handleSend()}
              isSending={isSending}
              error={error}
              onRetry={() => handleSend()}
              Placeholder="Type a message..."
              replyingTo={
                replyingTo
                  ? {
                      name: replyingTo.name,
                      text: replyingTo.deleted
                        ? 'This message was deleted'
                        : replyingTo.message_text,
                    }
                  : null
              }
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
