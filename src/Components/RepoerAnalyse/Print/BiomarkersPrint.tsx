// import StatusBarChartPrint from './StatusBarChartPrint';
import StatusBarChartPrintV2 from './StatusBarChartPrintV2';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkersPrintProps {
  data: any;
}

const BiomarkersPrint: React.FC<BiomarkersPrintProps> = ({ data }) => {
  return (
    <>
      <div
        className="w-full no-split relative  border bg-white rounded-md px-4  py-2"
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
              style={{ fontSize: '14px', color: '#383838' }}
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
        <div className="w-full  mt-10">
          <StatusBarChartPrintV2 data={data.chart_bounds} mapingData={Object.fromEntries(
                              Object.entries(data.chart_bounds).map(([key, valuess]:any) => [key, valuess.label])
                            )} status={data.status} unit={data.unit} values={data.values} ></StatusBarChartPrintV2>
        </div>
      </div>
    </>
  );
};

export default BiomarkersPrint;
