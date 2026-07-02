import { MouseEvent } from 'react';
import { NavigateFunction } from 'react-router-dom';

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

/** Same-tab SPA navigation on normal click; native new tab on modified clicks. */
export async function handlePortalAnchorClick(
  event: MouseEvent<HTMLElement>,
  path: string,
  navigate: NavigateFunction,
  canNavigate?: () => boolean | Promise<boolean>,
): Promise<void> {
  if (isModifiedNavigationEvent(event)) {
    return;
  }

  event.preventDefault();

  if (canNavigate) {
    const allowed = await canNavigate();
    if (!allowed) return;
  }

  navigate(normalizePortalPath(path));
}
