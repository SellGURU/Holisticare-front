/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TbFilterPlus } from "react-icons/tb";
import { columns } from './tableTd.tsx';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from '@tanstack/react-table';
import { FaSort } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Pagination from '../pagination/index.tsx';
// import Application from "@/api/app.ts";
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

const Table: React.FC<TableProps> = ({ classData }) => {
  const [data, setData] = useState(classData);
  const [globalFilter, setGlobalFilter] = useState(''); // State for global filter

  const [currentPage, setCurrentPage] = useState(0);

  // calculate the height of table
  const pageSize = (window.innerHeight * 0.67) / 65; // 100vh in pixels

  useEffect(() => {
    setData(classData);
  }, [classData]);

  const table = useReactTable({
    data,
    columns: columns(data.length),
    state: {
      globalFilter,
      pagination: {
        pageIndex: currentPage,
        pageSize, // Link page index to currentPage
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    globalFilterFn: nestedFilter,
    onGlobalFilterChange: setGlobalFilter, // Handle global filter changes
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-full mt-4">
        <div
          className={`overflow-x-auto  bg-white shadow-200  rounded-[16px] text-Text-Primary   mt-[-12px] h-[60vh]`}
        >
          {table.getRowModel().rows.length > 0 ? (
            <table
              className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
            >
              <thead className="text-xs text-Text-Primary ">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-nowrap text-Text-Primary "
                  >
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`px-3 pt-5 pb-3 text-xs   font-medium cursor-pointer `}
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
                {table.getRowModel().rows.map((row) => (
                  <tr className="text-Text-Primary space-y-7  " key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className={`px-3 py-3 text-center text-nowrap text-xs max-w-[80px]  `}
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
            <div className=" w-full h-full flex items-center justify-center flex-col">
              <p className="text-[#ffffffa4] mt-[8px] text-[16px]">
                No Result to Show
              </p>
            </div>
          )}
        </div>
      </div>
      <Pagination
        currentPage={currentPage + 1}
        totalPages={Math.ceil(data.length / pageSize)}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Table;
