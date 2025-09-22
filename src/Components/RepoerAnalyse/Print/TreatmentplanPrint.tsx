// import { splitInstructions } from '../../../help';

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
  // const { positive, negative } = splitInstructions(data.Notes);
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
        <div
          style={{
            backgroundColor: '#FDFDFD',
            paddingTop: '4px',
            paddingBottom: '4px',
            paddingLeft: '8px',
            paddingRight: '8px',
            borderRadius: '8px',
            border: '1px solid #E9EDF5',
          }}
        >
          <div
            className="top-2"
            style={{ fontSize: '12px', color: '#383838', fontWeight: 500 }}
          >
            {data.title}
          </div>
          <div className="flex flex-col gap-1 ml-3 mt-3">
            <div
              className="flex items-center gap-1"
              style={{
                color: '#005f73',
                fontSize: '0.75rem',
                lineHeight: '1rem',
              }}
            >
              <img src="/icons/book.svg" alt="" className="ml-[-2px]" />
              Scientific Basis
            </div>
            <div
              style={{
                color: '#888888',
                fontSize: '0.75rem',
                lineHeight: '1.25rem',
              }}
            >
              {data?.Based}
            </div>
            <div
              className="flex items-center gap-1 mt-1.5"
              style={{
                color: '#005f73',
                fontSize: '0.75rem',
                lineHeight: '1rem',
              }}
            >
              <img src="/icons/lamp-on-new.svg" alt="" className="ml-[-2px]" />
              Guidelines
            </div>
            <div
              style={{
                color: '#888888',
                fontSize: '0.75rem',
                lineHeight: '1.25rem',
              }}
            >
              {data?.Intervnetion_content}
            </div>
            <div
              className="flex items-center gap-1 mt-1.5"
              style={{
                color: '#005f73',
                fontSize: '0.75rem',
                lineHeight: '1rem',
              }}
            >
              <img src="/icons/medal-star.svg" alt="" className="ml-[-2px]" />
              Expected Benefits
            </div>
            <div className="flex flex-col ml-1">
              {data?.key_benefits?.map((el: any) => {
                return (
                  <div
                    style={{
                      color: '#888888',
                      fontSize: '0.75rem',
                      lineHeight: '1.25rem',
                    }}
                  >
                    <span style={{ color: '#38383899' }}>•</span> {el}
                  </div>
                );
              })}
            </div>
            {data?.Dose?.length > 0 && (
              <>
                <div
                  className="flex items-center gap-1"
                  style={{
                    color: '#005f73',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                  }}
                >
                  <img
                    src="/icons/ruler-new.svg"
                    alt=""
                    className="ml-[-2px]"
                  />
                  Recommended Dosage
                </div>
                <div
                  style={{
                    color: '#888888',
                    fontSize: '0.75rem',
                    lineHeight: '1.25rem',
                  }}
                >
                  {data?.Dose}
                </div>
              </>
            )}
            {data?.exercises_to_do?.length > 0 && (
              <>
                <div
                  className="flex items-center gap-1 mt-1.5"
                  style={{
                    color: '#005f73',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                  }}
                >
                  <img
                    src="/icons/tick-circle-new.svg"
                    alt=""
                    className="ml-[-2px]"
                  />
                  Recommended Exercises
                </div>
                <div className="flex flex-col ml-1">
                  {data?.exercises_to_do?.map((el: any) => {
                    return (
                      <div
                        style={{
                          color: '#888888',
                          fontSize: '0.75rem',
                          lineHeight: '1.25rem',
                        }}
                      >
                        <span style={{ color: '#38383899' }}>•</span> {el}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {data?.exercises_to_avoid?.length > 0 && (
              <>
                <div
                  className="flex items-center gap-1 mt-1.5"
                  style={{
                    color: '#005f73',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                  }}
                >
                  <img src="/icons/slash.svg" alt="" className="ml-[-2px]" />
                  Exercises to Avoid
                </div>
                <div className="flex flex-col ml-1">
                  {data?.exercises_to_avoid?.map((el: any) => {
                    return (
                      <div
                        style={{
                          color: '#888888',
                          fontSize: '0.75rem',
                          lineHeight: '1.25rem',
                        }}
                      >
                        <span className="text-Text-Secondary">•</span> {el}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {data?.foods_to_eat?.length > 0 && (
              <>
                <div
                  className="flex items-center gap-1 mt-1.5"
                  style={{
                    color: '#005f73',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                  }}
                >
                  <img
                    src="/icons/tick-circle-new.svg"
                    alt=""
                    className="ml-[-2px]"
                  />
                  Recommended Foods
                </div>
                <div className="flex flex-col ml-1">
                  {data?.foods_to_eat?.map((el: any) => {
                    return (
                      <div
                        style={{
                          color: '#888888',
                          fontSize: '0.75rem',
                          lineHeight: '1.25rem',
                        }}
                      >
                        <span style={{ color: '#38383899' }}>•</span> {el}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {data?.foods_to_avoid?.length > 0 && (
              <>
                <div
                  className="flex items-center gap-1 mt-1.5"
                  style={{
                    color: '#005f73',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                  }}
                >
                  <img src="/icons/slash.svg" alt="" className="ml-[-2px]" />
                  Foods to Limit
                </div>
                <div className="flex flex-col ml-1">
                  {data?.foods_to_avoid?.map((el: any) => {
                    return (
                      <div
                        style={{
                          color: '#888888',
                          fontSize: '0.75rem',
                          lineHeight: '1.25rem',
                        }}
                      >
                        <span style={{ color: '#38383899' }}>•</span> {el}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {/* {data.Notes ? (
            <>
              {data.Notes.map((el: any) => {
                return (
                  <div
                    className="my-2 flex"
                    style={{ fontSize: '12px', color: '#383838' }}
                  >
                    <div style={{ marginRight: '5px', color: '#888888' }}>
                      &#8226;
                    </div>
                    <div>
                      {el}
                    </div>
                  </div>
                );
              })}
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
                  {data.Notes}
                </div>
              </div>
            </>
          )} */}
          {/* {data?.Client_Notes?.length > 0 && (
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
              {data?.Client_Notes.map((el: any) => {
                return (
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
                    {el}
                  </div>
                );
              })}
            </>
          )} */}
        </div>
      </div>
    </>
  );
};

export default TreatmentPlanPrint;
