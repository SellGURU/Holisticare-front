/* eslint-disable @typescript-eslint/no-explicit-any */

import BioMarkerRowSuggestions from '../../generateTreatmentPlan/components/BiomarkerRow';
type CategoryState = {
  name: string;
  visible: boolean;
};

interface OverviewProps {
  treatmentPlanData: any;
  suggestionsChecked: Array<any>;
  visibleCategoriy: CategoryState[];
}
export const Overview: React.FC<OverviewProps> = ({
  visibleCategoriy,
  treatmentPlanData,
  suggestionsChecked,
}) => {
  const getAllCheckedCategories = () => {
    const checkedCategories: string[] = [];
    suggestionsChecked.forEach((el: any) => {
      if (el.checked) {
        checkedCategories.push(el.Category);
      }
    });
    return checkedCategories;
  };
  console.log(getAllCheckedCategories());
  return (
    <>
      <div className=" w-full relative  p-4 rounded-2xl bg-white">
        {suggestionsChecked.map((el: any, suggestionIndex: number) => {
          return (
            <>
              <div
                className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                key={`${el.title}-${suggestionIndex}`}
              >
                <BioMarkerRowSuggestions
                  isOverview
                  value={el}
                  onEdit={() => {}}
                  onchange={() => {}}
                  onDelete={() => {}}
                ></BioMarkerRowSuggestions>
              </div>
            </>
          );
        })}
        {treatmentPlanData['suggestion_tab']
          .filter(
            (el: any) =>
              el.checked == true &&
              !getAllCheckedCategories().includes(el.Category) &&
              visibleCategoriy
                .filter((el) => el.visible)
                .map((el) => el.name)
                .includes(el.Category),
          )
          .map((el: any, suggestionIndex: number) => {
            return (
              <>
                <div
                  className="w-full lg:px-6 lg:py-4 lg:bg-backgroundColor-Card lg:rounded-[16px] lg:border lg:border-Gray-50 mt-4"
                  key={`${el.title}-${suggestionIndex}`}
                >
                  <BioMarkerRowSuggestions
                    isOverview
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
