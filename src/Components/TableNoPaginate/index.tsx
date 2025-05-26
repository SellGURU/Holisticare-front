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
  classData: Array<any>;
  isPackage?: boolean;
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

const TableNoPaginate: FC<TableProps> = ({ classData, isPackage }) => {
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
  return (
    <div className="flex items-center justify-center">
      <div className="w-full mt-4">
        <div
          className={`flex flex-col justify-between overflow-x-auto  rounded-[16px] text-Text-Primary mt-[-12px]  shadow-200 border border-Boarder`}
        >
          {table.getRowModel().rows.length > 0 ? (
            <table
              className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
            >
              <thead
                className={`text-xs text-Text-Primary ${isPackage ? 'bg-[#F4F4F4]' : 'bg-bg-color'} `}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className={`text-nowrap ${isPackage ? 'text-Text-Primary' : 'text-Primary-DeepTeal'}`}
                  >
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`px-3 pt-3 pb-3 text-xs font-medium cursor-pointer `}
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
                            {!isPackage &&
                              header.column.getCanSort() &&
                              header.column.getIsSorted() === false && (
                                <FaSort className="cursor-pointer" />
                              )}
                            {!isPackage &&
                              header.column.getIsSorted() === 'asc' &&
                              ' 🔼'}
                            {!isPackage &&
                              header.column.getIsSorted() === 'desc' &&
                              ' 🔽'}
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
                    className={`text-Text-Primary space-y-7 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'}`}
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

export default TableNoPaginate;
