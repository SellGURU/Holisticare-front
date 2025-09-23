interface HolisticPlanExpectedBenefitsProps {
  value: string[];
}
const HolisticPlanExpectedBenefits: React.FC<
  HolisticPlanExpectedBenefitsProps
> = ({ value }) => {
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
        <img src="/icons/medal-star.svg" alt="" className="ml-[-2px]" />
        Expected Benefits
      </div>
      <div
        className="flex flex-col pt-1.5 pl-4"
        style={{ backgroundColor: '#FDFDFD' }}
      >
        {value?.map((el: string) => {
          return (
            <div
              style={{
                color: '#888888',
                fontSize: '0.75rem',
                lineHeight: '1.25rem',
              }}
            >
              <span style={{ color: '#38383899' }}>•</span> {el}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default HolisticPlanExpectedBenefits;
