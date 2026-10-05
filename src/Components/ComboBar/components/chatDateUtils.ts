export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function chatDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatChatDayLabel(
  timestamp: number,
  now: Date = new Date(),
): string {
  const date = new Date(timestamp);
  const day = startOfLocalDay(date).getTime();
  const today = startOfLocalDay(now).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;

  if (day === today) {
    return 'Today';
  }
  if (day === yesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

export function formatChatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
