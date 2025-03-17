import React, { useState } from 'react';
import TextField from '../../../../Components/TextField';
import { RangeCard } from '../../../CheckIn/components';
import CustomSelect from '../../../../Components/CustomSelect';
import Checkbox from '../../../../Components/checkbox';
import { MainModal } from '../../../../Components';
interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (exerciseData: any) => void;
  exercise?: any; // Optional, used for editing
  isEdit?: boolean;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  exercise = {}, // Default to an empty object for adding
  isEdit,
}) => {
  const [title, setTitle] = useState(exercise.title || '');
  const [description, setDescription] = useState(exercise.description || '');
  const [instruction, setInstruction] = useState(exercise.instruction || '');
  const [type, setType] = useState(exercise.type || '');
  const [terms, setTerms] = useState(exercise.terms || '');
  const [condition, setCondition] = useState(exercise.condition || '');
  const [muscle, setMuscle] = useState(exercise.muscle || '');
  const [equipment, setEquipment] = useState(exercise.equipment || '');
  const [level, setLevel] = useState(exercise.level || '');
  const [location, setLocation] = useState(exercise.location || '');
  const [youTubeLink, setYouTubeLink] = useState(exercise.youtubeLink || '');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [score, setScore] = useState(exercise.score || 0);

//   useEffect(() => {
//     // Reset form fields when the modal opens
//     if (isOpen) {
//       setTitle(exercise.title || '');
//       setDescription(exercise.description || '');
//       setInstruction(exercise.instruction || '');
//       setType(exercise.type || '');
//       setTerms(exercise.terms || '');
//       setCondition(exercise.condition || '');
//       setMuscle(exercise.muscle || '');
//       setEquipment(exercise.equipment || '');
//       setLevel(exercise.level || '');
//       setLocation(exercise.location || '');
//       setYouTubeLink(exercise.youtubeLink || '');
//       setScore(exercise.score || 0);
//       setVideoFile(null);
//     }
//   }, [isOpen, exercise]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleCheckboxChange = (value: string) => {
    setLocation((prev: any) => (prev === value ? '' : value));
  };

  const handleSubmit = () => {
    const exerciseData = {
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
    onSubmit(exerciseData);
    onClose();
  };

  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1107px] h-[473px] rounded-2xl p-4 shadow-800 bg-white text-Text-Primary relative">
        <div className="w-full border-b border-Gray-50 pb-2 text-sm font-medium">
          {isEdit ? 'Edit Exercise' : 'Add Exercise'}
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
            />
            <TextField
              type="text"
              newStyle
              label="Description"
              placeholder="Write the exercise’s description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <RangeCard
              onSubmit={(score) => setScore(score)}
              value={score}
              question="Base Weight"
            />
            <TextField
              newStyle
              type="text"
              placeholder="Write the exercise’s Instruction..."
              label="Instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
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
            />
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
                Supported formats: MP4, MOV, AVI, MKV, WMV
              </div>
              <div className="text-Primary-DeepTeal underline text-xs font-medium">
                Upload Video
              </div>
            </label>
            {videoFile && (
              <div className="rounded-xl border border-Gray-50 py-3 px-4 bg-white drop-shadow-sm w-full flex justify-between">
                <div className="flex gap-2 items-start">
                  <img src="/icons/pngwing.com (4) 2.svg" alt="" />
                  <div className="text-xs font-semibold">{videoFile.name}</div>
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
            onClick={onClose}
            className="text-[#909090] text-sm font-medium cursor-pointer"
          >
            Cancel
          </div>
          <div
            onClick={handleSubmit}
            className="text-Primary-DeepTeal cursor-pointer text-sm font-medium"
          >
            Add
          </div>
        </div>
      </div>
      </MainModal>
  );
};
export default ExerciseModal;
