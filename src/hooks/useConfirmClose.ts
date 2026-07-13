import { useCallback, useState } from 'react';

interface UseConfirmCloseOptions {
  onClose: () => void;
  getIsDirty: () => boolean;
  enabled?: boolean;
}

export function useConfirmClose({
  onClose,
  getIsDirty,
  enabled = true,
}: UseConfirmCloseOptions) {
  const [showConfirm, setShowConfirm] = useState(false);

  const requestClose = useCallback(() => {
    if (!enabled) {
      onClose();
      return;
    }

    if (getIsDirty()) {
      setShowConfirm(true);
      return;
    }

    onClose();
  }, [enabled, getIsDirty, onClose]);

  const confirmDiscard = useCallback(() => {
    setShowConfirm(false);
    onClose();
  }, [onClose]);

  const cancelDiscard = useCallback(() => {
    setShowConfirm(false);
  }, []);

  return {
    requestClose,
    showConfirm,
    confirmDiscard,
    cancelDiscard,
  };
}
