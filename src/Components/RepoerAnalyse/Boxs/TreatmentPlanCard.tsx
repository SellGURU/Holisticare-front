/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentCardProps {
  data: any;
}
const TreatmentCard: React.FC<TreatmentCardProps> = ({ data }) => {
  return (
    <div className="w-[354px] no-split print:w-full h-[200px] print:h-auto flex items-center px-4 py-2 card-box1 relative ">
      <div className="textStyle-type1 absolute top-2">{data.title}</div>
      <div className="my-8 textStyle-type2 ">
        <span className="textStyle-type1">Notes:</span> {data.Notes}
      </div>
      <div className="textStyle-type1 print:text-xs print:text-gray-300 absolute bottom-2">
        {' '}
        {data.Based}
      </div>
    </div>
  );
};

export default TreatmentCard;
