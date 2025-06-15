/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { Tooltip } from 'react-tooltip';

export const columns = (pageType: string): ColumnDef<any>[] => [
  {
    accessorKey: 'Title',
    header: 'Title',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <>
          <div
            className="flex justify-start text-xs text-Text-Primary"
            data-tooltip-id={`tooltip-${row.original?.Title}`}
          >
            {row.original?.Title.length > 15
              ? row.original?.Title.substring(0, 15) + '...'
              : row.original?.Title || '-'}
          </div>
          <Tooltip
            id={`tooltip-${row.original?.Title}`}
            place="top"
            className="!bg-white !w-[376px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
          >
            {row.original?.Title}
          </Tooltip>
        </>
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
              className="!bg-white !w-[376px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
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
        <>
          <div className="text-xs text-Text-Quadruple">
            {pageType === 'Supplement' ? (
              <div data-tooltip-id={`tooltip-${row.original?.Dose}`}>
                {row.original?.Dose.length > 12
                  ? row.original?.Dose.substring(0, 12) + '...'
                  : row.original?.Dose || '-'}
              </div>
            ) : pageType === 'Lifestyle' ? (
              <div className="flex items-center justify-center">
                {row.original?.Value} {row.original?.Unit}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div>Carb: {row.original?.['Total Macros'].Carbs} gr</div>
                <div>Pr: {row.original?.['Total Macros'].Protein} gr</div>
                <div>Fat: {row.original?.['Total Macros'].Fats} gr</div>
              </div>
            )}
          </div>
          {row.original?.Dose.length > 12 && (
            <Tooltip
              id={`tooltip-${row.original?.Dose}`}
              place="top"
              className="!bg-white !w-[376px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
            >
              {row.original?.Dose}
            </Tooltip>
          )}
        </>
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
      const dateStr = row.original?.['Added on'].substring(0, 10) || '-';
      let formattedDate = '-';

      if (dateStr !== '-') {
        const [year, month, day] = dateStr.split('-');
        formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      }

      return <div className="text-xs text-Text-Quadruple">{formattedDate}</div>;
    },
  },
];
