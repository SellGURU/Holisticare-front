/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TbFilterPlus } from "react-icons/tb";

import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { FaSort } from 'react-icons/fa';
import { columns } from './tableTd.tsx';
interface TableProps {
  classData: Array<any>;
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

const TableAssignList: React.FC<TableProps> = ({ classData }) => {
  const [data, setData] = useState(classData);

  useEffect(() => {
    setData(classData);
  }, [classData]);

  const table = useReactTable({
    data,
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: nestedFilter,
  });

  return (
    <div className="flex items-center justify-center">
      <div className="w-full mt-4">
        <div
          className={`flex flex-col justify-between overflow-y-auto  bg-white border border-bg-color  rounded-[16px] text-Text-Primary  mt-[-12px] h-[256px]`}
        >
          {table.getRowModel().rows.length > 0 ? (
            <table
              className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
            >
              <thead className="text-xs text-Text-Primary bg-bg-color sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-nowrap text-Text-Primary "
                  >
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`px-3 pt-2 pb-2 text-[10px] font-medium cursor-pointer`}
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
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    className={`text-Text-Primary space-y-7 ${index % 2 === 1 ? 'bg-backgroundColor-Main' : 'bg-white'}`}
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col">
              <p className="text-Text-Primary mt-[8px] text-[16px]">
                No Result to Show
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableAssignList;
