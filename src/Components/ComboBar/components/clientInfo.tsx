/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
export const ClientInfo = () => {
  const { id } = useParams<{ id: string }>();
  type ClientInfoType = {
    [key: string]: any;
    expert: string;
    'total workouts': string;
    'total Cardio Activities': string;
    first_name: string;
    last_name: string;
    Location: string;
    email: string;
    'phone number': string;
    medication: string;
    conditions: string;
  };

  const [data, setData] = useState<ClientInfoType | null>(null);
  const [clientGoals, setClientGoals] = useState(null);
  // const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      workOuts: '',
      Activity: '',
      expert: '',
      location: '',
    },
    onSubmit: () => {},
  });
  const [isLoading, setisLoading] = useState(false);
  useEffect(() => {
    setisLoading(true);
    Application.getClientInfo({ member_id: id })
      .then((res) => {
        if (res.data && res.data.personal_info) {
          const personalInfo = res.data.personal_info;
          setData(personalInfo);
          setClientGoals(res.data.client_goals);
          formik.setFieldValue('firstName', personalInfo['first_name'] || '');
          formik.setFieldValue('lastName', personalInfo['last_name'] || '');
          formik.setFieldValue(
            'workOuts',
            personalInfo['total workouts'] || '',
          );
          formik.setFieldValue(
            'Activity',
            personalInfo['total Cardio Activities'] || '',
          );
          formik.setFieldValue('expert', personalInfo['expert'] || '');
          formik.setFieldValue('location', personalInfo['Location'] || '');
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
        // setError("Failed to fetch client data");
      })
      .finally(() => {
        setisLoading(false);
        // setIsLoading(false);
      });
  }, [id]);

  // if (isLoading) {
  //     return <div>Loading...</div>;
  // }

  // if (error) {
  //     return <div className="text-red-500">{error}</div>;
  // }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <img className="object-contain" src="/icons/document-text.svg" alt="" />
        <div className="text-[12px] text-[#383838]">No Data Found</div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <div
          className="w-full  overflow-y-auto pr-1"
          style={{ height: window.innerHeight - 120 }}
        >
          <div className="bg-backgroundColor-Card select-none border rounded-md border-[#005F73] text-[8px] xs:text-[10px] md:text-xs text-Text-Primary border-opacity-10 p-2 flex flex-col gap-5 py-4">
            {/* <div className="w-full flex justify-between items-center">
          <div className="text-Text-Secondary font-medium flex items-center gap-1">
            <img src="/icons/workouts.svg" alt="" />
            Total workouts
          </div>
          {data['total workouts']}
        </div> */}
            {/* <div className="w-full flex justify-between items-center">
          <div className="text-Text-Secondary font-medium flex items-center gap-1">
            <img src="/icons/health.svg" alt="" />
            Total Cardio Activities
          </div>
          {data['total Cardio Activities']}
        </div> */}
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/frame.svg" alt="" />
                Coach
              </div>
              <div>
                <TooltipTextAuto maxWidth="150px">
                  {data['expert']}
                </TooltipTextAuto>
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/location.svg" alt="" />
                Location{' '}
              </div>
              <div>
                <TooltipTextAuto maxWidth="150px">
                  {data['Location']}
                </TooltipTextAuto>
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/sms.svg" alt="" />
                Email{' '}
              </div>

              <TooltipTextAuto maxWidth="150px">
                {data['email']}
              </TooltipTextAuto>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/call.svg" alt="" />
                Phone
              </div>
              <TooltipTextAuto maxWidth="150px">
                {data['phone number']}
              </TooltipTextAuto>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/pill.svg" alt="" />
                Medication
              </div>
              <TooltipTextAuto maxWidth="150px">
                {data['medication']}
              </TooltipTextAuto>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1 text-nowrap">
                <img src="/icons/healtcare.svg" alt="" />
                Medical Condition
              </div>
              <TooltipTextAuto maxWidth="150px">
                {data['conditions']}
              </TooltipTextAuto>
            </div>
          </div>
          <div className="flex flex-col mt-5">
            <div className="text-xs font-medium text-Text-Quadruple">
              Client Goals
            </div>
            {clientGoals && Object.keys(clientGoals).length > 0 ? (
              <div className="flex flex-col mt-2">
                {Object.entries(clientGoals).map(
                  ([key, value], index: number) => (
                    <div key={key} className="">
                      <div
                        className={`bg-Primary-DeepTeal bg-opacity-10 px-4 py-2 font-medium text-xs text-Text-Quadruple ${index === 0 && 'rounded-t-xl'}`}
                      >
                        {key}
                      </div>{' '}
                      <div
                        className={`border-l border-r border-Gray-50 px-4 py-2 text-xs text-Text-Primary text-justify ${index === Object.entries(clientGoals).length - 1 && 'rounded-b-xl border-b'}`}
                      >
                        {Array.isArray(value)
                          ? value.join(', ')
                          : (value as string | number | null)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="w-full mt-16 flex flex-col items-center justify-center">
                <img src="/icons/document-text-rectangle.svg" alt="" />
                <div className="font-medium text-xs text-Text-Primary -mt-3">
                  No client goals found.
                </div>
                <div className="text-[10px] text-Text-Quadruple text-center leading-5 mt-[2px]">
                  Once the client completes their assessment, their goals will
                  be displayed here
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
