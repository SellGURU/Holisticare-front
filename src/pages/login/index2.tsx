import { useFormik } from "formik";
import TextField from "../../Components/TextField"
import * as yup from "yup";
import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";
import Auth from "../../api/auth";
import { useApp } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BeatLoader} from "react-spinners";
import AuthLayout from "../../layout/AuthLayout";

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[@$!%*?&#]/, "Password must contain at least one special character")
    .required("Password is required"),
});

const Login = () => {
    const formik = useFormik({
        initialValues: {
        email: "",
        password: "",
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit:() => {}
    });
    const navigate = useNavigate()
    const appContext = useApp();
    const [isLoading,setIsLoading] = useState(false)
    const submit = () => {
        setIsLoading(true)
        Auth.login(formik.values.email, formik.values.password).then((res) => {
          appContext.login(res.data.access_token,res.data.permission);
          navigate("/");
        }).catch((res) => {
          if(res.detail){
            if(res.detail == 'Account not found. Check your email again.'){
              formik.setFieldError("email",res.detail)
            }
            if(res.detail == 'Incorrect password. Please try again.'){
              formik.setFieldError("password",res.detail)
            }        
          }      
        
        }).finally(() => {
            setIsLoading(false)
        })        
    }    
    return (
        <>
            <AuthLayout>
                <div className="flex justify-center items-center mb-4">
                    <img src="./icons/HolisticareLogo.svg" alt="" />
                </div>
                <div className="text-xl font-medium text-Text-Primary text-center">Welcome Back!</div>
                <div className="mt-6 grid gap-4">
                    <TextField inValid={formik.errors?.email != undefined && (formik.touched?.email as boolean)}  errorMessage={formik.errors?.email} {...formik.getFieldProps("email")} placeholder="Enter your email address..." label="Email Address" type="email" ></TextField> 
                    <div className="mb-4">
                        <TextField errorMessage={formik.errors?.password} inValid={formik.errors?.password != undefined && (formik.touched?.password as boolean)} {...formik.getFieldProps("password")} placeholder="Enter your password..." label="Password" type="password" ></TextField> 
                        <div className="w-full mt-2 flex justify-end items-center">
                            <div className="text-[12px] cursor-pointer text-Primary-DeepTeal font-medium hover:opacity-85 hover:underline">Forgot password?</div>
                        </div>

                    </div>
                    <ButtonSecondary ClassName="rounded-[20px]" disabled={!formik.isValid} onClick={() => {
                        submit()  
                    }}>
                    {isLoading ?
                        <div className="flex justify-center items-center w-full min-h-[18px]">
                            <BeatLoader size={8} color="white"></BeatLoader>

                        </div>
                    :
                    'Log in'
                    }
                    </ButtonSecondary>            
                    <div className="flex items-center justify-center mt-4">
                        <div className="flex-grow h-px bg-gradient-to-l from-Text-Triarty via-Text-Triarty to-transparent"></div>
                        <span className="px-4 text-[14px] text-Text-Secondary">or</span>
                        <div className="flex-grow h-px bg-gradient-to-r from-Text-Triarty via-Text-Triarty to-transparent"></div>
                    </div> 
          
                    <div className="text-[12px] text-center text-Text-Secondary">Don't have an account? <span className="text-Primary-DeepTeal font-medium hover:opacity-85 cursor-pointer hover:underline">Sign up</span></div>                           
                </div>                
            </AuthLayout>
        </>
    )
}

export default Login