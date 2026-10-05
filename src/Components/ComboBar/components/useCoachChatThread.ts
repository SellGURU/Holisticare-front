import { useCallback, useEffect, useRef, useState } from 'react';
import Application from '../../../api/app.ts';
import { useVisibilityAwarePoll } from '../../../hooks/useVisibilityAwarePoll';
import { invalidateMessagesForMember } from '../../../utils/cacheKeys';
import { subscribe, unsubscribe } from '../../../utils/event.ts';
import {
  applyDeletedPlaceholder,
  applyReactionSummaries,
  canReactToChatMessage,
  canSendChatText,
  CHAT_LIVE_POLL_MS,
  CHAT_PAGE_SIZE,
  findMessageByConversationId,
  groupMessagesByDay,
  livePollAddedMessages,
  mergeChatMessages,
  messageDomId,
  messageListKey,
  normalizeHistoryResponse,
  presenceFromHistoryResponse,
  shouldStickOnLivePoll,
} from './chatMessageUtils';
import type { ChatCursor, ChatMessage, ChatPresence } from './chatTypes';

type UseCoachChatThreadOptions = {
  memberId: number | null;
  liveEnabled?: boolean;
  onSent?: (memberId: number) => void;
};

export function useCoachChatThread({
  memberId,
  liveEnabled = true,
  onSent,
}: UseCoachChatThreadOptions) {
  const [messageData, setMessageData] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<ChatCursor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [presence, setPresence] = useState<ChatPresence | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const pendingAnchorHeight = useRef<number | null>(null);
  const pendingJumpId = useRef<number | null>(null);
  const highlightTimer = useRef<number | null>(null);
  const onSentRef = useRef(onSent);
  onSentRef.current = onSent;

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPage = useCallback(
    async (cursor?: ChatCursor | null, replace = false) => {
      if (!memberId) return;
      if (cursor) {
        setIsLoadingOlder(true);
      } else {
        setIsLoading(true);
      }
      try {
        const res = await Application.userMessagesList({
          member_id: memberId,
          message_from: 'client',
          limit: CHAT_PAGE_SIZE,
          before_timestamp: cursor?.timestamp,
          before_conversation_id: cursor?.conversation_id,
        });
        const page = normalizeHistoryResponse(res.data);
        setHasMore(page.has_more);
        setNextCursor(page.next_cursor);
        setPresence(page.presence ?? presenceFromHistoryResponse(res.data));
        setError(null);
        setMessageData((current) =>
          replace ? page.messages : mergeChatMessages(current, page.messages),
        );
      } catch (err) {
        console.error('Error getting list chats:', err);
        setError('Couldn’t load chat history.');
      } finally {
        setIsLoading(false);
        setIsLoadingOlder(false);
      }
    },
    [memberId],
  );

  const loadLatestLive = useCallback(async () => {
    if (!memberId) return;
    try {
      const res = await Application.userMessagesList({
        member_id: memberId,
        message_from: 'client',
        limit: CHAT_PAGE_SIZE,
      });
      const page = normalizeHistoryResponse(res.data);
      setPresence(page.presence ?? presenceFromHistoryResponse(res.data));
      setMessageData((current) => {
        const added = livePollAddedMessages(current, page.messages);
        if (shouldStickOnLivePoll(stickToBottom.current, added.length)) {
          stickToBottom.current = true;
        }
        return mergeChatMessages(current, page.messages);
      });
      setError(null);
    } catch (err) {
      console.error('Error polling chat:', err);
    }
  }, [memberId]);

  useEffect(() => {
    setMessageData([]);
    setNextCursor(null);
    setHasMore(false);
    setReplyingTo(null);
    setPresence(null);
    setInput('');
    setError(null);
    stickToBottom.current = true;
    if (memberId) {
      void loadPage(null, true);
    }
  }, [memberId, loadPage]);

  useEffect(() => {
    const refresh = () => {
      void loadLatestLive();
    };
    subscribe('hasUnreadMessage', refresh);
    return () => unsubscribe('hasUnreadMessage', refresh);
  }, [loadLatestLive]);

  useVisibilityAwarePoll(
    loadLatestLive,
    CHAT_LIVE_POLL_MS,
    Boolean(memberId) && liveEnabled,
    {
      immediate: false,
    },
  );

  const handleSend = async (
    retryMessage?: ChatMessage,
    extras?: { images?: string[] },
  ) => {
    const text = (retryMessage?.message_text || input).trim();
    if (!canSendChatText(text, isSending) || !memberId) {
      return;
    }
    const replyTarget = retryMessage
      ? messageData.find(
          (item) => item.conversation_id === retryMessage.replied_message_id,
        ) || null
      : replyingTo;
    const images = extras?.images || retryMessage?.images || [];
    const clientKey = retryMessage?.clientKey || `tmp-${Date.now()}`;
    const optimistic: ChatMessage = {
      conversation_id: retryMessage?.conversation_id || Date.now(),
      date: new Date().toISOString(),
      message_text: text,
      replied_message_id: replyTarget?.conversation_id ?? null,
      reply_preview: replyTarget
        ? {
            conversation_id: replyTarget.conversation_id,
            message_text: replyTarget.deleted ? '' : replyTarget.message_text,
            sender_type: replyTarget.sender_type,
            deleted: Boolean(replyTarget.deleted),
            name: replyTarget.name,
          }
        : null,
      sender_id: Number(memberId),
      isSending: true,
      sendFailed: false,
      sender_type: 'user',
      time: '',
      timestamp: retryMessage?.timestamp || Date.now(),
      recipient: false,
      name: '',
      clientKey,
      images,
    };
    stickToBottom.current = true;
    setMessageData((current) => {
      const withoutRetry = current.filter(
        (item) => messageListKey(item) !== clientKey,
      );
      return [...withoutRetry, optimistic];
    });
    if (!retryMessage) {
      setInput('');
      setReplyingTo(null);
    }
    setIsSending(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        message_text: text,
        receiver_id: Number(memberId),
        chatting_with: 'client',
        replied_conv_id: replyTarget?.conversation_id,
      };
      if (images.length) {
        payload.images = images;
      }
      await Application.sendMessage(payload);
      invalidateMessagesForMember(memberId);
      await loadPage(null, true);
      onSentRef.current?.(memberId);
    } catch (err) {
      console.log(err);
      setMessageData((current) =>
        current.map((item) =>
          messageListKey(item) === clientKey
            ? { ...item, isSending: false, sendFailed: true }
            : item,
        ),
      );
      setError('Couldn’t send your message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReact = async (message: ChatMessage, emoji: string) => {
    if (!memberId || !canReactToChatMessage(message)) return;
    const key = messageListKey(message);
    const previous = message.reactions || [];
    setMessageData((current) =>
      current.map((item) => {
        if (messageListKey(item) !== key) return item;
        const existing = item.reactions || [];
        const mine = existing.find((reaction) => reaction.mine);
        let next = existing
          .map((reaction) =>
            reaction.mine
              ? { ...reaction, count: Math.max(0, reaction.count - 1) }
              : reaction,
          )
          .filter((reaction) => reaction.count > 0);
        if (!mine || mine.emoji !== emoji) {
          const match = next.find((reaction) => reaction.emoji === emoji);
          next = match
            ? next.map((reaction) =>
                reaction.emoji === emoji
                  ? { ...reaction, count: reaction.count + 1, mine: true }
                  : reaction,
              )
            : [...next, { emoji, count: 1, mine: true }];
        }
        return applyReactionSummaries(item, next);
      }),
    );
    try {
      const res = await Application.reactMessage({
        conversation_id: message.conversation_id,
        member_id: memberId,
        emoji,
      });
      if (Array.isArray(res.data?.reactions)) {
        setMessageData((current) =>
          current.map((item) =>
            messageListKey(item) === key
              ? applyReactionSummaries(item, res.data.reactions)
              : item,
          ),
        );
      }
    } catch (err) {
      console.error(err);
      setMessageData((current) =>
        current.map((item) =>
          messageListKey(item) === key
            ? applyReactionSummaries(item, previous)
            : item,
        ),
      );
      setError('Couldn’t add that reaction.');
    }
  };

  const handleDelete = async (message: ChatMessage) => {
    if (!memberId) return;
    const key = messageListKey(message);
    const previous = message;
    setMessageData((current) =>
      current.map((item) =>
        messageListKey(item) === key ? applyDeletedPlaceholder(item) : item,
      ),
    );
    try {
      await Application.deleteMessage({
        conversation_id: message.conversation_id,
        member_id: memberId,
      });
    } catch (err) {
      console.error(err);
      setMessageData((current) =>
        current.map((item) => (messageListKey(item) === key ? previous : item)),
      );
      setError('Couldn’t delete that message.');
    }
  };

  const highlightMessage = (conversationId: number) => {
    setHighlightedId(conversationId);
    if (highlightTimer.current) {
      window.clearTimeout(highlightTimer.current);
    }
    highlightTimer.current = window.setTimeout(() => {
      setHighlightedId((current) =>
        current === conversationId ? null : current,
      );
    }, 1800);
  };

  const scrollToMessage = (conversationId: number) => {
    const node = document.getElementById(messageDomId(conversationId));
    if (!node) {
      return false;
    }
    stickToBottom.current = false;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightMessage(conversationId);
    return true;
  };

  const jumpToReply = async (conversationId: number) => {
    if (!memberId) return;
    if (scrollToMessage(conversationId)) {
      return;
    }

    pendingJumpId.current = conversationId;
    stickToBottom.current = false;
    let cursor = nextCursor;
    let more = hasMore;
    while (more && cursor) {
      try {
        const res = await Application.userMessagesList({
          member_id: memberId,
          message_from: 'client',
          limit: CHAT_PAGE_SIZE,
          before_timestamp: cursor.timestamp,
          before_conversation_id: cursor.conversation_id,
        });
        const page = normalizeHistoryResponse(res.data);
        setHasMore(page.has_more);
        setNextCursor(page.next_cursor);
        setMessageData((current) => mergeChatMessages(current, page.messages));
        if (findMessageByConversationId(page.messages, conversationId)) {
          return;
        }
        cursor = page.next_cursor;
        more = page.has_more;
      } catch (err) {
        console.error(err);
        pendingJumpId.current = null;
        setError('Couldn’t open the original message.');
        return;
      }
    }
    pendingJumpId.current = null;
    setError('The original message is not in this chat history.');
  };

  useEffect(() => {
    return () => {
      if (highlightTimer.current) {
        window.clearTimeout(highlightTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (
      pendingJumpId.current != null &&
      scrollToMessage(pendingJumpId.current)
    ) {
      pendingJumpId.current = null;
      return;
    }
    if (pendingAnchorHeight.current != null && node) {
      node.scrollTop = node.scrollHeight - pendingAnchorHeight.current;
      pendingAnchorHeight.current = null;
      return;
    }
    if (stickToBottom.current) {
      scrollToBottom();
    }
  }, [messageData]);

  const handleScroll = async () => {
    const node = listRef.current;
    if (!node) return;
    const nearBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight < 48;
    stickToBottom.current = nearBottom;
    if (node.scrollTop > 40 || !hasMore || isLoadingOlder || !nextCursor) {
      return;
    }
    pendingAnchorHeight.current = node.scrollHeight;
    await loadPage(nextCursor);
  };

  return {
    messageData,
    input,
    setInput,
    replyingTo,
    setReplyingTo,
    isSending,
    isLoading,
    isLoadingOlder,
    error,
    setError,
    highlightedId,
    presence,
    listRef,
    endRef,
    handleScroll,
    handleSend,
    handleDelete,
    handleReact,
    jumpToReply,
    groups: groupMessagesByDay(messageData),
    empty: !isLoading && messageData.length < 1,
  };
}
