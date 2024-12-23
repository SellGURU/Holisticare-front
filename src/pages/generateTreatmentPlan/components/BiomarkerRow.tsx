import {  useState} from "react";
import RefrenceModal from "./RefrenceData";
/* eslint-disable @typescript-eslint/no-explicit-any */
interface BioMarkerRowSuggestionsProps {
  value: any;
}
const BioMarkerRowSuggestions: React.FC<BioMarkerRowSuggestionsProps> = ({
  value,
}) => {

  const resolveIcon = () => {
    if (value.pillar_name== "Diet") {
      return "./images/report/treatment/apple.svg";
    }
    if (value.pillar_name == "Mind") {
      return "./images/report/treatment/mental-disorder.svg";
    }
    if (value.pillar_name == "Activity") {
      return "./images/report/treatment/weight.svg";
    }
    if (value.pillar_name== "Supplement") {
      return "./images/report/treatment/pil.svg";
    }
  };
const [showModal, setshowModal] = useState(false)
const [editableValue, setEditableValue] = useState(value.note);

  return (
    <>
      <div className="w-full flex justify-center items-center gap-4">
        <div className="w-[60px]">
          <div className="w-full flex justify-center">
            <div className="w-[32px] flex justify-center items-center h-[32px] bg-[#333333] rounded-[8px]">
              <img className="w-[24px]" src={resolveIcon()} alt="" />
            </div>
          </div>
          <div className=" text-light-primary-text dark:text-[#FFFFFFDE] mt-1 tet-[10px] font-[500] text-center text-[10px]">
            {value.pillar_name}
          </div>
        </div>
        <div className="w-full  bg-light-min-color dark:bg-[#1E1E1E] px-4 py-2 flex justify-start text-light-primary-text dark:text-[#FFFFFFDE] items-center border border-light-border-color dark:border-[#383838] rounded-[6px] ">
          <div className="text-[12px]  gap-2 w-full   ">
            {/* {value[Object.keys(value)[0]]}  */}
            <textarea
              value={editableValue}
              onChange={(e) => setEditableValue(e.target.value)}
              className="bg-transparent text-[12px] outline-none w-full resize-none   "
              rows={2}
          
            />
            {value.reference && (
              <div onClick={()=>setshowModal(true)} className=" text-light-secandary-text dark:text-secondary-text text-xs inline-flex ml-1">
                Based on your:{" "}
                <span className="dark:text-brand-primary-color text-light-blue-active flex items-center gap-2 cursor-pointer">
                  TelomerAge{" "}
                  <img src="./Themes/Aurora/icons/export.svg" alt="" />
                </span>
              </div>
            )}

            {/* {value[Object.keys(value)[1]] &&
                             <div className="text-primary-color">TelomerAge</div>
                        } */}
          </div>
        </div>
      </div>
      {showModal && <RefrenceModal
          reference={value.reference}
          isOpen={showModal}
          onClose={() => setshowModal(false)}
        />}
    </>
  );
};

export default BioMarkerRowSuggestions;
