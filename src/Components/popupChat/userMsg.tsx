/* eslint-disable @typescript-eslint/no-explicit-any */
// import {useParams} from "react-router-dom";

export const UserMsg = ({
  msg,
  info,
  time,
}: {
  msg: string;
  info: any;
  time: number;
}) => {
  // const {name } = useParams<{ name:string }>();

  return (
    <div className={'flex items-start justify-end gap-2 my-5 '}>
      <div className={'pt-2  flex flex-col items-end  '}>
        <div className={'flex items-start justify-end gap-1 '}>
          <h1 className={'text-Text-Primary TextStyle-Headline-6 '}>
            {info.name}
          </h1>
          <p className={'text-xs text-Text-Secondary'}>
            {new Date(time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
        </div>
        <div
          style={{
            backgroundColor: 'rgba(0, 95, 115, 0.25)',
          }}
          className={
            'w-fit  h-fit    p-2 px-4 text-Text-Primary TextStyle-Body-2 flex items-center  border-Gray-50 border leading-loose rounded-bl-[20px] rounded-br-[20px] rounded-tl-[20px] '
          }
        >
          <p>{msg}</p>
        </div>
      </div>
      <div className="mr-1">
        <img
          onError={(e: any) => {
            e.target.src = `https://ui-avatars.com/api/?name=${info.name}`; // Set fallback image
          }}
          className="rounded-full min-w-[30px] min-h-[30px] border border-gray-50 w-[30px] h-[30px]"
          src={info.picture}
        />
      </div>
    </div>
  );
};
