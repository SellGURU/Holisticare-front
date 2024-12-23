import  Auth  from "../../api/auth";
import { useApp } from "../../hooks";
import { useNavigate,useLocation  } from "react-router-dom";
// import { Button, TextField } from "symphony-ui";
import { useFormik } from "formik";
import * as yup from "yup";
import TextField from "../../Components/TextField";
import { ButtonSecondary } from "../../Components/Button/ButtosSecondary";

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
  const appContext = useApp();
  const navigate = useNavigate();
  const location = useLocation(); // use useLocation to access the location object
  const searchParams = new URLSearchParams(location.search);
  const showSignUpLink = searchParams.get('demo') === 'true';
  // const [password, setPassword] = useState("");
  // const [showPassword, setShowPassword] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,

    onSubmit: async (values) => {
      try {
        Auth.login(values.email, values.password).then((res) => {
          console.log(res);
          appContext.login(res.data.access_token,res.data.permission);
          navigate("/");
          console.log("User registered successfully:", res.data);
        }).catch((res) => {
          // console.log(res)
          if(res.detail){
           
            if(res.detail == 'Account not found. Check your email again.'){
              formik.setFieldError("email",res.detail)
            }
            if(res.detail == 'Incorrect password. Please try again.'){
              formik.setFieldError("password",res.detail)
            }        
          }      
        
        })
      
        
    

      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
  });
    const handleSubmit = () => {
    formik.handleSubmit();

  };
  // const handleSubmit = () => {
  //   Auth.login(username, password)
  //     .then((res) => {
  //       console.log(res);
  //       appContext.login(res.data.access_token);
  //       navigate("/#/");
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // };
  return (
    <div className="w-full h-screen flex justify-center bg-backgroundColor-Main dark:bg-black-background px-12 pt-[66px] gap-20 overflow-auto ">
      <div className=" hidden md:block w-[35%] h-full self-center">
        <img src="./images/signin.svg" alt="" />
      </div>
      <div className="w-full max-w-[400px]  flex flex-col ">
        <img
          className="object-contain w-[194px] h-[130px] mx-auto "
          src="./images/holisticare.svg"
          alt=""
        />
        <div className="flex flex-col  gap-5 mt-6 ">
          <h3 className="text-2xl font-medium text-light-primary-text dark:text-primary-text">
            {" "}
            Welcome Back!
          </h3>
             <TextField {...formik.getFieldProps("email")} placeholder="Enter your email address..." label="Email Address" type="email" ></TextField> 
              <TextField {...formik.getFieldProps("password")} placeholder="Enter your password..." label="Password" type="password" ></TextField>   
            <ButtonSecondary disabled={!formik.isValid} onClick={() => {
                handleSubmit()              
            }}>
              Sign in
            </ButtonSecondary>
          {/* <TextField
            {...formik.getFieldProps("email")}
            label="Email Address"
            theme="Aurora"
            placeholder="Enter your email address..."
            name="email"
            type="email"
            errorMessage={formik.errors?.email}  
            inValid={formik.errors?.email != undefined && (formik.touched?.email as boolean)}          ></TextField>
          <TextField
            {...formik.getFieldProps("password")}
            label="Password"
            theme="Aurora"
            placeholder="Enter your password..."
            name="password"
            type="password"
            errorMessage={formik.errors?.password}  
            inValid={formik.errors?.password != undefined && (formik.touched?.password as boolean)}             ></TextField>
          <div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit()
              }}
              // disabled={isButtonDisabled}
              data-width="full"
              theme="Aurora"
            >
              Sign in
            </Button>
           <div className="text-xs text-brand-primary-color text-right mt-2 cursor-pointer">Forgot Password?</div>
          </div> */}
          <div className="flex items-center justify-center">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <span className="px-4 text-light-secandary-text dark:text-secondary-text">or</span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>

          {/* <Button
            style={{ fontSize: "14px" }}
            data-width="full"
            theme="Aurora-pro"
          >
            <img src="./Themes/Aurora/icons/Google.svg" alt="" />
            Sign in with Google
          </Button> */}
{showSignUpLink && (<div className="font-normal text-sm text-light-primary-text dark:text-primary-text">
          Don’t have an account?
            <span
              onClick={() => navigate("/register")}
              className="text-brand-primary-color cursor-pointer text-base font-medium ml-1"
            >
              Sign up
            </span>{" "}
          </div>)}
          
        </div>
      </div>
    </div>
  );
};

export default Login;
