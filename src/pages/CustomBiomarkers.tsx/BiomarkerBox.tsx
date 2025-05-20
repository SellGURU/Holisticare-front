/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
import BiomarkerItem from './BiomarkerItem';
import BiomarkersApi from '../../api/Biomarkers';
interface BiomarkerBoxProps {
  biomarkers: Array<any>;
  data: any;
  onSave: (values: any) => void;
}
const BiomarkerBox: React.FC<BiomarkerBoxProps> = ({
  data,
  onSave,
  biomarkers,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  // const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (biomarkers.length > 0 && isChanged) {
      BiomarkersApi.saveBiomarkersList({
        new_ranges: biomarkers,
      }).then(() => {
        if (isChanged) {
          // setShowSuccess(true);
          // setTimeout(() => {
          //   setShowSuccess(false);
          // }, 3000);
        }
      });
    }
  }, [biomarkers]);
  return (
    <>
      <div className="w-full relative mb-4 py-4 px-6 bg-white border border-Gray-50 shadow-100 rounded-[16px]">
        {/* {showSuccess && (
          <div className="absolute right-[54px] top-[12px] w-[198px] h-[44px] rounded-xl border border-Gray-50 shadow-100 flex items-center justify-center bg-white gap-2 z-50">
            <img
              src="/icons/tick-circle-large.svg"
              alt=""
              className="w-5 h-5"
            />
            <div className="text-[10px] bg-gradient-to-r from-[#005F73] to-[#6CC24A] bg-clip-text text-transparent">
              Changes applied successfully.
            </div>
          </div>
        )} */}
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center ">
            <div
              className="w-10 h-10 items-center border-2 border-Primary-DeepTeal rounded-full flex justify-center"
              style={
                {
                  // background: `blue`,
                }
              }
            >
              <div
                className="w-[35px] h-[35px]  flex justify-center bg-white items-center  rounded-full"
                style={{}}
              >
                <img
                  className=""
                  src={resolveAnalyseIcon(data['Benchmark areas'])}
                  alt=""
                />
              </div>
            </div>
            <div className="ml-2">
              <div className="TextStyle-Headline-5 text-Text-Primary flex items-center gap-2 ">
                {data['Benchmark areas']}
                {/* {isOpen && <Legends></Legends>} */}
              </div>
              <div className="flex justify-start items-center">
                <div className="TextStyle-Body-3 text-Text-Secondary">
                  {/* {data.subcategories[0]?.num_of_biomarkers} biomarkers */}
                </div>
                <div className="TextStyle-Body-3 text-Text-Secondary ml-2">
                  {/* {data.subcategories[0]?.needs_focus_count}{' '}
                  {data.subcategories[0].needs_focus_count > 1
                    ? 'Needs Focus'
                    : 'Need Focus'}{' '} */}
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`${isOpen ? 'rotate-180' : ''} cursor-pointer`}
          >
            <img
              className=" w-[24px]"
              src="/icons/arrow-down-green.svg"
              alt=""
            />
          </div>
        </div>
        {isOpen && (
          <div className="mt-4 grid gap-2">
            {data.biomarkers.map((value: any) => {
              return (
                <>
                  <BiomarkerItem
                    OnSave={(resovle) => {
                      setIsChanged(true);
                      // console.log(resovle)
                      // const
                      onSave({
                        ...data,
                        biomarkers: data.biomarkers.map((el: any) => {
                          if (el.Biomarker == value.Biomarker) {
                            return resovle;
                          } else {
                            return el;
                          }
                        }),
                      });
                    }}
                    data={value}
                  ></BiomarkerItem>
                </>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default BiomarkerBox;
