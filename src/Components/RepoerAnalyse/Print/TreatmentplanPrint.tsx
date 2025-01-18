/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentPlanPrintProps {
  data: any;
}

const TreatmentPlanPrint: React.FC<TreatmentPlanPrintProps> = ({ data }) => {
  return (
    <>
      <div className=" no-split w-full h-auto rounded-lg flex items-center px-4 py-2 bg-gray-200 relative ">
        <div className="text-sm text-gray-600 absolute top-2">{data.title}</div>
        <div className="my-8  text-sm">
          <span className="text-gray-800">Notes:</span> {data.Notes}
        </div>
        <div className="text-xs text-gray-600 absolute bottom-2">
          {' '}
          {data.Based}
        </div>
      </div>
    </>
  );
};

export default TreatmentPlanPrint;
