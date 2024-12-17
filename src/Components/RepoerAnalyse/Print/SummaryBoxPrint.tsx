import resolveAnalyseIcon from "../resolveAnalyseIcon";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SummaryBoxPrintProps  {
    data: any;
}

const SummaryBoxPrint:React.FC<SummaryBoxPrintProps> = ({data}) => {
    return (
        <>
        <a
            href={"#"+data.subcategory}
            className={`w-full  no-split flex cursor-pointer justify-start items-center h-16 p-4 rounded-md bg-light-min-color `}
        >
            <div
            className="w-10 h-10 items-center rounded-full flex justify-center" 
            style={{
                background: `conic-gradient(#7F39FB 0% ${data.status[0]}%,#06C78D ${data.status[0]}% ${data.status[1]+data.status[0]}%,#FBAD37 ${
                data.status[1]+data.status[0]
                }% ${data.status[1] + data.status[2]+data.status[0]}%,#FC5474 ${
                data.status[2] +data.status[1] +data.status[0]
                }% 100%)`,
            }}
            >
            <div
                className="w-8 h-8 bg-gray-700 flex justify-center  items-center  rounded-full"
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
            <div className="text-light-primary-text dark:text-[#FFFFFFDE] text-sm">
                {data.subcategory}
            </div>
            <div className="flex justify-start items-center">
                <div className=" text-light-secandary-text dark:text-[#FFFFFF99] text-sm">
                {" "}
                <span className=" text-black dark:text-white">
                    {data.num_of_biomarkers}
                </span>{" "}
                biomarkers
                </div>
                <div className=" text-light-secandary-text dark:text-[#FFFFFF99] ml-2 text-sm">
                <span className="dark:text-white text-black">
                    {data.out_of_ref}
                </span>{" "}
                {data.out_of_ref > 1 ?'Needs Focus':'Need Focus'}{" "}
                </div>
            </div>
            </div>
        </a>        
        </>
    )
}

export default SummaryBoxPrint