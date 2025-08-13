/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import {
  DoseFormatInfoText,
  DoseInfoText,
  DoseValidationEnglish,
  DoseValidationMetric,
  LengthValidation,
  MacrosFormatInfoText,
  MacrosInfoText,
  MacrosValidationNumber,
  ValueFormatInfoText,
  ValueInfoText,
  ValueValidation,
} from '../../../utils/library-unification';
import MainModal from '../../MainModal';
import SpinnerLoader from '../../SpinnerLoader';
import { TextField } from '../../UnitComponents';
import TextAreaField from '../../UnitComponents/TextAreaField';
import ThreeTextField from '../../UnitComponents/ThreeTextField';
import TwoTextField from '../../UnitComponents/TwoTextField';
import RangeCardLibraryThreePages from './RangeCard';
import ValidationForms from '../../../utils/ValidationForms';

interface AddModalLibraryTreePagesProps {
  addShowModal: boolean;
  handleCloseModal: () => void;
  pageType: string;
  onSubmit: (value: any) => void;
  selectedRow: any;
  setSelectedRow: () => void;
  loadingCall: boolean;
  clearData: boolean;
  handleClearData: (value: boolean) => void;
}

const AddModalLibraryTreePages: FC<AddModalLibraryTreePagesProps> = ({
  addShowModal,
  handleCloseModal,
  pageType,
  onSubmit,
  selectedRow,
  setSelectedRow,
  loadingCall,
  clearData,
  handleClearData,
}) => {
  const [addData, setAddData] = useState({
    title: '',
    // description: '',
    score: 0,
    instruction: '',
    clinical_guidance: '',
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
        clinical_guidance: selectedRow ? selectedRow.Ai_note : '',
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
        Ai_note: addData.clinical_guidance,
      };
      onSubmit(data);
    } else if (pageType === 'Lifestyle') {
      const data: any = {
        Title: addData.title,
        // Description: addData.description,
        Instruction: addData.instruction,
        Base_Score: addData.score,
        Value: Number(value),
        Unit: Unit,
        Ai_note: addData.clinical_guidance,
      };
      onSubmit(data);
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
        Ai_note: addData.clinical_guidance,
      };
      onSubmit(data);
    }
  };
  const clear = () => {
    setAddData({
      title: '',
      // description: '',
      score: 0,
      instruction: '',
      clinical_guidance: '',
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
    const doseRegex = DoseValidationMetric(dose);
    const isDoseValid = pageType === 'Supplement' ? doseRegex : true;

    const newErrors = {
      title: !addData.title,
      // description: !addData.description,
      instruction: !addData.instruction,
      dose: pageType === 'Supplement' && !dose,
      doseFormat: Boolean(pageType === 'Supplement' && dose && !isDoseValid),
      value:
        (pageType === 'Lifestyle' && !value) ||
        value?.length > LengthValidation,
      score: addData.score === 0,
      macros: {
        Fats:
          (pageType === 'Diet' && !totalMacros.Fats) ||
          totalMacros?.Fats?.length > LengthValidation,
        Protein:
          (pageType === 'Diet' && !totalMacros.Protein) ||
          totalMacros?.Protein?.length > LengthValidation,
        Carbs:
          (pageType === 'Diet' && !totalMacros.Carbs) ||
          totalMacros?.Carbs?.length > LengthValidation,
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
  useEffect(() => {
    if (clearData) {
      clear();
      handleClearData(false);
    }
  }, [clearData]);
  return (
    <MainModal
      isOpen={addShowModal}
      onClose={() => {
        handleCloseModal();
        clear();
        setSelectedRow();
      }}
    >
      <div className="flex flex-col justify-between bg-white w-[320px] xs:w-[350px] sm:w-[500px] rounded-[16px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="w-full h-full">
          <div className="flex justify-start items-center font-medium text-sm text-Text-Primary">
            {selectedRow ? 'Edit' : 'Add'} {pageType}
          </div>
          <div className="w-full h-[1px] bg-Boarder my-3"></div>

          {/* Title Field */}
          <TextField
            label="Title"
            placeholder={`${pageType === 'Supplement' ? 'Enter supplement title (e.g., Omega-3 Fish Oil)' : pageType === 'Lifestyle' ? 'Enter lifestyle title (e.g., Sleep enough)' : 'Enter diet title (e.g., Low-Carb Plan)'}`}
            value={addData.title}
            onChange={(e) => {
              updateAddData('title', e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, title: false }));
              } else {
                setErrors((prev) => ({ ...prev, title: true }));
              }
            }}
            isValid={errors.title}
            validationText={errors.title ? 'This field is required.' : ''}
          />

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
              } bg-backgroundColor-Card text-xs font-normal placeholder:text-Text-Fivefold resize-none`}
            />
            {errors.description && (
              <div className="text-Red text-[10px]">
                This field is required.
              </div>
            )}
          </div> */}

          {/* Base Score Field */}

          {/* Instruction Field */}
          <TextAreaField
            label="Instruction"
            placeholder={`${pageType === 'Supplement' ? 'Enter instructions (e.g., Take 1 capsule daily with food)' : pageType === 'Lifestyle' ? 'Enter instructions (e.g., Sleep at least 8 hours per day)' : 'Enter instructions (e.g., Limit carbs to under 100g daily)'}'`}
            value={addData.instruction}
            onChange={(e) => {
              updateAddData('instruction', e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, instruction: false }));
              } else {
                setErrors((prev) => ({ ...prev, instruction: true }));
              }
            }}
            isValid={ValidationForms.IsvalidField(
              'Instructions',
              addData.instruction,
            )}
            validationText={ValidationForms.ValidationText(
              'Instructions',
              addData.instruction,
            )}
          />

          {/* Supplement Specific Field */}
          {pageType === 'Supplement' && (
            <TextField
              label="Dose"
              placeholder="Enter dose amount"
              value={dose}
              onChange={(e) => {
                const value = e.target.value;
                const englishOnly = DoseValidationEnglish(value);
                setDose(englishOnly);

                const doseRegex = DoseValidationMetric(englishOnly);

                if (englishOnly) {
                  setErrors((prev) => ({
                    ...prev,
                    dose: false,
                    doseFormat: Boolean(!doseRegex),
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    dose: true,
                    doseFormat: false,
                  }));
                }
              }}
              isValid={errors.dose || errors.doseFormat}
              validationText={
                errors.dose
                  ? 'This field is required.'
                  : errors.doseFormat
                    ? DoseFormatInfoText
                    : ''
              }
              InfoText={DoseInfoText}
            />
          )}

          {/* Lifestyle Specific Field */}
          {pageType === 'Lifestyle' && (
            <TwoTextField
              label="Value"
              onePlaceholder="Enter value amount"
              twoPlaceholder="Enter unit"
              oneValue={value}
              twoValue={Unit}
              isValid={errors.value || value.length > LengthValidation}
              validationText={
                errors.value
                  ? 'This field is required.'
                  : value.length > LengthValidation
                    ? ValueFormatInfoText
                    : ''
              }
              InfoText={ValueInfoText}
              oneOnChange={(e) => {
                const value = e.target.value;
                if (ValueValidation(value)) {
                  setValue(value === '' ? '' : value);
                  setErrors((prev) => ({
                    ...prev,
                    value: value === '' ? true : false,
                  }));
                }
              }}
              onPaste={(e) => {
                const pastedData = e.clipboardData.getData('text');
                if (!ValueValidation(pastedData)) {
                  e.preventDefault();
                }
              }}
              twoOnChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z]/g, '');
                setUnit(onlyLetters);
              }}
            />
          )}

          {/* Diet Specific Fields */}
          {pageType === 'Diet' && (
            <ThreeTextField
              label="Macros Goal"
              onePlaceholder="Carb amount"
              twoPlaceholder="Protein amount"
              threePlaceholder="Fat amount"
              oneValue={totalMacros.Carbs}
              twoValue={totalMacros.Protein}
              threeValue={totalMacros.Fats}
              oneOnChange={(e) => {
                const value = e.target.value;
                if (MacrosValidationNumber(value)) {
                  updateTotalMacros('Carbs', value === '' ? '' : value);
                  setErrors((prev) => ({
                    ...prev,
                    macros: { ...prev.macros, Carbs: value === '' },
                  }));
                }
              }}
              onPaste={(e) => {
                const pastedData = e.clipboardData.getData('text');
                if (!MacrosValidationNumber(pastedData)) {
                  e.preventDefault();
                }
              }}
              twoOnChange={(e) => {
                const value = e.target.value;
                if (MacrosValidationNumber(value)) {
                  updateTotalMacros('Protein', value === '' ? '' : value);
                  setErrors((prev) => ({
                    ...prev,
                    macros: { ...prev.macros, Protein: value === '' },
                  }));
                }
              }}
              threeOnChange={(e) => {
                const value = e.target.value;
                if (MacrosValidationNumber(value)) {
                  updateTotalMacros('Fats', value === '' ? '' : value);
                  setErrors((prev) => ({
                    ...prev,
                    macros: { ...prev.macros, Fats: value === '' },
                  }));
                }
              }}
              oneIsValid={
                errors.macros.Carbs ||
                totalMacros.Carbs.length > LengthValidation
              }
              twoIsValid={
                errors.macros.Protein ||
                totalMacros.Protein.length > LengthValidation
              }
              threeIsValid={
                errors.macros.Fats || totalMacros.Fats.length > LengthValidation
              }
              validationText={
                errors.macros.Carbs ||
                errors.macros.Protein ||
                errors.macros.Fats
                  ? 'These fields are required.'
                  : totalMacros.Carbs.length > LengthValidation ||
                      totalMacros.Protein.length > LengthValidation ||
                      totalMacros.Fats.length > LengthValidation
                    ? `${
                        totalMacros.Carbs.length > LengthValidation
                          ? 'Carbs'
                          : totalMacros.Protein.length > LengthValidation
                            ? 'Protein'
                            : 'Fats'
                      } ${MacrosFormatInfoText}`
                    : ''
              }
              oneLabel="Carbs"
              twoLabel="Proteins"
              threeLabel="Fats"
              oneUnit="(gr)"
              twoUnit="(gr)"
              threeUnit="(gr)"
              InfoText={MacrosInfoText}
            />
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
          {/* Clinical Guidance Field */}
          <TextAreaField
            label="Clinical Guidance"
            placeholder="Enter clinical notes (e.g., Avoid in pregnancy; monitor in liver conditions)"
            value={addData.clinical_guidance}
            onChange={(e) => {
              updateAddData('clinical_guidance', e.target.value);
            }}
          />

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
                }
              }}
            >
              {!loadingCall ? (
                selectedRow ? (
                  'Update'
                ) : (
                  'Add'
                )
              ) : (
                <SpinnerLoader color="#005F73" />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainModal>
  );
};

export default AddModalLibraryTreePages;
