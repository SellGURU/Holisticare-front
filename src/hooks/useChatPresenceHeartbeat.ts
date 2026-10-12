import Application from '../api/app';
import { CHAT_PRESENCE_HEARTBEAT_MS } from '../Components/ComboBar/components/chatMessageUtils';
import { useVisibilityAwarePoll } from './useVisibilityAwarePoll';

export function useChatPresenceHeartbeat() {
  useVisibilityAwarePoll(
    () => {
      void Application.chatPresenceHeartbeat().catch(() => {});
    },
    CHAT_PRESENCE_HEARTBEAT_MS,
    true,
    { immediate: true },
  );
}
