/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import SearchBox from '../../Components/SearchBox';
import BioMarkerBox from './BiomarkerBox';
import BiomarkersApi from '../../api/Biomarkers';

// import mackData from './test.json'

const CustomBiomarkers = () => {
  const [biomarkers, setBiomarkers] = useState<Array<any>>([]);
  useEffect(() => {
    BiomarkersApi.getBiomarkersList().then((res) => {
      setBiomarkers(res.data);
    });
  }, []);
  useEffect(() => {
    if (biomarkers.length > 0) {
      BiomarkersApi.saveBiomarkersList(biomarkers);
    }
  }, [biomarkers]);
  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
        <div className="w-full flex justify-between items-center">
          <div className="text-Text-Primary font-medium opacity-[87%]">
            Custom Biomarker
          </div>
          <SearchBox
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search for categories & biomarkers ..."
            onSearch={() => {}}
          />
        </div>
      </div>
      <div className="w-full px-6 py-[80px]">
        {biomarkers.map((el) => {
          return (
            <BioMarkerBox
              onSave={(values) => {
                setBiomarkers((pre) => {
                  const resolved = pre.map((ol) => {
                    if (ol['Benchmark areas'] == values['Benchmark areas']) {
                      return values;
                    } else {
                      return ol;
                    }
                  });
                  return [...resolved];
                });
              }}
              data={el}
            ></BioMarkerBox>
          );
        })}
      </div>
    </>
  );
};

export default CustomBiomarkers;
