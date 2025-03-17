import React, { useEffect, useState } from 'react';
import TextField from '../../../../Components/TextField';
import { RangeCard } from '../../../CheckIn/components';
import CustomSelect from '../../../../Components/CustomSelect';
import Checkbox from '../../../../Components/checkbox';
import { MainModal } from '../../../../Components';
import Application from '../../../../api/app';
interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (exerciseData: any) => void;
  exercise?: any; // Optional, used for editing
  isEdit?: boolean;
}
interface FileData {
  Title: string;
  Type: string;
  base64Data?: string;
  // Optional until received from the API
  Content: {
    url?: string;
    file_id?: string;
  };
}
const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  exercise = {}, // Default to an empty object for adding
  isEdit,
}) => {
  console.log(exercise);

  const [title, setTitle] = useState(exercise.Title || '');
  const [description, setDescription] = useState(exercise.Description || '');
  const [instruction, setInstruction] = useState(exercise.Instruction || '');
  const [type, setType] = useState(exercise.Exercise_Filters?.Type || '');
  const [terms, setTerms] = useState(exercise.Exercise_Filters?.Terms || '');
  const [condition, setCondition] = useState(
    exercise.Exercise_Filters?.Conditions || '',
  );
  const [muscle, setMuscle] = useState(exercise.Exercise_Filters?.Muscle || '');
  const [equipment, setEquipment] = useState(
    exercise.Exercise_Filters?.Equipment || '',
  );
  const [level, setLevel] = useState(exercise.Exercise_Filters?.Level || '');
  const [location, setLocation] = useState<string[]>(
    exercise.Exercise_Location || [],
  );
  const [fileList, setFileList] = useState<FileData[]>(exercise.Files || []);
  const [score, setScore] = useState(exercise.Base_Score || 0);
  const [youTubeLink, setYouTubeLink] = useState<string>('');
  const [ConditionsOptions, setConditionsOptions] = useState([]);
  const [EquipmentOptions, setEquipmentOptions] = useState([]);
  const [LevelOptions, setLevelOptions] = useState([]);
  const [MuscleOptions, setMuscleOptions] = useState([]);
  const [TermsOptions, setTermsOptions] = useState([]);
  const [TypesOptions, setTypeOptions] = useState([]);
  useEffect(() => {
    Application.getExerciseFilters({}).then((res) => {
      setConditionsOptions(res.data.Conditions);
      setEquipmentOptions(res.data.Equipment);
      setMuscleOptions(res.data.Muscle);
      setLevelOptions(res.data.Level);
      setTermsOptions(res.data.Terms);
      setTypeOptions(res.data.Type);
    });
  }, []);
  useEffect(() => {
    const existingLink = fileList.find((file) => file.Type === 'link');
    if (existingLink) {
      setYouTubeLink(existingLink.Content.url || '');
    }
  }, [fileList]);
  const handleCheckboxChange = (value: string) => {
    setLocation((prev) =>
      prev.includes(value)
        ? prev.filter((loc) => loc !== value)
        : [...prev, value],
    );
  };
  const handleSubmit = () => {
    const filesData = fileList.map((file) => ({
      Title: file.Title,
      Type:
        file.Type === 'link'
          ? 'link'
          : file.Type.startsWith('video/')
            ? 'Video'
            : 'Picture',
      Content: {
        url: file.Content.url || '',
        file_id: file.Content.file_id || '',
      },
    }));
    const exerciseFilters = {
      Conditions: condition || '',
      Equipment: equipment || '',
      Type: type || '',
      Terms: terms || '',
      Muscle: muscle || '',
      Level: level || '',
    };

    // Construct Exercise_Location array
    const exerciseLocation = location ? location : []; // Assuming location is a single string

    const exerciseData = {
      Title: title,
      Description: description,
      Instruction: instruction,
      type,
      Exercise_Filters: exerciseFilters,
      'Added on':new  Date().toLocaleDateString(),
      Exercise_Location: exerciseLocation,
      Exercise_Id: '',
      //   youtubeLink: youTubeLink,
      Files: filesData,
      Base_Score: score,
    };
    onSubmit(exerciseData);
    onClose();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(async (file) => {
        const base64Data = await convertToBase64(file);
        const fileData: FileData = {
          Title: file.name,
          Type: file.type,
          base64Data: base64Data,
          Content: {},
        };

        // Add file to the list before uploading
        setFileList((prevList) => [...prevList, fileData]);

        uploadFile(fileData);
      });
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (fileData: FileData) => {
    try {
      const response = await Application.saveExcerciseFille({
        file_name: fileData.Title,
        base_64_data: fileData.base64Data,
        file_type: fileData.Type,
      });

      const { file_id } = response.data;
      // Update file with fileId after uploading
      setFileList((prevList) =>
        prevList.map((file) =>
          file.Title === fileData.Type ? { ...file, file_id } : file,
        ),
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const removeFile = (Title: string) => {
    setFileList((prevList) => prevList.filter((file) => file.Title !== Title));
  };
  const handleYouTubeLinkChange = (link: string) => {
    setYouTubeLink(link);
    setFileList((prevList) => {
      const existingLinkIndex = prevList.findIndex(
        (file) => file.Type === 'link',
      );
      const newLink = {
        Title: 'YouTube Link',
        Type: 'link',
        Content: {
          url: link,
          file_id: '',
        },
      };

      if (existingLinkIndex >= 0) {
        const updatedList = [...prevList];
        updatedList[existingLinkIndex] = newLink;
        return updatedList;
      } else {
        return [...prevList, newLink];
      }
    });
  };
  const resetForm = () => {
    setTitle(exercise.Title || '');
    setDescription(exercise.Description || '');
    setInstruction(exercise.Instruction || '');
    setType(exercise.Exercise_Filters?.Type || '');
    setTerms(exercise.Exercise_Filters?.Terms || '');
    setCondition(exercise.Exercise_Filters?.Conditions || '');
    setMuscle(exercise.Exercise_Filters?.Muscle || '');
    setEquipment(exercise.Exercise_Filters?.Equipment || '');
    setLevel(exercise.Exercise_Filters?.Leve || '');
    setLocation(exercise.Exercise_Location || []);
    setFileList(exercise.Files || []);
    setScore(exercise.Base_Score || 0);
    setYouTubeLink('');
  };

  return (
    <MainModal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
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
                options={TypesOptions}
                selectedOption={type}
                onOptionSelect={(option: string) => setType(option)}
              />
              <CustomSelect
                placeHolder="Terms"
                options={TermsOptions}
                selectedOption={terms}
                onOptionSelect={(option: string) => setTerms(option)}
              />
              <CustomSelect
                placeHolder="Condition"
                options={ConditionsOptions}
                selectedOption={condition}
                onOptionSelect={(option: string) => setCondition(option)}
              />
              <CustomSelect
                placeHolder="Muscle"
                options={MuscleOptions}
                selectedOption={muscle}
                onOptionSelect={(option: string) => setMuscle(option)}
              />
              <CustomSelect
                placeHolder="Equipment"
                options={EquipmentOptions}
                selectedOption={equipment}
                onOptionSelect={(option: string) => setEquipment(option)}
              />
              <CustomSelect
                placeHolder="Level"
                options={LevelOptions}
                selectedOption={level}
                onOptionSelect={(option: string) => setLevel(option)}
              />
            </div>
            <div className="flex flex-col text-xs gap-3 mt-2">
              Exercise Location
              <div className="flex gap-6">
                <Checkbox
                  checked={location.includes('Home')}
                  onChange={() => handleCheckboxChange('Home')}
                  label="Home"
                />
                <Checkbox
                  checked={location.includes('Gym')}
                  onChange={() => handleCheckboxChange('Gym')}
                  label="Gym"
                />
              </div>
            </div>
          </div>
          <div className="bg-[#E9EDF5] h-[328px] w-px"></div>
          <div className="w-[25%] flex flex-col gap-4">
            <TextField
              value={youTubeLink}
              newStyle
              type="text"
              label="Youtube link"
              placeholder="Enter youtube link ..."
              onChange={(e) => handleYouTubeLinkChange(e.target.value)}
            />
            <div className="w-full text-center text-xs font-medium">OR</div>
            <label className="w-full h-[174px] rounded-2xl border border-Gray-50 bg-white shadow-100 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer">
              <input
                type="file"
                accept="image/*,video/mp4,video/mov,video/avi,video/mkv,video/wmv"
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
            <div className="flex flex-col gap-1 h-[75px] overflow-auto">
              {fileList
                .filter((file) => file.Type !== 'link') // Filter out YouTube links
                .map((file) => (
                  <div
                    key={file.Type}
                    className="rounded-xl border border-Gray-50 py-3 px-4 bg-white drop-shadow-sm w-full flex justify-between"
                  >
                    <div className="flex gap-2 items-start">
                      <img src="/icons/pngwing.com (4) 2.svg" alt="" />
                      <div className="text-xs font-semibold">{file.Title}</div>
                    </div>
                    <img
                      onClick={() => removeFile(file.Title)}
                      className="cursor-pointer"
                      src="/icons/trash-blue.svg"
                      alt=""
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end gap-4 absolute right-4 bottom-4">
          <div
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-[#909090] text-sm font-medium cursor-pointer"
          >
            Cancel
          </div>
          <div
            onClick={() => {
              resetForm();
              handleSubmit();
            }}
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
