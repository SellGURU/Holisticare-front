/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import Badge from '../badge';
// import { PiChatBold } from "react-icons/pi";
// import { useSelector } from "react-redux";
// import { Application } from "@/api";
import { publish } from '../../utils/event';
import { Tooltip } from 'react-tooltip';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
// import SvgIcon from '../../utils/svgIcon';
// import CircularProgressBar from '../charts/CircularProgressBar';

export const columns = (dataLength: number): ColumnDef<any>[] => [
  {
    accessorKey: 'name',
    header: () => `Client Name (${dataLength})`,
    enableSorting: false,

    cell: ({ row }) => {
      console.log(row.original);

      return (
        <div className="w-[150px]">
          <Link
            to={`/report/${row.original.member_id}/${row.original.name}`}
            className={'w-fit'}
          >
            <div className="flex items-center justify-start gap-1 min-w-[120px]">
              <img
                className="2xl:w-10 2xl:h-10 w-7 h-7  border rounded-full"
                src={
                  row.original?.picture != ''
                    ? row.original?.picture
                    : `https://ui-avatars.com/api/?name=${row.original.name}`
                }
                alt={`${row.original?.name} image`}
              />
              <div
                data-tooltip-id={row.original?.name}
                className="font-meidum text-[10px] 2xl:text-xs   text-Text-Primary text-nowrap flex items-center gap-3"
              >
                <div className="truncate  max-w-[120px]">
                  <TooltipTextAuto maxWidth="120px">
                    {row.original?.name || 'No Data'}
                  </TooltipTextAuto>
                </div>
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
    enableSorting: true,
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
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original.enroll_date || 'NO Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'last_checkin',
    header: 'Checked on',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original.last_checkin != 'No Data'
            ? row.original.last_checkin
            : '-'}
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
      return (
        <div className="items-center justify-center text-xs text-Text-Secondary capitalize flex">
          <Badge status={row.original.status || 'needs check'}>
            {row.original.status || 'No Data'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'Assigned',
    header: 'Assigned',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original.assigned_to[0] || 'No Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Check-in',
    header: 'Check-in',
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="text-xs text-Text-Secondary ">
          {row.original['Check-in'] || 'NO Data'}
        </div>
      );
    },
  },
  {
    accessorKey: 'Questionnaire',
    header: 'Questionnaire',
    enableSorting: false,
    cell: ({ row }) => {
      const questionnaire = row.original['Questionary'] || 'NO Data';
      return (
        <div
          data-tooltip-id={questionnaire}
          className="text-xs text-Text-Secondary text-center"
        >
          {questionnaire.length > 40
            ? questionnaire.substring(0, 40) + '...'
            : questionnaire}
          {questionnaire.length > 40 && (
            <Tooltip
              place="top"
              id={questionnaire}
              className="!bg-white !w-fit !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
            >
              {questionnaire}
            </Tooltip>
          )}
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
      // const handleInvitation = (type: string) => {
      //   publish(`send${type}`, {
      //     id: row.original.member_id,
      //     name: row.original.name,
      //     email: row.original.email,
      //   });
      // };
      return (
        <div className="flex justify-center w-full gap-2">
          {/* <img
            onClick={() => handleInvitation('Email')}
            src="/icons/sms-tracking.svg"
            alt=""
            className="cursor-pointer"
          /> */}
          {/* <div onClick={() => {}}>
            <SvgIcon src="/icons/client-card/more.svg" color="#005F73" />
          </div> */}

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
