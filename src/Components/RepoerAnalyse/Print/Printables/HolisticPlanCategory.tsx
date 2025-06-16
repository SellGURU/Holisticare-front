/* eslint-disable @typescript-eslint/no-explicit-any */
interface HolisticPlanCategoryProps {
  el: any;
}

const resolveTreatmentPlanIcon = (category: string) => {
  if (category == 'Diet') {
    return '/icons/TreatmentPlan/IconApple.svg';
  }
  if (category == 'Activity') {
    return '/icons/TreatmentPlan/IconActivity.svg';
  }
  if (category == 'Supplement') {
    return '/icons/TreatmentPlan/IconSupplement.svg';
  }
  if (category == 'Mind') {
    return '/icons/TreatmentPlan/Iconmind.svg';
  }
  return '/icons/TreatmentPlan/IconApple.svg';
};
const HolisticPlanCategory: React.FC<HolisticPlanCategoryProps> = ({ el }) => {
  return (
    <>
      <div
        className="text-sm flex bg-white text-center rounded-md w-full justify-center items-center gap-1"
        style={{
          width: '193px',
          borderRadius: '8px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
          color: '#005F73',
        }}
      >
        <div className="w-8 h-8  flex justify-center items-center rounded-[8px]">
          <img src={resolveTreatmentPlanIcon(el.category)} alt="" />
        </div>
        {el.category}
      </div>
    </>
  );
};

export default HolisticPlanCategory;
