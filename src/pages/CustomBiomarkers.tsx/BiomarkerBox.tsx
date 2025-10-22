/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
import BiomarkerItem from './BiomarkerItemNew';
// import BiomarkersApi from '../../api/Biomarkers';
interface BiomarkerBoxProps {
  biomarkers: Array<any>;
  data: any;
  onSave: (values: any) => void;
  changeBiomarkersValue: (values: any) => void;
  biomarkersData: any[];
  searchTerm?: string;
}
const BiomarkerBox: FC<BiomarkerBoxProps> = ({
  data,
  // onSave,
  biomarkers,
  changeBiomarkersValue,
  biomarkersData,
  searchTerm = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // useEffect(() => {
  //   if (searchTerm != '') {
  //     setIsOpen(true);
  //   }
  // }, [searchTerm]);
  // console.log(biomarkers);
  // const [isChanged, setIsChanged] = useState(false);
  // const [showSuccess, setShowSuccess] = useState(false);
  // useEffect(() => {
  //   if (biomarkers.length > 0 && isChanged) {
  //     BiomarkersApi.saveBiomarkersList({
  //       new_ranges: biomarkers,
  //     }).then(() => {
  //       if (isChanged) {
  //         // setShowSuccess(true);
  //         // setTimeout(() => {
  //         //   setShowSuccess(false);
  //         // }, 3000);
  //       }
  //     });
  //   }
  // }, [biomarkers]);
  // Don't render the category if there are no matching biomarkers
  if (biomarkers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full relative mb-4 py-4 px-2 md:px-6 bg-white border border-Gray-50 shadow-100 rounded-[16px]">
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
            <div className="ml-2 flex flex-col items-start justify-center">
              <div className="TextStyle-Headline-5 text-Text-Primary flex items-center gap-2 ">
                {data['Benchmark areas']}
                {/* {isOpen && <Legends></Legends>} */}
              </div>
              <div className="flex justify-start items-center mt-1">
                <div className="text-Text-Quadruple text-[10px]">
                  <span className="text-xs text-Text-Primary">
                    {biomarkers.length}
                  </span>{' '}
                  Total Biomarker
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
            {biomarkers.map((value: any) => {
              return (
                <>
                  <BiomarkerItem
                    // OnSave={(resovle) => {
                    // onSave({
                    //   ...data,
                    //   biomarkers: data.biomarkers.map((el: any) => {
                    //     if (el.Biomarker == value.Biomarker) {
                    //       return resovle;
                    //     } else {
                    //       return el;
                    //     }
                    //   }),
                    // });
                    // }}
                    data={value}
                    biomarkers={biomarkersData}
                    changeBiomarkersValue={changeBiomarkersValue}
                    searchTerm={searchTerm}
                  />
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
