import React, { useState } from 'react';
// import { Auth } from "@/api";
// import { useApp } from "@/hooks";
import Auth from '../../api/auth';
import { useApp } from '../../hooks';
import { useNavigate } from 'react-router-dom';
// import { Button, TextField } from "symphony-ui";
import TextField from '../../Components/TextField';
import { useFormik } from 'formik';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import * as yup from 'yup';
const validationSchema = yup.object({
  username: yup
    .string()
    .min(4, 'username must be at least 4 characters')
    .required('Username is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(
      /[@$!%*?&#]/,
      'Password must contain at least one special character',
    )
    .required('Password is required'),
});

const SignUp: React.FC = () => {
  const appContext = useApp();

  const navigate = useNavigate();
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    validationSchema,

    onSubmit: async (values) => {
      try {
        const signupResponse = await Auth.signup(
          values.username,
          values.email,
          values.password,
        );
        console.log('User registered successfully:', signupResponse.data);

        try {
          const loginResponse = await Auth.login(values.email, values.password);
          appContext.login(
            loginResponse.data.access_token,
            loginResponse.data.permission,
          );
          console.log('User logged in successfully:', loginResponse.data);

          navigate('/');
        } catch (loginError) {
          console.error('Login failed:', loginError);
        }
      } catch (signupError) {
        console.error('Registration failed:', signupError);
      }
    },
  });
  const handleSubmit = () => {
    formik.handleSubmit();
  };
  const isButtonDisabled =
    !formik.values.username ||
    !formik.values.email ||
    !formik.values.password ||
    !checkboxChecked;
  return (
    <div className="w-full h-screen flex  justify-center dark:bg-black-background px-12 pt-[66px] gap-20 overflow-auto ">
      <div className=" h-full hidden md:block w-[40%] self-center">
        <img src="./images/signin.svg" alt="" />
      </div>
      <div className=" w-[400px]  flex flex-col -mt-10 ">
        <img
          className="object-contain w-[194px] h-[130px] mx-auto "
          src="./icons/Logo.png"
          alt=""
        />
        <div className="flex flex-col  gap-5 mt-6  ">
          <h3 className="text-2xl font-medium text-Text-Primary">
            {' '}
            Create Account!
          </h3>
          <TextField
            {...formik.getFieldProps('username')}
            label="Username"
            placeholder="Enter your username..."
            name="username"
            type="text"
            errorMessage={formik.errors?.username}
            inValid={
              formik.errors?.username != undefined &&
              (formik.touched?.username as boolean)
            }
          ></TextField>
          <TextField
            {...formik.getFieldProps('email')}
            label="Email Address"
            placeholder="Enter your email address..."
            name="email"
            type="email"
            errorMessage={formik.errors?.email}
            inValid={
              formik.errors?.email != undefined &&
              (formik.touched?.email as boolean)
            }
          ></TextField>
          <TextField
            {...formik.getFieldProps('password')}
            label="Password"
            placeholder="Enter your password..."
            name="password"
            type="password"
            errorMessage={formik.errors?.password}
            inValid={
              formik.errors?.password != undefined &&
              (formik.touched?.password as boolean)
            }
          ></TextField>
          <div className="w-full">
            <ButtonSecondary
              style={{ width: '100%' }}
              onClick={() => {
                // e.preventDefault();
                handleSubmit();
              }}
              disabled={isButtonDisabled}
            >
              Create Account
            </ButtonSecondary>
            <label
              //  onClick={() => {
              //     handleButtonClick(el)
              // }}
              htmlFor="terms"
              className="flex items-center space-x-2 cursor-pointer mt-2"
            >
              <input
                id="terms"
                type="checkbox"
                checked={checkboxChecked}
                onChange={() => setCheckboxChecked(!checkboxChecked)}
                className="hidden"
              />
              <div
                className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Primary-DeepTeal ${
                  checkboxChecked ? 'bg-Primary-DeepTeal' : ' bg-white '
                }`}
              >
                {checkboxChecked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-xs leading-6 text-Text-Primary select-none">
                I agree with
                <span className="text-brand-primary-color">
                  Terms & Conditions
                </span>{' '}
                and{' '}
                <span className="text-brand-primary-color">Privacy Policy</span>
                .
              </div>
            </label>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <span className="px-4 text-light-secandary-text dark:text-secondary-text">
              or
            </span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>

          {/* <ButtonSecondary
            style={{ fontSize: "14px" }}
            data-width="full"
          >
            <img src="./Themes/Aurora/icons/Google.svg" alt="" />
            Sign up with Google
          </ButtonSecondary> */}

          <div className="font-normal text-sm text-Text-Primary">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-Primary-EmeraldGreen cursor-pointer text-base font-medium"
            >
              Sign in
            </span>{' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
