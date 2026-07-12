import { hasCategoryStatusRing } from './asyncProcessing';

export type StatusRingPalette = 'summary6' | 'print4' | 'printPurple';

export const CATEGORY_STATUS_RING_PLACEHOLDER = '#E5E7EB';

export const buildCategoryStatusRingBackground = (
  status: unknown,
  palette: StatusRingPalette,
): string | undefined => {
  if (!hasCategoryStatusRing(status)) return undefined;

  const [s0, s1, s2, s3] = status;

  if (palette === 'summary6') {
    return `conic-gradient(#37B45E 0% ${s0}%,#72C13B ${s0}% ${s1 + s0}%,#D8D800 ${
      s1 + s0
    }% ${s1 + s2 + s0}%,#BA5225 ${
      s2 + s1 + s0
    }% ${s3 + s2 + s1 + s0}%,#B2302E ${s3 + s2 + s1 + s0}% 100%)`;
  }

  if (palette === 'printPurple') {
    return `conic-gradient(#7F39FB 0% ${s0}%,#06C78D ${s0}% ${s1 + s0}%,#FBAD37 ${
      s1 + s0
    }% ${s1 + s2 + s0}%,#FC5474 ${s2 + s1 + s0}% 100%)`;
  }

  // print4
  return `conic-gradient(#37B45E 0% ${s0}%,#72C13B ${s0}% ${s1 + s0}%,#D8D800 ${
    s1 + s0
  }% ${s1 + s2 + s0}%,#B2302E ${s2 + s1 + s0}% 100%)`;
};

/** Safe background for category ring: gradient when valid, placeholder otherwise. */
export const resolveCategoryStatusRingBackground = (
  status: unknown,
  palette: StatusRingPalette,
): string =>
  buildCategoryStatusRingBackground(status, palette) ??
  CATEGORY_STATUS_RING_PLACEHOLDER;
