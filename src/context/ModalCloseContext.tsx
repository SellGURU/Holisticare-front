import { createContext, useContext } from 'react';

export interface ModalCloseContextValue {
  requestClose: () => void;
  registerDirtyChecker: (checker: () => boolean) => void;
  unregisterDirtyChecker: () => void;
}

const defaultValue: ModalCloseContextValue = {
  requestClose: () => {},
  registerDirtyChecker: () => {},
  unregisterDirtyChecker: () => {},
};

export const ModalCloseContext =
  createContext<ModalCloseContextValue>(defaultValue);

export function useModalCloseContext() {
  return useContext(ModalCloseContext);
}
