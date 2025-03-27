/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { Tooltip } from 'react-tooltip';

export const columns = (pageType: string): ColumnDef<any>[] => [
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
            data-tooltip-id={`tooltip-${pageType === 'Supplement' ? row.original?.Sup_Id : pageType === 'Lifestyle' ? row.original?.Life_Id : row.original?.Diet_Id}`}
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
            <Tooltip
              id={`tooltip-${pageType === 'Supplement' ? row.original?.Sup_Id : pageType === 'Lifestyle' ? row.original?.Life_Id : row.original?.Diet_Id}`}
              place="top"
              className="!bg-white !w-[376px] !leading-5 !text-wrap !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-[99999]"
            >
              {row.original?.Instruction}
            </Tooltip>
          )}
        </>
      );
    },
  },
  {
    accessorKey:
      pageType === 'Supplement'
        ? 'Dose'
        : pageType === 'Lifestyle'
          ? 'Value'
          : 'Macros Goal',
    header:
      pageType === 'Supplement'
        ? 'Dose'
        : pageType === 'Lifestyle'
          ? 'Value'
          : 'Macros Goal',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Quadruple">
          {pageType === 'Supplement' ? (
            row.original?.Dose || '-'
          ) : pageType === 'Lifestyle' ? (
            row.original?.Value
          ) : (
            <div className="flex items-center justify-center gap-4">
              <div>Carb: {row.original?.['Total Macros'].Carbs} gr</div>
              <div>Pr: {row.original?.['Total Macros'].Protein} gr</div>
              <div>Fat: {row.original?.['Total Macros'].Fats} gr</div>
            </div>
          )}
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
];
