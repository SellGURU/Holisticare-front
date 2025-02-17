/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';

export const columns = (): ColumnDef<any>[] => [
  {
    accessorKey: 'No',
    header: 'No',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start text-xs text-Text-Secondary ">
          {row.original?.No || 'No Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'package_name',
    header: () => {
      return (
        <>
          <img src="/icons/box.svg" alt="" className="mr-1" />
          Package Name
        </>
      );
    },
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.package_name}
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: () => {
      return (
        <>
          <img src="/icons/wallet-money.svg" alt="" className="mr-1" />
          Price
        </>
      );
    },
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          ${row.original?.price || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'start_date',
    header: () => {
      return (
        <>
          <img src="/icons/calendar-tick.svg" alt="" className="mr-1" />
          Start Date
        </>
      );
    },
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.start_date || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'expire_date',
    header: () => {
      return (
        <>
          <img src="/icons/calendar-tick.svg" alt="" className="mr-1" />
          Expire Date
        </>
      );
    },
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.expire_date || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => {
      return (
        <>
          <img src="/icons/note-text.svg" alt="" className="mr-1" />
          Status
        </>
      );
    },
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary flex justify-center">
          <div
            className={`flex justify-center items-center w-[112px] h-[24px] rounded-[16px] ${row.original?.status ? 'bg-[#06C78D1A] text-Green' : 'bg-[#9090901A] text-[Disable]'}`}
          >
            {row.original?.status ? 'Active' : 'Deactive'}
          </div>
        </div>
      );
    },
  },
];
