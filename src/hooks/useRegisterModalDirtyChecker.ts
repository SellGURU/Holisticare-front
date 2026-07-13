import { useEffect, useRef } from 'react';
import { useModalCloseContext } from '../context/ModalCloseContext';

export function useRegisterModalDirtyChecker(getIsDirty: () => boolean) {
  const { registerDirtyChecker, unregisterDirtyChecker } =
    useModalCloseContext();
  const getIsDirtyRef = useRef(getIsDirty);
  getIsDirtyRef.current = getIsDirty;

  useEffect(() => {
    registerDirtyChecker(() => getIsDirtyRef.current());
    return unregisterDirtyChecker;
  }, [registerDirtyChecker, unregisterDirtyChecker]);
}
