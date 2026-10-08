import { describe, expect, it } from 'vitest';
import type { ChatMessage } from './chatTypes';
import {
  applyDeletedPlaceholder,
  applyReactionSummaries,
  canDeleteChatMessage,
  canReactToChatMessage,
  canSendChatText,
  findMessageByConversationId,
  groupMessagesByDay,
  livePollAddedMessages,
  mergeChatMessages,
  messageDomId,
  messageListKey,
  normalizeHistoryResponse,
  presenceFromHistoryResponse,
  replyPreviewTitle,
  shouldSendOnEnter,
  shouldStickOnLivePoll,
  sortMessagesChronologically,
  unreadPollIntervalMs,
} from './chatMessageUtils';

function message(
  partial: Partial<ChatMessage> & { conversation_id: number },
): ChatMessage {
  return {
    date: '',
    time: '',
    message_text: 'hello',
    sender_id: 1,
    replied_message_id: null,
    sender_type: 'user',
    timestamp: 0,
    name: 'Coach',
    ...partial,
  };
}

describe('sortMessagesChronologically', () => {
  it('orders by timestamp then conversation id', () => {
    const items = [
      message({ conversation_id: 3, timestamp: 20 }),
      message({ conversation_id: 1, timestamp: 10 }),
      message({ conversation_id: 2, timestamp: 10 }),
    ];
    expect(
      sortMessagesChronologically(items).map((item) => item.conversation_id),
    ).toEqual([1, 2, 3]);
  });
});

describe('groupMessagesByDay', () => {
  it('inserts day boundaries in local time', () => {
    const now = new Date(2026, 9, 5, 12, 0, 0);
    const groups = groupMessagesByDay(
      [
        message({
          conversation_id: 1,
          timestamp: new Date(2026, 9, 4, 23, 0).getTime(),
        }),
        message({
          conversation_id: 2,
          timestamp: new Date(2026, 9, 5, 1, 0).getTime(),
        }),
        message({
          conversation_id: 3,
          timestamp: new Date(2026, 9, 5, 9, 0).getTime(),
        }),
      ],
      now,
    );
    expect(groups.map((group) => group.label)).toEqual(['Yesterday', 'Today']);
    expect(groups[0].messages).toHaveLength(1);
    expect(groups[1].messages.map((item) => item.conversation_id)).toEqual([
      2, 3,
    ]);
  });
});

describe('normalizeHistoryResponse', () => {
  it('keeps the legacy array contract', () => {
    const page = normalizeHistoryResponse([message({ conversation_id: 1 })]);
    expect(page.messages).toHaveLength(1);
    expect(page.has_more).toBe(false);
    expect(page.next_cursor).toBeNull();
  });

  it('reads the paginated envelope', () => {
    const page = normalizeHistoryResponse({
      messages: [message({ conversation_id: 8, timestamp: 100 })],
      next_cursor: { timestamp: 100, conversation_id: 8 },
      has_more: true,
    });
    expect(page.has_more).toBe(true);
    expect(page.next_cursor?.conversation_id).toBe(8);
  });
});

describe('composer and delete helpers', () => {
  it('sends on Enter and keeps a newline on Shift+Enter', () => {
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: false })).toBe(true);
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: true })).toBe(false);
  });

  it('blocks empty or in-flight sends', () => {
    expect(canSendChatText('  ')).toBe(false);
    expect(canSendChatText('hi', true)).toBe(false);
    expect(canSendChatText('hi')).toBe(true);
  });

  it('allows delete only for sent coach messages', () => {
    expect(
      canDeleteChatMessage(
        message({ conversation_id: 1, sender_type: 'patient' }),
      ),
    ).toBe(false);
    expect(
      canDeleteChatMessage(message({ conversation_id: 2, deleted: true })),
    ).toBe(false);
    expect(canDeleteChatMessage(message({ conversation_id: 3 }))).toBe(true);
    expect(
      canDeleteChatMessage(message({ conversation_id: 4, clientKey: 'tmp-1' })),
    ).toBe(false);
  });

  it('clears text when applying a delete placeholder', () => {
    const deleted = applyDeletedPlaceholder(
      message({ conversation_id: 4, message_text: 'secret' }),
    );
    expect(deleted.deleted).toBe(true);
    expect(deleted.message_text).toBe('');
  });

  it('stores reaction summaries on the message', () => {
    const reacted = applyReactionSummaries(message({ conversation_id: 5 }), [
      { emoji: '❤️', count: 2, mine: true },
    ]);
    expect(reacted.reactions).toEqual([{ emoji: '❤️', count: 2, mine: true }]);
  });
});

