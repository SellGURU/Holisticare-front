import { useParams } from "react-router-dom";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { ButtonSecondary } from "../../Button/ButtosSecondary";
interface PlanCardProps {
  data: any;
  name:string
  onClick: ()=>void,
}
const PlanCard: React.FC<PlanCardProps> = ({ data,name ,onClick}) => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  return (
    <>
      <div className="w-[292px] h-fit min-h-[311px] bg-white   relative border border-Gray-200 shadow-200 rounded-[28px]  ">
        <div className="w-full flex justify-between   items-center   TextStyle-Headline-4 text-Primary-DeepTeal px-4  py-3   border-b border-Gray-50">
          {/* <img
            className=" invisible dark:visible absolute inset-0 min-w-[340px] -top-1 -left-1 "
            src="./images/ActionPlan/Vector.svg"
            alt=""
          /> */}
          <div>{name}</div>{" "}
          <img
            className="cursor-pointer"
            onClick={() => navigate(`/action-plan/orders/${id}`)}
            src="/icons/setting-3.svg"
            alt=""
          />
        </div>
        <div className=" bg-light-min-color dark:bg-black-secondary h-full flex flex-col  px-2 pt-4">
          <div className="flex flex-col gap-3 pl-3">
            <span className="TextStyle-Headline-6 text-Text-Primary ">
              Create Your AI Twin
            </span>
            <div className="h-[100px] overflow-y-auto grid gap-1">
              {data.interventions.filter((val:any) =>val.selected == true).map((el: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-Text-Primary TextStyle-Body-2  "
                >
                  <img src="/icons/tick-circle.svg" alt="" />
                  <div className="overflow-hidden" style={{textWrap:'nowrap',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                    {el.name}

                  </div>
                </div>
              ))}

            </div>
          </div>
          <div className=" self-end mt-6 TextStyle-Body-3 text-center flex gap-1 px-2.5 py-1 rounded-full bg-Secondary-SelverGray text-Primary-DeepTeal ">
            <img src="/icons/timer.svg" alt="" />
            Duration: {data.duration}
          </div>
          <div className=" mt-2 w-full   flex justify-center ">
            <ButtonSecondary onClick={onClick} style={{width:'100%'}}> <img src="/icons/tick-square.svg" alt="" /> Select Method</ButtonSecondary>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanCard;
