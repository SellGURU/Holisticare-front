/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState } from 'react';
import useModalAutoClose from '../../../../hooks/UseModalAutoClose';
import Application from '../../../../api/app';
import { publish } from '../../../../utils/event';

interface ActionModalProps {
  OnClose: () => void;
  member_id: string;
  el: any;
  status: 'completed' | 'incomplete';
  onAssign: () => void;
  onDelete: () => void;
  handleCloseSlideOutPanel: () => void;
}

const ActionModal: FC<ActionModalProps> = ({
  OnClose,
  member_id,
  el,
  status,
  onAssign,
  onDelete,
  handleCloseSlideOutPanel,
}) => {
  const modalRef = useRef(null);
  const CloseAction = () => {
    OnClose();
  };
  const [sureRemove, setSureRemove] = useState<boolean>(false);
  useModalAutoClose({
    refrence: modalRef,
    close: CloseAction,
  });
  const handlePreview = () => {
    Application.PreviewQuestionary({
      member_id: member_id,
      q_unique_id: el.unique_id,
      f_unique_id: el.forms_unique_id,
    })
      .then(() => {
        OnClose();
        window.open(
          `/surveys-view/${member_id}/${el.unique_id}/${el.forms_unique_id}`,
          '_blank',
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <div
        ref={modalRef}
        className="absolute top-10 right-[16px] z-20  w-[155px] rounded-[16px] px-4 py-2 bg-white border border-Gray-50 shadow-200 flex flex-col gap-3"
      >
        <div
          onClick={() => {
            handlePreview();
          }}
          className={`flex items-center border-b border-Secondary-SelverGray  gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-1  cursor-pointer`}
        >
          <img className="size-5" src="/icons/eye-green.svg" alt="" />
          Preview
        </div>
        {status == 'completed' && (
          <>
            <div
              onClick={() => {
                OnClose();
                publish('openFullscreenModal', {
                  url: `/surveys/${member_id}/${el.unique_id}/${el.forms_unique_id}/edit`,
                });
                handleCloseSlideOutPanel();
              }}
              className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2 border-b border-Secondary-SelverGray  cursor-pointer"
            >
              <img
                className="w-[22px] h-[22px]"
                src="/icons/edit-2-green.svg"
                alt=""
              />
              Edit
            </div>
          </>
        )}
        {status != 'completed' && (
          <>
            <div
              onClick={() => {
                OnClose();
                publish('openFullscreenModal', {
                  url: `/surveys/${member_id}/${el.unique_id}/${el.forms_unique_id}/fill`,
                });
                handleCloseSlideOutPanel();
              }}
              className="flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2 border-b border-Secondary-SelverGray  cursor-pointer"
            >
              <img className="size-5" src="/icons/Fiilout-Form.svg" alt="" />
              Fill out
            </div>
            <div
              onClick={() => {
                if (!el.assinged_to_client) {
                  Application.QuestionaryAction({
                    member_id: member_id,
                    q_unique_id: el.unique_id,
                    f_unique_id: el.forms_unique_id,
                    action: 'assign',
                  })
                    .then(() => {
                      OnClose();
                      onAssign();
                      //   setisAssigned(true);
                      //   setshowModal(false);
                      //   onAssign(el.unique_id);
                    })
                    .catch(() => {});
                }
              }}
              className={`${el.assinged_to_client ? 'opacity-50' : 'opacity-100'} border-b border-Secondary-SelverGray flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-2  cursor-pointer`}
            >
              <img className="size-5" src="/icons/user-add-green.svg" alt="" />
              Assign to Client
            </div>
          </>
        )}
        {!sureRemove ? (
          <>
            <div
              onClick={() => {
                setSureRemove(true);
              }}
              className={`flex items-center gap-2 TextStyle-Body-2 text-xs text-Text-Primary pb-1 cursor-pointer`}
            >
              <img className="size-5" src="/icons/delete-green.svg" alt="" />
              Delete
            </div>
          </>
        ) : (
          <div className="flex items-center justify-start gap-2">
            <div className="text-Text-Quadruple text-xs">Sure?</div>
            <img
              src="/icons/tick-circle-green.svg"
              alt=""
              className="w-[20px] h-[20px] cursor-pointer"
              onClick={() => {
                OnClose();
                onDelete();
                // handleDelete(
                //   id,
                //   el.unique_id,
                //   el.forms_unique_id,
                //   el.status,
                // );
              }}
            />
            <img
              src="/icons/close-circle-red.svg"
              alt=""
              className="w-[20px] h-[20px] cursor-pointer"
              onClick={() => setSureRemove(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ActionModal;
