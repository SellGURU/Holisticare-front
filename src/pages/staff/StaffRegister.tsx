import { useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import AuthLayout from '../../layout/AuthLayout';
import TextField from '../../Components/TextField';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import YoupValidation from '../../validation';
import Auth from '../../api/auth';
import { useApp } from '../../hooks';

const validationSchema = yup.object({
  password: YoupValidation('password'),
  confirm: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), ''], 'Passwords must match'),
});

type VerifyState =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; email: string; fullName: string; clinicName: string };

const StaffRegister = () => {
  const navigate = useNavigate();
  const appContext = useApp();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [verifyState, setVerifyState] = useState<VerifyState>({
    status: 'loading',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const formik = useFormik({
    initialValues: {
      password: '',
      confirm: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {
      submit();
    },
  });

  useEffect(() => {
    const urlToken = searchParams.get('token')?.trim() || '';
    if (!urlToken) {
      setVerifyState({
        status: 'invalid',
        message:
          'This registration link is invalid. Please ask your clinic admin to send a new invitation.',
      });
      return;
    }

    setToken(urlToken);
    setVerifyState({ status: 'loading' });

    Auth.verifyStaffInvitation(urlToken)
      .then((res) => {
        setVerifyState({
          status: 'ready',
          email: res.data.email,
          fullName: res.data.full_name,
          clinicName: res.data.clinic_name,
        });
        window.history.replaceState({}, '', '/staff/register');
      })
      .catch((error) => {
        setVerifyState({
          status: 'invalid',
          message:
            error?.detail ||
            'This invitation link is invalid or has expired. Please ask your clinic admin to send a new invitation.',
        });
      });
  }, [searchParams]);

  const submit = () => {
    if (verifyState.status !== 'ready' || !token) {
      return;
    }

    formik.setTouched({
      password: true,
      confirm: true,
    });

    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        return;
      }

      setSubmitError('');
      setIsLoading(true);
      Auth.registerStaff(
        token,
        formik.values.password,
        formik.values.confirm,
      )
        .then(() => Auth.login(verifyState.email, formik.values.password))
        .then((res) => {
          appContext.login(
            res.data.access_token,
            res.data.permission,
            verifyState.email,
            res.data.account_role,
          );
          navigate('/');
        })
        .catch((error) => {
          const detail = error?.detail;
          if (typeof detail === 'string') {
            if (detail.toLowerCase().includes('password')) {
              formik.setFieldError('password', detail);
              formik.setFieldTouched('password', true, false);
            } else {
              setSubmitError(detail);
            }
          } else {
            setSubmitError('Registration failed. Please try again.');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const renderBody = () => {
    if (verifyState.status === 'loading') {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <BeatLoader size={10} color="#005F73" />
        </div>
      );
    }

    if (verifyState.status === 'invalid') {
      return (
        <div className="mt-6 text-center text-[12px] text-Text-Secondary leading-6">
          {verifyState.message}
        </div>
      );
    }

    return (
      <form
        id="staff-register-form"
        className="mt-6 grid gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <TextField
          value={verifyState.fullName}
          label="Full name"
          type="text"
          disabled
          readOnly
        />
        <TextField
          value={verifyState.email}
          label="Email Address"
          type="email"
          disabled
          readOnly
        />
        <div className="mb-4 relative">
          <TextField
            autoComplete="new-password"
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
          />
          <img
            data-tooltip-id="staff-password-modal"
            className="w-2 h-2 absolute top-0 left-[60px] cursor-pointer object-contain"
            src="/icons/user-navbar/info-circle.svg"
            alt=""
          />
          <Tooltip
            className="!bg-white !w-[284px] !rounded-md !border !border-Gray-50 !p-[10px] !bg-opacity-100 !opacity-100 !shadow-200"
            place="top"
            id="staff-password-modal"
          >
            <ul className=" list-disc text-[#888888] text-[10px] leading-5 text-justify px-[10px] select-none">
              <li>
                At least 8 characters.(Use Uppercase & Lowercase letters,
                Numbers and Special characters)
              </li>
              <li>Avoid using personal information or patterns.</li>
            </ul>
          </Tooltip>
        </div>
        <TextField
          autoComplete="new-password"
          errorMessage={formik.errors?.confirm}
          inValid={
            formik.errors?.confirm != undefined &&
            (formik.touched?.confirm as boolean)
          }
          {...formik.getFieldProps('confirm')}
          onBlur={(e) => {
            formik.handleBlur(e);
            formik.validateField('confirm');
          }}
          placeholder="Confirm your password..."
          label="Confirm Password"
          type="password"
        />
        {submitError ? (
          <div className="text-[12px] text-red-500 text-center">{submitError}</div>
        ) : null}
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
              <BeatLoader size={8} color="white" />
            </div>
          ) : (
            'Complete Registration'
          )}
        </ButtonSecondary>
      </form>
    );
  };

  const subtitle =
    verifyState.status === 'ready'
      ? `Join ${verifyState.clinicName} by creating your password.`
      : 'Complete your staff registration';

  return (
    <AuthLayout>
      <div className="flex justify-center items-center mb-4">
        <img src="./icons/HolisticareLogo.svg" alt="" />
      </div>
      <div className="text-xl font-medium text-Text-Primary text-center">
        Complete Your Registration
      </div>
      <div className="text-[12px] text-Text-Secondary text-center mt-2">
        {subtitle}
      </div>
      {renderBody()}
      <div className="text-[12px] text-center text-Text-Secondary mt-6">
        Already have an account?
        <span
          onClick={() => navigate('/login')}
          className="text-Primary-DeepTeal font-medium hover:opacity-85 cursor-pointer hover:underline ml-[6px]"
        >
          Log in
        </span>
      </div>
    </AuthLayout>
  );
};

export default StaffRegister;
