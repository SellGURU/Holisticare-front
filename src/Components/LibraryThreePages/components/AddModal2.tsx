/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Application from '../../../api/app';
import {
  AssociatedInterventionInfoTextDiet,
  // DoseInfoText,
  DoseValidationEnglish,
  MacrosValidationNumber,
  ValueInfoText,
  ValueValidation,
} from '../../../utils/library-unification';
import ValidationForms from '../../../utils/ValidationForms';
import MainModal from '../../MainModal';
import SpinnerLoader from '../../SpinnerLoader';
import {
  MultiTextField,
  SelectBoxField,
  TextAreaField,
  TextField,
} from '../../UnitComponents';
import RangeCardLibraryThreePages from './RangeCard';
import PeptideDoseScheduleStep from './PeptideDoseScheduleStep';
import SelectBoxFieldAuto from '../../UnitComponents/SelectBoxFieldAuto';

interface AddModalLibraryTreePagesProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  editData?: any;
  pageType: string;
  onSubmit: (value: any) => void;
  loadingCall: boolean;
}

const AddModalLibraryTreePages: FC<AddModalLibraryTreePagesProps> = ({
  isOpen,
  editData,
  onSubmit,
  onClose,
  mode,
  pageType,
  loadingCall,
}) => {
  const placeHolderTitle = () => {
    if (pageType === 'Supplement')
      return 'Enter supplement title (e.g., Omega-3 Fish Oil)';
    if (pageType === 'Lifestyle')
      return 'Enter lifestyle title (e.g., Sleep enough)';
    if (pageType === 'Diet') return 'Enter diet title (e.g., Low-Carb Plan)';
    if (pageType === 'Peptide')
      return 'Enter peptide title (e.g., GLP-1 Agonists)';
    if (pageType === 'Other')
      return 'Enter title (e.g., Ozone Therapy session)';
    return '';
  };
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    unit: '',
    score: 0,
    dose: '',
    instruction: '',
    macros: {
      Fats: '',
      Protein: '',
      Carbs: '',
    },
    clinical_guidance: '',
    Parent_Title: '',
    fda_status: '',
    Type_Id: '',
  });
  const [step, setStep] = useState(0);
  const [selectedSchedules, setSelectedSchedules] = useState<any[]>([]);
  const [selectedCheckins, setSelectedCheckins] = useState<any[]>([]);
  const onClear = () => {
    setShowValidation(false);
    setStep(0);
    setSelectedSchedules([]);
    setSelectedCheckins([]);
    setFormData({
      title: '',
      score: 0,
      instruction: '',
      clinical_guidance: '',
      value: '',
      macros: {
        Fats: '',
        Protein: '',
        Carbs: '',
      },
      unit: '',
      dose: '',
      Parent_Title: '',
      fda_status: '',
      Type_Id: '',
    });
  };
  useEffect(() => {
    if (!isOpen) {
      onClear();
    }
  }, [isOpen]);
  const [showValidation, setShowValidation] = useState(false);
  const updateAddData = (key: keyof typeof formData, value: any) => {
    setFormData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };

  const [dietLibrary, setDietLibrary] = useState<
    { title: string; uid: string }[]
  >([]);
  const [otherTypeList, setOtherTypeList] = useState<
    { Ot_Id: string; type_name: string }[]
  >([]);
  useEffect(() => {
    if (pageType === 'Diet') {
      Application.getDietLibrary()
        .then((res) => {
          setDietLibrary(res.data);
        })
        .catch((err) => {
          console.error('Error getting diet library:', err);
        });
    }
    if (pageType === 'Other') {
      Application.getOtherTypeList()
        .then((res) => {
          setOtherTypeList(res.data || []);
        })
        .catch((err) => {
          console.error('Error getting other types:', err);
        });
    }
  }, [pageType]);
  useEffect(() => {
    if (pageType === 'Other' && isOpen) {
      Application.getOtherTypeList()
        .then((res) => {
          setOtherTypeList(res.data || []);
        })
        .catch((err) => {
          console.error('Error getting other types:', err);
        });
    }
  }, [pageType, isOpen]);

  const validateSupplementForm = () => {
    if (
      ValidationForms.IsvalidField('Title', formData.title) &&
      ValidationForms.IsvalidField('Instruction', formData.instruction) &&
      ValidationForms.IsvalidField('Dose', formData.dose) &&
      ValidationForms.IsvalidField('Score', formData.score)
    ) {
      return true;
    }
    return false;
  };
  const validateLifestyleForm = () => {
    if (
      ValidationForms.IsvalidField('Title', formData.title) &&
      ValidationForms.IsvalidField('Instruction', formData.instruction) &&
      ValidationForms.IsvalidField('Value', formData.value) &&
      ValidationForms.IsvalidField('Score', formData.score)
    ) {
      return true;
    }
    return false;
  };
  const validatePeptideForm = () => {
    if (
      ValidationForms.IsvalidField('Title', formData.title) &&
      ValidationForms.IsvalidField('Instruction', formData.instruction) &&
      ValidationForms.IsvalidField('Score', formData.score)
    ) {
      return true;
    }
    return false;
  };
  const validateOtherForm = () => {
    if (
      ValidationForms.IsvalidField('Title', formData.title) &&
      ValidationForms.IsvalidField('Instruction', formData.instruction) &&
      ValidationForms.IsvalidField('Score', formData.score) &&
      ValidationForms.IsvalidField('Type', formData.Type_Id)
    ) {
      return true;
    }
    return false;
  };
  const validateDietForm = () => {
    if (
      ValidationForms.IsvalidField('Title', formData.title) &&
      ValidationForms.IsvalidField('Instruction', formData.instruction) &&
      ValidationForms.IsvalidField('Macros', formData.macros) &&
      ValidationForms.IsvalidField('Score', formData.score)
      // ValidationForms.IsvalidField('Parent_Title', formData.Parent_Title)
    ) {
      if (mode === 'add') {
        if (
          ValidationForms.IsvalidField('Parent_Title', formData.Parent_Title)
        ) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  };
  const validateFields = () => {
    if (validateSupplementForm() && pageType === 'Supplement') {
      return true;
    }
    if (validateLifestyleForm() && pageType === 'Lifestyle') {
      return true;
    }
    if (validateDietForm() && pageType === 'Diet') {
      return true;
    }
    if (validatePeptideForm() && pageType === 'Peptide') {
      return true;
    }
    if (validateOtherForm() && pageType === 'Other') {
      return true;
    }
    return false;
  };
  useEffect(() => {
    setFormData({
      title: editData?.Title || '',
      score: editData?.Base_Score || 0,
      instruction: editData?.Instruction || '',
      clinical_guidance: editData?.Ai_note || '',
      dose: editData?.Dose || '',
      value: editData?.Value || '',
      unit: editData?.Unit || '',
      macros: {
        Fats: editData?.['Total Macros']?.Fats || '',
        Protein: editData?.['Total Macros']?.Protein || '',
        Carbs: editData?.['Total Macros']?.Carbs || '',
      },
      Parent_Title: editData?.Parent_Title || '',
      fda_status: editData?.Fda_status || '',
      Type_Id: editData?.Type_Id || '',
    });

    // For peptides, load linked schedules and connected check-ins from showPeptideDetails
    if (pageType === 'Peptide' && editData?.Peptide_Id) {
      // Use showPeptideDetails to get all peptide data including Linked_Schedules and Connected_Checkins
      if (editData?.Linked_Schedules && editData?.Connected_Checkins) {
        // If data is already in editData, use it
        setSelectedSchedules(editData.Linked_Schedules);

        // Load connected check-ins from editData
        if (editData.Connected_Checkins.length > 0) {
          Application.getCheckinFormsList()
            .then((res) => {
              const allCheckins = res.data || [];
              const selectedIds = editData.Connected_Checkins;
              const selected = allCheckins.filter(
                (c: any) =>
                  selectedIds.includes(c.id) ||
                  selectedIds.includes(c.checkin_form_id),
              );
              setSelectedCheckins(selected);
            })
            .catch((err) => {
              console.error('Error fetching check-ins for selection:', err);
              setSelectedCheckins([]);
            });
        } else {
          setSelectedCheckins([]);
        }
      } else {
        // Fetch full peptide details if not in editData
        Application.showPeptideDetails(editData.Peptide_Id)
          .then((res) => {
            const peptideData = res.data || {};
            // Set linked schedules
            setSelectedSchedules(peptideData.Linked_Schedules || []);

            // Load connected check-ins
            if (
              peptideData.Connected_Checkins &&
              peptideData.Connected_Checkins.length > 0
            ) {
              Application.getCheckinFormsList()
                .then((checkinRes) => {
                  const allCheckins = checkinRes.data || [];
                  const selectedIds = peptideData.Connected_Checkins;
                  const selected = allCheckins.filter(
                    (c: any) =>
                      selectedIds.includes(c.id) ||
                      selectedIds.includes(c.checkin_form_id),
                  );
                  setSelectedCheckins(selected);
                })
                .catch((err) => {
                  console.error('Error fetching check-ins for selection:', err);
                  setSelectedCheckins([]);
                });
            } else {
              setSelectedCheckins([]);
            }
          })
          .catch((err) => {
            console.error('Error fetching peptide details:', err);
            setSelectedSchedules([]);
            setSelectedCheckins([]);
          });
      }
    }
  }, [editData, pageType]);

  const submit = () => {
    if (pageType === 'Supplement') {
      const data: any = {
        Title: formData.title,
        Instruction: formData.instruction,
        Base_Score: formData.score,
        Dose: formData.dose,
        Ai_note: formData.clinical_guidance,
      };
      onSubmit(data);
      return;
    }
    if (pageType === 'Lifestyle') {
      const data: any = {
        Title: formData.title,
        // Description: addData.description,
        Instruction: formData.instruction,
        Base_Score: formData.score,
        Value: Number(formData.value),
        Unit: formData.unit,
        Ai_note: formData.clinical_guidance,
      };
      onSubmit(data);
      return;
    }
    if (pageType === 'Diet') {
      const data: any = {
        Title: formData.title,
        Instruction: formData.instruction,
        Base_Score: formData.score,
        Total_Macros: {
          Fats: Number(formData.macros.Fats),
          Protein: Number(formData.macros.Protein),
          Carbs: Number(formData.macros.Carbs),
        },
        Ai_note: formData.clinical_guidance,
        Parent_Id:
          dietLibrary.find(
            (value: any) => value.title === formData.Parent_Title,
          )?.uid || '',
      };
      onSubmit(data);
      return;
    }
    if (pageType === 'Peptide') {
      const data: any = {
        Title: formData.title,
        Instruction: formData.instruction,
        Base_Score: formData.score,
        Ai_note: formData.clinical_guidance,
        Fda_status: formData.fda_status || null,
      };
      onSubmit(data);
      return;
    }
    if (pageType === 'Other') {
      const data: any = {
        Title: formData.title,
        Instruction: formData.instruction,
        Base_Score: formData.score,
        Ai_note: formData.clinical_guidance,
        Type_Id: formData.Type_Id,
      };
      onSubmit(data);
      return;
    }
    return;
  };
  return (
    <>
      <MainModal
        isOpen={isOpen}
        onClose={() => {
          onClear();
          onClose();
        }}
      >
        <div className="flex relative flex-col justify-between bg-white w-[320px] xs:w-[350px] sm:w-[500px] rounded-[16px] p-6 max-h-[85vh] ">
          <div className="w-full  h-full border-b border-Boarder pb-3 mb-3">
            <div className="flex  justify-start items-center font-medium text-sm text-Text-Primary">
              {mode === 'add' ? 'Add' : 'Edit'} {pageType}
              {pageType === 'Peptide' && ` - Step ${step + 1} of 2`}
            </div>
          </div>
          <div className="overflow-y-auto h-[70%] pr-2">
            {pageType === 'Peptide' && step === 1 ? (
              <PeptideDoseScheduleStep
                selectedSchedules={selectedSchedules}
                selectedCheckins={selectedCheckins}
                onSchedulesChange={setSelectedSchedules}
                onCheckinsChange={setSelectedCheckins}
                showValidation={showValidation}
              />
            ) : (
              <>
                <TextField
                  label="Title"
                  placeholder={placeHolderTitle()}
                  value={formData.title}
                  onChange={(e) => {
                    updateAddData('title', e.target.value);
                  }}
                  isValid={
                    showValidation
                      ? ValidationForms.IsvalidField('Title', formData.title)
                      : true
                  }
                  validationText={
                    showValidation
                      ? ValidationForms.ValidationText('Title', formData.title)
                      : ''
                  }
                  margin="mt-0"
                />

                {pageType === 'Other' && (
                  <SelectBoxField
                    label="Type"
                    options={otherTypeList.map((t: any) => t.type_name)}
                    value={
                      otherTypeList.find(
                        (t: any) => t.Ot_Id === formData.Type_Id,
                      )?.type_name ?? ''
                    }
                    onChange={(value) => {
                      const selected = otherTypeList.find(
                        (t: any) => t.type_name === value,
                      );
                      updateAddData('Type_Id', selected?.Ot_Id ?? '');
                    }}
                    isValid={
                      showValidation
                        ? ValidationForms.IsvalidField('Type', formData.Type_Id)
                        : true
                    }
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText(
                            'Type',
                            formData.Type_Id,
                          )
                        : ''
                    }
                    placeholder="Select type (e.g. Ozone Therapy, Cryo Cabin)"
                    margin="mb-0 mt-2"
                  />
                )}

                {pageType === 'Diet' && (
                  <SelectBoxField
                    label="Associated Intervention"
                    options={dietLibrary.map((value: any) => value.title)}
                    value={formData.Parent_Title}
                    onChange={(value) => {
                      updateAddData('Parent_Title', value);
                    }}
                    disabled={mode === 'edit'}
                    showDisabled={mode === 'edit'}
                    isValid={
                      mode === 'add' && showValidation
                        ? ValidationForms.IsvalidField(
                            'Parent_Title',
                            formData.Parent_Title,
                          )
                        : true
                    }
                    validationText={
                      mode === 'add' && showValidation
                        ? ValidationForms.ValidationText(
                            'Parent_Title',
                            formData.Parent_Title,
                          )
                        : ''
                    }
                    placeholder={AssociatedInterventionInfoTextDiet}
                    margin="mb-0 mt-2"
                  />
                )}

                <TextAreaField
                  label="Instruction"
                  placeholder={`${pageType === 'Supplement' ? 'Enter instructions (e.g., Take 1 capsule daily with food)' : pageType === 'Lifestyle' ? 'Enter instructions (e.g., Sleep at least 8 hours per day)' : pageType === 'Peptide' ? 'Enter instructions (e.g., Subcutaneous injection)' : pageType === 'Other' ? 'Enter instructions (e.g., Session duration and frequency)' : 'Enter instructions (e.g., Limit carbs to under 100g daily)'}`}
                  value={formData.instruction}
                  onChange={(e) => {
                    updateAddData('instruction', e.target.value);
                  }}
                  isValid={
                    showValidation
                      ? ValidationForms.IsvalidField(
                          'Instruction',
                          formData.instruction,
                        )
                      : true
                  }
                  validationText={
                    showValidation
                      ? ValidationForms.ValidationText(
                          'Instruction',
                          formData.instruction,
                        )
                      : ''
                  }
                />

                {pageType === 'Supplement' && (
                  <TextField
                    label="Dose"
                    placeholder="Enter dose amount"
                    value={formData.dose}
                    onChange={(e) => {
                      const value = e.target.value;
                      const englishOnly = DoseValidationEnglish(value);
                      updateAddData('dose', englishOnly);
                    }}
                    isValid={
                      showValidation
                        ? ValidationForms.IsvalidField('Dose', formData.dose)
                        : true
                    }
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText('Dose', formData.dose)
                        : ''
                    }
                    // InfoText={DoseInfoText}
                  />
                )}

                {pageType === 'Lifestyle' && (
                  <MultiTextField
                    label="Value"
                    inputs={[
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Enter value amount',
                        value: formData.value,
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'Value',
                              formData.value,
                            )
                          : true,
                      },
                      {
                        mode: 'text',
                        pattern: '*',
                        placeholder: 'Enter unit',
                        value: formData.unit,
                        isValid: true,
                      },
                    ]}
                    onchanges={(vales: Array<any>) => {
                      if (ValueValidation(vales[0].value)) {
                        updateAddData('value', vales[0].value);
                      }
                      const onlyLettersAndSpaces = vales[1].value.replace(
                        /[^a-zA-Z\s]/g,
                        '',
                      );
                      updateAddData('unit', onlyLettersAndSpaces);
                    }}
                    InfoText={ValueInfoText}
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText(
                            'Value',
                            formData.value,
                          )
                        : ''
                    }
                  />
                )}

                {pageType === 'Diet' && (
                  <MultiTextField
                    label="Macros Goal"
                    inputs={[
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Carb amount',
                        value: formData.macros.Carbs,
                        label: 'Carbs',
                        unit: '(gr)',
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'MacrosSeparately',
                              formData.macros.Carbs,
                            )
                          : true,
                      },
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Protein amount',
                        value: formData.macros.Protein,
                        label: 'Proteins',
                        unit: '(gr)',
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'MacrosSeparately',
                              formData.macros.Protein,
                            )
                          : true,
                      },
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Fat amount',
                        value: formData.macros.Fats,
                        label: 'Fats',
                        unit: '(gr)',
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'MacrosSeparately',
                              formData.macros.Fats,
                            )
                          : true,
                      },
                    ]}
                    onchanges={(vales: Array<any>) => {
                      updateAddData('macros', {
                        Fats: MacrosValidationNumber(vales[2].value)
                          ? vales[2].value
                          : formData.macros.Fats,
                        Protein: MacrosValidationNumber(vales[1].value)
                          ? vales[1].value
                          : formData.macros.Protein,
                        Carbs: MacrosValidationNumber(vales[0].value)
                          ? vales[0].value
                          : formData.macros.Carbs,
                      });
                    }}
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText(
                            'Macros',
                            formData.macros,
                          )
                        : ''
                    }
                  />
                )}

                <div className="flex flex-col mt-4 w-full">
                  <div className="text-xs font-medium text-Text-Primary">
                    Priority Weight
                  </div>
                  <RangeCardLibraryThreePages
                    value={formData.score}
                    onChange={(value) => {
                      updateAddData('score', value);
                    }}
                    isValid={
                      showValidation
                        ? ValidationForms.IsvalidField('Score', formData.score)
                        : true
                    }
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText(
                            'Score',
                            formData.score,
                          )
                        : ''
                    }
                  />
                </div>

                <TextAreaField
                  label="Clinical Guidance"
                  placeholder="Enter clinical notes (e.g., Avoid in pregnancy; monitor in liver conditions)"
                  value={formData.clinical_guidance}
                  onChange={(e) => {
                    updateAddData('clinical_guidance', e.target.value);
                  }}
                />

                {pageType === 'Peptide' && (
                  <SelectBoxFieldAuto
                    label="FDA Status"
                    options={[
                      'FDA Approved',
                      'Over-the-Counter',
                      'Investigational',
                      'Compounded',
                      'Research Use Only',
                    ]}
                    value={formData.fda_status}
                    onChange={(value) => {
                      updateAddData('fda_status', value);
                    }}
                    placeholder="Select FDA status (optional)"
                    margin="mt-4"
                  />
                )}
              </>
            )}
          </div>
          <div className="w-full flex justify-between items-center p-2 mt-5">
            {pageType === 'Peptide' && step === 1 && (
              <div
                className="text-Disable text-sm font-medium cursor-pointer flex items-center gap-1"
                onClick={() => setStep(0)}
              >
                <img src="/icons/arrow-left.svg" alt="" className="w-5 h-5" />
                Back
              </div>
            )}
            <div className="flex-1"></div>
            <div
              className="text-Disable text-sm font-medium mr-4 cursor-pointer"
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              Cancel
            </div>
            <div
              className="text-Primary-DeepTeal text-sm font-medium cursor-pointer"
              onClick={() => {
                setShowValidation(true);
                if (pageType === 'Peptide' && step === 0) {
                  // For peptide step 1, validate and go to next step
                  if (validateFields()) {
                    setStep(1);
                    setShowValidation(false);
                  }
                } else if (pageType === 'Peptide' && step === 1) {
                  // For peptide step 2, validate schedules (required) and submit
                  if (selectedSchedules.length === 0) {
                    // Show validation error - schedules required
                    return;
                  }
                  // Submit with schedules and check-ins
                  const scheduleIds = selectedSchedules.map(
                    (s: any) => s.Schedule_Id || s.Pds_Id,
                  );
                  const checkinIds = selectedCheckins.map(
                    (c: any) => c.id || c.checkin_form_id,
                  );
                  const data: any = {
                    Title: formData.title,
                    Instruction: formData.instruction,
                    Base_Score: formData.score,
                    Ai_note: formData.clinical_guidance,
                    Fda_status: formData.fda_status || null,
                    Schedule_Ids: scheduleIds,
                    Connected_Checkins: checkinIds,
                  };
                  onSubmit(data);
                } else {
                  // For all other page types, submit normally
                  if (validateFields()) {
                    submit();
                  }
                }
              }}
            >
              {!loadingCall ? (
                pageType === 'Peptide' && step === 0 ? (
                  'Next'
                ) : mode === 'edit' ? (
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
      </MainModal>
    </>
  );
};

export default AddModalLibraryTreePages;
