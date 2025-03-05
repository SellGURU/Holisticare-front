// import { useState } from "react";
import ItemUpload from './ItemUpload';

interface UploadCardProps {
  question: string;
  value: number;
  index?: number;
}

const UploadCard: React.FC<UploadCardProps> = ({ index, question }) => {
  // const [frontal,setFrotal] = useState("")
  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full h-full rounded-[12px] border border-gray-50">
        <div className="text-[12px] text-Text-Primary">
          {index}. {question}
        </div>
        <div className="w-full bg-white rounded-[8px] p-2">
          <div className="flex justify-between">
            <div className="text-[12px] text-[#B0B0B0]">Jan 27, 2024</div>
          </div>
          <div className="w-full gap-4 flex justify-center items-center">
            <ItemUpload name="Frontal"></ItemUpload>
            <ItemUpload name="Back"></ItemUpload>
            <ItemUpload name="Side"></ItemUpload>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadCard;
