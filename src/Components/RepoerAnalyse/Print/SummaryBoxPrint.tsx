import resolveAnalyseIcon from '../resolveAnalyseIcon';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SummaryBoxPrintProps {
  data: any;
}

const SummaryBoxPrint: React.FC<SummaryBoxPrintProps> = ({ data }) => {
  return (
    <>
      <a
        href={'#' + data.subcategory}
        className={`w-full  no-split flex cursor-pointer justify-start items-center h-16 p-4 rounded-md bg-white border border-gray-50  `}
        style={{
          boxShadow: '0px 8px 8px -4px #18274B14',
          borderRadius: '16px',
        }}
      >
        <div
          className="w-10 h-10 items-center rounded-full flex justify-center"
          style={{
            background: `conic-gradient(#37B45E 0% ${data.status[0]}%,#72C13B ${data.status[0]}% ${data.status[1] + data.status[0]}%,#D8D800 ${
              data.status[1] + data.status[0]
            }% ${data.status[1] + data.status[2] + data.status[0]}%,#B2302E ${
              data.status[2] + data.status[1] + data.status[0]
            }% 100%)`,
          }}
        >
          <div
            className="w-8 h-8 bg-white flex justify-center  items-center  rounded-full"
            // style={{backgroundColor}}
          >
            <img
              className="w-5 h-5"
              src={resolveAnalyseIcon(data.subcategory)}
              alt=""
            />
          </div>
        </div>
        <div className="ml-2">
          <div className=" text-sm" style={{ color: '#005F73' }}>
            {data.subcategory}
          </div>
          <div
            className="flex justify-start items-center"
            style={{ color: '#383838 ' }}
          >
            <div className="  text-xs" style={{ fontSize: '10px' }}>
              {' '}
              <span
                className=" text-xs"
                style={{ color: '#383838 ', fontSize: '10px' }}
              >
                {data.num_of_biomarkers}
              </span>{' '}
              Biomarkers
            </div>
            <div
              className=" ml-2 text-xs"
              style={{ color: '#383838 ', fontSize: '10px' }}
            >
              <span className="">{data.out_of_ref}</span>{' '}
              {data.out_of_ref > 1 ? 'Needs Focus' : 'Need Focus'}{' '}
            </div>
          </div>
        </div>
      </a>
    </>
  );
};

export default SummaryBoxPrint;
