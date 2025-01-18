import { MutableRefObject, useEffect } from 'react';

interface useModalAutoClose {
  refrence: MutableRefObject<HTMLDivElement | null>;
  buttonRefrence?: MutableRefObject<HTMLDivElement | null>;
  close: () => void;
}

const useModalAutoClose = (props: useModalAutoClose) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        props.refrence.current &&
        !props.refrence.current.contains(event.target as Node) &&
        !props.buttonRefrence?.current?.contains(event.target as Node)
      ) {
        props.close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [props, props.refrence]);
};

export default useModalAutoClose;
