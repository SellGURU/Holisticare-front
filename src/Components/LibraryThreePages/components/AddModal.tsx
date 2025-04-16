/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import MainModal from '../../MainModal';
import RangeCardLibraryThreePages from './RangeCard';

interface AddModalLibraryTreePagesProps {
  addShowModal: boolean;
  handleCloseModal: () => void;
  pageType: string;
  onSubmit: (value: any) => void;
  selectedRow: any;
  setSelectedRow: () => void;
}

const AddModalLibraryTreePages: FC<AddModalLibraryTreePagesProps> = ({
  addShowModal,
  handleCloseModal,
  pageType,
  onSubmit,
  selectedRow,
  setSelectedRow,
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
    Fats: '',
    Protein: '',
    Carbs: '',
  });
  useEffect(() => {
    if (selectedRow) {
      setAddData({
        title: selectedRow ? selectedRow.Title : '',
        description: selectedRow ? selectedRow.Description : '',
        score: selectedRow ? selectedRow.Base_Score : 0,
        instruction: selectedRow ? selectedRow.Instruction : '',
      });
      setDose(selectedRow ? selectedRow.Dose : '');
      setValue(selectedRow ? selectedRow.Value : '');
      setTotalMacros({
        Fats: selectedRow ? selectedRow['Total Macros']?.Fats : '',
        Protein: selectedRow ? selectedRow['Total Macros']?.Protein : '',
        Carbs: selectedRow ? selectedRow['Total Macros']?.Carbs : '',
      });
    }
  }, [selectedRow]);
  const updateTotalMacros = (key: keyof typeof totalMacros, value: any) => {
    setTotalMacros((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  // const notDisabled = () => {
  //   if (pageType === 'Supplement') {
  //     return (
  //       addData.title && addData.description && addData.instruction && dose
  //     );
  //   } else if (pageType === 'Lifestyle') {
  //     return (
  //       addData.title && addData.description && addData.instruction && value
  //     );
  //   } else {
  //     return (
  //       addData.title &&
  //       addData.description &&
  //       addData.instruction &&
  //       totalMacros.Carbs &&
  //       totalMacros.Fats &&
  //       totalMacros.Protein
  //     );
  //   }
  // };
  const submit = () => {
    setShowValidation(true);
    // Validate fields using the validateFields function
    if (!validateFields()) {
      return; // Exit the function if there are validation errors
    }

    // Proceed with data submission if validation passes
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
        Value: Number(value),
      };
      onSubmit(data);
      clear();
    } else {
      const data: any = {
        Title: addData.title,
        Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Total_Macros: {
          Fats: Number(totalMacros.Fats),
          Protein: Number(totalMacros.Protein),
          Carbs: Number(totalMacros.Carbs),
        },
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
    setTotalMacros({ Carbs: '', Fats: '', Protein: '' });
    setShowValidation(false);
    setSelectedRow();
    setErrors({
      title: false,
      description: false,
      instruction: false,
      dose: false,
      value: false,
      score: false,
      macros: {
        Fats: false,
        Protein: false,
        Carbs: false,
      },
    });
  };

  const [errors, setErrors] = useState({
    title: false,
    description: false,
    instruction: false,
    dose: false,
    value: false,
    score: false,
    macros: {
      Fats: false,
      Protein: false,
      Carbs: false,
    },
  });

  const validateFields = () => {
    const newErrors = {
      title: !addData.title,
      description: !addData.description,
      instruction: !addData.instruction,
      dose: pageType === 'Supplement' && !dose,
      value: pageType === 'Lifestyle' && !value,
      score: addData.score === 0,
      macros: {
        Fats: pageType === 'Diet' && !totalMacros.Fats,
        Protein: pageType === 'Diet' && !totalMacros.Protein,
        Carbs: pageType === 'Diet' && !totalMacros.Carbs,
      },
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (error) =>
        error === true ||
        (typeof error === 'object' && Object.values(error).some(Boolean)),
    );
  };
  const [showValidation, setShowValidation] = useState(false);
  return (
    <MainModal
      isOpen={addShowModal}
      onClose={() => {
        handleCloseModal();
        clear();
        setSelectedRow()
      }}
    >
      <div className="flex flex-col justify-between bg-white w-[500px] rounded-[16px] p-6">
        <div className="w-full h-full">
          <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
            {selectedRow ? 'Edit' : 'Add'} {pageType}
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>

          {/* Title Field */}
          <div className="flex flex-col mt-5 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Title <span className="text-Red">*</span>
            </div>
            <input
              placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}'s title...`}
              value={addData.title}
              onChange={(e) => updateAddData('title', e.target.value)}
              className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                showValidation && errors.title ? 'border-Red' : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
            />
            {showValidation && errors.title && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="flex flex-col mt-4 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Description <span className="text-Red">*</span>
            </div>
            <textarea
              placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}'s description...`}
              value={addData.description}
              onChange={(e) => updateAddData('description', e.target.value)}
              className={`w-full h-[98px] rounded-[16px] text-justify py-1 px-3 border ${
                showValidation && errors.description
                  ? 'border-Red'
                  : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none`}
            />
            {showValidation && errors.description && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div>

          {/* Base Score Field */}
          <div className="flex flex-col mt-4 w-full">
            <div className="text-xs font-medium text-Text-Primary">
              Base Score <span className="text-Red">*</span>
            </div>
            <RangeCardLibraryThreePages
              value={addData.score}
              changeValue={updateAddData}
              showValidation={showValidation}
              error={errors.score}
              required={true}
            />
          </div>

          {/* Instruction Field */}
          <div className="flex flex-col mt-4 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Instruction <span className="text-Red">*</span>
            </div>
            <textarea
              placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}'s instruction...`}
              value={addData.instruction}
              onChange={(e) => updateAddData('instruction', e.target.value)}
              className={`w-full h-[98px] text-justify rounded-[16px] py-1 px-3 border ${
                showValidation && errors.instruction
                  ? 'border-Red'
                  : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none`}
            />
            {showValidation && errors.instruction && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div>

          {/* Supplement Specific Field */}
          {pageType === 'Supplement' && (
            <div className="flex flex-col mt-5 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary">
                Dose <span className="text-Red">*</span>
              </div>
              <input
                placeholder="Enter the supplement's dose..."
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                  showValidation && errors.dose
                    ? 'border-Red'
                    : 'border-Gray-50'
                } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
              />
              {showValidation && errors.dose && (
                <div className="text-Red text-[10px]">
                  This field is required.
                </div>
              )}
            </div>
          )}

          {/* Lifestyle Specific Field */}
          {pageType === 'Lifestyle' && (
            <div className="flex flex-col mt-5 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary">
                Value <span className="text-Red">*</span>
              </div>
              <input
                placeholder="Enter Value..."
                value={value}
                type="number"
                onChange={(e) => setValue(e.target.value)}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                  showValidation && errors.value
                    ? 'border-Red'
                    : 'border-Gray-50'
                } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
              />
              {showValidation && errors.value && (
                <div className="text-Red text-[10px]">
                  This field is required.
                </div>
              )}
            </div>
          )}

          {/* Diet Specific Fields */}
          {pageType === 'Diet' && (
            <div className="flex flex-col w-full mt-3.5">
              <div className="font-medium text-Text-Primary text-xs">
                Macros Goal <span className="text-Red">*</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mt-3 gap-4">
                  {/* Carbs Input */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className="text-[10px] font-medium text-Text-Primary">
                        Carbs
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        (gr)
                      </div>
                    </div>
                    <input
                      type="number"
                      placeholder="Carbohydrates"
                      value={totalMacros.Carbs}
                      onChange={(e) =>
                        updateTotalMacros('Carbs', Number(e.target.value))
                      }
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                        showValidation &&
                        (errors.macros.Carbs ||
                          errors.macros.Protein ||
                          errors.macros.Fats)
                          ? 'border-Red'
                          : 'border-Gray-50'
                      } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                    />
                  </div>

                  {/* Proteins Input */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className="text-[10px] font-medium text-Text-Primary">
                        Proteins
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        (gr)
                      </div>
                    </div>
                    <input
                      type="number"
                      placeholder="Proteins"
                      value={totalMacros.Protein}
                      onChange={(e) =>
                        updateTotalMacros('Protein', Number(e.target.value))
                      }
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                        showValidation &&
                        (errors.macros.Carbs ||
                          errors.macros.Protein ||
                          errors.macros.Fats)
                          ? 'border-Red'
                          : 'border-Gray-50'
                      } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                    />
                  </div>

                  {/* Fats Input */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className="text-[10px] font-medium text-Text-Primary">
                        Fats
                      </div>
                      <div className="text-[10px] text-Text-Quadruple">
                        (gr)
                      </div>
                    </div>
                    <input
                      type="number"
                      placeholder="Fats"
                      value={totalMacros.Fats}
                      onChange={(e) =>
                        updateTotalMacros('Fats', Number(e.target.value))
                      }
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                        showValidation &&
                        (errors.macros.Carbs ||
                          errors.macros.Protein ||
                          errors.macros.Fats)
                          ? 'border-Red'
                          : 'border-Gray-50'
                      } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                    />
                  </div>
                </div>
                {/* Single validation message for all macro fields */}
                {showValidation &&
                  (errors.macros.Carbs ||
                    errors.macros.Protein ||
                    errors.macros.Fats) && (
                    <div className="text-Red text-[10px]">
                      These fields are required.
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex justify-end items-center p-2 mt-5">
            <div
              className="text-Disable text-sm font-medium mr-4 cursor-pointer"
              onClick={() => {
                handleCloseModal();
                clear();
              }}
            >
              Cancel
            </div>
            <div
              className="text-Primary-DeepTeal text-sm font-medium cursor-pointer"
              onClick={() => {
                setShowValidation(true);
                if (validateFields()) {
                  submit();
                  clear();
                }
              }}
            >
              {selectedRow ? 'Update' : 'Add'}
            </div>
          </div>
        </div>
      </div>
    </MainModal>
  );
};

export default AddModalLibraryTreePages;
