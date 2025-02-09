/* eslint-disable @typescript-eslint/no-explicit-any */
import SvgIcon from '../../../utils/svgIcon';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import { Tooltip } from 'react-tooltip';
interface PlanCardProps {
  data: any;
  name: string;
  onClick: () => void;
  onEdit: () => void;
}
const PlanCard: React.FC<PlanCardProps> = ({ data, name, onEdit, onClick }) => {
  return (
    <>
      <div className="w-[344px] lg:w-[292px] h-fit min-h-[208px] lg:min-h-[311px] bg-white relative border shadow-200 rounded-[20px] lg:rounded-[40px]">
        <div className="w-full flex justify-between items-center TextStyle-Headline-4 text-Primary-DeepTeal px-4 py-3 border-b border-Gray-50 mt-1 lg:mt-0">
          {/* <img
            className=" invisible dark:visible absolute inset-0 min-w-[340px] -top-1 -left-1 "
            src="./images/ActionPlan/Vector.svg"
            alt=""
          /> */}
          <div>{name}</div>{' '}
          <div className="flex lg:hidden self-end TextStyle-Body-3 text-center gap-1 px-2.5 py-1 rounded-full bg-Secondary-SelverGray text-Primary-DeepTeal">
            <img src="/icons/timer.svg" alt="" />
            Duration: {data.duration}
          </div>
          <img
            className="cursor-pointer hidden lg:block"
            onClick={() => onEdit()}
            src="/icons/setting-3.svg"
            alt=""
          />
        </div>
        <div className="bg-light-min-color dark:bg-black-secondary h-full flex flex-col px-2 pt-4">
          <div className="flex flex-col gap-3 pl-3">
            <span className="TextStyle-Headline-6 text-Text-Primary">
              {data.description}
            </span>
            <div className="h-[48px] lg:h-[100px] overflow-y-auto overflow-x-hidden grid gap-1">
              {data.interventions
                .filter((val: any) => val.selected == true)
                .map((el: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-Text-Primary TextStyle-Body-2 pr-[6px]"
                  >
                    <img src="/icons/tick-circle.svg" alt="" />
                    <div
                      data-tooltip-id={`tooltip-${i}`}
                      className="overflow-hidden select-none"
                      style={{
                        textWrap: 'nowrap',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {el.name.length > 35
                        ? el.name.substring(0, 35) + '...'
                        : el.name}
                    </div>
                    {el.name.length > 35 && (
                      <Tooltip id={`tooltip-${i}`} place="top">
                        {el.name}
                      </Tooltip>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="hidden lg:flex self-end mt-6 TextStyle-Body-3 text-center gap-1 px-2.5 py-1 rounded-full bg-Secondary-SelverGray text-Primary-DeepTeal">
            <img src="/icons/timer.svg" alt="" />
            Duration: {data.duration}
          </div>
          <div className="w-full flex justify-center mt-3 lg:mt-2">
            <ButtonSecondary
              onClick={() => onEdit()}
              style={{ width: '100%', borderRadius: '20px', cursor: 'pointer' }}
              ClassName="bg-backgroundColor-Card !border-Primary-EmeraldGreen !text-Primary-EmeraldGreen mr-1"
            >
              {' '}
              <SvgIcon src="/icons/setting-3.svg" color="#6CC24A" /> Set Orders
            </ButtonSecondary>
            <ButtonSecondary
              onClick={onClick}
              style={{ width: '100%', borderRadius: '20px' }}
              ClassName="ml-1"
            >
              {' '}
              <img src="/icons/tick-square.svg" alt="" /> Select Method
            </ButtonSecondary>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanCard;
