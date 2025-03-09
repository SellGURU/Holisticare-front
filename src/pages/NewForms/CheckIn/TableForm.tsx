/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useEffect, useRef, useState } from 'react';
import { columns } from './tableTd';
import { FaSort } from 'react-icons/fa';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import FormsApi from '../../../api/Forms';

interface TableProps {
  classData: Array<any>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  setCheckInLists: (value: any) => void;
  setCheckInListEditValue: (value: any) => void;
  setEditModeModal: (value: boolean) => void;
  setShowModal: (value: boolean) => void;
  setRepositionModeModal: (value: boolean) => void;
  setShowModalSchedule: (value: boolean) => void;
}
// Custom filter function to handle nested fields
const nestedFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId);
  if (typeof rowValue === 'object' && rowValue !== null) {
    return Object.values(rowValue).some((val) =>
      String(val).toLowerCase().includes(filterValue.toLowerCase()),
    );
  }
  return String(rowValue).toLowerCase().includes(filterValue.toLowerCase());
};

const TableForm: FC<TableProps> = ({
  classData,
  onDelete,
  onEdit,
  // setCheckInLists,
  setCheckInListEditValue,
  setShowModal,
  setRepositionModeModal,
  setShowModalSchedule,
}) => {
  const [data, setData] = useState(classData);
  useEffect(() => {
    setData(classData);
  }, [classData]);
  const table = useReactTable({
    data,
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: nestedFilter,
  });
  const [showModal, setshowModal] = useState(false);
  const showModalRefrence = useRef(null);
  const showModalButtonRefrence = useRef(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  useModalAutoClose({
    refrence: showModalRefrence,
    buttonRefrence: showModalButtonRefrence,
    close: () => {
      setshowModal(false);
    },
  });
  const [modalPosition, setModalPosition] = useState({ top: 0 });
  const handleOpenModal = (e: React.MouseEvent<HTMLImageElement>, row: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      top: rect.top + window.scrollY - 200,
    });
    setSelectedRow(row.original);
    setshowModal(true);
  };
  const [sureRemove, setSureRemove] = useState(false);
  const removeItemByNo = (id: string) => {
    FormsApi.deleteCheckin(id).then(() => {
      onDelete(id);
    });
    setshowModal(false);
    setSelectedRow(null);
    setSureRemove(false);
  };
  const handleEdit = (id: string) => {
    // setRepositionModeModal(false);
    setshowModal(false);
    onEdit(id);
    // setEditModeModal(true);
    // setCheckInListEditValue(selectedRow);
    // setShowModal(true);
  };
  const handleReposition = () => {
    setshowModal(false);
    setRepositionModeModal(true);
    setCheckInListEditValue(selectedRow);
    setShowModal(true);
  };
  const handleSchedule = () => {
    setshowModal(false);
    setCheckInListEditValue(selectedRow);
    setShowModalSchedule(true);
  };
  return (
    <div className="flex items-center justify-center relative">
      {showModal && (
        <div
          ref={showModalRefrence}
          style={{ top: `${modalPosition.top}px` }}
          className="absolute right-[100px] z-20 w-[188px] rounded-[16px] px-4 py-2 bg-white shadow-800 flex flex-col gap-3"
        >
          <div
            className="flex items-center gap-2 TextStyle-Body-2 text-Text-Primary pb-2 border-b border-Secondary-SelverGray cursor-pointer"
            onClick={handleReposition}
          >
            <img src="/icons/setting-4-green.svg" alt="" className="w-4 h-4" />
            Reposition
          </div>
          <div
            className="flex items-center border-b border-Secondary-SelverGray gap-2 TextStyle-Body-2 text-Text-Primary pb-2 cursor-pointer"
            onClick={handleSchedule}
          >
            <img src="/icons/timer-green.svg" alt="" />
            Schedule & Reminder
          </div>
          <div className="flex items-center border-b border-Secondary-SelverGray gap-2 TextStyle-Body-2 text-Text-Primary pb-2 cursor-pointer">
            <img src="/icons/eye-green.svg" className="w-4" alt="" />
            Preview
          </div>
          <div
            className="flex items-center border-b border-Secondary-SelverGray gap-2 TextStyle-Body-2 text-Text-Primary pb-2 cursor-pointer"
            onClick={() => handleEdit(selectedRow.id)}
          >
            <img src="/icons/edit-green.svg" className="w-4" alt="" />
            Edit
          </div>
          {sureRemove ? (
            <div className="flex items-center justify-start gap-3">
              <div className="text-Text-Quadruple text-xs">Sure?</div>
              <img
                src="/icons/tick-circle-green.svg"
                alt=""
                className="w-[20px] h-[20px] cursor-pointer"
                onClick={() => removeItemByNo(selectedRow.id)}
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
      <div className="w-full mt-4">
        <div
          className={`flex flex-col justify-between overflow-x-auto bg-white rounded-[16px] text-Text-Primary mt-[-12px] border border-Boarder shadow-200`}
        >
          {table.getRowModel().rows.length > 0 ? (
            <table
              className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
            >
              <thead className="text-xs text-Text-Primary bg-backgroundColor-Main">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-nowrap text-Text-Primary"
                  >
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`px-3 pt-4 pb-3.5 text-xs font-medium cursor-pointer first:rounded-tl-[12px] last:rounded-tr-[12px]`}
                      >
                        <div
                          className={`flex items-center  ${index == 0 ? 'justify-start ' : 'justify-center '} `}
                        >
                          <div
                            className="flex items-center justify-center"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() &&
                              header.column.getIsSorted() === false && (
                                <FaSort className="cursor-pointer" />
                              )}
                            {header.column.getIsSorted() === 'asc' && ' 🔼'}
                            {header.column.getIsSorted() === 'desc' && ' 🔽'}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th
                      className={`px-3 pt-4 pb-3.5 text-xs font-medium cursor-pointer first:rounded-tl-[12px] last:rounded-tr-[12px]`}
                    >
                      <div className={`flex items-center justify-center`}>
                        <div className="flex items-center justify-center">
                          Action
                        </div>
                      </div>
                    </th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    className={`text-Text-Primary space-y-7 bg-white`}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className="px-3 py-3 text-center text-nowrap text-xs"
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center text-nowrap text-xs">
                      <div className="flex justify-center w-full">
                        <img
                          onClick={(e) => {
                            handleOpenModal(e, row);
                          }}
                          src="/icons/more-blue.svg"
                          alt=""
                          className="cursor-pointer"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col">
              <p className="text-[#ffffffa4] mt-[8px] text-[16px]">
                No Result to Show
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableForm;
