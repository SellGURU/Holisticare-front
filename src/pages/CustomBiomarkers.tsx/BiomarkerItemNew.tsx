/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react';
import Select from '../../Components/Select';
import SvgIcon from '../../utils/svgIcon';
import StatusBarChartV2 from './StatusBarChartV2';
import { MainModal } from '../../Components';
import EditModal from './EditModal';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkerItemNewProps {
  data: any;
}

const biomarkerItem = ({ data }: BiomarkerItemNewProps) => {
  const [activeEdit, setActiveEdit] = useState(false);
  const [activeBiomarker, setActiveBiomarker] = useState(data.age_groups[0]);
  const [gender, setGender] = useState(activeBiomarker.gender);
  const [ageRange, setAgeRange] = useState(
    activeBiomarker.min_age + '-' + activeBiomarker.max_age,
  );
  const avilableGenders = () => {
    const resolvedValues: Array<string> = [];
    data.age_groups.map((el: any) => {
      if (!resolvedValues.includes(el.gender)) {
        resolvedValues.push(el.gender);
      }
    });
    return resolvedValues;
  };
  const avilableAges = () => {
    const resolvedValues: Array<string> = [];
    data.age_groups.map((el: any) => {
      if (!resolvedValues.includes(el.min_age + '-' + el.max_age)) {
        resolvedValues.push(el.min_age + '-' + el.max_age);
      }
    });
    return resolvedValues;
  };
  return (
    <>
      <div className="w-full relative py-2 px-3  bg-[#F4F4F4] pt-2 rounded-[12px] border border-gray-50 min-h-[60px]">
        <div className="flex gap-6 w-full min-h-[60px] justify-start items-start">
          <div className="w-[200px]">
            <div className="text-[12px] font-medium text-Text-Primary">
              {data.Biomarker}
            </div>
            <div className="text-[10px] max-w-[100px] text-nowrap overflow-hidden text-ellipsis mt-1 text-Text-Secondary">
              {/* {data.more_info} */}
            </div>
          </div>
          <div className="w-[70%] mt-20 mb-3">
            <StatusBarChartV2
              mapingData={data.label_mapping_chart}
              data={activeBiomarker.status}
            ></StatusBarChartV2>
          </div>
          <div className="absolute right-4 gap-2 flex justify-end items-center top-2">
            <div>
              <Select
                key="ages"
                onChange={(val) => {
                  setAgeRange(val);
                }}
                options={avilableAges()}
              ></Select>
            </div>
            <div>
              <Select
                isCapital
                key="gender"
                onChange={(val) => {
                  setGender(val);
                }}
                options={avilableGenders()}
              ></Select>
            </div>
            <div
              onClick={() => {
                setActiveEdit(true);
              }}
            >
              <SvgIcon color="#005F73" src="./icons/edit-green.svg"></SvgIcon>
            </div>
          </div>
        </div>
      </div>

      <MainModal
        isOpen={activeEdit}
        onClose={() => {
          setActiveEdit(false);
        }}
      >
        <>
          <EditModal onCancel={() => {
            setActiveEdit(false);
          }} onSave={() => {
            setActiveEdit(false);
          }} data={data}></EditModal>
        </>
      </MainModal>
    </>
  );
};

export default biomarkerItem;
