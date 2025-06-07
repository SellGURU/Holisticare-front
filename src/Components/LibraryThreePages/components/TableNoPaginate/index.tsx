/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useEffect, useState } from 'react';
import { columns } from './tableTd';
import { FaSort } from 'react-icons/fa';

interface TableProps {
  tableData: Array<any>;
  pageType: string;
  onDelete: (id: string) => void;
  onEdit: (row: any) => void;
  onPreview: (row: any) => void;
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

const TableNoPaginateForLibraryThreePages: FC<TableProps> = ({
  tableData,
  pageType,
  onDelete,
  onEdit,
  onPreview,
}) => {
  const [data, setData] = useState(tableData);
  useEffect(() => {
    setData(tableData);
  }, [tableData]);
  const table = useReactTable({
    data,
    columns: columns(pageType),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: nestedFilter,
  });
  const [sureRemoveIndex, setSureRemoveIndex] = useState<number | null>(null);
  const removeItemByNo = (id: string) => {
    onDelete(id);
    setSureRemoveIndex(null);
  };
  const handleEdit = (row: any) => {
    onEdit(row);
  };
  const handlePreview = (row: any) => {
    onPreview(row);
  };
  return (
    <div className="w-full mt-6 mb-14">
      <div
        className={`flex flex-col justify-between overflow-x-auto bg-white text-Text-Primary border border-Boarder`}
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
                      className={`px-3 pt-4 pb-3.5 text-xs font-medium cursor-pointer `}
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
                    className={`px-3 pt-4 pb-3.5 text-xs font-medium cursor-pointer`}
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
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  className={`text-Text-Primary space-y-7 ${index % 2 === 1 ? 'bg-backgroundColor-Main' : 'bg-white'}`}
                  key={row.original.Sup_Id}
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
                    {sureRemoveIndex === index ? (
                      <div className="flex items-center justify-center w-full gap-1">
                        <div className="text-Text-Quadruple text-xs">Sure?</div>
                        <img
                          src="/icons/tick-circle-green.svg"
                          alt=""
                          className="w-[20px] h-[20px] cursor-pointer"
                          onClick={() => {
                            if (pageType === 'Supplement') {
                              removeItemByNo(row.original.Sup_Id);
                            } else if (pageType === 'Lifestyle') {
                              removeItemByNo(row.original.Life_Id);
                            } else {
                              removeItemByNo(row.original.Diet_Id);
                            }
                          }}
                        />
                        <img
                          src="/icons/close-circle-red.svg"
                          alt=""
                          className="w-[20px] h-[20px] cursor-pointer"
                          onClick={() => setSureRemoveIndex(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full gap-2">
                        <img
                          onClick={() => handlePreview(row.original)}
                          className="cursor-pointer"
                          src="/icons/eye-blue.svg"
                          alt=""
                        />
                        <img
                          onClick={() => handleEdit(row.original)}
                          src="/icons/edit-blue.svg"
                          alt=""
                          className="cursor-pointer"
                        />
                        <img
                          onClick={() => setSureRemoveIndex(index)}
                          src="/icons/trash-blue.svg"
                          alt=""
                          className="cursor-pointer"
                        />
                      </div>
                    )}
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
  );
};

export default TableNoPaginateForLibraryThreePages;
