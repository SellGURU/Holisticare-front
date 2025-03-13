/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { Tooltip } from 'react-tooltip';

export const columns = (
  tableData: Array<any>,
  pageType: string,
): ColumnDef<any>[] => [
  {
    accessorKey: 'Title',
    header: 'Supplement Title',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start text-xs text-Text-Primary">
          {row.original?.Title || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Instruction',
    header: 'Instruction',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <>
          <div
            data-tooltip-id={`tooltip-${row.original?.Sup_Id}`}
            className="overflow-hidden select-none text-xs text-Text-Quadruple"
            style={{
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {row.original?.Instruction.length > 47
              ? row.original?.Instruction.substring(0, 47) + '...'
              : row.original?.Instruction}
          </div>
          {row.original?.Instruction.length > 47 && (
            <Tooltip id={`tooltip-${row.original?.Sup_Id}`} place="top">
              {row.original?.Instruction}
            </Tooltip>
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'Dose',
    header: 'Dose',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Quadruple">
          {row.original?.Dose || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Base_Score',
    header: 'Base Score',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          <div className="px-3 py-[2px] rounded-xl bg-[#FFD8E4] flex items-center justify-center">
            <div className="text-[10px] text-Text-Primary">
              {row.original?.Base_Score}
            </div>
            <div className="text-[10px] text-Text-Quadruple">/10</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'Added on',
    header: 'Added on',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Quadruple">
          {row.original?.['Added on'].substring(0, 10) || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: '',
    header: 'Action',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center w-full gap-2">
          <img
            onClick={() => {}}
            className="cursor-pointer"
            src="/icons/eye-blue.svg"
            alt=""
          />
          <img
            onClick={() => {}}
            src="/icons/edit-blue.svg"
            alt=""
            className="cursor-pointer"
          />
          <img
            onClick={() => {}}
            src="/icons/trash-blue.svg"
            alt=""
            className="cursor-pointer"
          />
        </div>
      );
    },
  },
];
