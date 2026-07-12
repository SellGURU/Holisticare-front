export type DescriptionDisplayPhase =
  | 'loading'
  | 'ready_unchanged'
  | 'ready_changed';

export type DescriptionDisplayInput = {
  descriptionReady: boolean;
  descriptionText: string | null | undefined;
  committedText: string | null;
  overviewProcessing: boolean;
  isReprocessing?: boolean;
  failOpen?: boolean;
};

export function isDescriptionActuallyReady(
  descriptionReady: boolean,
  descriptionText: string | null | undefined,
): boolean {
  return descriptionReady && Boolean(String(descriptionText || '').trim());
}

export function resolveDescriptionDisplayPhase(
  input: DescriptionDisplayInput,
): {
  phase: DescriptionDisplayPhase;
  nextCommittedText: string | null;
} {
  const isActuallyReady = isDescriptionActuallyReady(
    input.descriptionReady,
    input.descriptionText,
  );

  if (!isActuallyReady) {
    if (input.isReprocessing) {
      return { phase: 'loading', nextCommittedText: null };
    }
    if (input.committedText) {
      return { phase: 'ready_unchanged', nextCommittedText: input.committedText };
    }
    return { phase: 'loading', nextCommittedText: null };
  }

  const text = String(input.descriptionText || '').trim();
  if (text === input.committedText) {
    return { phase: 'ready_unchanged', nextCommittedText: text };
  }
  return { phase: 'ready_changed', nextCommittedText: text };
}
