import { useEffect, useState } from "react"
import Application from "../../../api/app";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface UploadingProps {
    file:any
    memberId:string
    onSuccess:(file:any) =>void
}

const Uploading:React.FC<UploadingProps> = ({
    file,memberId,onSuccess
}) => {
    const convertToBase64 = (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            const base64 = reader.result as string;
            resolve({ name: file.name, url:base64,type:file.type ,size:file.size});
        };

        reader.onerror = (error) => {
            reject(error);
        };
        });
    };      
    const [isCompleted,setIsCompleted] = useState(false)
    useEffect(() => {
        convertToBase64(file).then((res) => {
            Application.addLabReport({
                member_id:memberId,
                report:{
                    "file name":res.name,
                    "base64 string":res.url
                }
            }).then(() => {
                onSuccess(file)
                setIsCompleted(true)
                // setFiles([...files,file])
            })
        })   
    },[])
    return (
        <>
            <div className="w-full px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px]" style={{display:isCompleted?'none':'block'}}>
                <div className="text-[12px] text-Text-Primary font-[600]">Uploading...</div>
                <div className="text-Text-Secondary text-[12px] mt-1">
                    13%  • 30 seconds remaining
                </div>
                <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center" >
                    <div className="bg-Primary-DeepTeal h-[5px] rounded-[12px]" style={{width:'13%'}}>

                    </div>
                </div>
            </div>        
        </>
    )
}

export default Uploading