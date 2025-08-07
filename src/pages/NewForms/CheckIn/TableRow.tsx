/* eslint-disable @typescript-eslint/no-explicit-any */
import { Row } from '@tanstack/react-table';
import { FC, useRef, useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';

interface TableRowProps {
  row: Row<any>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onReposition: (id: string) => void;
  index: number;
}

const TableRow: FC<TableRowProps> = ({
  row,
  onDelete,
  onEdit,
  onPreview,
  onReposition,
  index,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sureRemove, setSureRemove] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);

  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setShowModal(false);
      setSureRemove(false);
    },
  });

  const handleOpenModal = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const modalHeight = 160;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    // Calculate position relative to the viewport
    let topPosition = rect.top + scrollY;
    const leftPosition = rect.right - 188; // 188px is the modal width

    // Adjust position if modal would go off screen
    if (topPosition + modalHeight > windowHeight + scrollY) {
      topPosition = rect.top + scrollY - modalHeight;
    }

    setModalPosition({
      top: topPosition,
      left: leftPosition,
    });
    setShowModal(true);
  };

  const removeItemByNo = (id: string) => {
    onDelete(id);
    setShowModal(false);
    setSureRemove(false);
  };

  const handleEdit = (id: string) => {
    setShowModal(false);
    onEdit(id);
  };

  const handleReposition = (id: string) => {
    setShowModal(false);
    onReposition(id);
  };

  return (
    <>
      <tr
        className={`${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-Text-Primary relative space-y-7`}
        key={row.id}
      >
        {row.getVisibleCells().map((cell) => (
          <td
            className="px-3 py-3 text-center text-nowrap text-xs"
            key={cell.id}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
        <td className="px-3 py-3 text-center text-nowrap text-xs">
          <div className="flex justify-center w-full">
            <img
              onClick={handleOpenModal}
              src="/icons/more-blue.svg"
              alt=""
              className="cursor-pointer px-4 py-2"
            />
          </div>
        </td>
      </tr>
      {showModal && (
        <div
          ref={showModalRefrence}
          style={{
            position: 'fixed',
            top: `${modalPosition.top}px`,
            left: `${modalPosition.left}px`,
          }}
          className="z-20 w-[188px] rounded-[16px] px-4 py-2 bg-white shadow-800 flex flex-col gap-3"
        >
          <div
            className="flex items-center gap-2 TextStyle-Body-2 text-Text-Primary pb-2 border-b border-Secondary-SelverGray cursor-pointer"
            onClick={() => handleReposition(row.original.id)}
          >
            <img src="/icons/setting-4-green.svg" alt="" className="w-4 h-4" />
            Reposition
          </div>
          {/* <div
            className="flex items-center cursor-not-allowed border-b opacity-50 border-Secondary-SelverGray gap-2 TextStyle-Body-2 text-Text-Primary pb-2 "
          >
            <img src="/icons/timer-green.svg" alt="" />
            Schedule & Reminder
          </div> */}
          <div
            onClick={() => {
              setShowModal(false);
              onPreview(row.original.id);
            }}
            className="flex items-center border-b border-Secondary-SelverGray gap-2 TextStyle-Body-2 text-Text-Primary pb-2 cursor-pointer"
          >
            <img src="/icons/eye-green.svg" className="w-4" alt="" />
            Preview
          </div>
          <div
            className="flex items-center border-b border-Secondary-SelverGray gap-2 TextStyle-Body-2 text-Text-Primary pb-2 cursor-pointer"
            onClick={() => handleEdit(row.original.id)}
          >
            <img src="/icons/edit-green.svg" className="w-4" alt="" />
            Edit
          </div>
          {sureRemove ? (
            <div className="flex items-center justify-start gap-1">
              <div className="text-Text-Primary text-xs">Sure?</div>
              <img
                src="/icons/tick-circle-green.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => removeItemByNo(row.original.id)}
              />
              <img
                src="/icons/close-circle-red.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => setSureRemove(false)}
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 TextStyle-Body-2 text-Text-Primary pb-1 cursor-pointer"
              onClick={() => setSureRemove(true)}
            >
              <img src="/icons/delete-green.svg" className="w-4" alt="" />
              Delete
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TableRow;
