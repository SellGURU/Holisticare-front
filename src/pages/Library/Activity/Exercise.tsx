import React, { useState } from 'react';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import { MainModal } from '../../../Components';
import TextField from '../../../Components/TextField';
import { RangeCard } from '../../CheckIn/components';
import CustomSelect from '../../../Components/CustomSelect';
import Checkbox from '../../../Components/checkbox';
import { ExerciseRow } from './AddComponents/ExerciseRow';
interface ExerciseHandlerProps {
  data: Array<any>;
  setData: React.Dispatch<React.SetStateAction<Array<any>>>;
  showAdd: boolean;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
}
export const Exercise: React.FC<ExerciseHandlerProps> = ({
  data,
  setData,
  showAdd,
  setShowAdd,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');

  const [score, setScore] = useState(0);
  //   const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState('');
  const [terms, setTerms] = useState('');
  const [condition, setCondition] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [level, setLevel] = useState('');
  const [Location, setLocation] = useState('');
  const [YouTubeLink, setYouTubeLink] = useState('');
  const handleCheckboxChange = (value: string) => {
    setLocation((prev) => (prev === value ? '' : value));
  };
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // You can also add any additional logic here, like uploading the file to a server
    }
  };
  const handleAddExercise = () => {
    const newExercise = {
      title,
      description,
      instruction,
      type,
      score,
      terms,
      condition,
      muscle,
      equipment,
      level,
      location: Location,
      youtubeLink: YouTubeLink,
      file: videoFile ? videoFile.name : null,
      addedOn: new Date().toLocaleDateString(),
    };

    setData([...data, newExercise]);
    setShowAdd(false);

    // Reset form fields
    setTitle('');
    setDescription('');
    setInstruction('');
    setType('');
    setTerms('');
    setCondition('');
    setMuscle('');
    setEquipment('');
    setLevel('');
    setLocation('');
    setYouTubeLink('');
    setVideoFile(null);
  };
  console.log(data);
  const handleDeleteExercise = (index: number) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
  };
  return (
    <>
      {data.length == 0 ? (
        <div className="w-full h-full min-h-[450px] flex justify-center items-center">
          <div>
            <img src="/icons/no-exercise.svg" alt="" />
            <div className="mt-8">
              <div className="text-Text-Primary text-center font-medium">
                No exercise existed yet.
              </div>
              <div className="flex justify-center mt-4">
                <ButtonSecondary
                  onClick={() => {
                    setShowAdd(true);
                  }}
                  ClassName="rounded-full min-w-[180px]"
                >
                  <img src="./icons/add-square.svg" alt="" />
                  Add Exercise
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <table className="w-full  ">
            <thead className="w-full">
              <tr className="text-left text-xs bg-[#F4F4F4] text-Text-Primary border-Gray-50 w-full ">
                <th className="py-3 pl-4 w-[160px] rounded-tl-2xl">Title</th>
                <th className="py-3 w-[300px] text-center">Instruction</th>
                <th className="py-3 w-[100px] text-center pl-2">File</th>
                <th className="py-3 w-[66px] text-center pl-3">Base Score</th>
                <th className="py-3 w-[100px] text-center pl-3">Added on</th>
                <th className="py-3 w-[80px] text-center pl-3 rounded-tr-2xl">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="border border-t-0 border-[#E9F0F2] ">
              {data.map((exercise, index) => (
                <ExerciseRow
                  exercise={exercise}
                  index={index}
                  onDelete={() => handleDeleteExercise(index)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {
        <MainModal isOpen={showAdd} onClose={() => setShowAdd(false)}>
          <div className="w-[1107px] h-[473px] rounded-2xl p-4 shadow-800 bg-white text-Text-Primary relative">
            <div className="w-full border-b border-Gray-50 pb-2 text-sm font-medium">
              Add Exercise
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
                      checked={Location === 'Home'}
                      onChange={() => handleCheckboxChange('Home')}
                      label="Home"
                    />
                    <Checkbox
                      checked={Location === 'Gym'}
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
                  value={YouTubeLink}
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
                onClick={() => setShowAdd(false)}
                className="text-[#909090] text-sm font-medium cursor-pointer"
              >
                Cancel
              </div>
              <div
                onClick={handleAddExercise}
                className="text-Primary-DeepTeal cursor-pointer text-sm font-medium"
              >
                Add
              </div>
            </div>
          </div>
        </MainModal>
      }
    </>
  );
};
