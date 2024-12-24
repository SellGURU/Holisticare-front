/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ButtonPrimary } from "../../Button/ButtonPrimary";
import Uploading from "./uploading";

interface UploadTestProps {
    memberId:any
}

const UploadTest:React.FC<UploadTestProps> = ({memberId}) => {
   
    const [files,setFiles] = useState<Array<any>>([])
    const [upLoadingFiles,setUploadingFiles] = useState<Array<any>>([])
    return (
        <>
            <div className="w-[93%] rounded-[16px] h-[89vh] top-14 flex justify-center  absolute left-0">
                <div className="w-full h-full opacity-95 rounded-[12px] bg-gray-50 absolute">

                </div>                                   
                <div className="w-[560px] relative z-10">
                    <div className="w-full flex justify-center text-Text-Primary font-medium mt-14">No Data Available Yet!</div>

                    <div className="text-[12px] text-Text-Primary  text-center mt-1 ">
                        It looks like you haven’t uploaded any test results yet. To view your detailed insights, please upload your test results now.
                    </div>

                    <div onClick={() => {
                        document.getElementById("uploadFile")?.click()
                    }} className="w-[576px] shadow-100 border-spacing-9 mt-6 h-[182px] bg-white rounded-[12px] border border-dashed border-Primary-DeepTeal">
                        <div className="w-full flex justify-center mt-6">
                            <img src="/icons/upload-test.svg" alt="" />
                        </div>
                        <div className="text-[12px] text-Text-Primary text-center mt-3">
                            Drag and drop your test file here or click to upload.
                        </div>
                        <div className="w-full mt-3 flex justify-center">
                            <ButtonPrimary >
                                Upload Test Results
                            </ButtonPrimary>

                        </div>
                        <input type="file" multiple onChange={(e:any) => {
                            const fileList = Array.from(e.target.files);
                            setUploadingFiles([...upLoadingFiles,...fileList])
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
                    <div className="mt-6 grid grid-cols-1 max-h-[200px] gap-2 py-2 px-2 overflow-y-scroll">
                        {files.map((el:any) => {
                            return (
                                <>
                                    <div className="w-full px-4 py-2 h-[52px] bg-white shadow-200 rounded-[16px]">
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
                                    </div>
                                </>
                            )
                        })}
                        {upLoadingFiles.map((el:any) => {
                            return (
                                <>
                                <Uploading memberId={memberId} file={el} onSuccess={(file) => {
                                    setFiles([...files,file])
                                }}></Uploading>
                                </>
                            )
                        })}
                    </div>        
                </div>
            </div>        
        </>
    )
}

export default UploadTest