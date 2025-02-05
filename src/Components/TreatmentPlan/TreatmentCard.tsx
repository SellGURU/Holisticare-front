/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentCardProps {
  data: any;
}
const TreatmentCard: React.FC<TreatmentCardProps> = ({ data }) => {
  return (
    <div className="w-[354px] no-split print:w-full h-full md:h-[200px] print:h-auto flex flex-col gap-4 px-4 py-2 bg-backgroundColor-Card border border-Gray-50 rounded-2xl relative ">
      <div className="text-sm text-Text-Primary ">
        {data.title}
      </div>
      <div className=" text-Text-Secondary text-xs ">
        <span className="text-Text-Primary text-xs">Notes:</span> {data.Notes}
      </div>
      <div className="text-xs font-medium text-Primary-DeepTeal select-none">
        {' '}
        {data.Based}
      </div>
    </div>
  );
};

export default TreatmentCard;
