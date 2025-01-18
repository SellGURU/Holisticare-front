import { FiExternalLink } from 'react-icons/fi';
import { sortKeysWithValues } from '../Boxs/Help';
import StatusBarChartPrint from './StatusBarChartPrint';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkersPrintProps {
  data: any;
}

const BiomarkersPrint: React.FC<BiomarkersPrintProps> = ({ data }) => {
  const resolveColor = (key: string) => {
    if (key == 'Needs Focus') {
      return '#FC5474';
    }
    if (key == 'Ok') {
      return '#FBAD37';
    }
    if (key == 'Good') {
      return '#06C78D';
    }
    if (key == 'Excellent') {
      return '#7F39FB';
    }
    return '#FBAD37';
  };
  const sortedLimits = sortKeysWithValues(data.chart_bounds);
  const resovleStatusFromValue = (value: number) => {
    let status = 'Needs Focus';
    sortedLimits.forEach((el) => {
      if (el.value[0] <= value && el.value[1] >= value) {
        status = el.key;
      }
    });
    return status;
  };
  return (
    <>
      <div
        className="w-full no-split relative h-48 border bg-gray-50  border-gray-100 rounded-md px-4 border-l-4 py-2"
        style={{
          borderLeftColor: resolveColor(resovleStatusFromValue(data.values[0])),
        }}
      >
        <div>
          <div className=" flex justify-start items-center">
            <div className="text-base font-medium">{data.name}</div>
            <a
              href={'#' + data.subcategory}
              className="text-green-500 flex ml-2 justify-center items-center gap-1 text-xs cursor-pointer"
            >
              Group
              <FiExternalLink></FiExternalLink>
            </a>
          </div>
          <div className="text-sm flex items-center  mt-2">
            Current Value:
            <div className="flex items-center flex-row">
              <div className="text-xs font-medium ">
                {data.values[0] + ' ' + data.unit}
              </div>
              <div
                className="w-3 h-3 mr-1 rounded-full "
                style={{
                  backgroundColor: resolveColor(
                    resovleStatusFromValue(data.values[0]),
                  ),
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full  mt-24">
          <StatusBarChartPrint data={data}></StatusBarChartPrint>
        </div>
      </div>
    </>
  );
};

export default BiomarkersPrint;
