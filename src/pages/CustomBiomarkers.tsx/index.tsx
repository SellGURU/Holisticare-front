/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import BioMarkerBox from './BiomarkerBox';

// import mackData from './newMock.json';
import { MainModal } from '../../Components';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import AddModal from './AddModal';

import DefaultData from './default.json';
// import mockData from './mockData.json';

const CustomBiomarkers = () => {
  const [biomarkers, setBiomarkers] = useState<Array<any>>([]);
  const changeBiomarkersValue = (values: any) => {
    setBiomarkers(values);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  // const [isChanged, setIsChanged] = useState(false);
  // const [showSuccess, setShowSuccess] = useState(false);
  const [activeAdd, setActiveAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModalAdd = () => setActiveAdd(true);
  const closeModalAdd = () => {setActiveAdd(false);
    setErrorDetails('')
  }
  const [errorDetails, setErrorDetails] = useState<string>('');
  const getBiomarkers = () => {
    setIsLoading(true);
    // setBiomarkers(mockData);
    // setIsLoading(false);
    BiomarkersApi.getBiomarkersList()
      .then((res) => {
        setBiomarkers(res.data);
        // setBiomarkers(mackData);
      })
      .finally(() => {
        // setBiomarkers(mackData);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    getBiomarkers();
  }, []);
  // useEffect(() => {
  //   if (biomarkers.length > 0 && isChanged) {
  //     BiomarkersApi.saveBiomarkersList({
  //       new_ranges: biomarkers,
  //     }).then(() => {
  //       if (isChanged) {
  //         setShowSuccess(true);
  //         setTimeout(() => {
  //           setShowSuccess(false);
  //         }, 3000);
  //       }
  //     });
  //   }
  // }, [biomarkers]);
  const filteredBiomarkers = () => {
    if (!searchValue.trim()) {
      return biomarkers;
    }

    const lowerSearch = searchValue.toLowerCase();

    const results = biomarkers.filter(
      (item) =>
        item['Benchmark areas'].toLowerCase().includes(lowerSearch) ||
        item['Biomarker'].toLowerCase().includes(lowerSearch),
    );

    return results;
  };

  const resolveAllBenchmarks = () => {
    return [
      ...new Set(
        filteredBiomarkers().map((el) => {
          return el['Benchmark areas'];
        }),
      ),
    ];
  };

  const getFilteredBiomarkersForCategory = (benchmark: string) => {
    if (!searchValue.trim()) {
      return biomarkers.filter((item) => item['Benchmark areas'] === benchmark);
    }

    const lowerSearch = searchValue.toLowerCase();
    return biomarkers.filter(
      (item) =>
        item['Benchmark areas'] === benchmark &&
        (item['Benchmark areas'].toLowerCase().includes(lowerSearch) ||
          item['Biomarker'].toLowerCase().includes(lowerSearch)),
    );
  };
  const onsave = (values: any) => {
    setLoading(true);
    BiomarkersApi.addBiomarkersList({
      new_biomarker: values,
    })
      .then(() => {
        closeModalAdd();
        setBiomarkers((pre) => [...pre, values]);
      })
      .catch((error) => {
        setErrorDetails(error.detail);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-2 md:px-6 pt-8 pb-2 md:pr-[200px]">
        <div className="w-full flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div className="text-Text-Primary font-medium opacity-[87%] text-nowrap">
            Custom Biomarker
          </div>
          <div className="flex flex-col md:flex-row pr-4 md:pr-0 md:items-center gap-4">
            <SearchBox
              value={searchValue}
              ClassName="rounded-2xl !h-7 !py-[0px] !px-3 !shadow-[unset]"
              placeHolder="Search categories & biomarkers ..."
              onSearch={(val) => {
                setSearchValue(val);
              }}
            />
            <ButtonSecondary
              ClassName="rounded-[20px] text-xs border border-white"
              onClick={openModalAdd}
            >
              <img src="/icons/add-square.svg" alt="" />
              Add Biomarker
            </ButtonSecondary>
          </div>
        </div>
      </div>
      {/* {showSuccess && (
        <div className="absolute right-12 top-[120px] w-[198px] h-[44px] rounded-xl border border-Gray-50 shadow-100 flex items-center justify-center bg-white gap-2 z-50">
          <img src="/icons/tick-circle-large.svg" alt="" className="w-5 h-5" />
          <div className="text-[10px] bg-gradient-to-r from-[#005F73] to-[#6CC24A] bg-clip-text text-transparent">
            Changes applied successfully.
          </div>
        </div>
      )} */}
      {isLoading ? (
        <>
          <div className="w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
            <Circleloader></Circleloader>
          </div>
        </>
      ) : (
        <div className="w-full min-h-full px-2 md:px-6 py-[80px]">
          {resolveAllBenchmarks().map((benchmark) => {
            const filteredBiomarkersForCategory =
              getFilteredBiomarkersForCategory(benchmark);
            return (
              <BioMarkerBox
                biomarkers={filteredBiomarkersForCategory}
                onSave={(values) => {
                  // setIsChanged(true);
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
                data={
                  biomarkers.filter(
                    (item) => item['Benchmark areas'] == benchmark,
                  )[0]
                }
                biomarkersData={biomarkers}
                changeBiomarkersValue={changeBiomarkersValue}
                searchTerm={searchValue}
              />
            );
          })}
          {filteredBiomarkers().length == 0 && (
            <div className="h-full">
              <div className="flex h-full  justify-center items-center   flex-col gap-2">
                <img
                  className="w-[220px]"
                  src="/icons/empty-messages-coach.svg"
                  alt=""
                />
                <div className="text-Text-Primary -mt-10  text-center text-base font-medium">
                  No results found.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <MainModal
        isOpen={activeAdd}
        onClose={() => {
          closeModalAdd();
        }}
      >
        <>
          <AddModal
            onCancel={() => {
              closeModalAdd();
            }}
            onSave={(values: any) => {
              onsave(values);
            }}
            data={DefaultData}
            loading={loading}
            errorDetails={errorDetails}
            setErrorDetails={setErrorDetails}
          />
        </>
      </MainModal>
    </>
  );
};

export default CustomBiomarkers;
