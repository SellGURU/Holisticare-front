/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import Application from '../../api/app';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import TextField from '../../Components/TextField';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useModalAutoClose from '../../hooks/UseModalAutoClose';
import MainTopBar from '../../Components/MainTopBar';
import * as yup from 'yup';
import YoupValidation from '../../validation';
import SpinnerLoader from '../../Components/SpinnerLoader';
import SvgIcon from '../../utils/svgIcon';
const AddClient = () => {
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 30,
      gender: 'unset',
    },
    validationSchema: yup.object({
      age: yup.number().min(12).max(60),
      email: YoupValidation('email'),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
    }),
    onSubmit: () => {
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

  const submit = () => {
    if (
      !formik.values.firstName ||
      !formik.values.email ||
      !formik.values.lastName ||
      !formik.values.age ||
      formik.values.gender === 'unset'
    ) {
      // alert("Please fill in all required fields");
      return;
    }

    setisLoading(true);

    Application.addClient({
      first_name: formik.values.firstName,
      email: formik.values.email,
      last_name: formik.values.lastName,
      picture: photo,
      age: formik.values.age,
      gender: formik.values.gender,
      wearable_devices: [],
    })
      .then((res) => {
        setIsAdded(true);
        setMemberID(res.data.member_id);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

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
      <div className="w-full  p-3 xs:p-4 sm:p-6  md:p-8">
        {isAdded ? (
          <>
            <div className="w-full flex justify-center items-center h-[80vh]">
              <div className=" w-[300px] md:w-[440px] h-[256px] md:h-[304px] bg-white rounded-[16px] border border-gray-50 shadow-200">
                <div className="w-full flex justify-center mt-4 md:mt-8">
                  <SvgIcon
                    color="#6CC24A"
                    src="/icons/tick-circle.svg"
                    width="64px"
                    height="64px"
                  />
                  {/* <img
                    src="/public/icons/tick-circle.svg"
                    className="w-[64px] h-[64px]"
                    alt=""
                  /> */}
                </div>
                <div className="mt-4">
                  <div className="text-center font-medium text-xs md:text-[14px] text-Text-Primary">
                    The client has been successfully saved!
                  </div>
                  <div className="flex justify-center">
                    <div className="text-justify w-[250px] md:w-[373px] text-[10px] md:text-xs text-Text-Primary mt-2">
                      To set up their profile or monitor their progress, please
                      navigate to the client’s health profile. Here, you can
                      view detailed insights and track all updates to ensure
                      their wellness journey is progressing smoothly.
                    </div>
                  </div>
                  <div className="flex gap-1 w-full justify-between items-center px-2 md:px-8 mt-4">
                    <ButtonPrimary
                      size="small"
                      onClick={() => {
                        setIsAdded(false);
                        formik.resetForm();
                        setPhoto('');
                      }}
                      outLine
                    >
                      <img
                        src={'/icons/add-blue.svg'}
                        className={'md:w-5 md:h-5 h-4 w-4'}
                      />
                      <div className=" text-nowrap text-[10px] md:text-xs md:w-[140px] ">
                        Add Another Client
                      </div>
                    </ButtonPrimary>
                    <ButtonPrimary
                      size="small"
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
                      <img
                        src={'/icons/tick.svg'}
                        className={' md:w-5 md:h-5  h-4 w-4'}
                      />
                      <div className=" text-nowrap text-[10px] md:text-xs   md:w-[140px]">
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

            <div className="flex justify-center w-full overflow-hidden">
              <div className="max-w-[460px] h-full max-h-[460px] overflow-x-hidden overflow-y-auto w-full grid gap-4">
                <div className="w-full flex gap-4 md:gap-0 flex-col md:flex-row justify-between items-start md:h-[50px] overflow-hidden md:overflow-visible">
                  <div className=" w-full md:w-[220px]">
                    <TextField
                      type="text"
                      {...formik.getFieldProps('firstName')}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter client’s first name..."
                    />
                  </div>
                  <div className=" w-full md:w-[220px]">
                    <TextField
                      type="text"
                      {...formik.getFieldProps('lastName')}
                      label="Last Name"
                      placeholder="Enter client’s last name..."
                    />
                  </div>
                </div>
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:h-[50px] overflow-visible">
                  <div className="relative md:h-[28px] overflow-visible">
                    <label className="text-Text-Primary text-[12px] font-medium">
                      Gender
                    </label>
                    <div
                      ref={selectButRef}
                      onClick={() => setShowSelect(!showSelect)}
                      className={` w-[260px] xs:w-[344px] md:w-[219px] cursor-pointer h-[28px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border ${formik.errors.gender && formik.touched.gender ? 'border-red-500' : ''}`}
                    >
                      {formik.values.gender !== 'unset' ? (
                        <div className="text-[12px] text-Text-Primary">
                          {formik.values.gender}
                        </div>
                      ) : (
                        <div className="text-[12px] text-gray-400">
                          Select client’s gender...
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
                        className="w-full z-20 shadow-200 p-2 rounded-[12px] absolute bg-white border-gray-50 top-[55px]"
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
                  </div>
                  <div className="w-full md:w-auto">
                    <label className="text-Text-Primary text-[12px] font-medium">
                      Age
                    </label>
                    <div className="w-full select-none flex justify-between">
                      <div
                        onClick={() =>
                          formik.setFieldValue('age', formik.values.age - 1)
                        }
                        className=" w-full md:w-[66px] h-[28px] flex justify-center items-center cursor-pointer text-Primary-DeepTeal bg-backgroundColor-Main rounded-l-[16px] border-gray-50 border text-[24px]"
                      >
                        -
                      </div>
                      <div className=" w-full md:w-[88px] h-[28px] bg-backgroundColor-Card border border-gray-50">
                        <input
                          {...formik.getFieldProps('age')}
                          value={Number(formik.values.age)}
                          type="number"
                          placeholder="30"
                          min={12}
                          max={60}
                          className={`w-full text-center text-Text-Primary text-[14px] outline-none ${formik.errors.age && formik.touched.age ? 'border-red-500' : ''}`}
                        />
                      </div>
                      <div
                        onClick={() =>
                          formik.setFieldValue('age', formik.values.age + 1)
                        }
                        className=" w-full md:w-[66px] flex justify-center text-Primary-DeepTeal cursor-pointer items-center h-[28px] bg-backgroundColor-Main rounded-r-[16px] border-gray-50 border text-[24px]"
                      >
                        +
                      </div>
                    </div>
                    <div className="text-[10px] text-Text-Secondary mt-1 px-2">
                      Enter a number between 12 and 60
                    </div>
                  </div>
                </div>
                <TextField
                  {...formik.getFieldProps('email')}
                  type="email"
                  label="Email Address"
                  errorMessage={formik.errors.email}
                  inValid={
                    formik.errors?.email != undefined &&
                    (formik.touched?.email as boolean)
                  }
                  placeholder="Enter client’s email address..."
                />
                <div>
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
                                className="w-[60px] h-[60px] rounded-full"
                                src={photo}
                                alt=""
                              />
                              <div
                                onClick={() => {
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
                          JPEG, PNG
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".jpeg, .jpg, .png"
                      onChange={(e: any) => {
                        const file = e.target.files[0];
                        convertToBase64(file).then((res) => {
                          setPhoto(res.url);
                        });
                      }}
                      id="uploadFile"
                      className="w-full absolute invisible h-full left-0 top-0"
                    />
                  </div>
                </div>
                <div className="w-full flex justify-center mt-4">
                  <ButtonPrimary
                    disabled={
                      isLoading ||
                      !formik.isValid ||
                      formik.values.email.length == 0 ||
                      Object.values(formik.errors).some((error) => error !== '')
                    }
                    onClick={submit}
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddClient;
