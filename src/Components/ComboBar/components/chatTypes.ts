export type ChatReplyPreview = {
  conversation_id: number;
  message_text: string;
  sender_type: string | null;
  deleted: boolean;
  name?: string;
};

export type ChatReaction = {
  emoji: string;
  count: number;
  mine: boolean;
};

export type ChatMessage = {
  date: string;
  recipient?: boolean;
  time: string;
  conversation_id: number;
  message_text: string;
  sender_id: number;
  isSending?: boolean;
  sendFailed?: boolean;
  replied_message_id: number | null;
  sender_type: string;
  images?: string[];
  timestamp: number;
  name: string;
  deleted?: boolean;
  reported?: boolean;
  reply_preview?: ChatReplyPreview | null;
  reactions?: ChatReaction[];
  clientKey?: string;
};

export type ChatCursor = {
  timestamp: number;
  conversation_id: number;
};

export type ChatPresenceParty = {
  name: string;
  online: boolean;
  visible?: boolean;
};

export type ChatPresence = {
  you: ChatPresenceParty;
  peer: ChatPresenceParty;
};

export type ChatHistoryPage = {
  messages: ChatMessage[];
  next_cursor: ChatCursor | null;
  has_more: boolean;
  presence?: ChatPresence | null;
};

export type ChatDayGroup = {
  key: string;
  label: string;
  messages: ChatMessage[];
};
