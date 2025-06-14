export const BotMsg = ({ msg, time }: { msg: string; time: number }) => {
  return (
    <div className={'flex items-start justify-start gap-1'}>
      <div>
        <img
          className="rounded-full w-[30px] h-[30px]"
          src={'/images/chat/Float Button.svg'}
        />
      </div>
      <div className={'pt-2'}>
        <div className={'flex items-start gap-1'}>
          <h1 className={'text-Text-Primary TextStyle-Headline-6 '}>
            AI Copilot
          </h1>
          <p className={'text-xs text-Text-Secondary'}>
            {new Date(time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
          {/* <p className={"TextStyle-Body-2 text-Text-Primary"}>11:46</p> */}
        </div>
        <div
          className={
            'w-[213px] h-fit  p-2 text-Text-Primary TextStyle-Body-2 bg-backgroundColor-Main border-Gray-50 border leading-loose rounded-bl-[20px] rounded-br-[20px] rounded-tr-[20px] '
          }
        >
          <p>{msg}</p>
        </div>
      </div>
    </div>
  );
};
