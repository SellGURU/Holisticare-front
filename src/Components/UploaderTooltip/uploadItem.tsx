import { useState } from "react";

const UploadItem = () => {
    const [progress, ] = useState(98);    
    const [timeRemaining, ] = useState('5 secends');    


    return (
        <>
            <div className="w-full flex justify-between">
                <div>
                    <div className="text-Text-Secondary  text-[10px] md:text-[10px] mt-1">
                    {progress}% • {timeRemaining}
                    </div>
                </div>
            </div>
            <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
            <div
                className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                style={{ width: progress + '%' }}
            ></div>
            </div>          
        </>
    )
}

export default UploadItem;
