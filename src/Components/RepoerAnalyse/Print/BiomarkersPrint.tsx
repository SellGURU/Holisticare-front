import StatusBarChartPrint from './StatusBarChartPrint';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkersPrintProps {
  data: any;
}

const BiomarkersPrint: React.FC<BiomarkersPrintProps> = ({ data }) => {
  return (
    <>
      <div
        className="w-full no-split relative  border bg-white rounded-md px-4 border-l-4 py-2"
        style={{
          borderRadius: '16px',
          boxShadow: '0px 4px 4px -2px #18274B14',
          padding: '8px 16px',
          paddingBottom: '32px',
          // borderLeftColor: resolveColor(resovleStatusFromValue(data.values[0])),
        }}
      >
        <div>
          <div className=" flex justify-start items-center">
            <div
              className="text-base font-medium"
              style={{ fontSize: '12px', color: '#383838' }}
            >
              {data.name}
            </div>
            {/* <a
              href={'#' + data.subcategory}
              className="text-green-500 flex ml-2 justify-center items-center gap-1 text-xs cursor-pointer"
            >
              Group
              <FiExternalLink></FiExternalLink>
            </a> */}
          </div>
          <div className="text-sm flex items-center  mt-2">
            {/* Current Value: */}
            <div className="flex items-center flex-row">
              {/* <div className="text-xs font-medium ">
                {data.values[0] + ' ' + data.unit}
              </div> */}
              {/* <div
                className="w-3 h-3 mr-1 rounded-full "
                style={{
                  backgroundColor: resolveColor(
                    resovleStatusFromValue(data.values[0]),
                  ),
                }}
              ></div> */}
            </div>
          </div>
        </div>
        <div className="w-full  mt-8">
          <StatusBarChartPrint data={data}></StatusBarChartPrint>
        </div>
      </div>
    </>
  );
};

export default BiomarkersPrint;
