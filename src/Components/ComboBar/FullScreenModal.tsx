/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { publish, subscribe } from '../../utils/event';
import Application from '../../api/app';

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
          try {
            const res = await Application.checkUpdateQuestionary({
              f_unique_id: receivedData.f_unique_id as string,
              q_unique_id: receivedData.q_unique_id as string,
              member_id: receivedData.member_id as string,
            });
            if (res.status === 200 && res.data.status === true) {
              publish('UpdateQuestionnaireTrackingSuccess', {});
            } else {
              setTimeout(checkUpdate, 15000);
            }
          } catch (err) {
            console.error('err', err);

            setTimeout(checkUpdate, 15000);
          }
        };
        checkUpdate();
      }
      if (receivedData.isFill) {
        publish('openFilloutQuestionnaireTrackingProgressModal', {});
        const checkFillout = async () => {
          try {
            const res = await Application.checkFilloutQuestionary({
              f_unique_id: receivedData.f_unique_id as string,
              q_unique_id: receivedData.q_unique_id as string,
              member_id: receivedData.member_id as string,
            });
            if (res.status === 200 && res.data.status === true) {
              publish('FilloutQuestionnaireTrackingSuccess', {});
            } else {
              setTimeout(checkFillout, 15000);
            }
          } catch (err) {
            console.error('err', err);

            setTimeout(checkFillout, 15000);
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
