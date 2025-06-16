/* eslint-disable @typescript-eslint/no-explicit-any */
interface HolisticPlanHeaderProps {
  helthPlan: any;
}

const HolisticPlanHeader: React.FC<HolisticPlanHeaderProps> = ({
  helthPlan,
}) => {
  return (
    <>
      {helthPlan && (
        <div
          style={{
            borderRadius: '11px',
            background: '#FFFFFF',
            width: '100%',
          }}
          className="py-2 px-4 flex justify-between items-center"
        >
          <div className="text-sm" style={{ color: '#005F73' }}>
            {helthPlan[helthPlan.length - 1]?.t_title}
          </div>
          <div className="flex justify-end items-center">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#4C88FF' }}
            ></div>
            <div
              className="ml-1"
              style={{ fontSize: '12px', color: '#383838' }}
            >
              {helthPlan[helthPlan.length - 1]?.state}
            </div>
            <div
              style={{
                backgroundColor: '#E5E5E5',
                marginLeft: '24px',
                padding: '2.5px 12px',
                borderRadius: '12px',
              }}
            >
              <div
                className="flex justify-center gap-1 items-center"
                style={{ fontSize: '12px', color: '#005F73' }}
              >
                <img src="/icons/timerprint.svg" alt="" />
                {helthPlan[helthPlan.length - 1]?.formatted_date}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HolisticPlanHeader;
