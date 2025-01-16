/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import Uploading from "./uploading";
import { ButtonSecondary } from "../../Button/ButtosSecondary";

interface UploadTestProps {
    memberId:any
    onGenderate:() => void
}

const UploadTest:React.FC<UploadTestProps> = ({memberId,onGenderate}) => {
    const fileInputRef = useRef<any>(null);
    const [files,setFiles] = useState<Array<any>>([])
    const [upLoadingFiles,setUploadingFiles] = useState<Array<any>>([])
    return (
        <>
            <div className="w-[93%] rounded-[16px] h-[89vh] top-4 flex justify-center  absolute left-0">
                <div className="w-full h-full opacity-95 rounded-[12px] bg-gray-50 absolute">

                </div>                                   
                <div className="w-[530px] relative z-10">
                    <div className="w-full flex justify-center text-Text-Primary font-medium mt-14">No Data Available Yet!</div>

                    <div className="text-[12px] text-Text-Primary  text-center mt-1 ">
                        It looks like you haven’t uploaded any test results or completed any questionary yet. To view detailed insights, please upload your test results or complete the questionnaires now.
                    </div>

                    <div onClick={() => {
                        document.getElementById("uploadFile")?.click()
                    }} className="w-full shadow-100 border-spacing-9 mt-4 h-[154px] bg-white rounded-[12px] border border-dashed border-Primary-DeepTeal">
                        <div className="w-full flex justify-center mt-6">
                            <img src="/icons/upload-test.svg" alt="" />
                        </div>
                        <div className="text-[12px] text-Text-Primary text-center mt-3">
                            Drag and drop your test file here or click to upload.
                        </div>
                        <div className="w-full mt-3 flex justify-center">
                            <div className="text-Primary-DeepTeal cursor-pointer text-[12px] underline">Upload Test Results</div>

                        </div>
                        <input type="file" ref={fileInputRef} multiple onChange={(e:any) => {
                            const fileList = Array.from(e.target.files);
                            setFiles([...files,...upLoadingFiles])
                            setUploadingFiles([])
                            setTimeout(() => {
                                setUploadingFiles(fileList)
                            }, 200);
                            fileInputRef.current.value = "";   
                            // fileList.forEach((file:any) => {
                            //     convertToBase64(file).then((res) => {
                            //         Application.addLabReport({
                            //             member_id:memberId,
                            //             report:{
                            //                 "file name":res.name,
                            //                 "base64 string":res.url
                            //             }
                            //         }).then(() => {
                            //             setFiles([...files,file])
                            //         })
                            //     })                         
                            // });

                            
                        }} id="uploadFile" className="w-full absolute invisible h-full left-0 top-0" />                                            
                    </div>

                    <div className="text-Text-Primary text-[12px] mt-2 w-[470px]">
                        {`Accepted formats: PDF, CSV, Excel, Image (JPEG, PNG, TIFF), and Text files.Max file size: 10MB.`}
                    </div>
                    <div className="mt-1 grid grid-cols-1 max-h-[200px] gap-2 py-2 px-2 overflow-y-auto">
                        {files.map((el:any) => {
                            return (
                                <>
                                    <div className="w-full flex justify-between items-center px-4 py-2 h-[52px] bg-white shadow-200 rounded-[16px] ">
                                       <div className="flex justify-start gap-2">
                                            <img src="/images/Pdf.png" alt="" />
                                            <div>
                                                <div className="text-[12px] text-Text-Primary font-[600]">
                                                    {el.name} 
                                                </div>
                                                <div className="text-[12px] text-Text-Secondary">
                                                    {(el.size / ( 1024)).toFixed(2)} KB
                                                </div>
                                            </div>
                                       </div>
                                       <img className="w-6 h-6 cursor-pointer" src="/icons/delete.svg" alt="" />
                                    </div>
                                </>
                            )
                        })}
                        {upLoadingFiles.map((el:any) => {
                            return (
                                <>
                                <Uploading  memberId={memberId} file={el} onSuccess={(_file) => {
                                    // setFiles([...files,file])
                                    // setFiles((prevFiles) => [...prevFiles, file]);
                                }}></Uploading>
                                </>
                            )
                        })}
                    </div>     

                    <div className="flex justify-center items-center w-full">
                        <div className="h-[1px] bg-Text-Triarty w-[180px] relative">
                        </div>
                        <div className=" text-Text-Primary text-[10px] ">
                            <div className=" px-3">
                                Alternatively
                            </div>    
                        </div>
                        <div className="h-[1px] bg-Text-Triarty w-[180px] relative">
                        </div>                        
                    </div>
                    <div className="w-full mt-6 flex justify-center">
                        <div className="text-Primary-DeepTeal cursor-pointer text-[12px] underline">Complete Questionnaire</div>

                    </div>                    
                    {
                        upLoadingFiles.length >0 &&
                            <div className="flex justify-center mt-1">
                                <ButtonSecondary onClick={() => {
                                    onGenderate()
                                }}>
                                    <img src="/icons/tick-square.svg" alt="" />
                                    Develop Health Plan
                                </ButtonSecondary>
                            </div>   
                    }      
                </div>
            </div>        
        </>
    )
}

export default UploadTest