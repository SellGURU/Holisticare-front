/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import { TextField } from '../../../Components/UnitComponents';
import SelectBoxField from '../../../Components/UnitComponents/SelectBoxField';
import TextAreaField from '../../../Components/UnitComponents/TextAreaField';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import {
  // DoseInfoText,
  DoseValidationEnglish,
  ExercisesToAvoidInfoText,
  ExercisesToDoInfoText,
  FoodsToAvoidInfoText,
  KeyBenefitsInfoText,
  NotesInfoText,
  RecommendedFoodsInfoText,
} from '../../../utils/library-unification';
import SvgIcon from '../../../utils/svgIcon';
import ValidationForms from '../../../utils/ValidationForms';
// import Checkbox from '../../../Components/checkbox';
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (newNotes: string[]) => void;
  isAdd?: boolean;
  defalts?: any;
  onSubmit: (data: any) => void;
}

const EditModal: FC<EditModalProps> = ({
  isOpen,
  defalts,
  onClose,
  onSubmit,
  // onAddNotes,
  isAdd,
}) => {
  const [selectedGroupDose, setSelectedGroupDose] = useState(false);

  const [groups, setGroups] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [keyBenefitValue, setKeyBenefitValue] = useState('');
  const [foodsToEatValue, setFoodsToEatValue] = useState('');
  const [foodsToAvoidValue, setFoodsToAvoidValue] = useState('');
  const [exercisesToDoValue, setExercisesToDoValue] = useState('');
  const [exercisesToAvoidValue, setExercisesToAvoidValue] = useState('');
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  const [client_versions, setclient_versions] = useState<string[]>(
    defalts && Array.isArray(defalts['client_version'])
      ? defalts['client_version']
      : [],
  );

  const [practitionerComments] = useState<string[]>(
    defalts ? defalts['Practitioner Comments'] : [],
  );
  const [showValidation, setShowValidation] = useState(false);

  const modalRef = useRef(null);

  interface FormValues {
    'Based on': string;
    Intervnetion_content: string;
    Category: string;
    Recommendation: string;
    Dose: string;
    Instruction: string;
    key_benefits: string[];
    Notes: string[];
    PractitionerComments: string[];
    foods_to_eat: string[];
    foods_to_avoid: string[];
    exercises_to_do: string[];
    exercises_to_avoid: string[];
    issue_list: string[];
  }
  const [formData, setFormData] = useState<FormValues>({
    Category: defalts?.Category || '',
    Recommendation: defalts?.Recommendation || '',
    'Based on': defalts?.['Based on'] || '',
    Dose: defalts?.Dose || '',
    Intervnetion_content: defalts?.Intervnetion_content || '',
    key_benefits: defalts?.key_benefits || [],
    foods_to_eat: defalts?.foods_to_eat || [],
    foods_to_avoid: defalts?.foods_to_avoid || [],
    exercises_to_do: defalts?.exercises_to_do || [],
    exercises_to_avoid: defalts?.exercises_to_avoid || [],
    Instruction: '',
    Notes: defalts?.['Client Notes'] || notes,
    PractitionerComments:
      defalts?.['Practitioner Comments'] || practitionerComments,
    issue_list: defalts?.issue_list || [],
  });
  const updateFormData = (key: keyof typeof formData, value: any) => {
    setFormData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const clearFields = () => {
    setFormData({
      'Based on': '',
      Intervnetion_content: '',
      Category: '',
      Recommendation: '',
      Dose: '',
      Instruction: '',
      key_benefits: [],
      Notes: [],
      PractitionerComments: [],
      foods_to_eat: [],
      foods_to_avoid: [],
      exercises_to_do: [],
      exercises_to_avoid: [],
      issue_list: [],
    });
    setNewNote('');
    setNotes([]);
    setSelectedGroupDose(false);
    setclient_versions([]);
    setShowValidation(false);
    setFoodsToEatValue('');
    setFoodsToAvoidValue('');
    setExercisesToDoValue('');
    setExercisesToAvoidValue('');
    setKeyBenefitValue('');
  };
  const handleSubmit = () => {
    onSubmit({
      Category: formData.Category,
      Recommendation: formData.Recommendation || '',
      'Based on': formData['Based on'] || '',
      Intervnetion_content: formData.Intervnetion_content,
      'Practitioner Comments': practitionerComments,
      Instruction: defalts?.Instruction
        ? defalts?.Instruction
        : [...client_versions, formData.Instruction].join(', '),
      client_version:
        formData.Instruction.trim() !== ''
          ? [...client_versions, formData.Instruction]
          : client_versions,
      Score: 0,
      'System Score': 0,
      Dose: formData.Dose,
      label: defalts?.label,
      key_benefits:
        keyBenefitValue.trim() !== ''
          ? [...formData.key_benefits, keyBenefitValue]
          : formData.key_benefits,
      foods_to_eat:
        foodsToEatValue.trim() !== ''
          ? [...formData.foods_to_eat, foodsToEatValue]
          : formData.foods_to_eat,
      foods_to_avoid:
        foodsToAvoidValue.trim() !== ''
          ? [...formData.foods_to_avoid, foodsToAvoidValue]
          : formData.foods_to_avoid,
      Times: defalts?.Times || [],
      exercises_to_avoid:
        exercisesToAvoidValue.trim() !== ''
          ? [...formData.exercises_to_avoid, exercisesToAvoidValue]
          : formData.exercises_to_avoid,
      exercises_to_do:
        exercisesToDoValue.trim() !== ''
          ? [...formData.exercises_to_do, exercisesToDoValue]
          : formData.exercises_to_do,
      'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
      issue_list: formData.issue_list.length > 0 ? formData.issue_list : [],
    });
    onClose();
    clearFields();
  };
  // const formik = useFormik<FormValues>({
  //   initialValues: {
  //     Category: defalts?.Category || '',
  //     Recommendation: defalts?.Recommendation || '',
  //     Dose: defalts?.Dose || '',
  //     Instruction: defalts?.['Instruction'],
  //     // Times: defalts?.Times || [],
  //     Notes: defalts?.['Client Notes'] || notes,
  //     PractitionerComments:
  //       defalts?.['Practitioner Comments'] || practitionerComments,
  //   },
  //   validationSchema,
  //   validateOnMount: true,
  //   onSubmit: (values) => ,
  // });
  useEffect(() => {
    Application.HolisticPlanCategories({}).then((res) => {
      setGroups(res.data);

      // If there's a default category, set the initial dose value
      if (defalts?.Category) {
        const selectedGroupData = res.data.find(
          (g: any) => Object.keys(g)[0] === defalts.Category,
        );
        if (selectedGroupData) {
          setSelectedGroupDose(selectedGroupData[defalts.Category].Dose);
        }
      }
    });
  }, []);

  useEffect(() => {
    const category = formData.Category;
    if (category && groups.length > 0) {
      const selectedGroupData = groups.find(
        (g: any) => Object.keys(g)[0] === category,
      );
      if (selectedGroupData) {
        setSelectedGroupDose(selectedGroupData[category].Dose);
      }
    }
  }, [formData.Category, groups]);
  // useModalAutoClose({
  //   refrence: selectRef,
  //   buttonRefrence: selectButRef,
  //   close: () => {
  //     setShowSelect(false);
  //   },
  // });

  useModalAutoClose({
    refrence: modalRef,
    close: () => {
      onClose();
      clearFields();
    },
  });

  if (!isOpen) return null;

  const handleNoteKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newNote.trim()) {
        if (newNote.length <= 400) {
          setNotes([...notes, newNote]);
          setNewNote('');
        }
      }
    }
  };
  const handleKeyBenefitKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (keyBenefitValue.trim()) {
        setKeyBenefitValue('');
        updateFormData('key_benefits', [
          ...formData.key_benefits,
          keyBenefitValue,
        ]);
      }
    }
  };
  const handleFoodsToEatKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (foodsToEatValue.trim()) {
        setFoodsToEatValue('');
        updateFormData('foods_to_eat', [
          ...formData.foods_to_eat,
          foodsToEatValue,
        ]);
      }
    }
  };
  const handleFoodsToAvoidKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (foodsToAvoidValue.trim()) {
        setFoodsToAvoidValue('');
        updateFormData('foods_to_avoid', [
          ...formData.foods_to_avoid,
          foodsToAvoidValue,
        ]);
      }
    }
  };
  const handleDeleteFoodsToEat = (index: number) => {
    const updatedFoodsToEat = formData.foods_to_eat.filter(
      (_, i) => i !== index,
    );
    updateFormData('foods_to_eat', updatedFoodsToEat);
  };
  const handleDeleteFoodsToAvoid = (index: number) => {
    const updatedFoodsToAvoid = formData.foods_to_avoid.filter(
      (_, i) => i !== index,
    );
    updateFormData('foods_to_avoid', updatedFoodsToAvoid);
  };
  const handleInstructionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formData.Instruction.trim()) {
        setclient_versions([...client_versions, formData.Instruction]);
        updateFormData('Instruction', '');
      }
    }
  };
  const handleExercisesToDoKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (exercisesToDoValue.trim()) {
        setExercisesToDoValue('');
        updateFormData('exercises_to_do', [
          ...formData.exercises_to_do,
          exercisesToDoValue,
        ]);
      }
    }
  };
  const handleExercisesToAvoidKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (exercisesToAvoidValue.trim()) {
        setExercisesToAvoidValue('');
        updateFormData('exercises_to_avoid', [
          ...formData.exercises_to_avoid,
          exercisesToAvoidValue,
        ]);
      }
    }
  };
  const handleDeleteExercisesToDo = (index: number) => {
    const updatedExercisesToDo = formData.exercises_to_do.filter(
      (_, i) => i !== index,
    );
    updateFormData('exercises_to_do', updatedExercisesToDo);
  };
  const handleDeleteExercisesToAvoid = (index: number) => {
    const updatedExercisesToAvoid = formData.exercises_to_avoid.filter(
      (_, i) => i !== index,
    );
    updateFormData('exercises_to_avoid', updatedExercisesToAvoid);
  };
  // const handleCommentKeyDown = (
  //   e: React.KeyboardEvent<HTMLTextAreaElement>,
  // ) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     if (practitionerComment.trim()) {
  //       setPractitionerComments([...practitionerComments, practitionerComment]);
  //       setPractitionerComment('');
  //     }
  //   }
  // };
  const handleDeleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleDeleteKeyBenefit = (index: number) => {
    const updatedKeyBenefits = formData.key_benefits.filter(
      (_, i) => i !== index,
    );
    updateFormData('key_benefits', updatedKeyBenefits);
  };

  // const handleDeleteInstruction = (index: number) => {
  //   const updatedNotes = client_versions.filter((_, i) => i !== index);
  //   setclient_versions(updatedNotes);
  // };

  // const handleApply = () => {
  //   onSubmit({
  //     Category: selectedGroup,
  //     Recommendation: defalts?.Recommendation || '',
  //           'Based on': defalts ? defalts['Based on'] : '',
  //     'Practitioner Comments': practitionerComments,
  //     Instruction: instructions,
  //     Times: selectedTimes,
  //     Dose: dose,
  //     'Client Notes': notes,
  //   });
  //   onClose();
  // };
  // const handleDeleteComment = (index: number) => {
  //   const updatedComments = practitionerComments.filter((_, i) => i !== index);
  //   setPractitionerComments(updatedComments);
  // };

  // const toggleTimeSelection = (time: string) => {
  //   setSelectedTimes((prevTimes) =>
  //     prevTimes.includes(time)
  //       ? prevTimes.filter((t) => t !== time)
  //       : [...prevTimes, time],
  //   );
  // };

  // const times = ['morning', 'midday', 'night'];
  //               "morning",
  // "midday",
  // "night"
  // const groups = ['Diet', 'Activity', 'Supplement', 'Lifestyle'];

  // const selectedGroupDose = selectedGroup
  //   ? groups.find((g) => Object.keys(g)[0] === selectedGroup)?.[selectedGroup]
  //       .Dose
  //   : false;

  const handleSaveClick = () => {
    setShowValidation(true);

    if (
      !formData.Category ||
      !formData.Recommendation ||
      // ||
      // (formData.Instruction.length === 0 && client_versions.length === 0)
      !formData.Intervnetion_content ||
      !formData['Based on']
    ) {
      return;
    }
    if (
      formData.key_benefits.length === 0 &&
      !ValidationForms.IsvalidField('KeyBenefits', keyBenefitValue)
    ) {
      return;
    }
    if (
      formData.Category === 'Supplement' &&
      !ValidationForms.IsvalidField('Dose', formData.Dose)
    ) {
      return;
    }
    if (
      formData.Category === 'Diet' &&
      !ValidationForms.IsvalidField('FoodsToEat', formData.foods_to_eat) &&
      !ValidationForms.IsvalidField('FoodsToEat', foodsToEatValue)
    ) {
      return;
    }
    if (
      formData.Category === 'Diet' &&
      !ValidationForms.IsvalidField('FoodsToAvoid', formData.foods_to_avoid) &&
      !ValidationForms.IsvalidField('FoodsToAvoid', foodsToAvoidValue)
    ) {
      return;
    }
    if (
      formData.Category === 'Activity' &&
      !ValidationForms.IsvalidField(
        'ExercisesToDo',
        formData.exercises_to_do,
      ) &&
      !ValidationForms.IsvalidField('ExercisesToDo', exercisesToDoValue)
    ) {
      return;
    }
    if (
      formData.Category === 'Activity' &&
      !ValidationForms.IsvalidField(
        'ExercisesToAvoid',
        formData.exercises_to_avoid,
      ) &&
      !ValidationForms.IsvalidField('ExercisesToAvoid', exercisesToAvoidValue)
    ) {
      return;
    }
    // Validate notes length
    if (newNote.length > 400) {
      return;
    }
    // if (
    //   formData.Instruction.length > 400 ||
    //   (formData.Instruction.length === 0 && client_versions.length == 0)
    // ) {
    //   return;
    // }
    handleSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div
        ref={modalRef}
        className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[90vw]  md:w-[500px] text-Text-Primary max-h-[660px]"
      >
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">
            {isAdd ? 'Add Recommendation' : 'Edit Recommendation'}
          </div>
        </h2>
        <div
          className="max-h-[460px] overflow-y-auto pr-1 mt-[6px]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#E5E5E5 transparent',
          }}
        >
          {/* Category Field */}
          <SelectBoxField
            label="Category"
            options={groups.map((group) => Object.keys(group)[0])}
            value={formData.Category}
            onChange={(value) => {
              updateFormData('Category', value);
              updateFormData('Dose', '');
            }}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField('Category', formData.Category)
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText('Category', formData.Category)
                : ''
            }
            placeholder="Select Group"
          />
          <TextField
            label="Title"
            placeholder="Enter recommendation title (e.g., Vitamin D3)"
            value={formData.Recommendation}
            onChange={(e) => {
              updateFormData('Recommendation', e.target.value);
            }}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField('Title', formData.Recommendation)
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText(
                    'Title',
                    formData.Recommendation,
                  )
                : ''
            }
            margin="mb-4"
          />
          <TextField
            label="Scientific Basis"
            placeholder="Enter a related biomarker or health concern  (e.g., LDL Cholesterol )"
            value={formData['Based on']}
            onChange={(e) => {
              updateFormData('Based on', e.target.value);
            }}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField('Based on', formData['Based on'])
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText(
                    'Based on',
                    formData['Based on'],
                  )
                : ''
            }
            margin="mb-4"
          />
          {selectedGroupDose && (
            <TextField
              label="Recommended Dosage"
              value={formData.Dose}
              onChange={(e) => {
                const value = e.target.value;
                const englishOnly = DoseValidationEnglish(value);
                updateFormData('Dose', englishOnly);
              }}
              disabled={!selectedGroupDose}
              placeholder="Enter dose amount"
              margin={`${selectedGroupDose ? 'opacity-100' : 'opacity-50'} mb-4`}
              isValid={
                showValidation && selectedGroupDose
                  ? ValidationForms.IsvalidField('Dose', formData.Dose)
                  : true
              }
              validationText={
                showValidation && selectedGroupDose
                  ? ValidationForms.ValidationText('Dose', formData.Dose)
                  : ''
              }
              // InfoText={DoseInfoText}
            />
          )}
          <TextAreaField
            label="Guidelines"
            placeholder="Enter a detailed, client-facing explanation of the intervention (e.g., Focuses on fresh fruits, vegetables, whole grains, nuts, and healthy fats.)"
            value={formData.Intervnetion_content}
            onChange={(e) => {
              updateFormData('Intervnetion_content', e.target.value);
            }}
            onKeyDown={handleInstructionKeyDown}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField(
                    'Intervnetion_content',
                    formData.Intervnetion_content,
                  )
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText(
                    'Intervnetion_content',
                    formData.Intervnetion_content,
                  )
                : ''
            }
            height="h-[140px]"
            margin="mb-4"
          />

          <TextAreaField
            label="Expected Benefits"
            placeholder="List expected benefits (e.g., Improves sleep quality, boosts energy)"
            value={keyBenefitValue}
            onChange={(e) => {
              setKeyBenefitValue(e.target.value);
            }}
            onKeyDown={handleKeyBenefitKeyDown}
            isValid={
              showValidation && formData.key_benefits.length === 0
                ? ValidationForms.IsvalidField('KeyBenefits', keyBenefitValue)
                : true
            }
            validationText={
              showValidation && formData.key_benefits.length === 0
                ? ValidationForms.ValidationText('KeyBenefits', keyBenefitValue)
                : ''
            }
            InfoText={KeyBenefitsInfoText}
            margin={`${formData.key_benefits.length > 0 ? 'mb-4' : 'mb-0'}`}
          />

          {/* Notes List */}
          <div className="mb-4 flex flex-col gap-2">
            {formData.key_benefits.map((keyBenefit, index) => (
              <div key={index} className="w-full flex gap-1 items-start">
                <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                  <span>{keyBenefit}</span>
                </div>
                <div
                  onClick={() => handleDeleteKeyBenefit(index)}
                  className="cursor-pointer"
                >
                  <SvgIcon
                    src="/icons/delete.svg"
                    color="#FC5474"
                    width="24px"
                    height="24px"
                  />
                </div>
              </div>
            ))}
          </div>

          {formData.Category === 'Diet' ? (
            <>
              <TextAreaField
                label="Recommended Foods"
                placeholder="Suggest foods to include (e.g., Leafy greens, lean proteins)"
                value={foodsToEatValue}
                onChange={(e) => {
                  setFoodsToEatValue(e.target.value);
                }}
                onKeyDown={handleFoodsToEatKeyDown}
                isValid={
                  showValidation && formData.foods_to_eat.length === 0
                    ? ValidationForms.IsvalidField(
                        'FoodsToEat',
                        foodsToEatValue,
                      )
                    : true
                }
                validationText={
                  showValidation && formData.foods_to_eat.length === 0
                    ? ValidationForms.ValidationText(
                        'FoodsToEat',
                        foodsToEatValue,
                      )
                    : ''
                }
                InfoText={RecommendedFoodsInfoText}
                margin={`${formData.foods_to_eat.length > 0 ? 'mb-4' : 'mb-0'}`}
              />

              <div className="mb-4 flex flex-col gap-2">
                {formData.foods_to_eat.map((foodsToEat, index) => (
                  <div key={index} className="w-full flex gap-1 items-start">
                    <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                      <span>{foodsToEat}</span>
                    </div>
                    <div
                      onClick={() => handleDeleteFoodsToEat(index)}
                      className="cursor-pointer"
                    >
                      <SvgIcon
                        src="/icons/delete.svg"
                        color="#FC5474"
                        width="24px"
                        height="24px"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <TextAreaField
                label="Foods to Limit"
                placeholder="Mention foods to limit (e.g., Avoid dairy, fried foods)"
                value={foodsToAvoidValue}
                onChange={(e) => {
                  setFoodsToAvoidValue(e.target.value);
                }}
                onKeyDown={handleFoodsToAvoidKeyDown}
                isValid={
                  showValidation && formData.foods_to_avoid.length === 0
                    ? ValidationForms.IsvalidField(
                        'FoodsToAvoid',
                        foodsToAvoidValue,
                      )
                    : true
                }
                validationText={
                  showValidation && formData.foods_to_avoid.length === 0
                    ? ValidationForms.ValidationText(
                        'FoodsToAvoid',
                        foodsToAvoidValue,
                      )
                    : ''
                }
                InfoText={FoodsToAvoidInfoText}
                margin={`${formData.foods_to_avoid.length > 0 ? 'mb-4' : 'mb-0'}`}
              />

              <div className="mb-4 flex flex-col gap-2">
                {formData.foods_to_avoid.map((foodsToAvoid, index) => (
                  <div key={index} className="w-full flex gap-1 items-start">
                    <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                      <span>{foodsToAvoid}</span>
                    </div>
                    <div
                      onClick={() => handleDeleteFoodsToAvoid(index)}
                      className="cursor-pointer"
                    >
                      <SvgIcon
                        src="/icons/delete.svg"
                        color="#FC5474"
                        width="24px"
                        height="24px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            ''
          )}
          {formData.Category === 'Activity' ? (
            <>
              <TextAreaField
                label="Recommended Exercises"
                placeholder="Suggest suitable exercises (e.g., Light yoga, daily walks)"
                value={exercisesToDoValue}
                onChange={(e) => {
                  setExercisesToDoValue(e.target.value);
                }}
                onKeyDown={handleExercisesToDoKeyDown}
                isValid={
                  showValidation && formData.exercises_to_do.length === 0
                    ? ValidationForms.IsvalidField(
                        'ExercisesToDo',
                        exercisesToDoValue,
                      )
                    : true
                }
                validationText={
                  showValidation && formData.exercises_to_do.length === 0
                    ? ValidationForms.ValidationText(
                        'ExercisesToDo',
                        exercisesToDoValue,
                      )
                    : ''
                }
                InfoText={ExercisesToDoInfoText}
                margin={`${formData.exercises_to_do.length > 0 ? 'mb-4' : 'mb-0'}`}
              />

              {/* Notes List */}
              <div className="mb-4 flex flex-col gap-2">
                {formData.exercises_to_do.map((exercisesToDo, index) => (
                  <div key={index} className="w-full flex gap-1 items-start">
                    <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                      <span>{exercisesToDo}</span>
                    </div>
                    <div
                      onClick={() => handleDeleteExercisesToDo(index)}
                      className="cursor-pointer"
                    >
                      <SvgIcon
                        src="/icons/delete.svg"
                        color="#FC5474"
                        width="24px"
                        height="24px"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <TextAreaField
                label="Exercises to Limit"
                placeholder="Mention any exercises to limit (e.g., Avoid intense cardio)"
                value={exercisesToAvoidValue}
                onChange={(e) => {
                  setExercisesToAvoidValue(e.target.value);
                }}
                onKeyDown={handleExercisesToAvoidKeyDown}
                isValid={
                  showValidation && formData.exercises_to_avoid.length === 0
                    ? ValidationForms.IsvalidField(
                        'ExercisesToAvoid',
                        exercisesToAvoidValue,
                      )
                    : true
                }
                validationText={
                  showValidation && formData.exercises_to_avoid.length === 0
                    ? ValidationForms.ValidationText(
                        'ExercisesToAvoid',
                        exercisesToAvoidValue,
                      )
                    : ''
                }
                InfoText={ExercisesToAvoidInfoText}
                margin={`${formData.exercises_to_avoid.length > 0 ? 'mb-4' : 'mb-0'}`}
              />

              {/* Notes List */}
              <div className="mb-4 flex flex-col gap-2">
                {formData.exercises_to_avoid.map((exercisesToAvoid, index) => (
                  <div key={index} className="w-full flex gap-1 items-start">
                    <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                      <span>{exercisesToAvoid}</span>
                    </div>
                    <div
                      onClick={() => handleDeleteExercisesToAvoid(index)}
                      className="cursor-pointer"
                    >
                      <SvgIcon
                        src="/icons/delete.svg"
                        color="#FC5474"
                        width="24px"
                        height="24px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            ''
          )}
          {/* Instructions Field */}
          {/* <TextAreaField
            label="Instructions"
            placeholder="Write the action's instruction..."
            value={formData.Instruction}
            onChange={(e) => {
              updateFormData('Instruction', e.target.value);
            }}
            onKeyDown={handleInstructionKeyDown}
            isValid={
              showValidation && client_versions.length === 0
                ? ValidationForms.IsvalidField(
                    'Instruction',
                    formData.Instruction,
                  )
                : true
            }
            validationText={
              showValidation && client_versions.length === 0
                ? ValidationForms.ValidationText(
                    'Instruction',
                    formData.Instruction,
                  )
                : ''
            }
            InfoText={InstructionInfoText}
            margin={`${client_versions.length > 0 ? 'mb-4' : 'mb-0'}`}
          /> */}
          {/* <div className="mb-4 flex flex-col gap-2">
            {client_versions.map((note, index) => (
              <div key={index} className="w-full flex gap-1 items-start">
                <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                  <span>{note}</span>
                </div>
                <div
                  onClick={() => handleDeleteInstruction(index)}
                  className="cursor-pointer"
                >
                  <SvgIcon
                    src="/icons/delete.svg"
                    color="#FC5474"
                    width="24px"
                    height="24px"
                  />
                </div>
              </div>
            ))}
          </div> */}

          {/* Times Selection */}
          {/* <div className="mb-4">
              <label className="text-xs font-medium">Times</label>
              <div className="flex w-full mt-2 gap-6">
                {times.map((item, index) => {
                  return (
                    <Checkbox
                      key={index}
                      checked={selectedTimes.includes(item)}
                      onChange={() => toggleTimeSelection(item)}
                      label={item}
                      borderColor="border-Text-Quadruple"
                      width="w-3.5"
                      height="h-3.5"
                    />
                  );
                })}
              </div>
            </div> */}

          {/* Client Notes */}
          <TextAreaField
            label="Client Notes"
            placeholder="Write personalized notes for your client"
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
            }}
            onKeyDown={handleNoteKeyDown}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField('Note', newNote)
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText('Note', newNote)
                : ''
            }
            InfoText={NotesInfoText}
            margin="mb-4"
          />

          {/* Notes List */}
          <div className="mb-4 flex flex-col gap-2">
            {notes.map((note, index) => (
              <div key={index} className="w-full flex gap-1 items-start">
                <div className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                  <span>{note}</span>
                </div>
                <div
                  onClick={() => handleDeleteNote(index)}
                  className="cursor-pointer"
                >
                  <SvgIcon
                    src="/icons/delete.svg"
                    color="#FC5474"
                    width="24px"
                    height="24px"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Practitioner Comments */}
          {/* <div className="mb-4">
              <label className="block text-xs font-medium">
                Practitioner Comments
              </label>
              <textarea
                value={practitionerComment}
                onChange={(e) => setPractitionerComment(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
                rows={4}
                placeholder="Enter internal observations or comments..."
              />
            </div> */}

          {/* Comments List */}
          {/* <div className="mb-4 flex flex-col gap-2">
              {practitionerComments?.map((comment, index) => (
                <div key={index} className="w-full flex gap-1 items-start">
                  <div className="w-full flex justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl">
                    <span>{comment}</span>
                  </div>
                  <div
                    onClick={() => handleDeleteComment(index)}
                    className="cursor-pointer"
                  >
                    <SvgIcon
                      src="/icons/delete.svg"
                      color="#FC5474"
                      width="16px"
                      height="16px"
                    />
                  </div>
                </div>
              ))}
            </div> */}
        </div>

        {/* Action Buttons */}
        <div className="  flex justify-end gap-4 mt-8">
          <button
            onClick={() => {
              setShowValidation(false);
              onClose();
              clearFields();
            }}
            className="text-sm font-medium text-[#909090] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setShowValidation(true);
              handleSaveClick();
            }}
            className="text-sm font-medium cursor-pointer text-Primary-DeepTeal"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
