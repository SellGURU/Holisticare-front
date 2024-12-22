/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from "formik"
import Application from "../../api/app"
import { ButtonPrimary } from "../../Components/Button/ButtonPrimary"
import TextField from "../../Components/TextField"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const AddClient =() => {
    const formik = useFormik({
        initialValues:{
            firstName:'',
            lastName:'',
            email:'',
        },
        onSubmit :() => {

        }
    })
    const navigate = useNavigate()
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
    const [photo,setPhoto] = useState("")
    const submit =() => {
        Application.addClient({
            first_name: formik.values.firstName,
            email: formik.values.email,
            last_name: formik.values.lastName,
            picture: photo,
            wearable_devices: [],
        })
    }
    return (
        <>
        <div className=" w-full p-8">
            <div className=" mb-2 ">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => {
                            navigate(-1)
                        }}
                        className={` px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
                    >
                        <img className="w-6 h-6" src="/icons/arrow-back.svg" />
                    </div>
                    <div className="TextStyle-Headline-5 text-Text-Primary">
                        Add New Client
                    </div>
                </div>
            </div>   
            
            <div className="flex justify-center w-full">
                <div className="max-w-[430px] w-full grid gap-4">
                    <TextField {...formik.getFieldProps("firstName")} name="firstName" label="First Name" placeholder="Enter client’s first name..." ></TextField>
                    <TextField {...formik.getFieldProps("lastName")} label="Last Name" placeholder="Enter client’s last name..." ></TextField>
                    <TextField {...formik.getFieldProps("email")} type="email" label="Email Address" placeholder="Enter client’s email address..."  ></TextField>
                    <div>
                        <label className="text-Text-Primary  text-[12px] font-medium">Client’s Photo</label>
                        <div onClick={() => {
                            document.getElementById("uploadFile")?.click()
                        }} className="w-full relative bg-white border border-gray-50 mt-1 shadow-300 rounded-[16px] h-[146px]">
                            <div className="w-full  h-full flex justify-center items-center">
                                <div className="text-center">
                                    <div className="justify-center flex mb-2">
                                        {photo == '' ?
                                            <img src="icons/upload-test.svg" alt="" />
                                        :
                                            <img className="w-[60px] h-[60px] rounded-full" src={photo} alt="" />
                                        }
                                    </div>
                                    <div className="text-[12px] text-Text-Primary">
                                        Drag and drop or click to upload.
                                    </div>
                                    <div className="text-Text-Secondary text-[10px] mt-2">
                                        JPEG, PNG
                                    </div>
                                </div>
                            </div>

                            <input type="file" onChange={(e:any) => {
                                const file = e.target.files[0];
                                convertToBase64(file).then((res) => {
                                    setPhoto(res.url)
                                })
                            }} id="uploadFile" className="w-full absolute invisible h-full left-0 top-0" />
                        </div>
                    </div>
                    <div className="w-full flex justify-center mt-4">
                        <ButtonPrimary onClick={submit}>
                            Save Changes
                        </ButtonPrimary>
                    </div>
                </div>         

            </div>
        </div>        
        </>
    )
}

export default AddClient