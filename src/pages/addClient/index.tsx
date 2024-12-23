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
    const [isAdded,setIsAdded] =useState(false)
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
    const [memberId,setMemberID] = useState("")
    const [isLoading,setisLoading] = useState(false)
    const submit =() => {
        setisLoading(true)
        Application.addClient({
            first_name: formik.values.firstName,
            email: formik.values.email,
            last_name: formik.values.lastName,
            picture: photo,
            wearable_devices: [],
        }).then(res => {
            setIsAdded(true)
            setMemberID(res.data.member_id)
        }).finally(() => {
            setisLoading(false)
        })
    }
    return (
        <>
        <div className=" w-full p-8">
            {
                isAdded ?
                <>
                    <div className="w-full flex justify-center items-center h-[80vh]">
                        <div className="w-[440px] h-[304px] bg-white rounded-[16px] border border-gray-50 shadow-200">
                            <div className="w-full flex justify-center mt-8">
                                <img src="/icons/tick-circle.svg" className="w-[64px] h-[64px]" alt="" />
                            </div>

                            <div className="mt-4">
                                <div className="text-center font-medium text-[14px] text-Text-Primary">The client has been successfully saved!</div>
                                <div className="flex justify-center">
                                    <div className="text-justify w-[373px] text-[12px] text-Text-Primary mt-2">
                                        To set up their profile or monitor their progress, please navigate to the client’s health profile. Here, you can view detailed insights and track all updates to ensure their wellness journey is progressing smoothly.                                
                                    </div>
                                </div>
                                <div className="flex w-full justify-between items-center px-8 mt-4">
                                    <ButtonPrimary onClick={() => {
                                        setIsAdded(false)
                                        formik.resetForm()
                                        setPhoto("")
                                    }} outLine>
                                        <div className="w-[130px]">
                                            Add Another Client
                                        </div>
                                    </ButtonPrimary>                                    
                                    <ButtonPrimary onClick={() => {
                                        navigate('/report/'+memberId)
                                    }}>
                                        <div className="w-[130px]">
                                            Create Report
                                        </div>
                                    </ButtonPrimary>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                :
                <>
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
                        <div className="max-w-[460px] w-full grid gap-4">
                            <TextField {...formik.getFieldProps("firstName")} name="firstName" label="First Name" placeholder="Enter client’s first name..." ></TextField>
                            <TextField {...formik.getFieldProps("lastName")} label="Last Name" placeholder="Enter client’s last name..." ></TextField>
                            <TextField {...formik.getFieldProps("email")} type="email" label="Email Address" placeholder="Enter client’s email address..."  ></TextField>
                            <div className="w-full flex justify-between items-start">
                                <div>
                                    <label className="text-Text-Primary  text-[12px] font-medium">Gender</label>
                                    <div className="w-[219px] cursor-pointer h-[28px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border border-gray-50 shadow-100">
                                        <div className="text-[12px] text-gray-400">
                                            Select client’s gender...
                                        </div>
                                        <div>
                                            <img src="./icons/arrow-down-drop.svg" alt="" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-Text-Primary  text-[12px] font-medium">Age</label>
                                    <div className="w-full flex justify-between">
                                        <div className="w-[66px] h-[28px] bg-backgroundColor-Main rounded-l-[16px] border-gray-50 border">

                                        </div>
                                        <div className="w-[88px] h-[28px] bg-backgroundColor-Card border border-gray-50">

                                        </div>
                                        <div className="w-[66px] h-[28px] bg-backgroundColor-Main rounded-r-[16px] border-gray-50 border">

                                        </div>                                        
                                    </div>
                                    <div className="text-[10px] text-Text-Secondary mt-1 px-2">Enter a number between 0 and 9</div>
                                </div>
                            </div>
                            
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
                                <ButtonPrimary disabled={isLoading} onClick={submit}>
                                    Save Changes
                                </ButtonPrimary>
                            </div>
                        </div>         

                    </div>     
                </>
            }
        </div>        
        </>
    )
}

export default AddClient