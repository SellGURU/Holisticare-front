interface HolisticPlanGuidelinesProps {
  value: string;
}
const HolisticPlanGuidelines: React.FC<HolisticPlanGuidelinesProps> = ({
  value,
}) => {
  return (
    <>
      <div
        className="flex items-center gap-1 pt-1.5 pl-3"
        style={{
          color: '#005f73',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          backgroundColor: '#FDFDFD',
        }}
      >
        <img src="/icons/lamp-on-new.svg" alt="" className="ml-[-2px]" />
        Guidelines
      </div>
      <div
        style={{
          color: '#888888',
          fontSize: '0.75rem',
          lineHeight: '1.25rem',
          backgroundColor: '#FDFDFD',
        }}
        className="pt-1.5 pl-3"
      >
        {value}
      </div>
    </>
  );
};

export default HolisticPlanGuidelines;
