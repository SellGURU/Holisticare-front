/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
// import Badge from '../badge';
// import { PiChatBold } from "react-icons/pi";
// import { useSelector } from "react-redux";
// import { Application } from "@/api";
// import { publish } from '../../utils/event';
// import CircularProgressBar from '../charts/CircularProgressBar';

export const columns = (
  classData: Array<any>,
  setReportsFiltered: (data: any) => void,
): ColumnDef<any>[] => [
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
    accessorKey: 'name',
    header: 'Client name',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">{row.original?.name}</div>
      );
    },
  },
  {
    accessorKey: 'reportWriter',
    header: 'Report Writer',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.reportWriter || '-'}
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
        <div className="text-xs text-Text-Secondary ">
          {row.original?.id || '-'}
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
        <div className="text-xs text-Text-Secondary ">
          {row.original?.gender || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'testResults',
    header: 'Test & results',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary flex items-center justify-center">
          {row.original?.testResults ? (
            <>
              <img
                src="/icons/tick-circle-background.svg"
                alt=""
                className="pr-3"
              />
              Check Results
            </>
          ) : (
            <>
              <img
                src="/icons/close-circle-background.svg"
                alt=""
                className="pl-3.5 pr-3"
              />
              Add Prescription
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'dateOfReport',
    header: 'Date of report',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original.dateOfReport || 'NO Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'enrollDate',
    header: 'Enroll Date',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original.enrollDate || 'NO Data'}
        </div>
      );
    },
  },
  {
    accessorKey: '',
    header: 'Action',
    enableSorting: false,
    cell: ({ row }) => {
      const handleDelete = (No: number) => {
        setReportsFiltered(classData.filter((item) => item.No !== No));
      };
      return (
        <div className="flex justify-center w-full gap-2">
          <img
            onClick={() => {}}
            src="/icons/edit-blue.svg"
            alt=""
            className="cursor-pointer"
          />
          <img
            onClick={() => {}}
            className="cursor-pointer"
            src="/icons/eye-blue.svg"
            alt=""
          />
          <img
            onClick={() => {
              handleDelete(row.original.No);
            }}
            src="/icons/trash-blue.svg"
            alt=""
            className="cursor-pointer"
          />
        </div>
      );
    },
  },
];
