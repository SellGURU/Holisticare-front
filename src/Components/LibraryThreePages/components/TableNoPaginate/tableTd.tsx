/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
// import { Tooltip } from 'react-tooltip';
import EllipsedTooltip from './ElipsedTooltip';

export const columns = (pageType: string): ColumnDef<any>[] => [
  {
    accessorKey: 'Title',
    header: 'Subject',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <>
          <div
            className="flex justify-start text-xs text-Text-Primary cursor-default"
          >
              <EllipsedTooltip text={row.original?.Title || '-'} />
          </div>
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
            className="overflow-hidden select-none text-xs text-Text-Quadruple cursor-default"
            style={{
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <EllipsedTooltip text={row.original?.Instruction || '-'} />
          </div>
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
          <div className="text-xs text-Text-Quadruple cursor-default">
            {pageType === 'Supplement' ? (

              <EllipsedTooltip text={row.original?.Dose || '-'} />
            ) : pageType === 'Lifestyle' ? (
              <div className="flex items-center justify-center">
               <EllipsedTooltip text={row.original?.Value +" "+ (row.original?.Unit || '')} />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <EllipsedTooltip text={
                  'Carb: '+row.original?.['Total Macros'].Carbs +" gr" + ", "+
                  'Pr:'+row.original?.['Total Macros'].Protein +" gr" + ",  "+
                  'Fat:'+row.original?.['Total Macros'].Fats +" gr"
                  } />
                {/* <div>Carb: {row.original?.['Total Macros'].Carbs} gr</div>
                <div>Pr: {row.original?.['Total Macros'].Protein} gr</div>
                <div>Fat: {row.original?.['Total Macros'].Fats} gr</div> */}
              </div>
            )}
          </div>
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

      return (
        <>
          <div
            // data-tooltip-id={tooltipId}
            className="overflow-hidden select-none text-xs text-Text-Quadruple cursor-default"
            style={{
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
              <EllipsedTooltip text={row.original?.Ai_note || '-'} />
          </div>
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

      return <div className="text-xs text-Text-Quadruple">{formattedDate}</div>;
    },
  },
];
