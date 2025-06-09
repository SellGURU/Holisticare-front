/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import Application from '../../../api/app';
import Circleloader from '../../CircleLoader';
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
          <div className="bg-backgroundColor-Card border rounded-md border-[#005F73] text-[8px] xs:text-[10px] md:text-xs text-Text-Primary border-opacity-10 p-2 flex flex-col gap-5 pt-4">
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
              <div data-tooltip-id={`tooltip-${data['expert']}`}>
                {data['expert'] && data['expert'].length > 30
                  ? data['expert'].substring(0, 30) + '...'
                  : data['expert']}
              </div>
              {data['expert'] && data['expert'].length > 30 && (
                <Tooltip
                  id={`tooltip-${data['expert']}`}
                  place="bottom-end"
                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  {data['expert']}
                </Tooltip>
              )}
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/location.svg" alt="" />
                Location{' '}
              </div>
              <div data-tooltip-id={`tooltip-${data['Location']}`}>
                {data['Location'] && data['Location'].length > 30
                  ? data['Location'].substring(0, 30) + '...'
                  : data['Location']}
              </div>
              {data['Location'] && data['Location'].length > 30 && (
                <Tooltip
                  id={`tooltip-${data['Location']}`}
                  place="bottom-end"
                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  {data['Location']}
                </Tooltip>
              )}
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/sms.svg" alt="" />
                Email{' '}
              </div>
              <div data-tooltip-id={`tooltip-${data['email']}`}>
                {data['email'] && data['email'].length > 30
                  ? data['email'].substring(0, 30) + '...'
                  : data['email']}
              </div>
              {data['email'] && data['email'].length > 30 && (
                <Tooltip
                  id={`tooltip-${data['email']}`}
                  place="bottom-end"
                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  {data['email']}
                </Tooltip>
              )}
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/call.svg" alt="" />
                Phone
              </div>
              <div data-tooltip-id={`tooltip-${data['phone number']}`}>
                {data['phone number'] && data['phone number'].length > 30
                  ? data['phone number'].substring(0, 30) + '...'
                  : data['phone number']}
              </div>
              {data['phone number'] && data['phone number'].length > 30 && (
                <Tooltip
                  id={`tooltip-${data['phone number']}`}
                  place="bottom-end"
                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  {data['phone number']}
                </Tooltip>
              )}
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1">
                <img src="/icons/pill.svg" alt="" />
                Medication
              </div>
              <div data-tooltip-id={`tooltip-${data['medication']}`}>
                {data['medication'] && data['medication'].length > 30
                  ? data['medication'].substring(0, 30) + '...'
                  : data['medication']}
              </div>
              {data['medication'] && data['medication'].length > 30 && (
                <Tooltip
                  id={`tooltip-${data['medication']}`}
                  place="bottom-end"
                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  {data['medication']}
                </Tooltip>
              )}
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-Text-Secondary font-medium flex items-center gap-1 text-nowrap">
                <img src="/icons/healtcare.svg" alt="" />
                Medical Condition
              </div>
              <div
                className="text-end text-nowrap overflow-hidden text-ellipsis max-w-[150px]"
                data-tooltip-id={`tooltip-medical-condition`}
              >
                {data['conditions']}
              </div>
              {data['conditions'] && data['conditions'].length > 30 && (
                <Tooltip
                  id={`tooltip-medical-condition`}
                  place="bottom-end"
                  className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  {data['conditions']}
                </Tooltip>
              )}
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
