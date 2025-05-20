/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
// import TooltipText from '../../../Components/TooltipText';

export const columns = (): ColumnDef<any>[] => [
  {
    accessorKey: 'no',
    header: 'No',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start text-xs text-Text-Secondary ">
          {/* {row.original?.no || 'No Data'} */}
          {row.index + 1}
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary flex justify-center text-center ">
          <div className="max-w-[250px] overflow-hidden text-ellipsis ">
            {row.original?.title}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'questions',
    header: 'Questions',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.questions || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'time_required',
    header: 'Time Required',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {(() => {
            const ms = row.original?.time_required;
            if (!ms) return '-';
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${minutes} min, ${seconds} sec`;
          })() || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_on',
    header: 'Created on',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.created_on || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_by',
    header: 'Created by',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.created_by || '-'}
        </div>
      );
    },
  },
];
