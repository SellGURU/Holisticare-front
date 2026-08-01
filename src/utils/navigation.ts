import { MouseEvent } from 'react';

export function normalizePortalPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/** Allow browser-native new-tab behavior for modified clicks. */
export function isModifiedNavigationEvent(event: MouseEvent): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}
