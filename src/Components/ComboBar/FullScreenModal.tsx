/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { publish, subscribe, unsubscribe } from '../../utils/event';

const FullScreenModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const isProcessingRef = useRef(false);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null,
  );

  useEffect(() => {
    subscribe('openFullscreenModal', (e: any) => {
      setIsOpen(true);
      setUrl(e.detail.url);
    });
    setTimeout(() => {
      if (isOpen) {
        publish('openSideMenu', { status: true });
      } else {
        publish('openSideMenu', { status: false });
      }
    }, 300);
    return () => {
      unsubscribe('openFullscreenModal', () => {
        setIsOpen(false);
        setUrl('');
      });
      unsubscribe('openSideMenu', () => {
        publish('openSideMenu', { status: false });
      });
    };
  }, [isOpen]);

  useEffect(() => {
    // Create a stable handler function
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'closeFullscreenModal') {
        // Prevent multiple rapid executions
        if (isProcessingRef.current) {
          return;
        }

        isProcessingRef.current = true;

        // const receivedData = event.data.data;
        publish('checkProgress', {});
        setIsOpen(false);
        publish('reloadQuestionnaires', {});
        publish('reloadMainQuestionnaires', {});
        setUrl('');

        // Reset the flag after a short delay to allow processing
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }
    };

    // Store the handler reference for cleanup
    messageHandlerRef.current = handleMessage;

    window.addEventListener('message', handleMessage);

    // Cleanup: remove the event listener when component unmounts
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []);
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black left-0 bg-opacity-50 flex items-center justify-center">
      <div className="w-full h-full bg-white relative">
        {/* Close button */}
        <img
          onClick={() => {
            setIsOpen(false);
            setUrl('');
          }}
          className="cursor-pointer absolute right-4 top-4"
          src="/icons/close.svg"
        />

        <iframe
          src={url}
          className="w-full h-full "
          title="Survey"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default FullScreenModal;
