export const BotMsg = ({
  msg,
  time,
  name,
}: {
  msg: string;
  time?: string;
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
    <div className={'flex items-start justify-start gap-1'}>
      <div>
        <img
          className="rounded-full w-[30px] h-[30px]"
          src={`https://ui-avatars.com/api/?name=${name}`}
          alt=""
        />
      </div>
      <div className={'pt-1'}>
        <div className={'flex items-start gap-1'}>
          <h1 className={'text-Text-Primary TextStyle-Headline-6 '}>{name}</h1>
          <p className={'text-xs text-Text-Quadruple'}>{time}</p>
        </div>
        <div className="max-w-[232px] bg-backgroundColor-Main border border-Gray-50 px-4 py-2 text-justify mt-1 text-Text-Primary text-xs rounded-bl-[20px] rounded-br-[20px] rounded-tr-[20px]">
          {formatText(msg)}
        </div>
      </div>
    </div>
  );
};
