// import { data } from "react-router-dom"
import StatusBarChart from '../../Components/RepoerAnalyse/Boxs/StatusBarChart';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkerItemProps {
  data: any;
}

const BiomarkerItem: React.FC<BiomarkerItemProps> = ({ data }) => {
  return (
    <>
      <div className="w-full py-2 px-3 flex gap-6 justify-start items-center bg-[#F4F4F4] rounded-[12px] border border-gray-50 min-h-[60px]">
        <div className="w-[200px]">
          <div className="text-[12px] font-medium text-Text-Primary">
            {data.name}
          </div>
          <div className="text-[10px] max-w-[100px] text-nowrap overflow-hidden text-ellipsis mt-1 text-Text-Secondary">
            {data.more_info}
          </div>
        </div>
        <div className="w-[70%]">
          <StatusBarChart justView data={data}></StatusBarChart>
        </div>
      </div>
    </>
  );
};

export default BiomarkerItem;
