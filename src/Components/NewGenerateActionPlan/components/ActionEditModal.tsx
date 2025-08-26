/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import ExersiceStep from '../../../pages/Library/Activity/AddComponents/ExersiceStep';
import {
  DoseInfoText,
  DoseValidationEnglish,
  MacrosValidationNumber,
  NotesInfoText,
  ValueInfoText,
  ValueValidation,
} from '../../../utils/library-unification';
import SvgIcon from '../../../utils/svgIcon';
import ValidationForms from '../../../utils/ValidationForms';
import MainModal from '../../MainModal';
import { MultiTextField, TextField } from '../../UnitComponents';
import SelectBoxField from '../../UnitComponents/SelectBoxField';
import TextAreaField from '../../UnitComponents/TextAreaField';

interface ActionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (newNotes: string[]) => void;
  isAdd?: boolean;
  defalts?: any;
  onSubmit: (data: any) => void;
}

const ActionEditModal: React.FC<ActionEditModalProps> = ({
  isOpen,
  defalts,
  onClose,
  onSubmit,
  // onAddNotes,
  isAdd,
}) => {
  useEffect(() => {
    Application.HolisticPlanCategories({}).then((res) => {
      setGroups(res.data);
    });
  }, []);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDaysMonth, setSelectedDaysMonth] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState(defalts?.Category || '');
  const [title, setTitle] = useState(defalts?.Title || '');
  const [dose, setDose] = useState(defalts?.Dose || '');
  const [value, setValue] = useState(defalts?.Value || '');
  const [unit, setUnit] = useState(defalts?.Unit || '');
  const [totalMacros, setTotalMacros] = useState({
    Fats: defalts?.['Total Macros']?.Fats || '',
    Protein: defalts?.['Total Macros']?.Protein || '',
    Carbs: defalts?.['Total Macros']?.Carbs || '',
  });
  const [showValidation, setShowValidation] = useState(false);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const toggleDayMonthSelection = (day: string) => {
    setSelectedDaysMonth((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };
  const [groups, setGroups] = useState<any[]>([]);

  const [newNote, setNewNote] = useState('');

  const updateTotalMacros = (key: keyof typeof totalMacros, value: any) => {
    setTotalMacros((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const [instructions, setInstructions] = useState(defalts?.Instruction || '');
  const [selectedTimes] = useState<string[]>(defalts ? defalts.Times : []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    defalts ? defalts?.Activity_Location : [],
  );
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  // const [showSelect, setShowSelect] = useState(false);
  // const [practitionerComment, setPractitionerComment] = useState('');
  // const [description, setDescription] = useState('');
  // const [practitionerComments, setPractitionerComments] = useState<string[]>(
  //   defalts ? defalts['Practitioner Comments'] : [],
  // );
  const [sectionList, setSectionList] = useState([]);
  const [addData, setAddData] = useState({
    Type: defalts?.Activity_Filters?.Type || [],
    Terms: defalts?.Activity_Filters?.Terms || [],
    Conditions: defalts?.Activity_Filters?.Conditions || [],
    Muscle: defalts?.Activity_Filters?.Muscle || [],
    Equipment: defalts?.Activity_Filters?.Equipment || [],
    Level: defalts?.Activity_Filters?.Level || [],
  });
  const [step, setStep] = useState(0);
  // const updateAddData = (key: keyof typeof addData, value: any) => {
  //   setAddData((prevTheme) => ({
  //     ...prevTheme,
  //     [key]: value,
  //   }));
  // };
  // const [ConditionsOptions, setConditionsOptions] = useState([]);
  // const [EquipmentOptions, setEquipmentOptions] = useState([]);
  // const [LevelOptions, setLevelOptions] = useState([]);
  // const [MuscleOptions, setMuscleOptions] = useState([]);
  // const [TermsOptions, setTermsOptions] = useState([]);
  // const [TypesOptions, setTypeOptions] = useState([]);
  const [showExerciseValidation, setShowExerciseValidation] = useState(false);
  // useEffect(() => {
  //   Application.getExerciseFilters({}).then((res) => {
  //     setConditionsOptions(res.data.Conditions);
  //     setEquipmentOptions(res.data.Equipment);
  //     setMuscleOptions(res.data.Muscle);
  //     setLevelOptions(res.data.Level);
  //     setTermsOptions(res.data.Terms);
  //     setTypeOptions(res.data.Type);
  //   });
  // }, []);

  // const [baseScore, setBaseScore] = useState(
  //   defalts?.Base_Score === 0 ? defalts?.Base_Score : 5,
  // );
  const [frequencyType, setFrequencyType] = useState(defalts?.Frequency_Type);
  useEffect(() => {
    if (defalts) {
      if (defalts.Frequency_Type == 'weekly') {
        setSelectedDays(defalts.Frequency_Dates || []);
        setSelectedDaysMonth([]);
      } else if (defalts.Frequency_Type == 'monthly') {
        setSelectedDaysMonth(defalts.Frequency_Dates || []);
        setSelectedDays([]);
      } else {
        setSelectedDays([]);
        setSelectedDaysMonth([]);
      }
      setSelectedGroup(defalts.Category || null);
      setTitle(defalts.Title || '');
      setDose(defalts.Dose || '');
      setValue(defalts.Value || '');
      setUnit(defalts.Unit || '');
      setTotalMacros({
        Fats: defalts?.['Total Macros']?.Fats || '',
        Protein: defalts?.['Total Macros']?.Protein || '',
        Carbs: defalts?.['Total Macros']?.Carbs || '',
      });
      setInstructions(defalts.Instruction || '');
      // setSelectedTimes(defalts.Times || []);
      setNotes(defalts['Client Notes'] || []);
      // setDescription(defalts.Description || '');
      // setBaseScore(defalts.Base_Score === 0 ? defalts.Base_Score : 5);
      setFrequencyType(defalts?.Frequency_Type || null);
      setAddData({
        Type: defalts?.Activity_Filters?.Type || [],
        Terms: defalts?.Activity_Filters?.Terms || [],
        Conditions: defalts?.Activity_Filters?.Conditions || [],
        Muscle: defalts?.Activity_Filters?.Muscle || [],
        Equipment: defalts?.Activity_Filters?.Equipment || [],
        Level: defalts?.Activity_Filters?.Level || [],
      });
      // setPractitionerComments(defalts['Practitioner Comments'] || []);
    }
    setSelectedLocations(defalts?.Activity_Location || []);
    setSectionList(
      defalts?.Sections?.map((item: any) => {
        return {
          ...item,
          Exercises: item.Exercises.map((val: any) => {
            return {
              Reps: val.Reps,
              Rest: val.Rest,
              Weight: val.Weight,
              Exercise: {
                ...val,
                Reps: val.Reps,
                Rest: val.Rest,
                Weight: val.Weight,
              },
            };
          }),
        };
      }) || [],
    );
  }, [defalts, isOpen]);
  const [, setIsExerciseStepValid] = useState(false);
  const rsolveSectionListforSendToApi = () => {
    return sectionList.map((item: any) => {
      return {
        ...item,
        Exercises: item.Exercises.map((val: any) => {
          return {
            Exercise_Id: val.Exercise.Exercise_Id,
            Weight: val.Weight,
            Reps: val.Reps,
            Rest: val.Rest,
            ...val.Exercise,
          };
        }),
      };
    });
  };
  const saveActivity = () => {
    onSubmit({
      Category: selectedGroup,
      Title: title,
      // 'Practitioner Comments': practitionerComments,
      Instruction: instructions,
      Activity_Location: selectedLocations,
      // Times: selectedTimes,
      'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
      // frequencyType: frequencyType,
      frequencyDates:
        frequencyType == 'weekly'
          ? selectedDays
          : frequencyType == 'monthly'
            ? selectedDaysMonth
            : null,
      frequencyType: frequencyType,

      // Description: description,
      // Base_Score: baseScore,
      Activity_Filters: addData,
      Sections: rsolveSectionListforSendToApi(),
      Task_Type: 'Action',
    });
    onClose();
    onReset();
    setStep(0);
  };
  // const selectRef = useRef(null);
  const modalRef = useRef(null);
  // const selectButRef = useRef(null);

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
      onReset();
    },
  });

  if (!isOpen) return null;

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newNote.trim() && newNote.slice(0, 400)) {
        setNotes([...notes, newNote]);
        setNewNote('');
      }
    }
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
  const onReset = () => {
    setSelectedDays([]);
    setSelectedDaysMonth([]);
    setSelectedGroup(null);
    setTotalMacros({
      Fats: '',
      Protein: '',
      Carbs: '',
    });
    setInstructions('');
    // setSelectedTimes([]);
    setNotes([]);
    // setDescription('');
    // setBaseScore(5);
    setFrequencyType(null);
    // setPractitionerComments([]);
    // setPractitionerComment('');
    setNewNote('');
    setTitle('');
    setDose('');
    setValue('');
    setUnit('');
    setAddData({
      Type: [],
      Terms: [],
      Conditions: [],
      Muscle: [],
      Equipment: [],
      Level: [],
    });
    setSectionList([]);
    setShowValidation(false);
    setShowExerciseValidation(false);
  };

  const handleApplyClick = () => {
    setShowValidation(true);

    // Basic required field validations
    if (!selectedGroup || !title || !instructions) {
      return;
    }

    // Category specific validations
    if (
      selectedGroup === 'Supplement' &&
      !ValidationForms.IsvalidField('Dose', dose)
    ) {
      return;
    }
    if (
      selectedGroup === 'Lifestyle' &&
      !ValidationForms.IsvalidField('Value', value)
    ) {
      return;
    }
    if (
      selectedGroup === 'Diet' &&
      !ValidationForms.IsvalidField('Macros', totalMacros)
    ) {
      return;
    }

    // Frequency validations
    if (!frequencyType) {
      return;
    }
    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      return;
    }
    if (frequencyType === 'monthly' && selectedDaysMonth.length === 0) {
      return;
    }

    // If all validations pass, submit the form
    handleApply();
  };

  const handleApply = () => {
    if (selectedGroup === 'Supplement') {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        Instruction: instructions,
        Dose: dose,
        'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
        frequencyDates:
          frequencyType === 'weekly'
            ? selectedDays
            : frequencyType === 'monthly'
              ? selectedDaysMonth
              : null,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    } else if (selectedGroup === 'Lifestyle') {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        Instruction: instructions,
        Value: Number(value),
        'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
        frequencyDates:
          frequencyType === 'weekly'
            ? selectedDays
            : frequencyType === 'monthly'
              ? selectedDaysMonth
              : null,
        frequencyType: frequencyType,
        Task_Type: 'Action',
        Unit: unit,
      });
    } else if (selectedGroup === 'Diet') {
      const numberMacros = {
        Fats: Number(totalMacros.Fats),
        Protein: Number(totalMacros.Protein),
        Carbs: Number(totalMacros.Carbs),
      };
      onSubmit({
        Category: selectedGroup,
        Title: title,
        Instruction: instructions,
        'Total Macros': numberMacros,
        'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
        frequencyDates:
          frequencyType === 'weekly'
            ? selectedDays
            : frequencyType === 'monthly'
              ? selectedDaysMonth
              : null,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    } else {
      onSubmit({
        Category: selectedGroup,
        Title: title,
        Instruction: instructions,
        'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
        frequencyDates:
          frequencyType === 'weekly'
            ? selectedDays
            : frequencyType === 'monthly'
              ? selectedDaysMonth
              : null,
        frequencyType: frequencyType,
        Task_Type: 'Action',
      });
    }
    onClose();
    onReset();
  };
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
  // const toggleLocationSelection = (time: string) => {
  //   setSelectedLocations((prevTimes) =>
  //     prevTimes.includes(time)
  //       ? prevTimes.filter((t) => t !== time)
  //       : [...prevTimes, time],
  //   );
  // };

  // const times = ['morning', 'midday', 'night'];
  // const locations = ['Home', 'Gym'];
  const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
  const dayMapping: Record<string, string> = {
    sat: 'Saturday',
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
  };
  const sortedSelectedDays = [...selectedDays].sort((a, b) => {
    return days.indexOf(a) - days.indexOf(b);
  });
  const dayMonth = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(i + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const sortedSelectedDaysMonth = [...selectedDaysMonth].sort((a, b) => {
    const dayA = parseInt(a.split('-')[2], 10);
    const dayB = parseInt(b.split('-')[2], 10);
    return dayA - dayB;
  });
  const addDaySuffix = (dayStr: string) => {
    const day = parseInt(dayStr, 10);
    if (isNaN(day)) return dayStr;

    if (day >= 11 && day <= 13) return `${day}th`;

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const showAlert = () => {
    if (selectedGroup && frequencyType === 'daily') {
      return true;
    } else if (
      selectedGroup &&
      frequencyType &&
      (selectedDays.length > 0 || selectedDaysMonth.length > 0)
    ) {
      return true;
    }
  };

  const isNextDisabled = () => {
    if (!selectedGroup || !title || !frequencyType || !instructions) {
      return true;
    }
    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      return true;
    }
    if (frequencyType === 'monthly' && selectedDaysMonth.length === 0) {
      return true;
    }
    if (
      selectedGroup === 'Supplement' &&
      !ValidationForms.IsvalidField('Dose', dose)
    ) {
      return true;
    }
    if (
      selectedGroup === 'Lifestyle' &&
      !ValidationForms.IsvalidField('Value', value)
    ) {
      return true;
    }
    // if (selectedGroup === 'Activity' && selectedLocations.length === 0) {
    //   return true;
    // }
    if (
      selectedGroup === 'Diet' &&
      !ValidationForms.IsvalidField('Macros', totalMacros)
    ) {
      return true;
    }
    if (selectedGroup === 'Activity' && step === 1) {
      const emptySetSections = sectionList.filter(
        (section: any) => section.Sets == '',
      );
      if (
        sectionList.length > 0 &&
        emptySetSections.length == 0 &&
        selectedGroup === 'Activity'
      ) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  };

  // const validateDose = (value: string) => {
  //   if (!value) {
  //     return 'This field is required.';
  //   }
  //   const doseRegex = /^\d+\s*[a-zA-Z]+$/;
  //   if (!doseRegex.test(value)) {
  //     return 'Dose must follow the described format.';
  //   }
  //   return '';
  // };

  // const handleDoseBlur = () => {
  //   setTouchedFields((prev) => ({ ...prev, dose: true }));
  //   const error = validateDose(dose);
  //   setErrors((prev) => ({ ...prev, dose: error }));
  // };

  // const handleDoseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   // Only allow English characters, numbers, and spaces
  //   const englishOnly = value.replace(/[^a-zA-Z0-9\s]/g, '');
  //   setDose(englishOnly);
  //   if (touchedFields.dose) {
  //     const error = validateDose(englishOnly);
  //     setErrors((prev) => ({ ...prev, dose: error }));
  //   }
  // };

  const validateForm = () => {
    const newErrors = {
      title: '',
      instruction: '',
      dose: '',
      value: '',
      macros: '',
      category: '',
      frequency: '',
      clientNotes: '',
    };

    if (!title) {
      newErrors.title = 'This field is required.';
    }

    if (!instructions) {
      newErrors.instruction = 'This field is required.';
    }

    if (selectedGroup === 'Supplement') {
      newErrors.dose = dose ? '' : 'This field is required.';
    }

    if (selectedGroup === 'Lifestyle' && !value) {
      newErrors.value = 'This field is required.';
    }

    if (
      selectedGroup === 'Diet' &&
      (totalMacros.Carbs === '' ||
        totalMacros.Protein === '' ||
        totalMacros.Fats === '')
    ) {
      newErrors.macros = 'All macro values are required.';
    }

    if (!selectedGroup) {
      newErrors.category = 'This field is required.';
    }

    if (!frequencyType) {
      newErrors.frequency = 'This field is required.';
    }

    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      newErrors.frequency = 'Please select at least one day of the week.';
    }

    if (frequencyType === 'monthly' && selectedDaysMonth.length === 0) {
      newErrors.frequency = 'Please select at least one day of the month.';
    }

    if (newNote.length > 400) {
      newErrors.clientNotes = 'You can enter up to 400 characters';
    }

    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleNextClick = () => {
    setShowValidation(true);
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const handleSaveClick = () => {
    setShowValidation(true);
    setShowExerciseValidation(true);

    // First validate the form
    const isFormValid = validateForm();

    // Check if there are any exercises
    const hasExercises = sectionList.length > 0;

    // Check if there are any empty reps fields
    const emptySetSections = sectionList.filter(
      (section: any) => section.Sets === '',
    );
    const emptyRepsSections = sectionList.filter((section: any) =>
      section.Exercises.some((exercise: any) => exercise.Reps === ''),
    );

    // Only proceed if form is valid, there are exercises, and no empty reps
    if (
      isFormValid &&
      hasExercises &&
      emptySetSections.length == 0 &&
      emptyRepsSections.length == 0
    ) {
      saveActivity();
    }
  };
  return (
    <MainModal
      onClose={() => {
        onClose();
        onReset();
        setStep(0);
        setShowValidation(false);
      }}
      isOpen={isOpen}
    >
      <div
        className={`bg-white p-2 pb-6 rounded-2xl shadow-800 relative pt-10 ${selectedGroup == 'Activity' && step == 1 ? 'w-[920px]' : 'w-[530px]'}  text-Text-Primary`}
      >
        <div className="overflow-auto max-h-[620px] p-4 pt-0">
          <h2
            className={`${selectedGroup == 'Activity' ? 'w-[95%]' : 'w-[90%]'} border-b border-Gray-50 pb-2 pt-4 text-sm font-medium text-Text-Primary absolute top-0 bg-white z-10`}
          >
            <div className="flex gap-[6px] items-center">
              {isAdd ? 'Add Action ' : 'Edit Action'}
            </div>
          </h2>
          {step == 0 && (
            <div className={`grid `}>
              <div className="">
                <SelectBoxField
                  label="Category"
                  options={groups.map((group) => Object.keys(group)[0])}
                  value={selectedGroup || ''}
                  onChange={(value) => setSelectedGroup(value)}
                  isValid={
                    showValidation
                      ? ValidationForms.IsvalidField(
                          'Category',
                          selectedGroup || '',
                        )
                      : true
                  }
                  placeholder="Select Category"
                  disabled={defalts?.Category}
                  validationText={
                    showValidation
                      ? ValidationForms.ValidationText(
                          'Category',
                          selectedGroup || '',
                        )
                      : ''
                  }
                  margin={`${defalts?.Category ? 'opacity-50' : 'opacity-100'} mb-4 mt-2`}
                />
                <TextField
                  label="Title"
                  placeholder="Write the action's title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  isValid={
                    showValidation
                      ? ValidationForms.IsvalidField('Title', title)
                      : true
                  }
                  validationText={
                    showValidation
                      ? ValidationForms.ValidationText('Title', title)
                      : ''
                  }
                  margin="mb-4"
                />
                <TextAreaField
                  label="Instruction"
                  placeholder="Write the action's instruction..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  isValid={
                    showValidation
                      ? ValidationForms.IsvalidField(
                          'Instruction',
                          instructions,
                        )
                      : true
                  }
                  validationText={
                    showValidation
                      ? ValidationForms.ValidationText(
                          'Instruction',
                          instructions,
                        )
                      : ''
                  }
                  margin="mb-4"
                />
                {selectedGroup === 'Supplement' && (
                  <TextField
                    label="Dose"
                    placeholder="Enter dose amount"
                    value={dose}
                    onChange={(e) => {
                      const value = e.target.value;
                      const englishOnly = DoseValidationEnglish(value);
                      setDose(englishOnly);
                    }}
                    isValid={
                      showValidation
                        ? ValidationForms.IsvalidField('Dose', dose)
                        : true
                    }
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText('Dose', dose)
                        : ''
                    }
                    InfoText={DoseInfoText}
                    margin="mb-4"
                  />
                )}
                {selectedGroup === 'Lifestyle' && (
                  <MultiTextField
                    label="Value"
                    inputs={[
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Enter value amount',
                        value: value,
                        isValid: showValidation
                          ? ValidationForms.IsvalidField('Value', value)
                          : true,
                      },
                      {
                        mode: 'text',
                        pattern: '*',
                        placeholder: 'Enter unit',
                        value: unit,
                      },
                    ]}
                    onchanges={(vales: Array<any>) => {
                      if (ValueValidation(vales[0].value)) {
                        setValue(vales[0].value);
                      }
                      const onlyLetters = vales[1].value.replace(
                        /[^a-zA-Z]/g,
                        '',
                      );
                      setUnit(onlyLetters);
                    }}
                    onPaste={(e) => {
                      const pastedData = e.clipboardData.getData('text');
                      if (!ValueValidation(pastedData)) {
                        e.preventDefault();
                      }
                    }}
                    InfoText={ValueInfoText}
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText('Value', value)
                        : ''
                    }
                    margin="mb-4"
                  />
                )}
                {selectedGroup === 'Diet' && (
                  <MultiTextField
                    label="Macros Goal"
                    inputs={[
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Carb amount',
                        value: totalMacros.Carbs,
                        label: 'Carbs',
                        unit: '(gr)',
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'MacrosSeparately',
                              totalMacros.Carbs,
                            )
                          : true,
                      },
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Protein amount',
                        value: totalMacros.Protein,
                        label: 'Proteins',
                        unit: '(gr)',
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'MacrosSeparately',
                              totalMacros.Protein,
                            )
                          : true,
                      },
                      {
                        mode: 'numeric',
                        pattern: '[0-9]*',
                        placeholder: 'Fat amount',
                        value: totalMacros.Fats,
                        label: 'Fats',
                        unit: '(gr)',
                        isValid: showValidation
                          ? ValidationForms.IsvalidField(
                              'MacrosSeparately',
                              totalMacros.Fats,
                            )
                          : true,
                      },
                    ]}
                    onchanges={(vales: Array<any>) => {
                      updateTotalMacros(
                        'Fats',
                        MacrosValidationNumber(vales[2].value)
                          ? vales[2].value
                          : totalMacros.Fats,
                      );
                      updateTotalMacros(
                        'Protein',
                        MacrosValidationNumber(vales[1].value)
                          ? vales[1].value
                          : totalMacros.Protein,
                      );
                      updateTotalMacros(
                        'Carbs',
                        MacrosValidationNumber(vales[0].value)
                          ? vales[0].value
                          : totalMacros.Carbs,
                      );
                    }}
                    validationText={
                      showValidation
                        ? ValidationForms.ValidationText('Macros', totalMacros)
                        : ''
                    }
                    margin="mb-4"
                  />
                )}
                {/* {selectedGroup === 'Activity' && (
                  <>
                    <div className="text-xs font-medium mb-1">Filters</div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-">
                      <CustomSelect
                        placeHolder="Type"
                        options={TypesOptions}
                        selectedOption={addData.Type}
                        onOptionSelect={(option: string) =>
                          updateAddData('Type', [option])
                        }
                        showTop
                      />
                      <CustomSelect
                        placeHolder="Terms"
                        options={TermsOptions}
                        isMulti
                        selectedOption={addData.Terms}
                        onOptionSelect={(option: any) =>
                          updateAddData('Terms', option)
                        }
                        showTop
                      />
                      <CustomSelect
                        placeHolder="Condition"
                        options={ConditionsOptions}
                        isMulti
                        selectedOption={addData.Conditions}
                        onOptionSelect={(option: any) =>
                          updateAddData('Conditions', option)
                        }
                        showTop
                      />
                      <CustomSelect
                        placeHolder="Muscle"
                        options={MuscleOptions}
                        isMulti
                        selectedOption={addData.Muscle}
                        onOptionSelect={(option: any) =>
                          updateAddData('Muscle', option)
                        }
                        showTop
                      />
                      <CustomSelect
                        placeHolder="Equipment"
                        isMulti
                        options={EquipmentOptions}
                        selectedOption={addData.Equipment}
                        onOptionSelect={(option: any) =>
                          updateAddData('Equipment', option)
                        }
                        showTop
                      />
                      <CustomSelect
                        placeHolder="Level"
                        options={LevelOptions}
                        selectedOption={addData.Level}
                        onOptionSelect={(option: string) =>
                          updateAddData('Level', [option])
                        }
                        showTop
                      />
                    </div>
                  </>
                )} */}
              </div>
              <div>
                {/* {selectedGroup === 'Activity' && (
                  <div className="my-4">
                    <label className="text-xs font-medium">
                      Activity Location
                    </label>
                    <div className="flex w-full mt-2 gap-2">
                      {locations.map((item, index) => {
                        return (
                          <Checkbox
                            key={index}
                            checked={selectedLocations?.includes(item)}
                            onChange={() => toggleLocationSelection(item)}
                            label={item}
                          />
                        );
                      })}
                    </div>
                    {selectedLocations.length === 0 && showValidation && (
                      <span className="text-[10px] mt-[-4px] ml-2 text-red-500">
                        This field is required.
                      </span>
                    )}
                  </div>
                )} */}
                <div className="mb-4">
                  <label className="text-xs font-medium">Frequency</label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="daily"
                        name="frequency"
                        value="daily"
                        checked={frequencyType === 'daily'}
                        onChange={(e) => {
                          setFrequencyType(e.target.value);
                          setSelectedDays([]);
                          setSelectedDaysMonth([]);
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="daily"
                        className={`text-xs cursor-pointer ${frequencyType === 'daily' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
                      >
                        Daily
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="weekly"
                        name="frequency"
                        value="weekly"
                        checked={frequencyType === 'weekly'}
                        onChange={(e) => {
                          setFrequencyType(e.target.value);
                          if (frequencyType == 'weekly') {
                            setSelectedDaysMonth([]);
                          } else {
                            setSelectedDays([]);
                          }
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="weekly"
                        className={`text-xs cursor-pointer ${frequencyType === 'weekly' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
                      >
                        Weekly
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        id="monthly"
                        name="frequency"
                        value="monthly"
                        checked={frequencyType === 'monthly'}
                        onChange={(e) => {
                          setFrequencyType(e.target.value);
                          if (frequencyType == 'monthly') {
                            setSelectedDays([]);
                          } else {
                            setSelectedDaysMonth([]);
                          }
                        }}
                        className="w-[13.33px] h-[13.33px] accent-Primary-DeepTeal cursor-pointer"
                      />
                      <label
                        htmlFor="monthly"
                        className={`text-xs cursor-pointer ${frequencyType === 'monthly' ? 'text-Primary-DeepTeal' : 'text-Text-Quadruple'}`}
                      >
                        Monthly
                      </label>
                    </div>
                  </div>
                  {!frequencyType && showValidation && (
                    <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                      This field is required.
                    </span>
                  )}
                  {frequencyType === 'weekly' &&
                    selectedDays.length === 0 &&
                    showValidation && (
                      <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                        Please select at least one day of the week.
                      </span>
                    )}
                  {frequencyType === 'monthly' &&
                    selectedDaysMonth.length === 0 &&
                    showValidation && (
                      <span className="text-[10px] mt-[-16px] ml-2 text-red-500">
                        Please select at least one day of the month.
                      </span>
                    )}
                  {frequencyType === 'weekly' && (
                    <div className="mt-3">
                      <div className="text-xs text-Text-Quadruple">
                        Please select the days of the week you prefer:
                      </div>
                      <div className="mt-1 flex">
                        {days.map((day, index) => (
                          <div
                            key={index}
                            onClick={() => toggleDaySelection(day)}
                            className={`cursor-pointer capitalize border border-Gray-50 ${index == days.length - 1 && 'rounded-r-[4px]'} ${index == 0 && 'rounded-l-[4px]'} py-2 px-2 text-xs text-center ${
                              selectedDays.includes(day)
                                ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                                : 'text-Text-Secondary bg-backgroundColor-Card'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {frequencyType === 'monthly' && (
                    <div className="mt-3">
                      <div className="text-xs text-Text-Quadruple">
                        Please select the days of the month you prefer:
                      </div>
                      <div className="mt-1 flex flex-col">
                        <div className="flex">
                          {dayMonth.slice(0, 15).map((day, index) => (
                            <div
                              key={index}
                              onClick={() => toggleDayMonthSelection(day)}
                              className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-b-0 border-Gray-50 ${index == dayMonth.slice(0, 15).length - 1 && 'rounded-tr-[8px]'} ${index == 0 && 'rounded-tl-[8px]'} text-xs text-center ${
                                selectedDaysMonth.includes(day)
                                  ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                                  : 'text-Text-Secondary bg-backgroundColor-Card'
                              }`}
                            >
                              {day.split('-')[2]}
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          {dayMonth.slice(15).map((day, index) => (
                            <div
                              key={index}
                              onClick={() => toggleDayMonthSelection(day)}
                              className={`w-[24px] h-[32px] flex items-center justify-center cursor-pointer capitalize border border-Gray-50 ${index == dayMonth.slice(15).length - 1 && 'rounded-br-[8px]'} ${index == 0 && 'rounded-bl-[8px]'} text-xs text-center ${
                                selectedDaysMonth.includes(day)
                                  ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                                  : 'text-Text-Secondary bg-backgroundColor-Card'
                              }`}
                            >
                              {day.split('-')[2]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                {showAlert() ? (
                  <div className="mb-4">
                    <div className="w-full rounded-2xl px-3 py-[7px] gap-2.5 bg-bg-color border border-Gray-50 flex items-center text-justify">
                      <img
                        src="/icons/info-circle-blue.svg"
                        alt=""
                        className="w-4 h-4"
                      />
                      <div className="text-xs text-Primary-DeepTeal flex flex-wrap leading-relaxed ">
                        <span>
                          {selectedGroup === 'Supplement' ||
                          selectedGroup === 'Lifestyle' ||
                          selectedGroup === 'Diet' ||
                          selectedGroup === 'Activity'
                            ? selectedGroup
                            : 'Other'}{' '}
                          scheduled
                        </span>
                        {frequencyType === 'daily' ? (
                          <span>
                            &nbsp;for everyday {selectedTimes.join(' and ')}.
                          </span>
                        ) : frequencyType === 'weekly' ? (
                          <>
                            <span className="mr-1">&nbsp;for every</span>
                            {sortedSelectedDays.length > 1 ? (
                              <>
                                <span className="capitalize">
                                  {sortedSelectedDays
                                    .slice(0, -1)
                                    .map((day) => dayMapping[day] || day)
                                    .join(', ')}
                                </span>
                                <span className="mr-1">&nbsp;and</span>
                                <span className="capitalize">
                                  {dayMapping[
                                    sortedSelectedDays.slice(-1)[0]
                                  ] || sortedSelectedDays.slice(-1)[0]}
                                </span>
                              </>
                            ) : (
                              <span className="capitalize">
                                {dayMapping[sortedSelectedDays[0]] || ''}
                              </span>
                            )}
                            {selectedTimes.length > 0 && (
                              <>
                                <span className="mr-1">&nbsp;in</span>
                                <span>{selectedTimes.join(' and ')}</span>
                              </>
                            )}
                            <span>.</span>
                          </>
                        ) : (
                          <>
                            <span>&nbsp;for the</span>
                            {selectedTimes.length > 0 && (
                              <>
                                <span className="mr-1">&nbsp;in</span>
                                <span>{selectedTimes.join(' and ')}</span>
                              </>
                            )}
                            {sortedSelectedDaysMonth.length > 1 ? (
                              <>
                                <span className="mr-1">&nbsp;of</span>
                                <span>
                                  {sortedSelectedDaysMonth
                                    .slice(0, -1)
                                    .map((date) =>
                                      addDaySuffix(date.split('-')[2]),
                                    )
                                    .join(', ')}
                                </span>
                                <span className="mr-1">&nbsp;and</span>
                                <span>
                                  {addDaySuffix(
                                    sortedSelectedDaysMonth
                                      .slice(-1)[0]
                                      .split('-')[2],
                                  )}
                                </span>
                              </>
                            ) : (
                              <span className="ml-1">
                                {sortedSelectedDaysMonth[0]
                                  ? addDaySuffix(
                                      sortedSelectedDaysMonth[0].split('-')[2],
                                    )
                                  : ''}
                              </span>
                            )}
                            <span>.</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <TextAreaField
                  label="Client Notes"
                  placeholder="Write notes ..."
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
                <div
                  className={`${
                    notes.length > 0 ? 'mb-4' : ''
                  } flex flex-col gap-2`}
                >
                  {notes.map((note, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary  bg-backgroundColor-Card rounded-2xl"
                    >
                      <span className="break-all">{note}</span>
                      <div
                        onClick={() => handleDeleteNote(index)}
                        className="cursor-pointer"
                      >
                        <SvgIcon
                          src="/icons/delete.svg"
                          color="#FC5474"
                          width="20px"
                          height="20px"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* <div className="mb-4">
                  <label className="block text-xs font-medium">
                    Practitioner Comments
                  </label>
                  <textarea
                    value={practitionerComment}
                    onChange={(e) => setPractitionerComment(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none placeholder:text-Text-Fivefold"
                    rows={4}
                    placeholder="Document your clinical observations, interventions, and plans..."
                  />
                </div> */}
                {/* <div className="mb-4 flex flex-col gap-2">
                  {practitionerComments?.map((comment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl"
                    >
                      <span>{comment}</span>
                      <div
                        onClick={() => handleDeleteComment(index)}
                        className="cursor-pointer"
                      >
                        <SvgIcon
                          src="/icons/delete.svg"
                          color="#FC5474"
                          width="20px"
                          height="20px"
                        />
                      </div>
                    </div>
                  ))}
                </div> */}
                <div className="flex justify-end gap-3">
                  {selectedGroup !== 'Activity' && (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          setStep(0);
                          onReset();
                        }}
                        className="text-sm font-medium text-Disable cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyClick}
                        className={`${
                          selectedGroup &&
                          title &&
                          frequencyType &&
                          instructions
                            ? 'text-Primary-DeepTeal'
                            : 'text-Primary-DeepTeal'
                        } text-sm font-medium cursor-pointer`}
                      >
                        {isAdd ? 'Add' : 'Update'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <ExersiceStep
              sectionList={sectionList}
              onChange={(values: any) => {
                setSectionList(values);
              }}
              setShowValidation={(val: any) => {
                setShowExerciseValidation(val);
              }}
              showValidation={showExerciseValidation}
              onValidationChange={setIsExerciseStepValid}
            />
          )}

          {selectedGroup === 'Activity' && (
            <div
              className={`flex ${step === 0 ? 'justify-end' : 'justify-between'} items-center mb-1 mt-4`}
            >
              {step !== 0 && (
                <div
                  onClick={() => {
                    setStep(0);
                  }}
                  className="text-Disable text-[14px] cursor-pointer font-medium flex items-center gap-1"
                >
                  <img src="/icons/arrow-left.svg" alt="" className="w-5 h-5" />
                  Back
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    onClose();
                    onReset();
                    setStep(0);
                  }}
                  className="text-Disable text-[14px] cursor-pointer font-medium"
                >
                  Cancel
                </div>
                <div
                  onClick={step === 0 ? handleNextClick : handleSaveClick}
                  className={`${
                    isNextDisabled()
                      ? 'text-Primary-DeepTeal'
                      : 'text-Primary-DeepTeal'
                  } text-[14px] cursor-pointer font-medium`}
                >
                  {step === 0 ? 'Next' : !isAdd ? 'Update' : 'Save'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainModal>
  );
};

export default ActionEditModal;
