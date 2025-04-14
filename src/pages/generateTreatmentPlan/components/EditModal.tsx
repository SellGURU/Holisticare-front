/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import SvgIcon from '../../../utils/svgIcon';
import Application from '../../../api/app';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
  useEffect(() => {
    Application.HolisticPlanCategories({}).then((res) => {
      console.log(res.data);

      setGroups(res.data);
    });
  }, []);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup] = useState<string | null>(defalts?.Category || null);
  const [newNote, setNewNote] = useState('');
  const [recommendation] = useState(defalts?.Recommendation);
  const [dose] = useState(defalts?.Dose);
  const [instructions] = useState(defalts?.Instruction);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    defalts ? defalts.Times : [],
  );
  const [notes, setNotes] = useState<string[]>(
    defalts ? defalts['Client Notes'] : [],
  );
  const [showSelect, setShowSelect] = useState(false);
  // const [group, setGroup] = useState(defalts?.Category);
  const [practitionerComment, setPractitionerComment] = useState('');

  const [practitionerComments, setPractitionerComments] = useState<string[]>(
    defalts ? defalts['Practitioner Comments'] : [],
  );
  const selectRef = useRef(null);
  const modalRef = useRef(null);
  const selectButRef = useRef(null);
  const validationSchema = Yup.object({
    Category: Yup.string().required('This field is required.'),
    Recommendation: Yup.string().required('This field is required.'),
    Dose: Yup.string().required('This field is required.'),
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
      Notes: defalts?.['Client Notes'] || [],
      PractitionerComments: defalts?.['Practitioner Comments'] || [],
    },
    validationSchema,

    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });
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

  const handleCommentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (practitionerComment.trim()) {
        setPractitionerComments([...practitionerComments, practitionerComment]);
        setPractitionerComment('');
      }
    }
  };
  const handleDeleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleApply = () => {
    onSubmit({
      Category: selectedGroup,
      Recommendation: recommendation,
      'Based on': defalts ? defalts['Based on'] : '',
      'Practitioner Comments': practitionerComments,
      Instruction: instructions,
      Times: selectedTimes,
      Dose: dose,
      'Client Notes': notes,
    });
    onClose();
  };
  const handleDeleteComment = (index: number) => {
    const updatedComments = practitionerComments.filter((_, i) => i !== index);
    setPractitionerComments(updatedComments);
  };

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

  const selectedGroupDose = selectedGroup
    ? groups.find((g) => Object.keys(g)[0] === selectedGroup)?.[selectedGroup]
        .Dose
    : false;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[99]">
      <div
        ref={modalRef}
        className="bg-white p-6 pb-8 rounded-2xl shadow-800 w-[500px] text-Text-Primary max-h-[660px]"
      >
        <h2 className="w-full border-b border-Gray-50 pb-2 text-sm font-medium text-Text-Primary">
          <div className="flex gap-[6px] items-center">
            {/* <img src="/icons/danger.svg" alt="" />{' '} */}
            {isAdd ? 'Add Recommendation' : 'Edit Recommendation'}
          </div>
        </h2>
        <div className="max-h-[440px] overflow-auto pr-1 mt-[6px]">
          <div className=" w-full relative overflow-visible mt-2 mb-4">
            <label className="text-xs font-medium text-Text-Primary">
              Category
            </label>
            <div
              onClick={() => setShowSelect(!showSelect)}
              className={`w-full cursor-pointer h-[32px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border ${
                formik.errors.Category ? 'border-[#FC5474]' : 'border-Gray-50'
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
            {formik.touched.Category && formik.errors.Category && (
              <div className="text-[#FC5474] text-[10px] mt-1">
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
          {/* <div className="my-4">
          <label className="block text-xs font-medium">Group</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="mt-1 text-xs block w-full py-1 px-3 bg-backgroundColor-Card border border-Gray-50 outline-none rounded-2xl"
          >
            <option>Diet</option>
          </select>
        </div> */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium">
                Recommendation
              </label>
              <input
                name="Recommendation"
                value={formik.values.Recommendation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Write Recommendation"
                type="text"
                className={`mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border ${
                  formik.touched.Recommendation && formik.errors.Recommendation
                    ? 'border-red-500'
                    : 'border-Gray-50'
                } rounded-2xl outline-none`}
              />
              {formik.touched.Recommendation &&
                formik.errors.Recommendation && (
                  <div className="text-[#FC5474] text-[10px] mt-1">
                    {formik.errors.Recommendation}
                  </div>
                )}
            </div>
            {/* {selectedGroupDose && ( */}
            <div
              className={`${selectedGroupDose ? 'opacity-100' : 'opacity-50'}`}
            >
              <label className="block text-xs font-medium">Dose</label>
              <input
                name="Dose"
                value={formik.values.Dose}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Write Dose"
                type="text"
                className={`mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border ${
                  formik.touched.Dose &&
                  formik.errors.Dose &&
                  !selectedGroupDose
                    ? 'border-[#FC5474]'
                    : 'border-Gray-50'
                } rounded-2xl outline-none`}
              />
              {formik.touched.Dose &&
                formik.errors.Dose &&
                !selectedGroupDose && (
                  <div className="text-[#FC5474] text-[10px] mt-1">
                    {formik.errors.Dose}
                  </div>
                )}
            </div>
            {/* )} */}
          </div>
          <div className="mb-4">
            <label className="flex w-full justify-between items-center text-xs font-medium">
              Instructions
              {/* <div className="flex mt-2 space-x-4">
              <Checkbox
                label="Morning"
                checked={morning}
                onChange={() => setMorning(!morning)}
              />
              <Checkbox
                label="MidDay"
                checked={midDay}
                onChange={() => setMidDay(!midDay)}
              />
              <Checkbox
                label="Night"
                checked={night}
                onChange={() => setNight(!night)}
              />
            </div> */}
            </label>
            <input
              name="Instruction"
              value={formik.values.Instruction}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Write Instruction"
              type="text"
              className={`mt-1 text-xs block w-full bg-backgroundColor-Card py-1 px-3 border ${
                formik.errors.Instruction
                  ? 'border-[#FC5474]'
                  : 'border-Gray-50'
              } rounded-2xl outline-none`}
            />
            {formik.errors.Instruction &&  formik.touched.Instruction && (
              <div className="text-[#FC5474] text-[10px] mt-1">
                {formik.errors.Instruction}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium">Times</label>
            <div className="flex w-full mt-2 ">
              {times.map((time, index) => (
                <div
                  key={time}
                  onClick={() => toggleTimeSelection(time)}
                  className={`cursor-pointer py-1 px-3 border border-Gray-50 ${index == times.length - 1 && 'rounded-r-2xl'} ${index == 0 && 'rounded-l-2xl'} text-xs text-center w-full ${
                    selectedTimes.includes(time)
                      ? 'bg-gradient-to-r from-[#99C7AF]  to-[#AEDAA7]  text-Primary-DeepTeal'
                      : 'bg-backgroundColor-Card text-Text-Secondary'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium">Client Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleNoteKeyDown}
              className="mt-1 block text-xs resize-none w-full bg-backgroundColor-Card py-1 px-3 border border-Gray-50 rounded-2xl outline-none "
              rows={4}
              placeholder="Write notes ..."
            />
          </div>
          <div className="mb-4 flex flex-col gap-2  ">
            {notes.map((note, index) => (
              <div className="w-full flex gap-1 items-start">
                <div
                  key={index}
                  className="flex w-full justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary  bg-backgroundColor-Card rounded-2xl"
                >
                  <span>{note}</span>
                </div>
                <div
                  onClick={() => handleDeleteNote(index)}
                  className="cursor-pointer"
                >
                  <SvgIcon
                    src="/icons/delete.svg"
                    color="#FC5474
"
                    width="24px"
                    height="24px"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
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
          </div>
          <div className="mb-4 flex flex-col gap-2  ">
            {practitionerComments?.map((comment, index) => (
              <div className="w-full flex gap-1 items-start">
                <div
                  key={index}
                  className=" w-full flex justify-between items-center border border-Gray-50 py-1 px-3 text-xs text-Text-Primary bg-backgroundColor-Card rounded-2xl"
                >
                  <span>{comment}</span>
                </div>
                <div
                  onClick={() => handleDeleteComment(index)}
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
        </div>
        <div className="flex justify-end gap-4 mt-8 ">
          <button
            onClick={onClose}
            className="text-sm font-medium text-[#909090] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            type="submit"
            disabled={!(formik.isValid && formik.dirty)}
            className={`text-sm font-medium cursor-pointer ${
              formik.isValid && formik.dirty
                ? 'text-Primary-DeepTeal'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
