export const DESCRIPTION_DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_DESCRIPTION_DEBUG === '1';

export function logDescriptionRender(
  tag: string,
  payload: Record<string, unknown>,
) {
  if (!DESCRIPTION_DEBUG) return;
  console.log(`[description-debug:${tag}]`, payload);
}
