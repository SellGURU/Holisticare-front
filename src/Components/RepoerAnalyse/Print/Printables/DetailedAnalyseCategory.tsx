import resolveAnalyseIcon from '../../resolveAnalyseIcon';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DetailedAnalyseCategoryProps {
  data: any;
}

const DetailedAnalyseCategory: React.FC<DetailedAnalyseCategoryProps> = ({
  data,
}) => {
  // console.log(data)
  return (
    <>
      <div
        style={{
          borderRadius: '16px',
          // padding: '12px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
        className="bg-white px-4 rounded-b-none"
      >
        <div
          className={`w-full  no-split flex cursor-pointer justify-start items-center `}
          style={{ height: '70px' }}
        >
          <div
            className="w-10 h-10 items-center rounded-full flex justify-center"
            style={{
              background: `conic-gradient(#7F39FB 0% ${data.status[0]}%,#06C78D ${data.status[0]}% ${data.status[1] + data.status[0]}%,#FBAD37 ${
                data.status[1] + data.status[0]
              }% ${data.status[1] + data.status[2] + data.status[0]}%,#FC5474 ${
                data.status[2] + data.status[1] + data.status[0]
              }% 100%)`,
            }}
          >
            <div
              className="w-8 h-8  flex justify-center  items-center  rounded-full"
              // style={{backgroundColor}}
              style={{ backgroundColor: 'white' }}
            >
              <img
                className="w-5 h-5"
                src={resolveAnalyseIcon(data.subcategory)}
                alt=""
              />
            </div>
          </div>
          <div className="ml-2">
            <div
              id={data.subcategory}
              style={{ color: '#005F73', fontSize: '14px' }}
              className=" text-sm"
            >
              {data?.subcategory}
            </div>
            <div
              className="flex justify-start items-center "
              style={{ color: '#B0B0B0', fontSize: '12px' }}
            >
              <div className=" ">
                {' '}
                <span className=" ">{data?.num_of_biomarkers}</span> Biomarkers
              </div>
              <div className="  ml-2 ">
                <span className="">{data?.out_of_ref}</span>{' '}
                {data?.out_of_ref > 1 ? 'Needs Focus' : 'Need Focus'}{' '}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailedAnalyseCategory;