describe('reply navigation', () => {
  it('labels the quoted sender so the original message is identifiable', () => {
    expect(
      replyPreviewTitle({
        conversation_id: 9,
        message_text: 'Need a follow up',
        sender_type: 'patient',
        deleted: false,
        name: 'Ann A',
      }),
    ).toBe('Replying to Ann A');
    expect(
      replyPreviewTitle({
        conversation_id: 9,
        message_text: '',
        sender_type: 'patient',
        deleted: true,
        name: 'Ann A',
      }),
    ).toBe('Original message deleted');
  });

  it('finds the quoted message by conversation id', () => {
    const items = [
      message({ conversation_id: 4, name: 'Ann A' }),
      message({ conversation_id: 9, name: 'Coach' }),
    ];
    expect(findMessageByConversationId(items, 4)?.name).toBe('Ann A');
    expect(messageDomId(4)).toBe('msg-4');
  });
});

describe('canReactToChatMessage', () => {
  it('lets the coach react only to the client message', () => {
    expect(
      canReactToChatMessage(
        message({ conversation_id: 1, sender_type: 'patient' }),
      ),
    ).toBe(true);
    expect(
      canReactToChatMessage(
        message({ conversation_id: 2, sender_type: 'user' }),
      ),
    ).toBe(false);
    expect(
      canReactToChatMessage(
        message({ conversation_id: 3, sender_type: 'patient', deleted: true }),
      ),
    ).toBe(false);
  });
});

describe('chat presence', () => {
  it('reads both sides from a history page', () => {
    expect(
      presenceFromHistoryResponse({
        messages: [],
        you: { name: 'Coach', online: true },
        peer: { name: 'Ann A', online: false },
      }),
    ).toEqual({
      you: { name: 'Coach', online: true },
      peer: { name: 'Ann A', online: false },
    });
    expect(presenceFromHistoryResponse([])).toBeNull();
  });
});

describe('mergeChatMessages', () => {
  it('dedupes by stable key and keeps chronological order', () => {
    const merged = mergeChatMessages(
      [message({ conversation_id: 2, timestamp: 20, clientKey: 'tmp-1' })],
      [
        message({ conversation_id: 2, timestamp: 20, message_text: 'updated' }),
        message({ conversation_id: 1, timestamp: 10 }),
      ],
    );
    expect(merged.map((item) => item.conversation_id)).toEqual([1, 2]);
    expect(messageListKey(merged[1])).toBe('msg-2');
  });
});

describe('live poll merge', () => {
  it('adds only new incoming messages and keeps in-flight sends', () => {
    const current = [
      message({ conversation_id: 1, timestamp: 10 }),
      message({
        conversation_id: 99,
        timestamp: 30,
        clientKey: 'tmp-1',
        isSending: true,
      }),
    ];
    const incoming = [
      message({ conversation_id: 1, timestamp: 10 }),
      message({
        conversation_id: 2,
        timestamp: 20,
        sender_type: 'patient',
        name: 'Ann A',
      }),
    ];
    const added = livePollAddedMessages(current, incoming);
    const merged = mergeChatMessages(current, incoming);
    expect(added.map((item) => item.conversation_id)).toEqual([2]);
    expect(merged.some((item) => item.clientKey === 'tmp-1')).toBe(true);
    expect(merged.map((item) => item.conversation_id)).toEqual([1, 2, 99]);
  });

  it('sticks to the bottom only when the user is already there and messages arrived', () => {
    expect(shouldStickOnLivePoll(true, 1)).toBe(true);
    expect(shouldStickOnLivePoll(false, 2)).toBe(false);
    expect(shouldStickOnLivePoll(true, 0)).toBe(false);
  });

  it('polls faster while the coach chat is open', () => {
    expect(unreadPollIntervalMs(true)).toBe(5000);
    expect(unreadPollIntervalMs(false)).toBe(60000);
  });
});
