import { useEffect, useRef, useState } from 'react';
import { resolveDescriptionDisplayPhase } from '../utils/resolveDescriptionDisplayPhase';

export function useCategoryDescriptionDisplay(params: {
  categoryKey: string;
  descriptionReady: boolean;
  descriptionText: string | null | undefined;
  overviewProcessing: boolean;
  descriptionPending?: boolean;
  dataRevision?: string | null;
  descriptionEpoch?: number;
}) {
  const [committedText, setCommittedText] = useState<string | null>(null);
  const prevRevisionRef = useRef<string | null>(null);
  const prevProcessingRef = useRef(false);

  useEffect(() => {
    setCommittedText(null);
  }, [params.categoryKey, params.descriptionEpoch]);

  useEffect(() => {
    const rev = params.dataRevision ?? null;
    if (
      params.overviewProcessing &&
      prevRevisionRef.current != null &&
      rev != null &&
      rev !== prevRevisionRef.current
    ) {
      setCommittedText(null);
    }
    prevRevisionRef.current = rev;
  }, [params.dataRevision, params.overviewProcessing]);

  useEffect(() => {
    if (params.overviewProcessing && !prevProcessingRef.current) {
      setCommittedText(null);
    }
    prevProcessingRef.current = params.overviewProcessing;
  }, [params.overviewProcessing]);

  const isReprocessing =
    params.overviewProcessing && params.descriptionPending === true;

  const { phase, nextCommittedText } = resolveDescriptionDisplayPhase({
    descriptionReady: Boolean(params.descriptionReady),
    descriptionText: params.descriptionText,
    committedText,
    overviewProcessing: params.overviewProcessing,
    isReprocessing,
  });

  useEffect(() => {
    if (nextCommittedText !== committedText) {
      setCommittedText(nextCommittedText);
    }
  }, [nextCommittedText, committedText]);

  return { phase, displayedDescription: committedText };
}
