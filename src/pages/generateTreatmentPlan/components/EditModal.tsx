/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import { TextField } from '../../../Components/UnitComponents';
import SelectBoxField from '../../../Components/UnitComponents/SelectBoxField';
import TextAreaField from '../../../Components/UnitComponents/TextAreaField';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import {
  DoseInfoText,
  DoseValidationEnglish,
  InstructionInfoText,
  NotesInfoText,
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
    Category: string;
    Recommendation: string;
    Dose: string;
    Instruction: string;
    Notes: string[];
    PractitionerComments: string[];
  }
  const [formData, setFormData] = useState<FormValues>({
    Category: defalts?.Category || '',
    Recommendation: defalts?.Recommendation || '',
    Dose: defalts?.Dose || '',
    Instruction: '',
    Notes: defalts?.['Client Notes'] || notes,
    PractitionerComments:
      defalts?.['Practitioner Comments'] || practitionerComments,
  });
  const updateFormData = (key: keyof typeof formData, value: any) => {
    setFormData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const clearFields = () => {
    setFormData({
      Category: '',
      Recommendation: '',
      Dose: '',
      Instruction: '',
      Notes: [],
      PractitionerComments: [],
    });
    setNewNote('');
    setNotes([]);
    setSelectedGroupDose(false);
    setclient_versions([]);
    setShowValidation(false);
  };
  const handleSubmit = () => {
    onSubmit({
      Category: formData.Category,
      Recommendation: formData.Recommendation,
      'Based on': defalts ? defalts['Based on'] : '',
      'Practitioner Comments': practitionerComments,
      Instruction: defalts?.Instruction
        ? defalts?.Instruction
        : [...client_versions, formData.Instruction].join(', '),
      client_version:
        formData.Instruction.trim() !== ''
          ? [...client_versions, formData.Instruction]
          : client_versions,
      Score: '0',
      'System Score': '0',
      Dose: formData.Dose,
      label: defalts?.label,
      key_benefits: defalts?.key_benefits || [],
      foods_to_eat: defalts?.foods_to_eat || [],
      foods_to_avoid: defalts?.foods_to_avoid || [],
      Times: defalts?.Times || [],
      exercises_to_avoid: defalts?.exercises_to_avoid || [],
      exercises_to_do: defalts?.exercises_to_do || [],
      Intervnetion_content: defalts?.Intervnetion_content || '',
      'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
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
  const handleInstructionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formData.Instruction.trim()) {
        setclient_versions([...client_versions, formData.Instruction]);
        updateFormData('Instruction', '');
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

  const handleDeleteInstruction = (index: number) => {
    const updatedNotes = client_versions.filter((_, i) => i !== index);
    setclient_versions(updatedNotes);
  };

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
      (formData.Instruction.length === 0 && client_versions.length === 0)
    ) {
      return;
    }
    if (formData.Category === 'Supplement' && !formData.Dose) {
      return;
    }

    // Validate notes length
    if (newNote.length > 400) {
      return;
    }
    if (
      formData.Instruction.length > 400 ||
      (formData.Instruction.length === 0 && client_versions.length == 0)
    ) {
      return;
    }
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
            placeholder="Write recommendation's title…"
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
            label="Dose"
            value={formData.Dose}
            onChange={(e) => {
              const value = e.target.value;
              const englishOnly = DoseValidationEnglish(value);
              updateFormData('Dose', englishOnly);
            }}
            disabled={!selectedGroupDose}
            placeholder="Write Dose"
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
            InfoText={DoseInfoText}
          />

          {/* Instructions Field */}
          <TextAreaField
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
          />
          <div className="mb-4 flex flex-col gap-2">
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
          </div>

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
