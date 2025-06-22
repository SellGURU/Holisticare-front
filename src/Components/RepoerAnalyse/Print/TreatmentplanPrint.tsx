import { splitInstructions } from '../../../help';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TreatmentPlanPrintProps {
  data: any;
}

const TreatmentPlanPrint: React.FC<TreatmentPlanPrintProps> = ({ data }) => {
  // const result = {
  //   positive: data.Notes.match(
  //     /Positive:\s*(.*?)(?=Negative:|$)/s,
  //   )?.[1]?.trim(),
  //   negative: data.Notes.match(/Negative:\s*(.*)/s)?.[1]?.trim(),
  // };
  const { positive, negative } = splitInstructions(data.Notes);
  return (
    <>
      <div
        className=" no-split  h-auto rounded-lg flex items-center px-4 py-2 border  relative "
        style={{
          width: '100%',
          backgroundColor: '#FDFDFD',
          borderColor: '#E9EDF5',
        }}
      >
        <div>
          <div
            className="top-2"
            style={{ fontSize: '12px', color: '#383838', fontWeight: 500 }}
          >
            {data.title}
          </div>
          {positive && negative ? (
            <>
              {positive && (
                <div
                  className="my-2 flex"
                  style={{ fontSize: '12px', color: '#383838' }}
                >
                  <div style={{ marginRight: '5px', color: '#888888' }}>
                    &#8226;
                  </div>
                  <div>
                    {/* <span style={{ color: '#888888' }}>Key Benefits:</span>{' '} */}
                    {positive}
                  </div>
                </div>
              )}
              {negative && (
                <div
                  className="my-2 flex"
                  style={{ fontSize: '12px', color: '#383838' }}
                >
                  <div style={{ marginRight: '5px', color: '#888888' }}>
                    &#8226;
                  </div>
                  <div>
                    {/* <span style={{ color: '#888888' }}>Key Risks:</span>{' '} */}
                    {negative}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className="my-2 flex break-words text-justify"
                style={{ fontSize: '12px', color: '#383838' }}
              >
                <div style={{ marginRight: '5px', color: '#888888' }}>
                  &#8226;
                </div>
                <div
                  className="break-words text-justify"
                  style={{ maxWidth: '600px' }}
                >
                  {/* <span style={{ color: '#888888' }}>Key Benefits</span>{' '} */}
                  {data.Notes}
                </div>
              </div>
            </>
          )}
          {data?.Client_Notes?.length > 0 && (
            <>
              <div
                style={{
                  backgroundColor: '#E9EDF5',
                  width: '100%',
                  height: '1px',
                  marginBottom: '5px',
                  marginTop: '5px',
                }}
              ></div>
              <div style={{ color: '#888888', fontSize: '12px' }}>
                <span
                  style={{
                    color: '#383838',
                    fontSize: '12px',
                    marginRight: '5px',
                  }}
                >
                  Note:
                </span>
                {data.Client_Notes[0]}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TreatmentPlanPrint;
