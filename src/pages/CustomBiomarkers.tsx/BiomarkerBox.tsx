/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
import BiomarkerItem from './BiomarkerItemNew';

interface BiomarkerBoxProps {
  biomarkers: Array<any>;
  data: any;
  onSave: (values: any) => void;
  changeBiomarkersValue: (values: any) => void;
  biomarkersData: any[];
  searchTerm?: string;
  unitMappings?: any[];
  biomarkerMappings?: any[];
  onUnitMappingsChange?: (entries: any[]) => void;
  onBiomarkerMappingsChange?: (entries: any[]) => void;
}

const BiomarkerBox: FC<BiomarkerBoxProps> = ({
  data,
  biomarkers,
  changeBiomarkersValue,
  biomarkersData,
  searchTerm = '',
  unitMappings = [],
  biomarkerMappings = [],
  onUnitMappingsChange,
  onBiomarkerMappingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() !== '' && biomarkers.length > 0) {
      setIsOpen(true);
    } else if (searchTerm.trim() === '') {
      setIsOpen(false);
    }
  }, [searchTerm, biomarkers.length]);

  if (biomarkers.length === 0) return null;

  return (
    <div className="w-full relative mb-4 py-4 px-2 md:px-6 bg-white border border-Gray-50 shadow-100 rounded-[16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 items-center border-2 border-Primary-DeepTeal rounded-full flex justify-center">
            <div className="w-[35px] h-[35px] flex justify-center bg-white items-center rounded-full">
              <img src={resolveAnalyseIcon(data['Benchmark areas'])} alt="" />
            </div>
          </div>
          <div className="ml-2 flex flex-col items-start justify-center">
            <div className="TextStyle-Headline-5 text-Text-Primary flex items-center gap-2">
              {data['Benchmark areas']}
            </div>
            <div className="flex justify-start items-center mt-1">
              <div className="text-Text-Quadruple text-[10px]">
                <span className="text-xs text-Text-Primary">{biomarkers.length}</span> Total Biomarker
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`${isOpen ? 'rotate-180' : ''} cursor-pointer`}
        >
          <img className="w-[24px]" src="/icons/arrow-down-green.svg" alt="" />
        </div>
      </div>
      {isOpen && (
        <div className="mt-4 grid gap-2">
          {biomarkers.map((value: any) => (
            <BiomarkerItem
              key={value.Biomarker}
              data={value}
              biomarkers={biomarkersData}
              changeBiomarkersValue={changeBiomarkersValue}
              searchTerm={searchTerm}
              unitMappings={unitMappings}
              biomarkerMappings={biomarkerMappings}
              onUnitMappingsChange={onUnitMappingsChange}
              onBiomarkerMappingsChange={onBiomarkerMappingsChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BiomarkerBox;
