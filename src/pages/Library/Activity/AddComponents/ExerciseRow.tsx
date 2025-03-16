import React, { useState } from 'react';
import { MainModal } from '../../../../Components';
import TextField from '../../../../Components/TextField';
import { RangeCard } from '../../../CheckIn/components';
import CustomSelect from '../../../../Components/CustomSelect';
import Checkbox from '../../../../Components/checkbox';
interface ExerciseRowProps {
  exercise: any;
  index: number;
  onDelete: () => void;
  onUpdate: (updatedExercise: any, index: number) => void;
}
export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  exercise,
  index,
  onDelete,
  onUpdate,
}) => {
  const [ConfirmDelete, setConfirmDelete] = useState(false);
  const [ViewModal, setViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [title, setTitle] = useState(exercise.title);
  const [description, setDescription] = useState(exercise.description);
  const [instruction, setInstruction] = useState(exercise.instruction);
  const [type, setType] = useState(exercise.type);
  const [terms, setTerms] = useState(exercise.terms);
  const [condition, setCondition] = useState(exercise.condition);
  const [muscle, setMuscle] = useState(exercise.muscle);
  const [equipment, setEquipment] = useState(exercise.equipment);
  const [level, setLevel] = useState(exercise.level);
  const [location, setLocation] = useState(exercise.location);
  const [youTubeLink, setYouTubeLink] = useState(exercise.youtubeLink);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [score, setScore] = useState(exercise.score);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleCheckboxChange = (value: string) => {
    setLocation((prev: any) => (prev === value ? '' : value));
  };

  const handleUpdateExercise = () => {
    const updatedExercise = {
      ...exercise,
      title,
      description,
      instruction,
      type,
      terms,
      condition,
      muscle,
      equipment,
      level,
      location,
      youtubeLink: youTubeLink,
      file: videoFile ? videoFile.name : exercise.file,
      score,
    };

    onUpdate(updatedExercise, index);
    setShowEditModal(false);
  };

  return (
    <>
      <MainModal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <div className="w-[1107px] h-[473px] rounded-2xl p-4 shadow-800 bg-white text-Text-Primary relative">
          <div className="w-full border-b border-Gray-50 pb-2 text-sm font-medium">
            Edit Exercise
          </div>
          <div className="w-full flex gap-4 mt-6">
            <div className="w-[35%] flex flex-col gap-4">
              <TextField
                type="text"
                newStyle
                label="Title"
                placeholder="Write the exercise’s title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              ></TextField>

              <TextField
                type="text"
                newStyle
                label="Description"
                placeholder="Write the exercise’s description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></TextField>
              <RangeCard
                onSubmit={(score) => setScore(score)}
                value={score}
                question="Base Weight"
              ></RangeCard>
              <TextField
                newStyle
                type="text"
                placeholder="Write the exercise’s Instruction..."
                label="Instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              ></TextField>
            </div>
            <div className="bg-[#E9EDF5] h-[328px] w-px"></div>
            <div className="w-[35%] flex flex-col gap-4">
              <div className="text-xs font-medium">Filters</div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-">
                <CustomSelect
                  placeHolder="Type"
                  options={[]}
                  selectedOption={type}
                  onOptionSelect={(option: string) => setType(option)}
                />
                <CustomSelect
                  placeHolder="Terms"
                  options={[]}
                  selectedOption={terms}
                  onOptionSelect={(option: string) => setTerms(option)}
                />
                <CustomSelect
                  placeHolder="Condition"
                  options={[]}
                  selectedOption={condition}
                  onOptionSelect={(option: string) => setCondition(option)}
                />
                <CustomSelect
                  placeHolder="Muscle"
                  options={[]}
                  selectedOption={muscle}
                  onOptionSelect={(option: string) => setMuscle(option)}
                />
                <CustomSelect
                  placeHolder="Equipment"
                  options={[]}
                  selectedOption={equipment}
                  onOptionSelect={(option: string) => setEquipment(option)}
                />
                <CustomSelect
                  placeHolder="Level"
                  options={[]}
                  selectedOption={level}
                  onOptionSelect={(option: string) => setLevel(option)}
                />
              </div>
              <div className="flex flex-col text-xs gap-3 mt-2">
                Exercise Location
                <div className="flex gap-6">
                  <Checkbox
                    checked={location === 'Home'}
                    onChange={() => handleCheckboxChange('Home')}
                    label="Home"
                  />
                  <Checkbox
                    checked={location === 'Gym'}
                    onChange={() => handleCheckboxChange('Gym')}
                    label="Gym"
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#E9EDF5] h-[328px] w-px"></div>
            <div className="w-[25%] flex flex-col gap-4">
              <TextField
                newStyle
                type="text"
                value={youTubeLink}
                label="Youtube link"
                placeholder="Enter youtube link ..."
                onChange={(e) => setYouTubeLink(e.target.value)}
              ></TextField>
              <div className="w-full text-center text-xs font-medium">OR</div>
              <label className="w-full h-[174px] rounded-2xl border border-Gray-50 bg-white shadow-100 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer">
                <input
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/mkv,video/wmv"
                  style={{ display: 'none' }}
                  id="video-upload"
                  onChange={handleFileChange}
                />

                <img src="/icons/upload-test.svg" alt="" />
                <div className="text-xs text-[#888888] text-center">
                  Supported formats: MP4, MOV, AVI,MKV,WMV
                </div>
                <div className="text-Primary-DeepTeal underline text-xs font-medium">
                  Upload Video
                </div>
              </label>
              {videoFile && (
                <div className="rounded-xl border border-Gray-50 py-3 px-4 bg-white drop-shadow-sm w-full flex justify-between">
                  <div className="flex gap-2 items-start">
                    <img src="/icons/pngwing.com (4) 2.svg" alt="" />
                    <div className="text-xs font-semibold">
                      {videoFile.name}
                    </div>
                  </div>
                  <img
                    onClick={() => setVideoFile(null)}
                    className="cursor-pointer"
                    src="/icons/trash-blue.svg"
                    alt=""
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full justify-end gap-4 absolute right-4 bottom-4">
            <div
              onClick={() => setShowEditModal(false)}
              className="text-[#909090] text-sm font-medium cursor-pointer"
            >
              Cancel
            </div>
            <div
              onClick={handleUpdateExercise}
              className="text-Primary-DeepTeal cursor-pointer text-sm font-medium"
            >
              Add
            </div>
          </div>
        </div>
      </MainModal>
      <MainModal isOpen={ViewModal} onClose={() => setViewModal(false)}>
        <div className="bg-white rounded-2xl p-4 w-[500px] h-[440px] shadow-800 relative">
          <div className="w-full flex justify-between items-center border-b border-Gray-50 pb-2">
            {exercise.title}
            <img
              onClick={() => {
                setViewModal(false);
                setShowEditModal(true);
              }}
              className="size-6 cursor-pointer"
              src="/icons/edit-blue.svg"
              alt=""
            />
          </div>
          <div className="flex flex-col gap-4 mt-7">
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">Description</div>
              <div className="text-xs text-[#888888]">
                {exercise.description}
              </div>
            </div>
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">Base Weight</div>
              <div className="bg-[#FFD8E4] w-[47px] select-none rounded-xl py-1  px-2 h-[18px] flex justify-center items-center text-[10px]">
                <div className="flex">
                  {exercise.score}{' '}
                  <span className="text-Text-Triarty">/10</span>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">Instruction</div>
              <div className="text-xs text-[#888888]">
                {exercise.instruction}
              </div>
            </div>
            <div className="flex w-full justify-between items-start gap-3">
              <div className="text-xs font-medium">File</div>
              <div className="text-[#4C88FF] text-[12px] underline">
                {exercise.youtubeLink}
              </div>
            </div>
          </div>
          <div
            onClick={() => setViewModal(false)}
            className="absolute right-4 bottom-4 text-sm font-medium text-[#909090] cursor-pointer"
          >
            close
          </div>
        </div>
      </MainModal>
      <tr
        key={index}
        className={` ${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-sm text-Text-Primary border-b`}
      >
        <td className=" pl-4 py-3 text-xs w-[160px] text-Text-Primary">
          {exercise.title}
        </td>
        <td className="py-3 text-xs text-[#888888] w-[300px] text-center ">
          {exercise.instruction}
        </td>
        <td className="py-3 w-[100px] text-center text-[#4C88FF] text-[10px] underline">
          {exercise.youtubeLink}
        </td>
        {/* <td className="py-2 text-Text-Secondary text-[10px]">
      {exercise.file}
    </td> */}
        <td className="py-3  w-[47px] mx-auto text-center flex justify-center text-Text-Secondary text-[10px]">
          <div className="bg-red-100 rounded-full  px-2 h-[18px] flex justify-center">
            <div className="flex">
              {exercise.score} <span className="text-Text-Triarty">/10</span>
            </div>
          </div>
        </td>
        <td className="py-3 text-xs text-[#888888] w-[100px] text-center">
          {exercise.addedOn}
        </td>
        <td className="py-3 w-[80px] mx-auto text-center flex items-center justify-end  gap-2">
          {ConfirmDelete ? (
            <div className="flex items-center gap-1 text-xs text-Text-Primary">
              Sure?
              <img
                className="cursor-pointer"
                onClick={onDelete}
                src="/icons/confirm-tick-circle.svg"
                alt=""
              />
              <img
                className="cursor-pointer"
                onClick={() => setConfirmDelete(false)}
                src="/icons/cansel-close-circle.svg"
                alt=""
              />
            </div>
          ) : (
            <>
              <img
                onClick={() => setViewModal(true)}
                className="cursor-pointer"
                src="/icons/eye-blue.svg"
                alt=""
              />
              <img
                onClick={() => setShowEditModal(true)}
                className="cursor-pointer"
                src="/icons/edit-blue.svg"
                alt=""
              />
              <img
                onClick={() => {
                  setConfirmDelete(true);
                }}
                className="cursor-pointer"
                src="/icons/trash-blue.svg"
                alt=""
              />
            </>
          )}
        </td>
      </tr>
    </>
  );
};
