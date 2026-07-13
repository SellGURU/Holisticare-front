import { deepEqual } from '../utils/deepEqual';

/**
 * Compare form values against an initial snapshot.
 * After auto-save in future modals, reset the initial snapshot to the persisted state.
 */
export function isFormDirty<T>(
  current: T,
  initial: T,
  normalize?: (value: T) => T,
): boolean {
  const normalizedCurrent = normalize ? normalize(current) : current;
  const normalizedInitial = normalize ? normalize(initial) : initial;
  return !deepEqual(normalizedCurrent, normalizedInitial);
}
