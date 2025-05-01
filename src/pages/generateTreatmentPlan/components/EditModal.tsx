/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../utils/svgIcon';
import Application from '../../../api/app';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Tooltip } from 'react-tooltip';
import Checkbox from '../../../Components/checkbox';
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (newNotes: string[]) => void;
  isAdd?: boolean;
  defalts?: any;
  onSubmit: (data: any) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  defalts,
  onClose,
  onSubmit,
  // onAddNotes,
  isAdd,
}) => {
  const [selectedGroupDose, setSelectedGroupDose] = useState(false);

  const [groups, setGroups] = useState<any[]>([]);
  // const [selectedGroup] = useState<string | null>(defalts?.Category || null);
  const [newNote, setNewNote] = useState('');
  // const [recommendation] = useState(defalts?.Recommendation);
  // const [dose] = useState(defalts?.Dose);
  // const [instructions] = useState(defalts?.Instruction);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    defalts ? defalts.Times : [],
  );
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  const [showSelect, setShowSelect] = useState(false);
  // const [group, setGroup] = useState(defalts?.Category);
  // const [practitionerComment, setPractitionerComment] = useState('');

  const [practitionerComments] = useState<string[]>(
    defalts ? defalts['Practitioner Comments'] : [],
  );
  const [showValidation, setShowValidation] = useState(false);
  const clearFields = () => {
    formik.resetForm();
    setNewNote('');
    setNotes([]);
    setSelectedGroupDose(false);
    setSelectedTimes([]);
    setShowValidation(false);
    // setGroups([]);
  };

  const selectRef = useRef(null);
  const modalRef = useRef(null);
  const selectButRef = useRef(null);
  const validationSchema = Yup.object({
    Category: Yup.string().required('This field is required.'),
    Recommendation: Yup.string().required('This field is required.'),
    Dose: Yup.string().test(
      'dose-required',
      'This field is required.',
      function (value) {
        // If selectedGroupDose is true, then Dose is required
        if (!selectedGroupDose) return true;
        return Boolean(value && value.trim() !== '');
      },
    ),
    Instruction: Yup.string().required('This field is required.'),
  });
  interface FormValues {
    Category: string;
    Recommendation: string;
    Dose: string;
    Instruction: string;
    Times: string[];
    Notes: string[];
    PractitionerComments: string[];
  }
  const formik = useFormik<FormValues>({
    initialValues: {
      Category: defalts?.Category || '',
      Recommendation: defalts?.Recommendation || '',
      Dose: defalts?.Dose || '',
      Instruction: defalts?.Instruction || '',
      Times: defalts?.Times || [],
      Notes: defalts?.['Client Notes'] || notes,
      PractitionerComments:
        defalts?.['Practitioner Comments'] || practitionerComments,
    },
    validationSchema,
    validateOnMount: true,
    enableReinitialize: true,

    onSubmit: (values) => {
      if (formik.isValid) {
        onSubmit({
          Category: values.Category,
          Recommendation: values.Recommendation,
          'Based on': defalts ? defalts['Based on'] : '',
          'Practitioner Comments': practitionerComments,
          Instruction: values.Instruction,
          Score: '0',
          'System Score': '0',
          Times: selectedTimes,
          Dose: values.Dose,
          'Client Notes': newNote.trim() !== '' ? [...notes, newNote] : notes,
        });
        onClose();
        clearFields();
      }
    },
  });
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
    const category = formik.values.Category;
    if (category && groups.length > 0) {
      const selectedGroupData = groups.find(
        (g: any) => Object.keys(g)[0] === category,
      );
      if (selectedGroupData) {
        setSelectedGroupDose(selectedGroupData[category].Dose);
      }
    }
  }, [formik.values.Category, groups]);
  useModalAutoClose({
    refrence: selectRef,
    buttonRefrence: selectButRef,
    close: () => {
      setShowSelect(false);
    },
  });

  useModalAutoClose({
    refrence: modalRef,
    close: () => {
      onClose();
      clearFields();
    },
  });

  if (!isOpen) return null;

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newNote.trim()) {
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

  const toggleTimeSelection = (time: string) => {
    setSelectedTimes((prevTimes) =>
      prevTimes.includes(time)
        ? prevTimes.filter((t) => t !== time)
        : [...prevTimes, time],
    );
  };

  const times = ['morning', 'midday', 'night'];
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
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length > 0) {
        // If there are validation errors, just show them without submitting
        return;
      }
      // Only submit if there are no validation errors
      formik.handleSubmit();
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div
        ref={modalRef}
        className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[500px] text-Text-Primary max-h-[660px]"
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
          <form onSubmit={formik.handleSubmit}>
            {/* Category Field */}
            <div className="w-full relative overflow-visible mt-1 mb-4">
              <label className="text-xs font-medium text-Text-Primary">
                Category
              </label>
              <div
                onClick={() => setShowSelect(!showSelect)}
                className={`w-full cursor-pointer h-[28px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border mt-1 ${
                  showValidation && formik.errors.Category
                    ? 'border-Red'
                    : 'border-Gray-50'
                }`}
              >
                {formik.values.Category ? (
                  <div className="text-[12px] text-Text-Primary">
                    {formik.values.Category}
                  </div>
                ) : (
                  <div className="text-[12px] text-gray-400">Select Group</div>
                )}
                <div>
                  <img
                    className={`${showSelect && 'rotate-180'}`}
                    src="/icons/arow-down-drop.svg"
                    alt=""
                  />
                </div>
              </div>
              {showValidation && formik.errors.Category && (
                <div className="text-Red text-[10px] mt-1">
                  {formik.errors.Category}
                </div>
              )}
              {showSelect && (
                <div className="w-full z-20 shadow-200 py-1 px-3 rounded-br-2xl rounded-bl-2xl absolute bg-backgroundColor-Card border border-gray-50 top-[56px]">
                  {groups.map((groupObj, index) => {
                    const groupName = Object.keys(groupObj)[0];
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          formik.setFieldValue('Category', groupName);
                          setShowSelect(false);
                        }}
                        className="text-[12px] text-Text-Primary my-1 cursor-pointer"
                      >
                        {groupName}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium">Title</label>
              <input
                name="Recommendation"
                value={formik.values.Recommendation}
                onChange={formik.handleChange}
                placeholder="Write recommendation's title…"
                type="text"
                className={`mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border ${
                  showValidation && formik.errors.Recommendation
                    ? 'border-Red'
                    : 'border-Gray-50'
                } rounded-2xl outline-none`}
              />
              {showValidation && formik.errors.Recommendation && (
                <div className="text-Red text-[10px] mt-1">
                  {formik.errors.Recommendation}
                </div>
              )}
            </div>
            <div
              className={`${selectedGroupDose ? 'opacity-100' : 'opacity-50'} mb-4`}
            >
              <label className="text-xs font-medium flex items-start gap-[2px]">
                Dose{' '}
                {/* {selectedGroupDose && <span className="text-Red">*</span>} */}
                <img
                  className="cursor-pointer"
                  data-tooltip-id={'more-info'}
                  src="/icons/info-circle.svg"
                  alt=""
                />
              </label>
              <input
                name="Dose"
                value={formik.values.Dose}
                onChange={formik.handleChange}
                placeholder="Write Dose"
                type="text"
                disabled={!selectedGroupDose}
                className={`mt-1 ${!selectedGroupDose && 'cursor-not-allowed'} text-xs block w-full bg-backgroundColor-Card py-1 px-3 border ${
                  showValidation && formik.errors.Dose && selectedGroupDose
                    ? 'border-Red'
                    : 'border-Gray-50'
                } rounded-2xl outline-none`}
              />
              {showValidation && formik.errors.Dose && selectedGroupDose && (
                <div className="text-Red text-[10px] mt-1">
                  {formik.errors.Dose}
                </div>
              )}
              {selectedGroupDose && (
                <Tooltip
                  id="more-info"
                  place="top"
                  className="!bg-white !leading-5 !text-wrap !shadow-100 !text-[#B0B0B0] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                >
                  Dose must include a number followed by a unit (e.g., '50 mg')
                </Tooltip>
              )}
            </div>

            {/* Instructions Field */}
            <div className="mb-4">
              <label className="flex w-full gap-1 items-center text-xs font-medium">
                Instructions
              </label>
              <input
                name="Instruction"
                value={formik.values.Instruction}
                onChange={formik.handleChange}
                placeholder="Write the action's instruction..."
                type="text"
                className={`mt-1 text-xs block resize-none w-full bg-backgroundColor-Card py-1 px-3 border ${showValidation && formik.errors.Instruction ? 'border-red-500' : 'border-Gray-50'} rounded-2xl outline-none placeholder:text-Text-Fivefold`}
              />
              {showValidation && formik.errors.Instruction && (
                <div className="text-Red text-[10px] mt-1">
                  {formik.errors.Instruction}
                </div>
              )}
            </div>

            {/* Times Selection */}
            <div className="mb-4">
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
            </div>

            {/* Client Notes */}
            <div className="mb-4">
              <label className="text-xs font-medium flex items-start gap-[2px]">
                Client Notes{' '}
                <img
                  className="cursor-pointer"
                  data-tooltip-id={'more-info-notes'}
                  src="/icons/info-circle.svg"
                  alt=""
                />
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none"
                rows={4}
                placeholder="Write notes ..."
              />
              <Tooltip
                id="more-info-notes"
                place="top"
                className="!bg-white !w-[310px] !leading-5 !text-wrap !shadow-100 !text-[#B0B0B0] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
              >
                After writing each note, press the Enter key to save it and be
                able to add another note.
              </Tooltip>
            </div>

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
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
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
