import { useEffect, useState } from 'react';
import Select from '../../../Components/Select';
import { Tooltip } from 'react-tooltip';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';

export const ClinicPreferences = () => {
  const [Preferences, setPreferences] = useState('');
  const [textValue, settextValue] = useState('');
  const [initialPreferences, setInitialPreferences] = useState('');
  const [initialTextValue, setInitialTextValue] = useState('');
  const [Options, setOptions] = useState([]);

  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setloading] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);
  useEffect(() => {
    Application.getToneList({}).then((res) => {
      setOptions(res.data.options);
    });
    getSettingData();
  }, []);
  const getSettingData = () => {
    setloading(true);
    Application.getSettingData({}).then((res) => {
      setPreferences(res.data.tone);
      setInitialPreferences(res.data.tone);

      settextValue(res.data.focus_area);
      setInitialTextValue(res.data.focus_area);
      setloading(false);
    });
  };
  console.log(Preferences);
  console.log(initialPreferences);

  return (
    <div className="bg-backgroundColor-Card h-fit min-h-[348px]   w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary ">
      {loading ? (
        <div className="w-full flex flex-col gap-3  justify-center items-center h-[300px]">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <>
          <div className=" text-sm font-medium text-Text-Primary">
            Clinic Preferences
          </div>
          <div className=" text-[10px] text-[#888888] text-justify my-4">
            Adjust how the system generates and presents content to match your
            clinic's preferences. Ensure all outputs align with your operational
            needs.
          </div>
          <div className="w-full flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col gap-2 w-full md:w-[50%] text-xs font-medium  ">
              Text Preferences
              <Select
                placeholder="Select Content Preference"
                isSetting
                value={Preferences || ''}
                isLarge
                options={Options}
                onChange={(value) => {
                  setPreferences(value);
                }}
              />
            </div>
            <div className=" w-full md:w-[50%] flex flex-col gap-2  text-xs font-medium  ">
              <div className="flex items-start font-medium">
                Clinic-Specific Requests or Focus Areas
                <img
                  data-tooltip-id="text-info"
                  src="/icons/info-circle.svg"
                  alt=""
                />
                <Tooltip
                  place="top"
                  className="!w-[177px] !text-[10px] !font-normal !bg-white !text-[#888888]
            !text-justify !border !border-Gray-50 !shadow-100 !rounded-xl !z-[99] !leading-5"
                  id="text-info"
                >
                  Let us know any special focus areas, equipment you use (e.g.,
                  EMS), or preferences you'd like the system to consider when
                  generating plans for your clients.
                </Tooltip>
              </div>

              <textarea
                value={textValue || ''}
                onChange={(e) => settextValue(e.target.value)}
                placeholder="Enter any specific requests or areas of focus for your clinic"
                className="appearance-none resize-none font-normal w-full font-normal min-h-[116px] rounded-2xl border border-Gray-50 bg-[#FDFDFD] text-xs px-3 py-1 outline-none placeholder:text-[#B0B0B0] placeholder:font-light placeholder:text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-end mt-3 md:mt-0 md:mb-1 mr-1 absolute bottom-4 right-4">
            <div
              className="text-Disable text-xs md:text-sm font-medium cursor-pointer"
              onClick={() => {
                setPreferences(initialPreferences);
                settextValue(initialTextValue);
              }}
            >
              Back to Default
            </div>
            <div
              className="text-Primary-DeepTeal text-nowrap font-medium text-xs md:text-sm ml-6 cursor-pointer flex items-center justify-center"
              onClick={() => {
                if (btnLoading == false) {
                  setBtnLoading(true);
                  Application.updateSettingData({
                    tone: Preferences,
                    focus_area: textValue,
                  }).then(() => {
                    setBtnLoading(false);
                    getSettingData();
                    setChangesSaved(true);
                    setTimeout(() => setChangesSaved(false), 2000);
                  });
                }
              }}
            >
              {changesSaved ? (
                'Changes Saved'
              ) : btnLoading ? (
                <SpinnerLoader color="#005F73" />
              ) : (
                'Apply Changes'
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
