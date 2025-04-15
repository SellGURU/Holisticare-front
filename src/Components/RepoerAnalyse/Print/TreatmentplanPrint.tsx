/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentPlanPrintProps {
  data: any;
}

const TreatmentPlanPrint: React.FC<TreatmentPlanPrintProps> = ({ data }) => {
  return (
    <>
      <div
        className=" no-split  h-auto rounded-lg flex items-center px-4 py-2 border  relative "
        style={{
          width: '215px',
          backgroundColor: '#FDFDFD',
          borderColor: '#E9EDF5',
        }}
      >
        <div>
          <div
            className="text-sm text-gray-600  top-2"
            style={{ fontSize: '12px', color: '#383838' }}
          >
            {data.title}
          </div>
          <div
            className="my-8  text-sm"
            style={{ fontSize: '12px', color: '#888888' }}
          >
            <span className="text-gray-800">Notes:</span> {data.Notes}
          </div>
          <div
            className="text-sm text-gray-600 "
            style={{ color: '#005F73', fontSize: '10px' }}
          >
            {' '}
            {data.Based}
          </div>
        </div>
      </div>
    </>
  );
};

export default TreatmentPlanPrint;
