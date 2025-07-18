/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import { MainModal } from '../../Components';
import SvgIcon from '../../utils/svgIcon';
import EditModal from './EditModal';
import StatusBarChartV2 from './StatusBarChartV2';
import Select from '../../Components/Select';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkerItemNewProps {
  data: any;
  biomarkers: any[];
  changeBiomarkersValue: (values: any) => void;
}

const biomarkerItem = ({
  data,
  biomarkers,
  changeBiomarkersValue,
}: BiomarkerItemNewProps) => {
  const [activeEdit, setActiveEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModalEdit = () => setActiveEdit(true);
  const closeModalEdit = () => setActiveEdit(false);
  const [activeBiomarker, setActiveBiomarker] = useState(data.age_groups[0]);
  const [errorDetails, setErrorDetails] = useState('');
  useEffect(() => {
    setActiveBiomarker(data.age_groups[0]);
  }, [data]);
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

  const replaceBiomarker = (biomarkers: any[], updatedItem: any): any[] => {
    return biomarkers.map((item) =>
      item.Biomarker === updatedItem.Biomarker ? updatedItem : item,
    );
  };

  const onsave = (values: any) => {
    setLoading(true);
    BiomarkersApi.saveBiomarkersList({
      updated_biomarker: values,
    })
      .then(() => {
        closeModalEdit();
        changeBiomarkersValue(replaceBiomarker(biomarkers, values));
      })
      .catch((error) => {
        setErrorDetails(error.detail);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  console.log(data);

  return (
    <>
      <div className="w-full relative py-2 px-3  bg-[#F4F4F4] pt-2 rounded-[12px] border border-gray-50 h-[60px]">
        <div className="flex gap-6 w-full h-[60px] justify-start items-start">
          <div className="w-[200px]">
            <div className="text-[12px] font-medium text-Text-Primary flex items-center gap-[2px]">
              {data.Biomarker}
              <span className="text-[10px] text-[#888888]">({data.unit})</span>
            </div>
            <div className="text-[10px] text-nowrap mt-1 text-Text-Quadruple">
              {data.Category}
            </div>
          </div>
          <div className="w-[80%] mt-8  ">
            <StatusBarChartV2
              isCustom
              mapingData={data.label_mapping_chart}
              data={activeBiomarker.status}
            ></StatusBarChartV2>
          </div>
          <div className="absolute right-4 gap-2 flex justify-end items-center top-2">
            <div className="hidden">
              <Select
                key="ages"
                onChange={(val) => {
                  setAgeRange(val);
                }}
                value={ageRange}
                options={avilableAges()}
              ></Select>
            </div>
            <div className="hidden">
              <Select
                isCapital
                key="gender"
                onChange={(val) => {
                  setGender(val);
                }}
                value={gender}
                options={avilableGenders()}
              ></Select>
            </div>
            <div onClick={openModalEdit}>
              <SvgIcon color="#005F73" src="./icons/edit-green.svg"></SvgIcon>
            </div>
          </div>
        </div>
      </div>

      <MainModal
        isOpen={activeEdit}
        onClose={() => {
          closeModalEdit();
        }}
      >
        <>
          <EditModal
            onCancel={() => {
              closeModalEdit();
            }}
            onSave={(values: any) => {
              onsave(values);
            }}
            data={data}
            loading={loading}
            errorDetails={errorDetails}
            setErrorDetails={setErrorDetails}
          />
        </>
      </MainModal>
    </>
  );
};

export default biomarkerItem;
