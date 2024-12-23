/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ButtonPrimary } from "../../Button/ButtonPrimary";

const UploadTest = () => {
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
    const [files,setFiles] = useState<Array<any>>([])
    return (
        <>
            <div className="w-[99.1%] rounded-[16px] h-[89vh] top-6 flex justify-center  absolute left-0">
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
                        <input type="file" onChange={(e:any) => {
                            const file = e.target.files[0];
                            convertToBase64(file).then((res) => {
                                // setPhoto(res.url)
                                setFiles([res.url])
                            })
                        }} id="uploadFile" className="w-full absolute invisible h-full left-0 top-0" />                                            
                    </div>

                    <div className="text-Text-Primary text-[12px] mt-2 w-[470px]">
                        {`Accepted formats: PDF, CSV, Excel, Image (JPEG, PNG, TIFF), and Text files.Max file size: 10MB.`}
                    </div>
                </div>
                <div>
                    {files.map((_el:any) => {
                        return (
                            <>
                                <div className="w-full h-[52px] bg-white rounded-[16px]"></div>
                            </>
                        )
                    })}
                </div>        
            </div>        
        </>
    )
}

export default UploadTest