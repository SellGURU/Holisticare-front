import { useFormik } from 'formik';
import TextField from '../../Components/TextField';
import * as yup from 'yup';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import Auth from '../../api/auth';
import { useApp } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BeatLoader } from 'react-spinners';
import AuthLayout from '../../layout/AuthLayout';
// import YoupValidation from '../../validation';
// import AuthWithGoogle from '../../Components/AuthWithGoogle';

const validationSchema = yup.object({
  email: yup.string().required('This field is required'),
  password: yup.string().required('This field is required'),
});

const Login = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {
      submit();
    },
  });
  const navigate = useNavigate();
  const appContext = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const submit = () => {
    // Mark all fields as touched to trigger validation errors
    formik.setTouched({
      email: true,
      password: true,
    });

    // Validate form and show errors
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        return;
      }

      setIsLoading(true);
      Auth.login(formik.values.email, formik.values.password)
        .then((res) => {
          appContext.login(
            res.data.access_token,
            res.data.permission,
            'admin',
            res.data.user_type,
          );
          navigate('/');
        })
        .catch((res) => {
          if (res.detail) {
            if (res.detail.includes('email')) {
              formik.setFieldError(
                'email',
                'This email address is not registered in our system.',
              );
            } else if (res.detail.includes('password')) {
              formik.setFieldError(
                'password',
                ' Incorrect password. Please try again.',
              );
            } else {
              formik.setFieldError('email', res.detail);
            }
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };
  return (
    <>
      <AuthLayout>
        <div className="flex justify-center items-center mb-4">
          <img src="./icons/HolisticareLogo.svg" alt="" />
        </div>
        <div className="text-xl font-medium text-Text-Primary text-center">
          Welcome Back!
        </div>
        <form
          id="login-form"
          className="mt-6 grid gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <TextField
            // autoComplete=""
            inValid={
              formik.errors?.email != undefined &&
              (formik.touched?.email as boolean)
            }
            errorMessage={formik.errors?.email}
            {...formik.getFieldProps('email')}
            onBlur={(e) => {
              formik.handleBlur(e);
              formik.validateField('email');
            }}
            placeholder="Enter your username..."
            label="Username "
            type="text"
          ></TextField>
          <div className="mb-4">
            <TextField
              autoComplete="current-password"
              errorMessage={formik.errors?.password}
              inValid={
                formik.errors?.password != undefined &&
                (formik.touched?.password as boolean)
              }
              {...formik.getFieldProps('password')}
              onBlur={(e) => {
                formik.handleBlur(e);
                formik.validateField('password');
              }}
              placeholder="Enter your password..."
              label="Password"
              type="password"
            ></TextField>
            {/* <div className="w-full mt-2 flex justify-end items-center">
              <div
                onClick={() => {
                  navigate('/forgetPassword');
                }}
                className="text-[12px] cursor-pointer text-Primary-DeepTeal font-medium hover:opacity-85 hover:underline"
              >
                Forgot password?
              </div>
            </div> */}
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px]"
            onClick={() => {
              if (!isLoading) {
                submit();
              }
            }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center w-full min-h-[18px]">
                <BeatLoader size={8} color="white"></BeatLoader>
              </div>
            ) : (
              'Log in'
            )}
          </ButtonSecondary>
          {/* <div className="flex items-center justify-center mt-4">
            <div className="flex-grow h-px bg-gradient-to-l from-Text-Triarty via-Text-Triarty to-transparent"></div>
            <span className="px-4 text-[14px] text-Text-Secondary">or</span>
            <div className="flex-grow h-px bg-gradient-to-r from-Text-Triarty via-Text-Triarty to-transparent"></div>
          </div> */}
          {/* <div>
            <AuthWithGoogle mode="login"></AuthWithGoogle>
          </div> */}
          {/* <div className="text-[12px] text-center text-Text-Secondary">
            Don't have an account?{' '}
            <span
              onClick={() => {
                navigate('/register');
              }}
              className="text-Primary-DeepTeal font-medium hover:opacity-85 cursor-pointer hover:underline ml-[2px]"
            >
              Sign up
            </span>
          </div> */}
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
