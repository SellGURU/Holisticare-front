/* eslint-disable @typescript-eslint/no-explicit-any */

import BioMarkerRowSuggestions from '../../generateTreatmentPlan/components/BiomarkerRow';

interface OverviewProps {
  treatmentPlanData: any;
}
export const Overview: React.FC<OverviewProps> = ({ treatmentPlanData }) => {
  return (
    <>
      <div className=" w-full relative  p-4 rounded-2xl bg-white">
        {treatmentPlanData['suggestion_tab']
          .filter((el: any) => el.checked == true)
          .map((el: any, suggestionIndex: number) => {
            return (
              <>
                <div
                  className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                  key={`${el.title}-${suggestionIndex}`}
                >
                  <BioMarkerRowSuggestions
                    value={el}
                    onEdit={() => {}}
                    onchange={() => {}}
                    onDelete={() => {}}
                  ></BioMarkerRowSuggestions>
                </div>
              </>
            );
          })}
      </div>
    </>
  );
};
