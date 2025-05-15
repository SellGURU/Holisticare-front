import { MoonLoader } from 'react-spinners';

export const UserMsg = ({
  msg,
  time,
  isSending,
  name,
}: {
  msg: string;
  time?: string;
  isSending?: boolean;
  name: string;
}) => {
  const formatText = (text: string) => {
    const boldedText = text.replace(
      /\*(.*?)\*/g,
      (_match, p1) => `<strong>${p1}</strong>`,
    );

    const lines = boldedText.split('\n');

    return lines.map((line, index) => (
      <span key={index}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        <br />
      </span>
    ));
  };
  return (
    <div className={'flex items-start justify-end gap-2 my-5'}>
      <div className={'pt-1  flex flex-col items-end'}>
        <div className={'flex items-center justify-end gap-1'}>
          <p className="text-xs text-Text-Quadruple">{time}</p>
          <h1 className={'text-Text-Primary TextStyle-Headline-6'}>{name}</h1>
        </div>
        <div className="flex items-end">
          {isSending && (
            <span>
              <MoonLoader color="#383838" size={12} />
            </span>
          )}
          <div className="max-w-[232px] bg-[#005F7340] border border-Gray-50 px-4 py-2 text-justify mt-1 text-Text-Primary text-xs rounded-[20px] rounded-tr-none">
            {formatText(msg)}
          </div>
        </div>
      </div>
      <div className="mr-1 w-[32px] h-[32px]">
        <img
          className="rounded-full w-[30px] h-[30px]"
          src={`https://ui-avatars.com/api/?name=${name}`}
          alt=""
        />
      </div>
    </div>
  );
};
