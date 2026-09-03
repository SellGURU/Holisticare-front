import { useEffect, useState } from 'react';
import { resolveDescriptionDisplayPhase } from '../utils/resolveDescriptionDisplayPhase';

export function useCategoryDescriptionDisplay(params: {
  categoryKey: string;
  descriptionReady: boolean;
  descriptionText: string | null | undefined;
  overviewProcessing: boolean;
  descriptionPending?: boolean;
  failOpen?: boolean;
  dataRevision?: string | null;
  descriptionEpoch?: number;
}) {
  const [committedText, setCommittedText] = useState<string | null>(null);

  useEffect(() => {
    setCommittedText(null);
  }, [params.categoryKey]);

  const isReprocessing =
    params.overviewProcessing && params.descriptionPending === true;

  const { phase, nextCommittedText } = resolveDescriptionDisplayPhase({
    descriptionReady: Boolean(params.descriptionReady),
    descriptionText: params.descriptionText,
    committedText,
    overviewProcessing: params.overviewProcessing,
    isReprocessing,
    failOpen: params.failOpen,
  });

  useEffect(() => {
    if (nextCommittedText !== committedText) {
      setCommittedText(nextCommittedText);
    }
  }, [nextCommittedText, committedText]);

  return { phase, displayedDescription: committedText };
}
