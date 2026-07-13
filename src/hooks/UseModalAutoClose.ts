import { MutableRefObject, useEffect } from 'react';

interface useModalAutoClose {
  refrence: MutableRefObject<HTMLDivElement | null>;
  buttonRefrence?: MutableRefObject<HTMLDivElement | null>;
  close: () => void;
  enabled?: boolean;
}

const useModalAutoClose = (props: useModalAutoClose) => {
  const { refrence, buttonRefrence, close, enabled = true } = props;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        refrence.current &&
        !refrence.current.contains(event.target as Node) &&
        !buttonRefrence?.current?.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close, refrence, buttonRefrence, enabled]);
};

export default useModalAutoClose;
