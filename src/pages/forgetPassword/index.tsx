import { useState } from "react"
import AuthLayout from "../../layout/AuthLayout"
import { useFormik } from "formik"
import * as yup from "yup";
import TextField from "../../Components/TextField";
import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";
import { useNavigate } from "react-router-dom";
import VerificationInput from "react-verification-input";
import './index.css';
import Timer from "../../Components/Timer";
import Application from "../../api/app";

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

const validationSchema2 = yup.object({
  password: yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[@$!%*?&#]/, "Password must contain at least one special character")
    .required("Password is required"),
});
const ForgetPassword = () => {
    const [step,setStep] = useState(0)
    const formik = useFormik({
        initialValues: {
        email: "",
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit:() => {}
    });    
    const formik2 = useFormik({
        initialValues: {
            password: "",
            confirm:""
        },
        validationSchema:validationSchema2,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit:() => {}
    });       
    const [isCompleteCode,setIsCompleteCode] = useState(false)
    const navigate = useNavigate()
    const [codeValue,setCodeValue] = useState("")
    const resolveStep = () => {
        if(step == 0) {
            return <>
                <div className="mt-8 text-justify text-[12px] text-Text-Secondary " style={{textAlignLast:'center'}} >
                    Enter your email address below, and we’ll send you a link to reset your password.
                </div>
                <div className="grid gap-8">
                    <div className="mt-6">
                        <TextField inValid={formik.errors?.email != undefined && (formik.touched?.email as boolean)}  errorMessage={formik.errors?.email} {...formik.getFieldProps("email")} placeholder="Enter your email address..." label="Email Address" type="email" ></TextField> 
                    </div>
                    <ButtonSecondary onClick={() => {
                        Application.SendVerification({
                            email:formik.values.email
                        }).then(() => {
                            setStep(1)

                        })
                    }} disabled={!formik.isValid || formik.values.email.length == 0} ClassName="rounded-[20px]" >
                        Send Code
                    </ButtonSecondary>

                    <div className="flex justify-center items-center gap-1">
                        <img className="w-5 cursor-pointer" src="./icons/arrow-back.svg" alt="" />
                        <div onClick={() => {
                            navigate('/login')
                        }} className="text-[12px] cursor-pointer hover:opacity-90 font-medium text-Primary-DeepTeal">Back to log in</div>
                    </div>

                </div>
            </>
        }
        if(step == 1) {
            return (
                <div className="grid">
                    <div className="mt-8 text-justify text-[12px] text-Text-Secondary " style={{textAlignLast:'center'}} >
                        We have sent a code to <span className="text-Text-Primary">{formik.values.email}.</span> Please enter the code in the field below to proceed.
                    </div>            
                    <div className="mt-8">
                        <VerificationInput value={codeValue} onChange={(val) => {
                            setCodeValue(val)
                        }} classNames={{
                                container: "vari-container",
                                character: "vari-character",
                                characterInactive: "vari-character--inactive",
                                characterSelected: "vari-character--selected",
                                characterFilled: "vari-character--filled",
                        }} length={4} />    
                    </div>    
                    {isCompleteCode ?
                    <div onClick={() => {
                        Application.SendVerification({
                            email:formik.values.email
                        })
                        setIsCompleteCode(false)
                    }} className="text-[12px] text-Primary-EmeraldGreen font-medium  mt-10 text-center cursor-pointer">
                        Resend Code
                    </div>
                    :
                    <div className="text-[12px] flex justify-center items-center gap-1 text-Text-Secondary mt-10 text-center">Resend Code in <Timer initialMinute={2} initialSeconds={30} oncomplete={() => {
                        setIsCompleteCode(true)
                    }}></Timer></div>
                    }
                    <div className="mt-8 w-full grid">
                        <ButtonSecondary  onClick={() => {
                            Application.varifyCode({
                                email:formik.values.email,
                                reset_code:codeValue
                            }).then(() => {
                                setStep(2)
                            })
                        }} disabled={codeValue.length<4} ClassName="rounded-[20px]" >
                            Confirm Code
                        </ButtonSecondary>                    

                    </div>
                </div>                
            )
        }
        if(step == 2) {
            return (
                <>
                    <div className="grid gap-8">
                        <div className="mt-8 text-justify text-[12px] text-Text-Secondary " style={{textAlignLast:'center'}} >
                           Set a new password. It must be at least 8 characters long.
                        </div>       
                        <div className="">
                            <TextField errorMessage={formik2.errors?.password} inValid={formik2.errors?.password != undefined && (formik2.touched?.password as boolean)} {...formik2.getFieldProps("password")} placeholder="Enter your password..." label="Password" type="password" ></TextField>
                        </div>  
                        <div className="">
                            <TextField errorMessage={formik2.errors?.confirm} inValid={formik2.errors?.confirm != undefined && (formik2.touched?.confirm as boolean)} {...formik2.getFieldProps("confirm")} placeholder="Confirm password ...." label="Confirm Password" type="password" ></TextField>  
                        </div>     
                        <ButtonSecondary onClick={() => {
                            
                        }} ClassName="rounded-[20px]" >
                            Reset password
                        </ButtonSecondary>                
                    </div>
                </>
            )
        }
    }
    
    return (
        <>
            <AuthLayout>
                <div className="flex justify-center items-center mb-4">
                    <img src="./icons/HolisticareLogo.svg" alt="" />
                </div>
                <div className="text-xl font-medium text-Text-Primary text-center">Forgot password?</div>

                <div className="flex justify-between gap-2 items-center mt-8">
                    <div className={`w-1/3 h-1  rounded-[6px] ${step==0 ? 'bg-Primary-DeepTeal':'bg-backgroundColor-Card'}`}></div>
                    <div className={`w-1/3 h-1  rounded-[6px] ${step==1 ? 'bg-Primary-DeepTeal':'bg-backgroundColor-Card'}`}></div>
                    <div className={`w-1/3 h-1  rounded-[6px] ${step==2 ? 'bg-Primary-DeepTeal':'bg-backgroundColor-Card'}`}></div>
                </div>
                <div>
                    {resolveStep()}
                </div>
            </AuthLayout>
        </>
    )
}

export default ForgetPassword