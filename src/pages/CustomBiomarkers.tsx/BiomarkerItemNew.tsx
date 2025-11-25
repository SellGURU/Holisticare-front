/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import { MainModal } from '../../Components';
import SvgIcon from '../../utils/svgIcon';
import EditModal from './EditModal';
// import StatusBarChartV2 from './StatusBarChartV2';
import Select from '../../Components/Select';
import StatusBarChartv3 from './StatusBarChartv3';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BiomarkerItemNewProps {
  data: any;
  biomarkers: any[];
  changeBiomarkersValue: (values: any) => void;
  searchTerm?: string;
}

const biomarkerItem = ({
  data,
  biomarkers,
  changeBiomarkersValue,
  searchTerm = '',
}: BiomarkerItemNewProps) => {
  const getMaleThresholdKeys = () => {
    if (data && data.thresholds && data.thresholds.male) {
      return Object.keys(data.thresholds.male);
    }
    return [];
  };
  const getFemaleThresholdKeys = () => {
    if (data && data.thresholds && data.thresholds.female) {
      return Object.keys(data.thresholds.female);
    }
    return [];
  };
  const [activeEdit, setActiveEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModalEdit = () => setActiveEdit(true);
  const closeModalEdit = () => {
    setActiveEdit(false);
    setErrorDetails('');
  };
  const [activeBiomarker, setActiveBiomarker] = useState(() => {
    const maleKeys = getMaleThresholdKeys();
    const femaleKeys = getFemaleThresholdKeys();
    
    // Try to get male data first
    if (maleKeys.length > 0 && data?.thresholds?.male?.[maleKeys[0]]) {
      const maleData = data.thresholds.male[maleKeys[0]];
      // Check if male data is not empty (has actual data)
      if (maleData && (Array.isArray(maleData) ? maleData.length > 0 : Object.keys(maleData).length > 0)) {
        return maleData;
      }
    }
    
    // If male data is empty or doesn't exist, use female data
    if (femaleKeys.length > 0 && data?.thresholds?.female?.[femaleKeys[0]]) {
      return data.thresholds.female[femaleKeys[0]];
    }
    
    return null;
  });
  const [errorDetails, setErrorDetails] = useState('');
  useEffect(() => {
    // Get male threshold keys
    const maleKeys = data && data.thresholds && data.thresholds.male 
      ? Object.keys(data.thresholds.male) 
      : [];
    
    // Get female threshold keys
    const femaleKeys = data && data.thresholds && data.thresholds.female 
      ? Object.keys(data.thresholds.female) 
      : [];
    
    // Try to get male data first
    if (maleKeys.length > 0 && data?.thresholds?.male?.[maleKeys[0]]) {
      const maleData = data.thresholds.male[maleKeys[0]];
      // Check if male data is not empty (has actual data)
      if (maleData && (Array.isArray(maleData) ? maleData.length > 0 : Object.keys(maleData).length > 0)) {
        setActiveBiomarker(maleData);
        return;
      }
    }
    
    // If male data is empty or doesn't exist, use female data
    if (femaleKeys.length > 0 && data?.thresholds?.female?.[femaleKeys[0]]) {
      setActiveBiomarker(data.thresholds.female[femaleKeys[0]]);
      return;
    }
    
    setActiveBiomarker(null);
  }, [data]);
  const [gender, setGender] = useState('male');
  const [ageRange, setAgeRange] = useState(getMaleThresholdKeys()[0]);
  const avilableGenders = () => {
    const resolvedValues: Array<string> = ['male', 'female'];
    // data.age_groups.map((el: any) => {
    //   if (!resolvedValues.includes(el.gender)) {
    //     resolvedValues.push(el.gender);
    //   }
    // });
    return resolvedValues;
  };
  const avilableAges = () => {
    const resolvedValues: Array<string> = getMaleThresholdKeys();
    // data.age_groups.map((el: any) => {
    //   if (!resolvedValues.includes(el.min_age + '-' + el.max_age)) {
    //     resolvedValues.push(el.min_age + '-' + el.max_age);
    //   }
    // });
    return resolvedValues;
  };

  const replaceBiomarker = (biomarkers: any[], updatedItem: any): any[] => {
    return biomarkers.map((item) =>
      item.Biomarker === updatedItem.Biomarker ? updatedItem : item,
    );
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) {
      return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
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
  // console.log(data);

  return (
    <>
      <div className="w-full relative py-2 px-3  bg-[#F4F4F4] pt-2 rounded-[12px] border border-gray-50 min-h-[60px]">
        <div className="flex flex-col md:flex-row gap-6 w-full min-h-[60px] justify-start items-start">
          <div className="md:w-[200px]">
            <div className=" text-[10px] md:text-[12px] font-medium text-Text-Primary   ">
              {highlightText(data.Biomarker, searchTerm)}
              <span className=" text-[8px] md:text-[10px] text-[#888888] ml-[2px]">
                ({data.unit})
              </span>
            </div>
            <div className=" text-[8px] md:text-[10px] text-nowrap mt-1 text-Text-Quadruple">
              {data.Category}
            </div>
          </div>
          <div className=" w-full md:w-[80%] mt-4 md:mt-8  ">
            {/* <StatusBarChartV2
              isCustom
              mapingData={data.label_mapping_chart}
              data={activeBiomarker}
            ></StatusBarChartV2> */}
            <StatusBarChartv3
              isCustom
              data={activeBiomarker ?? []}
            ></StatusBarChartv3>
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
