import { useRef, useState } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextField from '../../Components/TextField';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import { useNavigate } from 'react-router-dom';
import VerificationInput from 'react-verification-input';
import './index.css';
import Timer from '../../Components/Timer';
import Application from '../../api/app';
import { BeatLoader } from 'react-spinners';
import YoupValidation from '../../validation';
import useModalAutoClose from '../../hooks/UseModalAutoClose';

const validationSchema = yup.object({
  email: YoupValidation('email'),
});

const validationSchema2 = yup.object({
  password: YoupValidation('password'),
  confirm: yup
    .string()
    .oneOf([yup.ref('password'), ''], 'Passwords must match')
    .required('Confirm Password is required'),
});
const ForgetPassword = () => {
  const [step, setStep] = useState(0);
  const [codeError, setCodeError] = useState('');
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const formik2 = useFormik({
    initialValues: {
      password: '',
      confirm: '',
    },
    validationSchema: validationSchema2,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {},
  });
  const [isCompleteCode, setIsCompleteCode] = useState(false);
  const navigate = useNavigate();
  const [codeValue, setCodeValue] = useState('');
  const [showPasswordModal, setshowPasswordModal] = useState(false);
  const passwordModalRef = useRef<HTMLDivElement | null>(null);
  const closeBtn = useRef<HTMLImageElement | null>(null);
  useModalAutoClose({
    refrence: passwordModalRef,
    buttonRefrence: closeBtn,
    close: () => setshowPasswordModal(false),
  });
  const [passwordChanged, setPasswordChanged] = useState(false);
  const resolveStep = () => {
    if (step == 0) {
      return (
        <>
          <div
            className="mt-8 text-justify text-[12px] text-Text-Secondary "
            style={{ textAlignLast: 'center' }}
          >
            Enter your email address below, and we'll send you a code to reset
            your password.
          </div>
          <div className="grid gap-8">
            <div className="mt-6">
              <TextField
                inValid={
                  formik.errors?.email != undefined &&
                  (formik.touched?.email as boolean)
                }
                errorMessage={formik.errors?.email}
                {...formik.getFieldProps('email')}
                placeholder="Enter your email address..."
                label="Email Address"
                type="email"
              ></TextField>
            </div>
            <ButtonSecondary
              onClick={() => {
                setIsLoading(true);
                Application.SendVerification({
                  email: formik.values.email,
                })
                  .then(() => {
                    setStep(1);
                  })
                  .catch((res) => {
                    if (res.detail) {
                      formik.setFieldError('email', res.detail);
                    }
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
              disabled={!formik.isValid || formik.values.email.length == 0}
              ClassName="rounded-[20px]"
            >
              {isLoading ? (
                <div className="flex justify-center items-center w-full min-h-[18px]">
                  <BeatLoader size={8} color="white"></BeatLoader>
                </div>
              ) : (
                'Send Code'
              )}
            </ButtonSecondary>

            <div className="flex justify-center items-center gap-1">
              <img
                className="w-5 cursor-pointer"
                src="./icons/arrow-back.svg"
                alt=""
              />
              <div
                onClick={() => {
                  navigate('/login');
                }}
                className="text-[12px] cursor-pointer hover:opacity-90 font-medium text-Primary-DeepTeal"
              >
                Back to log in
              </div>
            </div>
          </div>
        </>
      );
    }
    if (step == 1) {
      return (
        <div className="grid">
          <div
            className="mt-8 text-justify text-[12px] text-Text-Secondary "
            style={{ textAlignLast: 'center' }}
          >
            We have sent a code to{' '}
            <span className="text-Text-Primary">{formik.values.email}.</span>{' '}
            Please enter the code in the field below to proceed.
          </div>
          <div className="mt-8">
            <VerificationInput
              placeholder=""
              value={codeValue}
              onChange={(val) => {
                setCodeValue(val);
                setCodeError('');
              }}
              classNames={{
                container: 'vari-container',
                character: 'vari-character',
                characterInactive: 'vari-character--inactive',
                characterSelected: 'vari-character--selected',
                characterFilled: 'vari-character--filled',
              }}
              length={4}
            />
            {codeError && (
              <div className="text-Red text-[10px] mt-6 text-center">
                {codeError}
              </div>
            )}
          </div>
          {isCompleteCode ? (
            <div
              onClick={() => {
                Application.SendVerification({
                  email: formik.values.email,
                });
                setIsCompleteCode(false);
              }}
              className="text-[12px] text-Primary-EmeraldGreen font-medium  mt-10 text-center cursor-pointer"
            >
              Resend Code
            </div>
          ) : (
            <div className="text-[12px] flex justify-center items-center gap-1 text-Text-Secondary mt-10 text-center">
              Resend Code in{' '}
              <Timer
                initialMinute={2}
                initialSeconds={0}
                oncomplete={() => {
                  setIsCompleteCode(true);
                }}
              ></Timer>
            </div>
          )}
          <div className="mt-8 w-full grid">
            <ButtonSecondary
              onClick={() => {
                setIsLoading(true);
                Application.varifyCode({
                  email: formik.values.email,
                  reset_code: codeValue,
                })
                  .then(() => {
                    setStep(2);
                  })
                  .catch((error) => {
                    if (error.detail) {
                      setCodeError(error.detail);
                    }
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
              disabled={codeValue.length < 4}
              ClassName="rounded-[20px]"
            >
              {isLoading ? (
                <div className="flex justify-center items-center w-full min-h-[18px]">
                  <BeatLoader size={8} color="white"></BeatLoader>
                </div>
              ) : (
                'Confirm Code'
              )}
            </ButtonSecondary>
          </div>
          <div className="flex justify-center items-center gap-1 mt-5">
            <img
              className="w-5 cursor-pointer"
              src="./icons/arrow-back.svg"
              alt=""
            />
            <div
              onClick={() => {
                navigate('/login');
              }}
              className="text-[12px] cursor-pointer hover:opacity-90 font-medium text-Primary-DeepTeal"
            >
              Back to log in
            </div>
          </div>
        </div>
      );
    }
    if (step == 2) {
      return (
        <>
          <div className="grid gap-8">
            <div
              className="mt-8 text-justify text-[12px] text-Text-Secondary "
              style={{ textAlignLast: 'center' }}
            >
              Set a new password. It must be strong to ensure your security.
            </div>
            <div className="mb-4 relative">
              <TextField
                errorMessage={formik2.errors?.password}
                inValid={
                  formik2.errors?.password != undefined &&
                  (formik2.touched?.password as boolean)
                }
                {...formik2.getFieldProps('password')}
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
            <div className="">
              <TextField
                errorMessage={formik2.errors?.confirm}
                inValid={
                  formik2.errors?.confirm != undefined &&
                  (formik2.touched?.confirm as boolean)
                }
                {...formik2.getFieldProps('confirm')}
                placeholder="Confirm password ...."
                label="Confirm Password"
                type="password"
              ></TextField>
            </div>
            <ButtonSecondary
              disabled={!formik2.isValid || formik2.values.password.length == 0}
              onClick={() => {
                setIsLoading(true);
                Application.ChangePassword({
                  email: formik.values.email,
                  password: formik2.values.password,
                })
                  .then(() => {
                    setPasswordChanged(true);
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
              ClassName="rounded-[20px]"
            >
              {isLoading ? (
                <div className="flex justify-center items-center w-full min-h-[18px]">
                  <BeatLoader size={8} color="white"></BeatLoader>
                </div>
              ) : (
                'Reset password'
              )}
            </ButtonSecondary>
            <div className="flex justify-center items-center gap-1 ">
              <img
                className="w-5 cursor-pointer"
                src="./icons/arrow-back.svg"
                alt=""
              />
              <div
                onClick={() => {
                  navigate('/login');
                }}
                className="text-[12px] cursor-pointer hover:opacity-90 font-medium text-Primary-DeepTeal"
              >
                Back to log in
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <>
      <AuthLayout>
        {passwordChanged ? (
          <>
            <div className="grid">
              <div className="flex justify-center items-center mb-4">
                <img src="./icons/HolisticareLogo.svg" alt="" />
              </div>
              <div className="text-Text-Primary mb-8 font-medium text-center">
                Password has been successfully reset!
              </div>
              <ButtonSecondary
                onClick={() => {
                  navigate('/login');
                }}
                ClassName="rounded-[20px]"
              >
                Log in
              </ButtonSecondary>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center items-center mb-4">
              <img src="./icons/HolisticareLogo.svg" alt="" />
            </div>
            <div className="text-xl font-medium text-Text-Primary text-center">
              {step == 2 ? 'Set a New Password' : 'Forgot password?'}
            </div>

            <div className="flex justify-between gap-2 items-center mt-8">
              <div
                className={`w-1/3 h-1  rounded-[6px] ${step == 0 ? 'bg-Primary-DeepTeal' : 'bg-backgroundColor-Card'}`}
              ></div>
              <div
                className={`w-1/3 h-1  rounded-[6px] ${step == 1 ? 'bg-Primary-DeepTeal' : 'bg-backgroundColor-Card'}`}
              ></div>
              <div
                className={`w-1/3 h-1  rounded-[6px] ${step == 2 ? 'bg-Primary-DeepTeal' : 'bg-backgroundColor-Card'}`}
              ></div>
            </div>
            <div>{resolveStep()}</div>
          </>
        )}
      </AuthLayout>
    </>
  );
};

export default ForgetPassword;
