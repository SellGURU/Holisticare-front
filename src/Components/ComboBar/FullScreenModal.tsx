/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import Application from '../../api/app';
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
      const receivedData = event.data.data;
      if (receivedData.isUpdate) {
        publish('openUpdateQuestionnaireTrackingProgressModal', {});
        const checkUpdate = async () => {
          const pathname = window.location.pathname
            .split('/')
            .slice(1, 3)
            .join('/');
          if (pathname !== `report/${receivedData.member_id}`) {
            publish('closeUpdateQuestionnaireTrackingProgressModal', {});
            return;
          }
          try {
            const res = await Application.checkUpdateQuestionary({
              f_unique_id: receivedData.f_unique_id as string,
              q_unique_id: receivedData.q_unique_id as string,
              member_id: receivedData.member_id as string,
            });
            if (res.status === 200 && res.data.status === true) {
              publish('UpdateQuestionnaireTrackingSuccess', {});
            } else {
              setTimeout(checkUpdate, 30000);
            }
          } catch (err) {
            console.error('err', err);

            setTimeout(checkUpdate, 30000);
          }
        };
        checkUpdate();
      }
      if (receivedData.isFill) {
        publish('openFilloutQuestionnaireTrackingProgressModal', {});
        const checkFillout = async () => {
          const pathname = window.location.pathname
            .split('/')
            .slice(1, 3)
            .join('/');
          if (pathname !== `report/${receivedData.member_id}`) {
            publish('closeFilloutQuestionnaireTrackingProgressModal', {});
            return;
          }
          try {
            const res = await Application.checkFilloutQuestionary({
              f_unique_id: receivedData.f_unique_id as string,
              q_unique_id: receivedData.q_unique_id as string,
              member_id: receivedData.member_id as string,
            });
            if (res.status === 200 && res.data.status === true) {
              publish('FilloutQuestionnaireTrackingSuccess', {});
            } else {
              setTimeout(checkFillout, 30000);
            }
          } catch (err) {
            console.error('err', err);

            setTimeout(checkFillout, 30000);
          }
        };
        checkFillout();
      }

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
