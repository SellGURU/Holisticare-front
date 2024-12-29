/* eslint-disable @typescript-eslint/no-explicit-any */
import Tag from "../../../Components/Tag";
interface BioMarkerBoxProps {
  data: any;
  onCheck: () => void;
  onClick: () => void;
  isActive?: boolean;
}

const BioMarkerBox: React.FC<BioMarkerBoxProps> = ({
  data,
  onCheck,
  onClick,
  isActive,
}) => {
  const resolveTitle = () => {
    if (data.category.length > 30) {
      return data.category.substring(0, 30) + " ...";
    } else {
      return data.category;
    }
  };

  const resolveIcon = (name: string) => {
    if (name == "Cardiovascular and Respiratory Health") {
      return "/icons/biomarkers/heart.svg";
    }
    if (name == "Organ Health and Function") {
      return "/icons/biomarkers/Abdominal.svg";
    }
    if (name == "Urinary Health") {
      return "/icons/biomarkers/Urine.svg";
    }
    if (name == "Metabolic and Nutritional Health") {
      return "/icons/biomarkers/metabolism.svg";
    }
    if (name == "Immune, Inflammation, and Hormonal Health") {
      return "/icons/biomarkers/Inflammation.svg";
    }
    // ./images/report/intestine.svg"
    // ./images/report/muscle.svg
    // ./images/report/virus.svg
    return "/icons/biomarkers/heart.svg";
  };
  return (
    <>
      <div className="flex justify-start items-center gap-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.checked}
            onClick={() => {
              onCheck();
            }}
            className="hidden"
          />
          <div
            className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
              data.checked ? "bg-Primary-DeepTeal" : "bg-white"
            }`}
          >
            {data.checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </label>
        {/* <input onClick={() => {
                    onCheck()
                }} checked={data.checked} type="checkbox"  className="mr-2 peer shrink-0 appearance-none w-6 h-6 rounded-md bg-light-input-color dark:bg-black-primary border border-light-border-color dark:border-main-border checked:dark:bg-brand-secondary-color checked:bg-light-blue-active checked:border-transparent checked:text-black checked:before:content-['✔'] checked:before:text-black checked:before:block checked:before:text-center" />                                 */}
        <div
          onClick={() => {
            onClick();
          }}
          className={` ${
            isActive
              ? "border-Primary-EmeraldGreen"
              : " border-Gray-50"
          }  bg-backgroundColor-Card w-[360px] cursor-pointer flex justify-start  gap-2 items-center p-[12px] h-[64px] rounded-[16px] border `}
        >
          <div className="w-10 h-10 rounded-full flex justify-center items-center border-2 border-Primary-DeepTeal">
            <img
              className=""
              src={resolveIcon(data.category)}
              alt=""
            />
          </div>
          <div>
            <div className="flex">
              <div className="text-xs text-Text-Primary">{resolveTitle()}</div>
              {data.tags.length > 0 && (
                <div className="ml-8">
                  <Tag value={data.tags[0]}></Tag> 
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className=" text-Text-Secondary text-[10px]">
                <span className="text-[12px] text-Text-Primary">
                  {data.num_biomarkers}
                </span>{" "}
                Total Biomarkers{" "}
                <span className="ml-2 text-[12px] text-Text-Primary">
                  {data.needs_focus_count}
                </span>{" "}
                Needs Focus
              </div>
              {data.tags.length > 1 && (
                <div className="ml-8">
                  <Tag value={data.tags[1]}></Tag>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BioMarkerBox;
