import type { ChatPresence } from './chatTypes';

function PresenceDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${
        online ? 'bg-[#12B76A]' : 'bg-[#B0B0B0]'
      }`}
      aria-hidden
    />
  );
}

function PresenceParty({
  label,
  online,
}: {
  label: string;
  online: boolean;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <PresenceDot online={online} />
      <span className="truncate">{label || 'Someone'}</span>
      <span className={online ? 'text-[#12B76A]' : 'text-Text-Quadruple'}>
        {online ? 'Online' : 'Offline'}
      </span>
    </span>
  );
}

export function ChatPresenceBar({ presence }: { presence: ChatPresence | null }) {
  if (!presence) return null;
  return (
    <div
      className="mb-1 flex min-w-0 items-center justify-end gap-2 px-1 text-[10px] text-Text-Secondary"
      aria-live="polite"
    >
      <PresenceParty
        label={presence.peer.name || 'Client'}
        online={presence.peer.online}
      />
    </div>
  );
}
