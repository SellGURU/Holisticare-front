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
    const [isFailed,setIsFailed] = useState(false)
    const [progress,setProgress] = useState(0)
    useEffect(() => {
        convertToBase64(file).then((res) => {
            Application.addLabReport({
                member_id:memberId,
                report:{
                    "file name":res.name,
                    "base64 string":res.url
                },
                
            },(progressEvent:any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted)
            }).then(() => {
                onSuccess(file)
                setIsCompleted(true)
                // setFiles([...files,file])
            }).catch(() => {
                setIsFailed(true)
                setIsCompleted(true)
            })
        })   
        return () => {
            setIsCompleted(false)   
            setProgress(0)
        }
    },[])
    return (
        <>
            {isCompleted ?
                <div className={`w-full px-4 py-2 h-[52px] bg-white shadow-200 rounded-[16px] ${isFailed && 'border border-red-500'} flex justify-between`}>
                    <div className="flex justify-start gap-2">
                        <img src="/images/Pdf.png" alt="" />
                        <div>
                            <div className="text-[12px] text-Text-Primary font-[600]">
                                {file.name}
                            </div>
                            <div className="text-[12px] text-Text-Secondary">
                                {(file.size / ( 1024)).toFixed(2)} KB
                            </div>
                        </div>
                    </div>
                    <img className="cursor-pointer w-6 h-6" src="/icons/delete.svg" alt="" />

                </div>            
            :
                <div className="w-full relative px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px]" style={{}}>
                    <div className="w-full flex justify-between">
                        <div>
                        <div className="text-[12px] text-Text-Primary font-[600]">Uploading...</div>
                    <div className="text-Text-Secondary text-[12px] mt-1">
                        {progress}%  • 30 seconds remaining
                    </div>
                        </div>
                    
                    <img className="cursor-pointer" src="/icons/close.svg" alt="" />

                    </div>
                    <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center" >
                        <div className="bg-Primary-DeepTeal h-[5px] rounded-[12px]" style={{width:progress+'%'}}>

                        </div>
                    </div>

                </div>        
            }
        </>
    )
}

export default Uploading