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
  onDuplicate: (id: string) => void;
  onCopy?: (id: string) => void;
  onToggleEnabled?: (id: string, next: boolean) => void;
  // onReposition: (id: string) => void;
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
  onDuplicate,
  onCopy,
  onToggleEnabled,
  // onReposition,
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
      <div className="flex items-center justify-center relative">
        <div className="w-full mt-4">
          <div
            className={`flex flex-col justify-between overflow-x-auto bg-white rounded-[16px] text-Text-Primary mt-[-12px] border border-Boarder shadow-200`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#E9EDF5 #E9EDF5',
            }}
          >
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
                            {header.column.getIsSorted() === 'desc' && ' 🔽'}
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      row={row}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onPreview={onPreview}
                      onDuplicate={onDuplicate}
                      onCopy={onCopy}
                      onToggleEnabled={onToggleEnabled}
                      index={index}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length + 1}
                      className="px-3 py-10 text-center text-sm text-Text-Secondary"
                    >
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableForm;
