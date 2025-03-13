/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
import BiomarkerItem from './BiomarkerItem';

interface BiomarkerBoxProps {
  data: any;
  onSave: (values: any) => void;
}
const BiomarkerBox: React.FC<BiomarkerBoxProps> = ({ data, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="w-full mb-4 py-4 px-6 bg-white border border-Gray-50 shadow-100 rounded-[16px]">
        <div className="flex justify-between items-start">
          <div className="flex items-center ">
            <div
              className="w-10 h-10 items-center bg-Primary-DeepTeal rounded-full flex justify-center"
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
