/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { Tooltip } from 'react-tooltip';

export const columns = (pageType: string): ColumnDef<any>[] => [
  {
    accessorKey: 'Title',
    header: 'Subject',
    enableSorting: false,
    cell: ({ row }) => {
      const uniqueKey =
        pageType === 'Supplement'
          ? row.original?.Sup_Id
          : pageType === 'Lifestyle'
          ? row.original?.Life_Id
          : row.original?.Diet_Id;

      const tooltipId = `tooltip-title-${uniqueKey}`;

      return (
        <>
          <div
            className="flex justify-start text-xs text-Text-Primary cursor-default"
            data-tooltip-id={tooltipId}
          >
            {row.original?.Title?.length > 15
              ? row.original?.Title?.substring(0, 15) + '...'
              : row.original?.Title || '-'}
          </div>
          {row.original?.Title?.length > 15 && (
            <Tooltip
              id={tooltipId}
              place="top"
              className="!bg-white !bg-opacity-100 !max-w-[250px] !opacity-100 !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
            >
              {row.original?.Title}
            </Tooltip>
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'Instruction',
    header: 'Instruction',
    enableSorting: false,
    cell: ({ row }) => {
      const uniqueKey =
        pageType === 'Supplement'
          ? row.original?.Sup_Id
          : pageType === 'Lifestyle'
          ? row.original?.Life_Id
          : row.original?.Diet_Id;

      const tooltipId = `tooltip-instruction-${uniqueKey}`;

      return (
        <>
          <div
            data-tooltip-id={tooltipId}
            className="overflow-hidden select-none text-xs text-Text-Quadruple cursor-default"
            style={{
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {row.original?.Instruction?.length > 47
              ? row.original?.Instruction?.substring(0, 47) + '...'
              : row.original?.Instruction}
          </div>
          {row.original?.Instruction?.length > 47 && (
            <Tooltip
              id={tooltipId}
              place="top"
              className="!bg-white !bg-opacity-100 !opacity-100 !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
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
      const uniqueKey =
        pageType === 'Supplement'
          ? row.original?.Sup_Id
          : pageType === 'Lifestyle'
          ? row.original?.Life_Id
          : row.original?.Diet_Id;

      const tooltipId = `tooltip-dose-${uniqueKey}`;

      return (
        <>
          <div className="text-xs text-Text-Quadruple cursor-default">
            {pageType === 'Supplement' ? (
              <div data-tooltip-id={tooltipId}>
                {row.original?.Dose?.length > 12
                  ? row.original?.Dose?.substring(0, 12) + '...'
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
          {row.original?.Dose?.length > 12 && (
            <Tooltip
              id={tooltipId}
              place="top"
              className="!bg-white !max-w-[250px] !bg-opacity-100 !opacity-100 !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
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
    header: 'Priority Weight',
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
    accessorKey: 'Clinical Guidance',
    header: 'Clinical Guidance',
    enableSorting: false,
    cell: ({ row }) => {
      const uniqueKey =
        pageType === 'Supplement'
          ? row.original?.Sup_Id
          : pageType === 'Lifestyle'
          ? row.original?.Life_Id
          : row.original?.Diet_Id;

      const tooltipId = `tooltip-clinical-${uniqueKey}`;

      return (
        <>
          <div
            data-tooltip-id={tooltipId}
            className="overflow-hidden select-none text-xs text-Text-Quadruple cursor-default"
            style={{
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {row.original?.Ai_note
              ? row.original?.Ai_note?.length > 25
                ? row.original?.Ai_note?.substring(0, 25) + '...'
                : row.original?.Ai_note
              : '-'}
          </div>
          {row.original?.Ai_note?.length > 25 && (
            <Tooltip
              id={tooltipId}
              place="top"
              className="!bg-white !bg-opacity-100 !opacity-100 !max-w-[300px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
            >
              {row.original?.Ai_note}
            </Tooltip>
          )}
        </>
      );
    },
  },
  {
    accessorKey: 'Added on',
    header: 'Added on',
    enableSorting: false,
    cell: ({ row }) => {
      const dateStr = row.original?.['Added on']?.substring(0, 10) || '-';
      let formattedDate = '-';

      if (dateStr !== '-') {
        const [year, month, day] = dateStr.split('-');
        formattedDate = `${month.padStart(2, '0')}/${day.padStart(
          2,
          '0',
        )}/${year}`;
      }

      return (
        <div className="text-xs text-Text-Quadruple">{formattedDate}</div>
      );
    },
  },
];
