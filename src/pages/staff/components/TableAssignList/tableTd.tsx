/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';

export const columns = (): ColumnDef<any>[] => [
  {
    accessorKey: 'name',
    header: 'Client Name',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start text-[10px] text-Text-Primary">
          {row.original?.name || 'No Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.id || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'age',
    header: 'Age',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.age || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.gender || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'enroll_date',
    header: 'Enroll Date',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.enroll_date || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'assign_date',
    header: 'Assign Date',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple flex items-center justify-center">
          {row.original?.assign_date || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      let bgColor;
      let bgActive;
      switch (row.original?.status) {
        case 'Waiting':
          bgColor = '#F9DEDC';
          bgActive = '#FFAB2C';
          break;
        case 'Done':
          bgColor = '#DEF7EC';
          bgActive = '#06C78D';
          break;
        case 'In progress':
          bgColor = '#E9F0F2';
          bgActive = '#4C88FF';
          break;
      }
      return (
        <div className="flex justify-center items-center">
          <div
            className={`text-[8px] text-Text-Primary bg-[${bgColor}] rounded-3xl px-2 flex items-center justify-center gap-1`}
          >
            <div
              className={`w-2 h-2 rounded-full bg-[${bgActive}] ${row.original?.status === 'Waiting'}`}
            ></div>
            {row.original?.status || '-'}
          </div>
        </div>
      );
    },
  },
];
