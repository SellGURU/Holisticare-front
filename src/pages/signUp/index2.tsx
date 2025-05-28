import { BeatLoader } from 'react-spinners';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import TextField from '../../Components/TextField';
import AuthLayout from '../../layout/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useRef, useState } from 'react';
import Auth from '../../api/auth';
import { useApp } from '../../hooks';
import YoupValidation from '../../validation';
import AuthWithGoogle from '../../Components/AuthWithGoogle';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

const validationSchema = yup.object({
  email: YoupValidation('email'),
  password: YoupValidation('password'),
  userName: yup
    .string()
    .required('This field is required')
    .matches(/^[A-Za-z\s]+$/, 'Full name must only contain letters and spaces')
    .test('two-words', 'Full name must contain at least 2 words', (value) => {
      if (!value) return false;
      const words = value.trim().split(/\s+/);
      return words.length >= 2;
    }),
});
const SignUp = () => {
  const navigate = useNavigate();
  const appContext = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      userName: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {
      submit();
    },
  });
  const submit = () => {
    // Mark all fields as touched to trigger validation errors
    formik.setTouched({
      email: true,
      password: true,
      userName: true,
    });

    // Validate form and show errors
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        return;
      }

      setIsLoading(true);
      Auth.signup(
        formik.values.userName,
        formik.values.email,
        formik.values.password,
      )
        .then(() => {
          return Auth.login(formik.values.email, formik.values.password);
        })
        .then((res) => {
          appContext.login(res.data.access_token, res.data.permission);
          navigate('/');
        })
        .catch((error) => {
          if (error.detail.includes('email')) {
            formik.setErrors({
              email: 'This email is already registered in our system.',
            });
            formik.setFieldTouched('email', true, false);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const [showPasswordModal, setshowPasswordModal] = useState(false);
  const passwordModalRef = useRef<HTMLDivElement | null>(null);
  const closeBtn = useRef<HTMLImageElement | null>(null);
  useModalAutoClose({
    refrence: passwordModalRef,
    buttonRefrence: closeBtn,
    close: () => setshowPasswordModal(false),
  });
  return (
    <>
      <AuthLayout>
        <div className="flex justify-center items-center mb-4">
          <img src="./icons/HolisticareLogo.svg" alt="" />
        </div>
        <div className="text-xl font-medium text-Text-Primary text-center">
          Create Your Account
        </div>
        <div className="mt-6 grid gap-4">
          <TextField
            inValid={
              formik.errors?.userName != undefined &&
              (formik.touched?.userName as boolean)
            }
            errorMessage={formik.errors?.userName}
            {...formik.getFieldProps('userName')}
            onBlur={(e) => {
              formik.handleBlur(e);
              formik.validateField('userName');
            }}
            placeholder="Enter your full name..."
            label="Full name"
            type="text"
          ></TextField>
          <TextField
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
            placeholder="Enter your email address..."
            label="Email Address"
            type="email"
          ></TextField>
          <div className="mb-4 relative">
            <TextField
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
            <img
              ref={closeBtn}
              onMouseEnter={() => setshowPasswordModal(true)}
              onMouseLeave={() => setshowPasswordModal(false)}
              onClick={() => setshowPasswordModal(true)}
              className="w-2 h-2 absolute top-0 left-[60px] cursor-pointer object-contain"
              src="/icons/user-navbar/info-circle.svg"
              alt=""
            />
            {showPasswordModal && (
              <div
                ref={passwordModalRef}
                className="absolute top-2 left-[70px] bg-white rounded-md border border-Gray-50 p-[10px] shadow-200"
              >
                <ul className="space-y-2 list-disc text-Text-Secondary text-[8px] leading-5 text-justify px-[10px] select-none">
                  <li>
                    At least 8 characters.(Use Uppercase & Lowercase letters,
                    Numbers and Special characters)
                  </li>
                  <li>Avoid using personal information or patterns.</li>
                </ul>
              </div>
            )}
          </div>
          <ButtonSecondary
            ClassName="rounded-[20px]"
            // disabled={!formik.isValid || formik.values.userName.length == 0}
            onClick={() => {
              submit();
            }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center w-full min-h-[18px]">
                <BeatLoader size={8} color="white"></BeatLoader>
              </div>
            ) : (
              'Sign up'
            )}
          </ButtonSecondary>
          <div className="text-[10px] text-Text-Secondary text-center mt-[-10px]">
            By signing up you agreed with our{' '}
            <span
              className="text-Primary-DeepTeal cursor-pointer hover:underline hover:opacity-90"
              onClick={() => {
                window.open('https://holisticare.io/terms-of-service/');
              }}
            >
              Terms & Conditions.
            </span>{' '}
          </div>
          <div className="flex items-center justify-center mt-4">
            <div className="flex-grow h-px bg-gradient-to-l from-Text-Triarty via-Text-Triarty to-transparent"></div>
            <span className="px-4 text-[14px] text-Text-Secondary">or</span>
            <div className="flex-grow h-px bg-gradient-to-r from-Text-Triarty via-Text-Triarty to-transparent"></div>
          </div>
          <div>
            <AuthWithGoogle mode="register"></AuthWithGoogle>
          </div>
          <div className="text-[12px] text-center text-Text-Secondary">
            Already have an account?
            <span
              onClick={() => {
                navigate('/login');
              }}
              className="text-Primary-DeepTeal  font-medium hover:opacity-85 cursor-pointer hover:underline ml-[6px]"
            >
              Log in
            </span>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default SignUp;
