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
          width: '210px',
          backgroundColor: '#FDFDFD',
          borderColor: '#E9EDF5',
        }}
      >
        <div
          className="text-sm text-gray-600 absolute top-2"
          style={{ fontSize: '10px', color: '#383838' }}
        >
          {data.title}
        </div>
        <div
          className="my-8  text-sm"
          style={{ fontSize: '10px', color: '#888888' }}
        >
          <span className="text-gray-800">Notes:</span> {data.Notes}
        </div>
        <div
          className="text-xs text-gray-600 absolute bottom-2"
          style={{ color: '#005F73', fontSize: '10px' }}
        >
          {' '}
          {data.Based}
        </div>
      </div>
    </>
  );
};

export default TreatmentPlanPrint;
