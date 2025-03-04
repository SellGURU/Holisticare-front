/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

interface ItemInListModalProps {
  item: any;
  index: number;
  sureRemoveIndex: number | null;
  setSureRemoveIndex: (value: number | null) => void;
  handleRemove: (index: number) => void;
  handleEdit: (index: number) => void;
}

const ItemInListModal: FC<ItemInListModalProps> = ({
  handleEdit,
  handleRemove,
  index,
  item,
  setSureRemoveIndex,
  sureRemoveIndex,
}) => {
  return (
    <div className="flex items-center justify-between w-full h-[36px] py-2 px-4 bg-backgroundColor-Card rounded-xl border border-Gray-50">
      <div className="text-Text-Quadruple text-[10px] w-[60%]">
        {String(index + 1).padStart(2, '0')}
        {'  '}
        {item.title}
      </div>
      <div className="flex items-center justify-between w-[40%]">
        <div className="text-Orange text-[8px] flex items-center justify-center w-[41%]">
          {item.required ? (
            <img
              src="./icons/danger-new.svg"
              alt=""
              className="w-[12px] h-[12px] mr-1"
            />
          ) : (
            ''
          )}
          {item.required ? 'Required' : ''}
        </div>
        <div className="text-Text-Quadruple text-[10px] w-[30%] flex items-center justify-center text-nowrap">
          {item.type}
        </div>
        <div
          className={`flex items-center justify-end ${sureRemoveIndex === index ? 'w-[35%]' : 'w-[24%]'}`}
        >
          {sureRemoveIndex === index ? (
            <div className="flex items-center justify-center gap-1">
              <div className="text-Text-Quadruple text-xs">Sure?</div>
              <img
                src="/icons/tick-circle-green.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => handleRemove(index)}
              />
              <img
                src="/icons/close-circle-red.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => setSureRemoveIndex(null)}
              />
            </div>
          ) : (
            <>
              <img
                src="./icons/edit-blue.svg"
                alt=""
                className="w-[16px] h-[16px] cursor-pointer"
                onClick={() => handleEdit(index)}
              />
              <img
                src="./icons/trash-blue.svg"
                alt=""
                className="w-[16px] h-[16px] ml-2 cursor-pointer"
                onClick={() => setSureRemoveIndex(index)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemInListModal;
