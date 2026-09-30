function findScrollableParent(element: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = element.parentElement;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    const scrollable =
      overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
    if (scrollable && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/** Scroll so `target` is visible inside its nearest scrollable ancestor (not the window). */
export function scrollWithinParent(
  target: HTMLElement,
  options?: { behavior?: ScrollBehavior },
) {
  const behavior = options?.behavior ?? 'smooth';
  const scrollParent = findScrollableParent(target);
  const scrollMarginTop =
    parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;

  if (scrollParent) {
    const parentTop = scrollParent.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const nextTop =
      scrollParent.scrollTop + (targetTop - parentTop) - scrollMarginTop;
    scrollParent.scrollTo({ top: Math.max(0, nextTop), behavior });
  } else {
    target.scrollIntoView({ behavior, block: 'start' });
  }

  if (window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
}
