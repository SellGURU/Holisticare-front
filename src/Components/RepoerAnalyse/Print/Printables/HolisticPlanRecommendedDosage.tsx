interface HolisticPlanRecommendedDosageProps {
  value: string;
}
const HolisticPlanRecommendedDosage: React.FC<
  HolisticPlanRecommendedDosageProps
> = ({ value }) => {
  return (
    <>
      {value?.length > 0 && (
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
            <img src="/icons/ruler-new.svg" alt="" className="ml-[-2px]" />
            Recommended Dosage
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
      )}
    </>
  );
};

export default HolisticPlanRecommendedDosage;
