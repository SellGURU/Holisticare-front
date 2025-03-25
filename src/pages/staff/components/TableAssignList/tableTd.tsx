/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';

export const columns = (): ColumnDef<any>[] => [
  {
    accessorKey: 'first name',
    header: 'Client Name',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start items-center gap-1 text-[10px] text-Text-Primary">
          <div className="size-[24px] rounded-full relative">
            <img
              className="w-full h-full rounded-full object-cover border border-Primary-DeepTeal"
              src={row.original?.picture}
              alt=""
            />
          </div>
          {row.original?.['first name'] && row.original?.['last name']
            ? `${row.original?.['first name']} ${row.original?.['last name']}`
            : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'ID',
    header: 'ID',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.ID || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Age',
    header: 'Age',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.Age || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Gender',
    header: 'Gender',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.Gender || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Enroll Date',
    header: 'Enroll Date',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple ">
          {row.original?.['Enroll Date'] || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Assign Date',
    header: 'Assign Date',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-[10px] text-Text-Quadruple flex items-center justify-center">
          {row.original?.['Assign Date'] || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      let bgColor;
      let bgActive;
      switch (row.original?.Status) {
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
            <div className={`w-2 h-2 rounded-full bg-[${bgActive}]`}></div>
            {row.original?.Status || '-'}
          </div>
        </div>
      );
    },
  },
];
