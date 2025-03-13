/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import MainModal from '../../MainModal';
import RangeCardLibraryThreePages from './RangeCard';

interface AddModalLibraryTreePagesProps {
  addShowModal: boolean;
  handleCloseModal: () => void;
  pageType: string;
  onSubmit: (value: any) => void;
}

const AddModalLibraryTreePages: FC<AddModalLibraryTreePagesProps> = ({
  addShowModal,
  handleCloseModal,
  pageType,
  onSubmit,
}) => {
  const [addData, setAddData] = useState({
    title: '',
    description: '',
    score: 0,
    instruction: '',
  });
  const updateAddData = (key: keyof typeof addData, value: any) => {
    setAddData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const [dose, setDose] = useState('');
  const [value, setValue] = useState('');
  const [totalMacros, setTotalMacros] = useState({
    Fats: null,
    Protein: null,
    Carbs: null,
  });
  const notDisabled = () => {
    if (pageType === 'Supplement') {
      return (
        addData.title && addData.description && addData.instruction && dose
      );
    } else if (pageType === 'Lifestyle') {
      return addData.title && addData.description && addData.instruction;
    } else {
      return addData.title && addData.description && addData.instruction;
    }
  };
  const submit = () => {
    if (pageType === 'Supplement') {
      const data: any = {
        Title: addData.title,
        Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Dose: dose,
      };
      onSubmit(data);
      clear();
    } else if (pageType === 'Lifestyle') {
      const data: any = {
        Title: addData.title,
        Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Value: value,
      };
      onSubmit(data);
      clear();
    } else {
      const data: any = {
        Title: addData.title,
        Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Total_Macros: totalMacros,
      };
      onSubmit(data);
      clear();
    }
  };
  const clear = () => {
    setAddData({
      title: '',
      description: '',
      score: 0,
      instruction: '',
    });
    setDose('');
    setValue('');
    setTotalMacros({ Carbs: null, Fats: null, Protein: null });
  };
  return (
    <>
      <MainModal isOpen={addShowModal} onClose={handleCloseModal}>
        <div className="flex flex-col justify-between bg-white w-[500px] rounded-[16px] p-6">
          <div className="w-full h-full">
            <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
              Add {pageType}
            </div>
            <div className="w-full h-[1px] bg-Boarder my-3"></div>
            <div className="flex flex-col mt-5 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary">Title</div>
              <input
                placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}’s title...`}
                value={addData.title}
                onChange={(e) => updateAddData('title', e.target.value)}
                className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
              />
            </div>
            <div className="flex flex-col mt-4 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary">
                Description
              </div>
              <textarea
                placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}’s description...`}
                value={addData.description}
                onChange={(e) => updateAddData('description', e.target.value)}
                className="w-full h-[98px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none"
              />
            </div>
            <div className="flex flex-col mt-4 w-full">
              <div className="text-xs font-medium text-Text-Primary">
                Base Score
              </div>
              <RangeCardLibraryThreePages
                value={addData.score}
                changeValue={updateAddData}
              />
            </div>
            <div className="flex flex-col mt-4 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary">
                Instruction
              </div>
              <textarea
                placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}’s instruction...`}
                value={addData.instruction}
                onChange={(e) => updateAddData('instruction', e.target.value)}
                className="w-full h-[98px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none"
              />
            </div>
            {pageType === 'Supplement' && (
              <div className="flex flex-col mt-5 w-full gap-2">
                <div className="text-xs font-medium text-Text-Primary">
                  Dose
                </div>
                <input
                  placeholder="Write the supplement’s dose..."
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
                />
              </div>
            )}
            {pageType === 'Lifestyle' && (
              <div className="flex flex-col mt-5 w-full gap-2">
                <div className="text-xs font-medium text-Text-Primary">
                  Value
                </div>
                <input
                  placeholder="Enter Value..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full h-[28px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold"
                />
              </div>
            )}
            {pageType === 'Diet' && (
              <div className="flex flex-col w-full mt-3.5">
                <div className="font-medium text-Text-Primary text-xs">
                  Macros Goal
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <div className="text-[10px] font-medium text-Text-Primary">
                        Carbs
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        (gr)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="w-full flex justify-end items-center p-2 mt-5">
              <div
                className="text-Disable text-sm font-medium mr-4 cursor-pointer"
                onClick={handleCloseModal}
              >
                Cancel
              </div>
              <div
                className={`${notDisabled() ? 'text-Primary-DeepTeal' : 'text-Text-Fivefold'}  text-sm font-medium cursor-pointer`}
                onClick={() => {
                  if (notDisabled()) {
                    submit();
                  }
                }}
              >
                Add
              </div>
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default AddModalLibraryTreePages;
