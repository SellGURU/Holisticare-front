/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import SearchBox from '../../Components/SearchBox';
import BioMarkerBox from './BiomarkerBox';
import BiomarkersApi from '../../api/Biomarkers';
import Circleloader from '../../Components/CircleLoader';

// import mackData from './test.json'

const CustomBiomarkers = () => {
  const [biomarkers, setBiomarkers] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isChanged,setIsChanged] = useState(false)
  useEffect(() => {
    setIsLoading(true);
    BiomarkersApi.getBiomarkersList()
      .then((res) => {
        setBiomarkers(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    if (biomarkers.length > 0 && isChanged) {
      BiomarkersApi.saveBiomarkersList({
         new_ranges:biomarkers
      });
    }
  }, [biomarkers]);
  const filteredBiomarkers = () => {
    if (!searchValue.trim()) {
      return biomarkers;
    }

    // Search for Benchmark Area or Biomarker
    const results = biomarkers
      .map((benchmark) => {
        const matchingBiomarkers = benchmark.biomarkers.filter(
          (biomarker: any) =>
            biomarker.Biomarker.toLowerCase().includes(
              searchValue.toLowerCase(),
            ),
        );

        if (
          benchmark['Benchmark areas']
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          matchingBiomarkers.length > 0
        ) {
          return {
            ...benchmark,
            biomarkers:
              matchingBiomarkers.length > 0
                ? matchingBiomarkers
                : benchmark.biomarkers,
          };
        }
        return null;
      })
      .filter((item) => item !== null);
    return results;
  };
  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-6 pt-8 pb-2 pr-[200px]">
        <div className="w-full flex justify-between items-center">
          <div className="text-Text-Primary font-medium opacity-[87%]">
            Custom Biomarker
          </div>
          <SearchBox
            value={searchValue}
            ClassName="rounded-xl !h-6 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search for categories & biomarkers ..."
            onSearch={(val) => {
              setSearchValue(val);
            }}
          />
        </div>
      </div>
      {isLoading ? (
        <>
          <div className="w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
            <Circleloader></Circleloader>
          </div>
        </>
      ) : (
        <div className="w-full px-6 py-[80px]">
          {filteredBiomarkers().map((el) => {
            return (
              <BioMarkerBox
                onSave={(values) => {
                  setIsChanged(true)
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
      )}
    </>
  );
};

export default CustomBiomarkers;
