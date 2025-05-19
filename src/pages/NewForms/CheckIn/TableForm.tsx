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
import TableRow from './TableRow';

interface TableProps {
  classData: Array<any>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onReposition: (id: string) => void;
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
  onPreview,
  onReposition,
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

  return (
    <>
      {classData.length ? (
        <div className="flex items-center justify-center relative">
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
                            className={`px-3 pt-4 pb-3.5 text-xs font-medium cursor-pointer first:rounded-tl-[12px] last:rounded-tr-[12px] ${
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              ) === 'Title'
                                ? 'w-[300px]'
                                : 'w-[250px]'
                            }`}
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
                                {header.column.getIsSorted() === 'desc' &&
                                  ' 🔽'}
                              </div>
                            </div>
                          </th>
                        ))}
                        <th
                          className={`px-3 pt-4 pb-3.5 text-xs font-medium first:rounded-tl-[12px] last:rounded-tr-[12px] w-[200px]`}
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
                      <TableRow
                        key={row.id}
                        row={row}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onPreview={onPreview}
                        onReposition={onReposition}
                        index={index}
                      />
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
      ) : (
        <div className="w-full h-full flex items-center justify-center flex-col mt-28">
          <img
            src="/icons/empty-messages-coach.svg"
            alt=""
            className="w-60 h-60"
          />
          <p className="text-Text-Primary text-base font-medium -mt-12">
            No results found.
          </p>
        </div>
      )}
    </>
  );
};

export default TableForm;
