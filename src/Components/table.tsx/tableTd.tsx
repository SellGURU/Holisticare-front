/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Badge from '../badge';
// import { PiChatBold } from "react-icons/pi";
// import { useSelector } from "react-redux";
// import { Application } from "@/api";
import { publish } from '../../utils/event';
// import CircularProgressBar from '../charts/CircularProgressBar';

export const columns = (dataLength: number): ColumnDef<any>[] => [
  {
    accessorKey: 'name',
    header: () => `Client Name (${dataLength})`,
    enableSorting: false,

    cell: ({ row }) => {
      console.log(row);

      return (
        <div className="w-[15vw]">
          <Link
            to={`/report/${row.original.member_id}/${row.original.name}`}
            className={'w-fit'}
          >
            <div className="flex items-center justify-start gap-2 ">
              <img
                className="w-10 h-10 border rounded-full"
                src={
                  row.original?.picture != ''
                    ? row.original?.picture
                    : `https://ui-avatars.com/api/?name=${row.original.name}`
                }
                alt={`${row.original?.name} image`}
              />
              <div className="font-meidum text-xs text-Text-Primary text-nowrap flex items-center gap-3">
                {row.original?.name || 'No Data'}
                <FiExternalLink />
              </div>
            </div>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'member_id',
    header: 'Member ID',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center text-xs text-Text-Secondary ">
          {row.original?.member_id || 'No Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'age',
    header: 'Age',
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.age || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'sex',
    header: 'Gender',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original?.sex || 'No Data'}
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'weight',
  //   header: 'Weight',
  //   enableSorting: false,

  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center justify-center">
  //         {row.original?.weight || 'No Data'}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: 'height',
  //   enableSorting: false,

  //   header: 'Height',
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center justify-center">
  //         {row.original?.height || 'No Data'}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: 'enroll_date',
    header: 'Enroll Date',
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original.enroll_date || 'NO Data'}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "information.last_followup",
  //   header: "Last Follow-Up",
  // },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,

    cell: ({ row }) => {
      console.log(row);

      return (
        <div className="items-center justify-center text-xs text-Text-Secondary   flex ">
          <Badge status={row.original.status || 'at-risk'}>
            {row.original.status || 'No Data'}
          </Badge>
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'score',
  //   header: 'Score',
  //   enableSorting: false,

  //   cell: ({ row }) => {
  //     return (
  //       <div className="text-Text-Primary ">
  //         {row.original.score} <span className="text-Text-Secondary">/10</span>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: 'information.progress',
  //   header: 'Progress',
  //   enableSorting: false,

  //   cell: ({ row }) => {
  //     return (
  //       <div>
  //         <CircularProgressBar
  //           percentage={row.original?.progress}
  //         ></CircularProgressBar>{' '}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "information.heart_rate",
  //   header: "Heart Rate",
  // },
  // {
  //   accessorKey : 'information.heart_rate',
  //   header: "Heart Rate",
  //   cell: ({ row }) => {
  //     console.log(row.original.getBiomarkers());

  //     const biomarker = row.original.getBiomarkers().find((bio: any) => Object.keys(bio)[0] === "Heart Rate");
  //     console.log(biomarker);

  //     let value = "N/A";
  //     if (biomarker) {
  //       const nestedValue = Object.values(biomarker)[0].value;
  //       value = typeof nestedValue === "object" ? nestedValue.value?.value ?? "N/A" : nestedValue;
  //     }
  //     return <div className="flex items-center justify-center">{value}</div>;
  //   },
  // },

  // {
  //   accessorKey: "information.blood_pressure",
  //   header: "Blood Pressure",
  // },
  // {
  //   accessorKey: "information.temperatue",
  //   header: "Temperature",
  // },
  // {
  //   accessorKey: "information.blood_oxygen",
  //   header: "Blood Oxygen",
  // },

  // {
  //   accessorKey: "infomation.respiration_rate",
  //   header: "respiration",
  //   filterFn: "includesString",
  //   cell: ({ row }) => {
  //     return (
  //       <Badge
  //         theme={Theme()}
  //         status={resolveRespiration(row.original.information.respiration_rate)}
  //       >
  //         {row.original.information.respiration_rate}
  //       </Badge>
  //     );
  //   },
  // },

  {
    accessorKey: '',
    header: 'Action',
    enableSorting: false,
    cell: ({ row }) => {
      const handleInvitation = (type: string) => {
        publish(`send${type}`, {
          id: row.original.member_id,
          name: row.original.name,
          email: row.original.email,
        });
      };
      return (
        <div className="flex justify-center w-full gap-2">
          <img
            onClick={() => handleInvitation('Email')}
            src="/icons/sms-tracking.svg"
            alt=""
            className="cursor-pointer"
          />
          <img
            onClick={() => {
              publish('confirmDelete', {
                id: row.original.member_id,
                name: row.original.name,
              });
              // const status = confirm("delete this member?")
              // if(status){
              //   Application.deleteClinic({
              //     member_id:row.original.information.member_id
              //   })
              // }
              // console.log(row.original.information.member_id)
            }}
            className="cursor-pointer"
            src="/icons/delete-green.svg"
            alt=""
          />
        </div>
      );
    },
  },
];
