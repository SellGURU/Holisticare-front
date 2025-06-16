/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionPlanHeadBoxProps {
  ActionPlan: any;
}

const ActionPlanHeadBox: React.FC<ActionPlanHeadBoxProps> = ({
  ActionPlan,
}) => {
  return (
    <>
      <div
        className="w-full relative mb-4 mt-4"
        style={{
          borderRadius: '12px',
          zIndex: 60,
          background: 'linear-gradient(88.52deg, #005F73 3%, #6CC24A 140.48%)',
          padding: '1px',
        }}
      >
        <div
          style={{
            borderRadius: '11px',
            background: '#FFFFFF',
            width: '100%',
          }}
          className="py-2 px-4"
        >
          <div className="text-sm mb-2" style={{ color: '#005F73' }}>
            {ActionPlan[ActionPlan.length - 1]?.title}
          </div>
          <div className="text-xs" style={{ color: '#383838' }}>
            {ActionPlan[ActionPlan.length - 1]?.description}
          </div>
          <div className="flex justify-between items-center">
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <div style={{ color: '#383838', fontSize: '12px' }}>
                  Progress
                </div>
                <div style={{ color: '#005F73', fontSize: '12px' }}>
                  {ActionPlan[ActionPlan?.length - 1]?.progress
                    ? ActionPlan[ActionPlan?.length - 1]?.progress + '%'
                    : '0%'}
                </div>
              </div>
              <div>
                <div
                  className="relative"
                  style={{
                    width: '250px',
                    height: '8px',
                    borderRadius: '12px',
                    background: '#E5E5E5',
                  }}
                >
                  <div
                    className="absolute left-0  "
                    style={{
                      height: '6px',
                      backgroundColor: '#6CC24A',
                      borderRadius: '12px',
                      width: ActionPlan[ActionPlan.length - 1]?.progress
                        ? ActionPlan[ActionPlan.length - 1]?.progress + '%'
                        : '0%',
                    }}
                  ></div>
                </div>
              </div>
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
                {ActionPlan[ActionPlan.length - 1]?.state}
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
                  {ActionPlan[ActionPlan.length - 1]?.to_date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActionPlanHeadBox;
