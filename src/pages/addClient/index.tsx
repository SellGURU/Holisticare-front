/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Application from '../../api/app';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import MainTopBar from '../../Components/MainTopBar';
import SimpleDatePicker from '../../Components/SimpleDatePicker';
import SpinnerLoader from '../../Components/SpinnerLoader';
import TextField from '../../Components/TextField';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import YoupValidation from '../../validation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CustomTimezoneField from '../../Components/CustomTimezoneField/CustomTimezoneField';
import { allTimezones } from 'react-timezone-select';

const AddClient = () => {
  const [showValidation, setShowValidation] = useState(false);
  const [apiError, setApiError] = useState('');
  const [dobApiError, setDobApiError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const validationSchema = yup.object({
    age: yup.number().min(12).max(60),
    email: YoupValidation('email'),
    firstName: yup
      .string()
      .required('This field is required.')
      .matches(
        /^[A-Za-z\u0600-\u06FF\s]+$/,
        'First name must only contain letters.',
      ),
    lastName: yup
      .string()
      .required('This field is required.')
      .matches(
        /^[A-Za-z\u0600-\u06FF\s]+$/,
        'Last name must only contain letters.',
      ),
    gender: yup
      .string()
      .notOneOf(['unset'], 'This field is required.')
      .required(),
    timeZone: yup
      .string()
      .nullable()
      .test(
        'valid-timezone',
        'Please select a valid time zone.',
        function (value) {
          if (!value) return true; // empty is allowed
          return Object.keys(allTimezones).includes(value);
        },
      ),
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 30,
      gender: 'unset',
      phone: '',
      timeZone: '',
      address: '',
    },
    validationSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: () => {
      submit();
      // Logic for submission
    },
  });

  const selectRef = useRef(null);
  const selectButRef = useRef(null);
  const [showSelect, setShowSelect] = useState(false);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });

  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  const convertToBase64 = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          name: file.name,
          url: base64,
          type: file.type,
          size: file.size,
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const [photo, setPhoto] = useState('');
  const [memberId, setMemberID] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const validateDate = (date: any) => {
    return !isNaN(date.getTime()); // Returns true if it's a valid date
  };
  const submit = () => {
    setShowValidation(true);
    if (!formik.isValid) {
      return;
    }
    setisLoading(true);

    Application.addClient({
      first_name: formik.values.firstName,
      email: formik.values.email,
      last_name: formik.values.lastName,
      picture: photo,
      date_of_birth: dateOfBirth,
      gender: formik.values.gender,
      wearable_devices: [],
      timezone: formik.values.timeZone,
      address: formik.values.address,
      phone_number: '+' + formik.values.phone,
    })
      .then((res) => {
        setIsAdded(true);
        setMemberID(res.data.member_id);
      })
      .catch((error) => {
        console.log(error);
        setDobApiError('');
        setApiError('');
        const errorDetail = error?.detail;
        if (errorDetail === 'Client must be at least 18 years old.') {
          setDobApiError('Client must be at least 18 years old.');
        }
        if (errorDetail === 'Client already exists.') {
          setApiError('An account with this email address already exists.');
        }
      })
      .finally(() => {
        setisLoading(false);
      });
  };
  const handleSaveClick = () => {
    setShowValidation(true);
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        // If there are validation errors, just show them without submitting
        return;
      }
      // Only submit if there are no validation errors
      formik.handleSubmit();
    });
  };
  useEffect(() => {
    if (apiError) {
      setApiError('');
    }
  }, [formik.values.email]);
  const [dobTouched, setDobTouched] = useState(false);

  return (
    <>
      {/* {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )} */}
      <div className="w-full hidden md:block sticky z-50 top-0 ">
        <MainTopBar></MainTopBar>
      </div>
      <div className="w-full p-2 xs:p-4 sm:p-6 md:p-8 h-[100vh] ">
        {isAdded ? (
          <>
            <div className="w-full flex justify-center items-center h-[80vh]">
              <div className="  w-[95vw] md:w-[468px] h-fit sm:h-[324px] bg-white rounded-[16px] border border-Gray-50 shadow-200 p-2 sm:p-0">
                <div className="w-full flex justify-center md:mt-8">
                  <img src="/icons/tick-circle-background-new.svg" alt="" />
                </div>
                <div className="">
                  <div className="text-center  font-medium text-[10px] xs:text-xs md:text-[14px] text-Text-Primary">
                    The client has been successfully saved!
                  </div>
                  <div className="flex justify-center">
                    <div
                      style={{ textAlignLast: 'center' }}
                      className="text-justify w-[90%] md:text-xs text-[10px] text-Text-Primary mt-2 leading-6"
                    >
                      To set up their profile or monitor their progress, please
                      navigate to the client’s Health Plan. Here, you can view
                      detailed insights and track all updates to ensure their
                      wellness journey is progressing smoothly.
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap w-full justify-center xs:justify-between items-center px-2 md:px-8 mt-4">
                    <ButtonPrimary
                      ClassName="px-4 md:px-8 py-2 w-[188px]"
                      // style={{

                      //   paddingRight: '32px',
                      //   paddingLeft: '32px',
                      //   paddingTop: '8px',
                      //   paddingBottom: '8px',
                      // }}
                      size="normal"
                      onClick={() => {
                        // setIsAdded(false);
                        // formik.resetForm();
                        // setPhoto('');
                        navigate('/');
                      }}
                      outLine
                    >
                      <img
                        src={'/icons/arrow-back.svg'}
                        className={'h-4 w-4'}
                      />
                      <div className=" text-nowrap text-[10px] md:text-xs  ">
                        Back to Client List
                      </div>
                    </ButtonPrimary>
                    <ButtonPrimary
                      // style={{
                      //   paddingRight: '32px',
                      //   paddingLeft: '32px',
                      //   paddingTop: '8px',
                      //   paddingBottom: '8px',
                      // }}
                      ClassName="px-4 md:px-8 py-2 w-[188px] md:w-[200px]"
                      size="normal"
                      onClick={() => {
                        navigate(
                          '/report/' +
                            memberId +
                            '/' +
                            formik.values.firstName +
                            formik.values.lastName,
                        );
                      }}
                    >
                      <img src={'/icons/tick.svg'} className={'h-4 w-4'} />
                      <div className=" text-nowrap text-[10px] md:text-xs  ">
                        Develop Health Plan
                      </div>
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 ">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    navigate(-1);
                  }}
                  className={`px-[6px] py-[3px] flex items-center justify-center cursor-pointer bg-white border border-Gray-50 rounded-md shadow-100`}
                >
                  <img className="w-6 h-6" src="/icons/arrow-back.svg" />
                </div>
                <div className="TextStyle-Headline-5 text-Text-Primary">
                  Add New Client
                </div>
              </div>
            </div>

            <div className="flex justify-center w-full max-h-[80%] overflow-y-auto overflow-x-hidden">
              <div className="md:max-w-[360px] w-full grid pt-3 md:pt-0">
                <div className="">
                  <div className="w-full flex gap-4 mb-4 md:gap-0 flex-col md:flex-row justify-between items-start md:overflow-visible md:h-[50px]">
                    <div className="w-full md:w-[220px]">
                      <TextField
                        type="text"
                        {...formik.getFieldProps('firstName')}
                        label="First Name"
                        onBlur={formik.handleBlur}
                        placeholder="Enter first name"
                        inValid={Boolean(
                          (formik.touched.firstName || showValidation) &&
                            formik.errors.firstName,
                        )}
                      />
                      {Boolean(
                        (formik.touched.firstName || showValidation) &&
                          formik.errors.firstName,
                      ) && (
                        <div className="text-Red text-[10px] -mt-[2px]">
                          {formik.errors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-[220px]">
                      <TextField
                        type="text"
                        {...formik.getFieldProps('lastName')}
                        onBlur={formik.handleBlur}
                        label="Last Name"
                        placeholder="Enter last name"
                        inValid={Boolean(
                          (formik.touched.lastName || showValidation) &&
                            formik.errors.lastName,
                        )}
                      />
                      {Boolean(
                        (formik.touched.lastName || showValidation) &&
                          formik.errors.lastName,
                      ) && (
                        <div className="text-Red text-[10px] -mt-[2px]">
                          {formik.errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:h-[50px] overflow-visible">
                    <div className=" w-full relative md:h-[28px] overflow-visible mb-4">
                      <label className="text-Text-Primary text-[12px] font-medium">
                        Gender
                      </label>
                      <div
                        ref={selectButRef}
                        onClick={() => {
                          formik.setFieldTouched('gender', true);
                          setShowSelect(!showSelect);
                        }}
                        className={` w-full   md:w-[219px] cursor-pointer h-[32px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border ${
                          Boolean(
                            (formik.touched.gender || showValidation) &&
                              formik.errors.gender,
                          ) && 'border-Red'
                        }`}
                      >
                        {formik.values.gender !== 'unset' ? (
                          <div className="text-[12px] text-Text-Primary">
                            {formik.values.gender}
                          </div>
                        ) : (
                          <div className="text-[12px] text-[#B0B0B0] font-light">
                            Select gender
                          </div>
                        )}
                        <div>
                          <img
                            className={`${showSelect && 'rotate-180'}`}
                            src="/icons/arow-down-drop.svg"
                            alt=""
                          />
                        </div>
                      </div>
                      {showSelect && (
                        <div
                          ref={selectRef}
                          className="w-full z-20 shadow-200 p-2 rounded-[12px] absolute bg-white border-gray-50 top-[58px]"
                        >
                          <div
                            onClick={() => {
                              formik.setFieldValue('gender', 'Male');
                              setShowSelect(false);
                            }}
                            className="text-[12px] cursor-pointer text-Text-Primary py-1 border-b border-gray-100"
                          >
                            Male
                          </div>
                          <div
                            onClick={() => {
                              formik.setFieldValue('gender', 'Female');
                              setShowSelect(false);
                            }}
                            className="text-[12px] cursor-pointer text-Text-Primary py-1"
                          >
                            Female
                          </div>
                        </div>
                      )}
                      {Boolean(
                        (formik.touched.gender || showValidation) &&
                          formik.errors.gender,
                      ) && (
                        <div className="text-Red text-[10px] font-medium mt-[2px]">
                          {formik.errors.gender}
                        </div>
                      )}
                    </div>

                    <div className="w-full  md:ml-2 ">
                      <label className="text-Text-Primary text-[12px] font-medium">
                        Date of Birth
                      </label>
                      <div
                        className={`rounded-[16px] flex-grow h-[32px] w-full px-2 py-1 bg-backgroundColor-Card border ${
                          (dobTouched || showValidation) &&
                          (dateOfBirth == null || !!dobApiError)
                            ? 'border-Red'
                            : 'border-Gray-50'
                        }  shadow-100 items-center justify-between text-[10px] text-Text-Secondary`}
                      >
                        <SimpleDatePicker
                          placeholder="Select date of birth"
                          isAddClient
                          date={dateOfBirth}
                          setDate={(date) => {
                            if (validateDate(date)) {
                              setDateOfBirth(date);
                              setDobApiError('');
                            }
                          }}
                          inValid={
                            ((dobTouched || showValidation) &&
                              dateOfBirth == null) ||
                            ((dobTouched || showValidation) && !!dobApiError)
                          }
                          errorMessage={
                            (dobTouched || showValidation) &&
                            (dateOfBirth == null || dobApiError)
                              ? dateOfBirth == null
                                ? 'This field is required.'
                                : dobApiError
                              : ''
                          }
                          onManualOpen={() => setDobTouched(true)}
                        />
                      </div>
                    </div>
                    <div></div>
                  </div>
                  <TextField
                    {...formik.getFieldProps('email')}
                    type="email"
                    label="Email Address"
                    errorMessage={
                      (formik.touched.email || showValidation) &&
                      (formik.errors.email || apiError)
                        ? formik.errors.email || apiError
                        : ''
                    }
                    inValid={Boolean(
                      ((formik.touched.email || showValidation) &&
                        formik.errors.email) ||
                        ((formik.touched.email || showValidation) && apiError),
                    )}
                    placeholder="Enter an email (e.g. test@example.com)"
                  />
                  <div>
                    <div className="w-full mb-3 mt-2 flex flex-col md:flex-row justify-between items-center gap-2 md:h-[50px] overflow-visible">
                      <div className="w-full">
                        <label className="text-[12px] text-Text-Primary font-medium">
                          Phone Number
                        </label>
                        <div className="mt-1">
                          <PhoneInput
                            country={'us'}
                            value={formik.values.phone}
                            onChange={(value) =>
                              formik.setFieldValue('phone', value)
                            }
                            placeholder="234 567 890"
                            containerClass="custom-phone-input"
                            buttonClass="custom-phone-button"
                            dropdownClass="custom-phone-dropdown"
                            inputProps={{
                              name: 'phone',
                              required: false,
                              autoFocus: false,
                            }}
                          />
                        </div>
                      </div>

                      {/* Time Zone */}
                      <div className="w-full">
                        <label className="text-[12px] text-Text-Primary font-medium">
                          Time Zone
                        </label>
                        <div className="mt-[3px]">
                          <CustomTimezoneField
                            value={formik.values.timeZone}
                            onChange={(tz) => {
                              formik.setFieldTouched('timeZone', true);
                              formik.setFieldValue(
                                'timeZone',
                                tz?.value || tz || '',
                              );
                            }}
                          />
                          {(formik.touched.timeZone || showValidation) &&
                            formik.errors.timeZone && (
                              <div className="text-Red text-[10px] mt-[2px]">
                                {formik.errors.timeZone}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Address */}
                    <div className="flex flex-col gap-1 text-[12px] text-Text-Primary font-medium mb-3">
                      Address{' '}
                      <textarea
                        placeholder="Enter client’s address (e.g., 221B Baker Street, London)"
                        className=" w-full h-[89px] rounded-2xl border border-Gray-50 py-1 px-3 bg-backgroundColor-Card resize-none outline-none text-xs placeholder:text-[#B0B0B0] placeholder:font-medium text-Text-Primary shadow-100"
                        {...formik.getFieldProps('address')}
                      />
                    </div>

                    <label className="text-Text-Primary text-[12px] font-medium">
                      Client’s Photo
                    </label>
                    <div
                      onClick={() =>
                        document.getElementById('uploadFile')?.click()
                      }
                      className="w-full relative bg-white border border-gray-50 mt-1 shadow-300 rounded-[16px] h-[146px]"
                    >
                      <div className="w-full h-full flex justify-center items-center">
                        <div className="text-center">
                          <div className="justify-center flex mb-2">
                            {photo === '' ? (
                              <img src="icons/upload-test.svg" alt="" />
                            ) : (
                              <div className="relative">
                                <img
                                  className="w-[60px] object-contain h-[60px] rounded-full"
                                  src={photo}
                                  alt=""
                                />
                                <div
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setPhoto('');
                                  }}
                                  className="bg-white border border-gray-50 absolute top-[-6px] cursor-pointer right-[-6px] rounded-full shadow-200"
                                >
                                  <img
                                    className=""
                                    src="./icons/close.svg"
                                    alt=""
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-[12px] text-Text-Primary">
                            Drag and drop or click to upload.
                          </div>
                          <div className="text-Text-Secondary text-[10px] mt-2">
                            Accepted formats: .png, .jpg. Up to 3 MB.
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".jpeg, .jpg, .png"
                        onChange={(e: any) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const maxSizeInBytes = 3 * 1024 * 1024;
                          const allowedTypes = [
                            'image/jpeg',
                            'image/jpg',
                            'image/png',
                          ];
                          if (!allowedTypes.includes(file.type)) {
                            setPhotoError(
                              'File exceeds 3 MB or has an unsupported format.',
                            );
                            return;
                          }

                          if (file.size > maxSizeInBytes) {
                            setPhotoError(
                              'File exceeds 3 MB or has an unsupported format.',
                            );
                            return;
                          }

                          setPhotoError('');
                          convertToBase64(file).then((res) => {
                            setPhoto(res.url);
                          });
                        }}
                        id="uploadFile"
                        className="w-full absolute invisible h-full left-0 top-0"
                      />
                    </div>
                    {photoError && (
                      <div className="text-[10px] font-medium mt-1 text-Red">
                        {photoError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-fit flex justify-center mt-4 md:ml-11">
              <ButtonPrimary
                // disabled={
                //   isLoading ||
                //   !formik.isValid ||
                //   formik.values.email.length == 0 ||
                //   Object.values(formik.errors).some((error) => error !== '')
                // }
                onClick={() => {
                  if (!isLoading) {
                    handleSaveClick();
                    setShowValidation(true);
                  }
                }}
              >
                {isLoading ? (
                  <>
                    {' '}
                    <SpinnerLoader></SpinnerLoader>
                    Add Client
                  </>
                ) : (
                  <>
                    <img src="./icons/tick-square.svg" alt="" />
                    Add Client
                  </>
                )}
              </ButtonPrimary>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddClient;
