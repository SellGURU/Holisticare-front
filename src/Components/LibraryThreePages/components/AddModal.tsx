/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import MainModal from '../../MainModal';
import RangeCardLibraryThreePages from './RangeCard';
import { Tooltip } from 'react-tooltip';

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
    // description: '',
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
  const [Unit, setUnit] = useState('');
  const [totalMacros, setTotalMacros] = useState({
    Fats: '',
    Protein: '',
    Carbs: '',
  });
  useEffect(() => {
    if (selectedRow) {
      setAddData({
        title: selectedRow ? selectedRow.Title : '',
        // description: selectedRow ? selectedRow.Description : '',
        score: selectedRow ? selectedRow.Base_Score : 0,
        instruction: selectedRow ? selectedRow.Instruction : '',
      });
      setDose(selectedRow ? selectedRow.Dose : '');
      setValue(selectedRow ? selectedRow.Value : '');
      setUnit(selectedRow ? selectedRow.Unit : '');
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
        // Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Dose: dose,
      };
      onSubmit(data);
      clear();
    } else if (pageType === 'Lifestyle') {
      const data: any = {
        Title: addData.title,
        // Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Value: Number(value),
        Unit: Unit,
      };
      onSubmit(data);
      clear();
    } else {
      const data: any = {
        Title: addData.title,
        // Description: addData.description,
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
      // description: '',
      score: 0,
      instruction: '',
    });
    setDose('');
    setValue('');
    setUnit('');
    setTotalMacros({ Carbs: '', Fats: '', Protein: '' });
    setShowValidation(false);
    setSelectedRow();
    setErrors({
      title: false,
      // description: false,
      instruction: false,
      dose: false,
      doseFormat: false,
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
    // description: false,
    instruction: false,
    dose: false,
    doseFormat: false,
    value: false,
    score: false,
    macros: {
      Fats: false,
      Protein: false,
      Carbs: false,
    },
  });

  const validateFields = () => {
    const doseRegex = /^(\d+\s*[a-zA-Z]+)(\s*-\s*\d+\s*[a-zA-Z]+)?$/;
    const isDoseValid = pageType === 'Supplement' ? doseRegex.test(dose) : true;

    const newErrors = {
      title: !addData.title,
      // description: !addData.description,
      instruction: !addData.instruction,
      dose: pageType === 'Supplement' && !dose,
      doseFormat: Boolean(pageType === 'Supplement' && dose && !isDoseValid),
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
        setSelectedRow();
      }}
    >
      <div className="flex flex-col justify-between bg-white w-[320px] xs:w-[350px]   sm:w-[500px] rounded-[16px] p-6">
        <div className="w-full h-full">
          <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
            {selectedRow ? 'Edit' : 'Add'} {pageType}
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>

          {/* Title Field */}
          <div className="flex flex-col mt-5 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">Title</div>
            <input
              placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}'s title...`}
              value={addData.title}
              onChange={(e) => {
                updateAddData('title', e.target.value);
                if (e.target.value) {
                  setErrors((prev) => ({ ...prev, title: false }));
                } else {
                  setErrors((prev) => ({ ...prev, title: true }));
                }
              }}
              className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                errors.title ? 'border-Red' : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
            />
            {errors.title && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div>

          {/* Description Field */}
          {/* <div className="flex flex-col mt-4 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Description
            </div>
            <textarea
              placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}'s description...`}
              value={addData.description}
              onChange={(e) => {
                updateAddData('description', e.target.value);
                if (e.target.value) {
                  setErrors((prev) => ({ ...prev, description: false }));
                } else {
                  setErrors((prev) => ({ ...prev, description: true }));
                }
              }}
              className={`w-full h-[98px] rounded-[16px] text-justify py-1 px-3 border ${
                errors.description ? 'border-Red' : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none`}
            />
            {errors.description && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div> */}

          {/* Base Score Field */}

          {/* Instruction Field */}
          <div className="flex flex-col mt-4 w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Instruction
            </div>
            <textarea
              placeholder={`Write the ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}'s instruction...`}
              value={addData.instruction}
              onChange={(e) => {
                updateAddData('instruction', e.target.value);
                if (e.target.value) {
                  setErrors((prev) => ({ ...prev, instruction: false }));
                } else {
                  setErrors((prev) => ({ ...prev, instruction: true }));
                }
              }}
              className={`w-full h-[98px] text-justify rounded-[16px] py-1 px-3 border ${
                errors.instruction ? 'border-Red' : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none`}
            />
            {errors.instruction && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div>

          {/* Supplement Specific Field */}
          {pageType === 'Supplement' && (
            <div className="flex flex-col mt-5 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary flex gap-1 items-start">
                Dose
                <img
                  data-tooltip-id="dose-info"
                  src="/icons/info-circle.svg"
                  alt=""
                />
              </div>
              <input
                placeholder="Enter the supplement's dose..."
                value={dose}
                onChange={(e) => {
                  const value = e.target.value;
                  const englishOnly = value.replace(/[^a-zA-Z0-9\s-]/g, '');
                  setDose(englishOnly);

                  const doseRegex =
                    /^(\d+\s*[a-zA-Z]+)(\s*-\s*\d+\s*[a-zA-Z]+)?$/;

                  if (englishOnly) {
                    setErrors((prev) => ({
                      ...prev,
                      dose: false,
                      doseFormat: Boolean(!doseRegex.test(englishOnly)),
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      dose: true,
                      doseFormat: false,
                    }));
                  }
                }}
                className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                  errors.dose || errors.doseFormat
                    ? 'border-Red'
                    : 'border-Gray-50'
                } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
              />
              {errors.dose && (
                <div className="text-Red text-[10px]">
                  This field is required.
                </div>
              )}
              {errors.doseFormat && (
                <div className="text-Red text-[10px]">
                  Dose must follow the described format.
                </div>
              )}
              <Tooltip
                id={`dose-info`}
                place="top-start"
                className="!bg-white !w-fit !text-wrap 
                     !text-[#888888] !opacity-100 !bg-opacity-100 !shadow-100 text-justify !text-[10px] !rounded-[6px] !border !border-Gray-50 !p-2"
                style={{
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                Dose must include a number followed by a unit (e.g., '50 mg'){' '}
              </Tooltip>
            </div>
          )}

          {/* Lifestyle Specific Field */}
          {pageType === 'Lifestyle' && (
            <div className="flex flex-col mt-5 w-full gap-2">
              <div className="text-xs font-medium text-Text-Primary flex gap-1 items-start">
                Value
                <img
                  data-tooltip-id="value-info"
                  className="size-2 cursor-pointer"
                  src="/icons/info-circle-blue.svg"
                  alt=""
                />
                <Tooltip
                  id={`value-info`}
                  place="top-start"
                  className="!bg-white !w-fit !text-wrap 
                     !text-[#888888] !opacity-100 !bg-opacity-100 !shadow-100 text-justify !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  Provide the numerical value, and if needed, enter the unit
                  manually (e.g., 8 + Hours)
                </Tooltip>
              </div>
              <div className="flex w-full gap-3">
                <input
                  placeholder="Enter Value..."
                  value={value}
                  type="text"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow positive integers
                    if (/^\d*$/.test(value)) {
                      setValue(value === '' ? '' : value);
                      if (value) {
                        setErrors((prev) => ({ ...prev, value: false }));
                      } else {
                        setErrors((prev) => ({ ...prev, value: true }));
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Allow navigation keys
                    if (
                      e.key === 'ArrowUp' ||
                      e.key === 'ArrowDown' ||
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'Tab' ||
                      e.key === 'Enter'
                    ) {
                      return;
                    }
                    // Allow numbers, backspace, delete
                    if (
                      !/[\d\b]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'Tab'
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                    errors.value ? 'border-Red' : 'border-Gray-50'
                  } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                />
                <input
                  placeholder="Enter Unit..."
                  value={Unit}
                  type="text"
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(
                      /[^a-zA-Z]/g,
                      '',
                    );
                    setUnit(onlyLetters);
                  }}
                  className={`w-full h-[28px] rounded-[16px] py-1 px-3 border  border-Gray-50
                   bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                />
              </div>
              {errors.value && (
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
                Macros Goal
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
                      type="text"
                      placeholder="Carbohydrates"
                      value={totalMacros.Carbs}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive integers
                        if (/^\d*$/.test(value)) {
                          updateTotalMacros('Carbs', value === '' ? '' : value);
                          if (value) {
                            setErrors((prev) => ({
                              ...prev,
                              macros: { ...prev.macros, Carbs: false },
                            }));
                          } else {
                            setErrors((prev) => ({
                              ...prev,
                              macros: { ...prev.macros, Carbs: true },
                            }));
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Allow navigation keys
                        if (
                          e.key === 'ArrowUp' ||
                          e.key === 'ArrowDown' ||
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Tab' ||
                          e.key === 'Enter'
                        ) {
                          return;
                        }
                        // Allow numbers, backspace, delete
                        if (
                          !/[\d\b]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab'
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                        errors.macros.Carbs ? 'border-Red' : 'border-Gray-50'
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
                      type="text"
                      placeholder="Proteins"
                      value={totalMacros.Protein}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive integers
                        if (/^\d*$/.test(value)) {
                          updateTotalMacros(
                            'Protein',
                            value === '' ? '' : value,
                          );
                          if (value) {
                            setErrors((prev) => ({
                              ...prev,
                              macros: { ...prev.macros, Protein: false },
                            }));
                          } else {
                            setErrors((prev) => ({
                              ...prev,
                              macros: { ...prev.macros, Protein: true },
                            }));
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Allow navigation keys
                        if (
                          e.key === 'ArrowUp' ||
                          e.key === 'ArrowDown' ||
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Tab' ||
                          e.key === 'Enter'
                        ) {
                          return;
                        }
                        // Allow numbers, backspace, delete
                        if (
                          !/[\d\b]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab'
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                        errors.macros.Protein ? 'border-Red' : 'border-Gray-50'
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
                      type="text"
                      placeholder="Fats"
                      value={totalMacros.Fats}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive integers
                        if (/^\d*$/.test(value)) {
                          updateTotalMacros('Fats', value === '' ? '' : value);
                          if (value) {
                            setErrors((prev) => ({
                              ...prev,
                              macros: { ...prev.macros, Fats: false },
                            }));
                          } else {
                            setErrors((prev) => ({
                              ...prev,
                              macros: { ...prev.macros, Fats: true },
                            }));
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Allow navigation keys
                        if (
                          e.key === 'ArrowUp' ||
                          e.key === 'ArrowDown' ||
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight' ||
                          e.key === 'Tab' ||
                          e.key === 'Enter'
                        ) {
                          return;
                        }
                        // Allow numbers, backspace, delete
                        if (
                          !/[\d\b]/.test(e.key) &&
                          e.key !== 'Backspace' &&
                          e.key !== 'Delete' &&
                          e.key !== 'Tab'
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full h-[28px] rounded-[16px] py-1 px-3 border ${
                        errors.macros.Fats ? 'border-Red' : 'border-Gray-50'
                      } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold`}
                    />
                  </div>
                </div>
                {/* Single validation message for all macro fields */}
                {(errors.macros.Carbs ||
                  errors.macros.Protein ||
                  errors.macros.Fats) && (
                  <div className="text-Red text-[10px]">
                    These fields are required.
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col mt-4 w-full">
            <div className="text-xs font-medium text-Text-Primary">
              Priority Weight
            </div>
            <RangeCardLibraryThreePages
              value={addData.score}
              changeValue={updateAddData}
              showValidation={showValidation}
              error={errors.score}
              required={true}
            />
          </div>

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
