import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { ModalCloseContext } from '../../context/ModalCloseContext';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import { useConfirmClose } from '../../hooks/useConfirmClose';

interface MainModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  enableDiscardConfirm?: boolean;
  confirmCloseMessage?: string;
  confirmDiscardText?: string;
  confirmKeepText?: string;
}

const MainModal: React.FC<MainModalProps> = ({
  isOpen,
  onClose,
  children,
  enableDiscardConfirm = false,
  confirmCloseMessage = 'You have unsaved changes. If you close now, your edits will be lost.',
  confirmDiscardText = 'Discard changes',
  confirmKeepText = 'Keep editing',
}) => {
  const modalRefrence = useRef<HTMLDivElement | null>(null);
  const dirtyCheckerRef = useRef<(() => boolean) | null>(null);

  const getIsDirty = useCallback(() => {
    if (!enableDiscardConfirm) {
      return false;
    }
    return dirtyCheckerRef.current?.() ?? false;
  }, [enableDiscardConfirm]);

  const { requestClose, showConfirm, confirmDiscard, cancelDiscard } =
    useConfirmClose({
      onClose,
      getIsDirty,
      enabled: enableDiscardConfirm,
    });

  const registerDirtyChecker = useCallback((checker: () => boolean) => {
    dirtyCheckerRef.current = checker;
  }, []);

  const unregisterDirtyChecker = useCallback(() => {
    dirtyCheckerRef.current = null;
  }, []);

  const handleClose = enableDiscardConfirm ? requestClose : onClose;

  useModalAutoClose({
    refrence: modalRefrence,
    close: handleClose,
    enabled: Boolean(isOpen) && !showConfirm,
  });

  useEffect(() => {
    if (!isOpen || !enableDiscardConfirm || showConfirm) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, enableDiscardConfirm, showConfirm, requestClose]);

  const contextValue = useMemo(
    () => ({
      requestClose: handleClose,
      registerDirtyChecker,
      unregisterDirtyChecker,
    }),
    [handleClose, registerDirtyChecker, unregisterDirtyChecker],
  );

  if (!isOpen) return null;

  return (
    <ModalCloseContext.Provider value={contextValue}>
      <div className="w-full h-screen flex justify-center fixed z-[120] top-0 left-0 items-center">
        <div
          ref={modalRefrence}
          className="bg-[#FFFFFF66] min-h-[200px] rounded-[20px]  p-2 shadow-800"
        >
          {children}
        </div>
      </div>
      <div className="w-full h-full min-h-screen fixed top-0 left-0 bg-black opacity-30 z-[100]"></div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[130] bg-[#0000004D] bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cancelDiscard();
            }
          }}
        >
          <div
            className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[500px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="w-full border-b border-Gray-50 pb-2 flex items-center mb-4">
              <img src="/icons/danger.svg" alt="Warning" className="mr-2" />
              <h2 className="text-sm font-medium text-Text-Primary">
                Unsaved changes
              </h2>
            </div>
            <p className="text-xs text-Text-Secondary text-center mb-2">
              {confirmCloseMessage}
            </p>
            <p className="text-[10px] text-Text-Secondary text-center mb-6">
              Click outside to keep editing.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                autoFocus
                onClick={cancelDiscard}
                className="text-sm font-medium text-Primary-DeepTeal"
              >
                {confirmKeepText}
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className="text-sm text-[#909090]"
              >
                {confirmDiscardText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalCloseContext.Provider>
  );
};

export default MainModal;
