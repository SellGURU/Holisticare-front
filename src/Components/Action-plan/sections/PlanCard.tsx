import { ButtonPrimary } from "../../Button/ButtonPrimary";
import { useParams } from "react-router-dom";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
interface PlanCardProps {
  data: any;
}
const PlanCard: React.FC<PlanCardProps> = ({ data }) => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  return (
    <>
      <div className="w-[300px] h-[311px] overflow-hidden relative border-light-border-color dark:border-[#383838] border rounded-[6px] ">
        <div className="w-full flex justify-between border-light-border-color dark:border-[#383838]   text-sm text-light-primary-text  dark:text-primary-text bg-gray-200 dark:bg-black-fourth px-3 py-2 relative">
          <img
            className=" invisible dark:visible absolute inset-0 min-w-[340px] -top-1 -left-1 "
            src="./images/ActionPlan/Vector.svg"
            alt=""
          />
          <div className="w-full flex justify-between items-center pt-2 z-10 font-bold">
            {data.name}{" "}
            <img
              className="cursor-pointer"
              onClick={() => navigate(`/action-plan/edit/${id}`)}
              src="./Themes/Aurora/icons/setting-3.svg"
              alt=""
            />
          </div>
        </div>
        <div className=" bg-light-min-color dark:bg-black-secondary h-full flex flex-col px-4 pt-8">
          <div className="flex flex-col gap-2 pl-3">
            <span className="text-light-secandary-text dark:text-secondary-text text-base font-bold ">
              {data.description}
            </span>
            {data.features.map((el: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-1 font-normal text-sm text-light-secandary-text dark:text-secondary-text"
              >
                <img src="./Themes/Aurora/icons/tick-circle2.svg" alt="" />
                {el}
              </div>
            ))}
          </div>
          <div className=" mt-4 w-full text-center text-light-primary-text dark:text-primary-text text-base font-medium">
            Duration: {data.Duration}
          </div>
          <div className="mt-5 w-full flex justify-center">
            <ButtonPrimary >
              Generate Plan
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanCard;
