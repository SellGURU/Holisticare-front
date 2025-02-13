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
import PaginationCircular from '../paginationCircular/index.tsx';
import { columns } from './tableTd.tsx';
interface TableProps {
  classData: Array<any>;
  setReportsFiltered: (data: any) => void;
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

const TablePaginationInside: React.FC<TableProps> = ({
  classData,
  setReportsFiltered,
}) => {
  const [data, setData] = useState(classData);
  const [globalFilter, setGlobalFilter] = useState(''); // State for global filter

  const [currentPage, setCurrentPage] = useState(0);

  // calculate the height of table
  const pageSize = (window.innerHeight * 0.67) / 45; // 100vh in pixels

  useEffect(() => {
    setData(classData);
  }, [classData]);

  const table = useReactTable({
    data,
    columns: columns(classData, setReportsFiltered),
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-full mt-4">
        <div
          className={`flex flex-col justify-between overflow-x-auto  bg-white shadow-200  rounded-[16px] text-Text-Primary  mt-[-12px] h-[68vh]`}
        >
          {table.getRowModel().rows.length > 0 ? (
            <table
              className={`border-collapse table-auto text-sm text-left rtl:text-right w-full`}
            >
              <thead className="text-xs text-Text-Primary">
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
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    className={`text-Text-Primary space-y-7 ${index % 2 === 0 ? 'bg-Secondary-SelverGray' : 'bg-white'}`}
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
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex items-center justify-center text-Text-Primary text-[12px] ml-5">
              Show
              <div className="relative inline-block w-[80px] font-normal ml-3 mr-3">
                <select
                  onClick={() => setIsOpen(!isOpen)}
                  onBlur={() => setIsOpen(false)}
                  onChange={() => {
                    setIsOpen(false);
                  }}
                  className="block appearance-none w-full bg-backgroundColor-Secondary border-none py-2 px-4 pr-8 shadow-100 rounded-md leading-tight focus:outline-none text-[10px] text-Primary-EmeraldGreen"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <img
                  className={` w-3 h-3 object-contain opacity-80 absolute top-2 right-2 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  src="/icons/arow-down-drop.svg"
                  alt=""
                />
              </div>
              reports in each page.
            </div>
            <PaginationCircular
              currentPage={currentPage + 1}
              totalPages={Math.ceil(data.length / pageSize)}
              onPageChange={handlePageChange}
            />
            <div className="flex items-center justify-center text-Text-Primary text-[12px] mr-5">
              2 new reports were added today.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePaginationInside;
