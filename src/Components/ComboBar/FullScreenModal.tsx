/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { publish, subscribe } from '../../utils/event';

const FullScreenModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  subscribe('openFullscreenModal', (e: any) => {
    setIsOpen(true);
    setUrl(e.detail.url);
  });
  window.addEventListener('message', (event) => {
    if (event.data.type === 'closeFullscreenModal') {
      setIsOpen(false);
      publish('reloadQuestionnaires', {});
      setUrl('');
    }
  });
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
