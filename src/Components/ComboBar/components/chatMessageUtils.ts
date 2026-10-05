import { formatChatDayLabel, chatDayKey } from './chatDateUtils';
import type {
  ChatCursor,
  ChatDayGroup,
  ChatHistoryPage,
  ChatMessage,
  ChatPresence,
  ChatReplyPreview,
} from './chatTypes';

export const CHAT_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

export const CHAT_PAGE_SIZE = 40;
export const CHAT_LIVE_POLL_MS = 5000;
export const CHAT_UNREAD_POLL_MS = 60000;
export const CHAT_PRESENCE_HEARTBEAT_MS = 45000;

export function unreadPollIntervalMs(chatOpen: boolean): number {
  return chatOpen ? CHAT_LIVE_POLL_MS : CHAT_UNREAD_POLL_MS;
}

export function livePollAddedMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const known = new Set(
    current
      .filter((item) => !item.clientKey)
      .map((item) => item.conversation_id),
  );
  return incoming.filter((item) => !known.has(item.conversation_id));
}

export function shouldStickOnLivePoll(
  isAtBottom: boolean,
  addedCount: number,
): boolean {
  return isAtBottom && addedCount > 0;
}

export function sortMessagesChronologically(
  items: ChatMessage[],
): ChatMessage[] {
  return [...items].sort((left, right) => {
    const timeDelta = Number(left.timestamp || 0) - Number(right.timestamp || 0);
    if (timeDelta !== 0) return timeDelta;
    return Number(left.conversation_id || 0) - Number(right.conversation_id || 0);
  });
}

export function messageDomId(conversationId: number): string {
  return `msg-${conversationId}`;
}

export function messageListKey(message: ChatMessage): string {
  return message.clientKey || messageDomId(message.conversation_id);
}

export function replyPreviewTitle(preview: ChatReplyPreview): string {
  if (preview.deleted) {
    return 'Original message deleted';
  }
  const name = (preview.name || '').trim();
  return name ? `Replying to ${name}` : 'Replying to a message';
}

export function findMessageByConversationId(
  items: ChatMessage[],
  conversationId: number,
): ChatMessage | undefined {
  return items.find((item) => item.conversation_id === conversationId);
}

export function mergeChatMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const byId = new Map<number, ChatMessage>();
  const temps: ChatMessage[] = [];
  for (const item of [...current, ...incoming]) {
    if (item.clientKey) {
      temps.push(item);
      continue;
    }
    byId.set(item.conversation_id, item);
  }
  const committedIds = new Set(byId.keys());
  const leftoverTemps = temps.filter(
    (item) => !committedIds.has(item.conversation_id),
  );
  return sortMessagesChronologically([...byId.values(), ...leftoverTemps]);
}

export function groupMessagesByDay(
  items: ChatMessage[],
  now: Date = new Date(),
): ChatDayGroup[] {
  const groups: ChatDayGroup[] = [];
  for (const message of sortMessagesChronologically(items)) {
    const key = chatDayKey(message.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.messages.push(message);
    } else {
      groups.push({
        key,
        label: formatChatDayLabel(message.timestamp, now),
        messages: [message],
      });
    }
  }
  return groups;
}

function asPresenceParty(value: unknown): ChatPresence['you'] | null {
  if (!value || typeof value !== 'object') return null;
  const party = value as { name?: unknown; online?: unknown };
  if (typeof party.online !== 'boolean') return null;
  return {
    name: typeof party.name === 'string' ? party.name : '',
    online: party.online,
  };
}

export function presenceFromHistoryResponse(data: unknown): ChatPresence | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  const payload = data as { you?: unknown; peer?: unknown };
  const you = asPresenceParty(payload.you);
  const peer = asPresenceParty(payload.peer);
  if (!you || !peer) return null;
  return { you, peer };
}

export function normalizeHistoryResponse(data: unknown): ChatHistoryPage {
  if (Array.isArray(data)) {
    return {
      messages: data as ChatMessage[],
      next_cursor: null,
      has_more: false,
      presence: null,
    };
  }
  if (data && typeof data === 'object' && Array.isArray((data as ChatHistoryPage).messages)) {
    const page = data as ChatHistoryPage;
    return {
      messages: page.messages,
      next_cursor: page.next_cursor ?? null,
      has_more: Boolean(page.has_more),
      presence: presenceFromHistoryResponse(data),
    };
  }
  return { messages: [], next_cursor: null, has_more: false, presence: null };
}

export function shouldSendOnEnter(event: {
  key: string;
  shiftKey: boolean;
}): boolean {
  return event.key === 'Enter' && !event.shiftKey;
}

export function canSendChatText(value: string, isSending?: boolean): boolean {
  return Boolean(value.trim()) && !isSending;
}

export function isCoachMessage(message: ChatMessage): boolean {
  return message.sender_type === 'user';
}

export function canDeleteChatMessage(message: ChatMessage): boolean {
  return (
    isCoachMessage(message) &&
    !message.deleted &&
    !message.isSending &&
    !message.sendFailed &&
    !message.clientKey
  );
}

export function canReactToChatMessage(message: ChatMessage): boolean {
  return (
    !isCoachMessage(message) &&
    !message.deleted &&
    !message.isSending &&
    !message.sendFailed &&
    !message.clientKey
  );
}

export function applyReactionSummaries(
  message: ChatMessage,
  reactions: ChatMessage['reactions'],
): ChatMessage {
  return {
    ...message,
    reactions: reactions || [],
  };
}

export function applyDeletedPlaceholder(message: ChatMessage): ChatMessage {
  return {
    ...message,
    deleted: true,
    message_text: '',
    sendFailed: false,
  };
}

export function cursorFromPage(messages: ChatMessage[]): ChatCursor | null {
  if (!messages.length) {
    return null;
  }
  const oldest = sortMessagesChronologically(messages)[0];
  return {
    timestamp: oldest.timestamp,
    conversation_id: oldest.conversation_id,
  };
}
