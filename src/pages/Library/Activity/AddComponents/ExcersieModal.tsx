/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import TextField from '../../../../Components/TextField';
import { RangeCard } from '../../../CheckIn/components';
import CustomSelect from '../../../../Components/CustomSelect';
import Checkbox from '../../../../Components/checkbox';
import { MainModal } from '../../../../Components';
import Application from '../../../../api/app';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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

  const [, setTitle] = useState(exercise.Title || '');
  const [, setDescription] = useState(exercise.Description || '');
  const [, setInstruction] = useState(exercise.Instruction || '');
  const [type, setType] = useState(exercise.Exercise_Filters?.Type || '');
  const [terms, setTerms] = useState(exercise.Exercise_Filters?.Terms || []);
  const [condition, setCondition] = useState(
    exercise.Exercise_Filters?.Conditions || [],
  );
  const [muscle, setMuscle] = useState(exercise.Exercise_Filters?.Muscle || []);
  const [equipment, setEquipment] = useState(
    exercise.Exercise_Filters?.Equipment || [],
  );
  const [level, setLevel] = useState(exercise.Exercise_Filters?.Level || '');
  const [location, setLocation] = useState<string[]>(
    exercise.Exercise_Location || [],
  );
  const [fileList, setFileList] = useState<FileData[]>(exercise.Files || []);
  const [, setScore] = useState(exercise.Base_Score || 0);
  const [youTubeLink, setYouTubeLink] = useState<string>('');
  const [ConditionsOptions, setConditionsOptions] = useState([]);
  const [EquipmentOptions, setEquipmentOptions] = useState([]);
  const [LevelOptions, setLevelOptions] = useState([]);
  const [MuscleOptions, setMuscleOptions] = useState([]);
  const [TermsOptions, setTermsOptions] = useState([]);
  const [TypesOptions, setTypeOptions] = useState([]);
  const [youTubeError, setYouTubeError] = useState<string | undefined>(
    undefined,
  );
  const [showYouTubeValidation, setShowYouTubeValidation] = useState(false);
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
    setShowValidation(true);
    const hasFile = fileList.length > 0;
    const isYouTubeLinkValid = isValidYouTubeUrl(youTubeLink);

    // Validate YouTube link
    if (!isYouTubeLinkValid && youTubeLink.trim() !== '') {
      setYouTubeError('Please enter a valid YouTube link.');
      setShowYouTubeValidation(true);
      return;
    }

    // Validate file or YouTube link presence
    if (!hasFile && !isYouTubeLinkValid) {
      setFileError('At least one of these fields is required.');
      setShowFileValidation(true);
      return;
    }

    // Prepare files data, including valid YouTube link
    const filesData = fileList.slice(); // Copy current file list
    if (isYouTubeLinkValid) {
      const existingLinkIndex = filesData.findIndex(
        (file) => file.Type === 'link',
      );
      const newLink = {
        Title: 'YouTube Link',
        Type: 'link',
        Content: {
          url: youTubeLink,
          file_id: '',
        },
      };

      if (existingLinkIndex >= 0) {
        filesData[existingLinkIndex] = newLink;
      } else {
        filesData.push(newLink);
      }
    }

    const exerciseFilters = {
      Conditions: [condition],
      Equipment: [equipment],
      Type: [type],
      Terms: [terms],
      Muscle: [muscle],
      Level: [level],
    };

    const exerciseData = {
      Title: formik.values.title,
      Description: formik.values.description,
      Instruction: formik.values.instruction,
      type,
      Exercise_Filters: exerciseFilters,
      'Added on': new Date(),
      Exercise_Location: location || [],
      Exercise_Id: exercise.Exercise_Id,
      Files: filesData,
      Base_Score: formik.values.score,
    };

    onSubmit(exerciseData);
    onClose();
  };

  // const handleFileChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const files = event.target.files;
  //   if (files) {
  //     Array.from(files).forEach(async (file) => {
  //       const base64Data = await convertToBase64(file);
  //       const fileData: FileData = {
  //         Title: file.name,
  //         Type: file.type,
  //         base64Data: base64Data,
  //         Content: {},
  //       };

  //       // Add file to the list before uploading
  //       setFileList((prevList) => [...prevList, fileData]);

  //       uploadFile(fileData);
  //     });
  //   }
  // };
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUpload = async (event: any) => {
    const files = event.target.files;
    if (files) {
      const file = files[0];
      if (!isFileSizeValid(file)) {
        setFileError('File exceeds 4.5 MB or has an unsupported format.');
        return;
      }
      setFileError(undefined);
      const base64Data = await convertToBase64(file);
      const fileData: FileData = {
        Title: file.name,
        Type: file.type,
        base64Data: base64Data,
        Content: {},
      };

      // Start the progress bar
      setUploadProgress(10); // Start at 10% to indicate the start of the process
      const incrementProgress = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(incrementProgress);
            return prevProgress;
          }
          return prevProgress + 10; // Increment progress during the wait
        });
      }, 500);

      // Upload the file and wait for the response
      try {
        await uploadFile(fileData);
      } finally {
        clearInterval(incrementProgress);
      }
    }
  };

  const handleCancelUpload = () => {
    setUploadProgress(0);
    setFileUploaded(false);
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
      setFileUploaded(true);
      setFileList((prevList) => [
        ...prevList,
        { ...fileData, Content: { ...fileData.Content, file_id } },
      ]);
      setUploadProgress(100); // Set progress to 100% once complete
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0); // Reset progress on error
    }
  };
  const removeFile = (Title: string) => {
    setFileList((prevList) => prevList.filter((file) => file.Title !== Title));
    setFileUploaded(false);
  };
  const handleYouTubeLinkChange = (link: string) => {
    setYouTubeLink(link);
    // Clear any error if the link is valid
    if (showYouTubeValidation) {
      setYouTubeError(undefined);
    }
    if (isValidYouTubeUrl(link)) {
      setFileError(undefined);
    }
    // Do not update file list here, handle it in the save logic
  };
  const resetForm = () => {
    formik.resetForm();
    setShowValidation(false);
    setShowFileValidation(false);
    setFileError(undefined);
    setTitle(exercise.Title || '');
    setDescription(exercise.Description || '');
    setInstruction(exercise.Instruction || '');
    setType(exercise.Exercise_Filters?.Type || '');
    setTerms(exercise.Exercise_Filters?.Terms || []);
    setCondition(exercise.Exercise_Filters?.Conditions || []);
    setMuscle(exercise.Exercise_Filters?.Muscle || []);
    setEquipment(exercise.Exercise_Filters?.Equipment || []);
    setLevel(exercise.Exercise_Filters?.Level || '');
    setLocation(exercise.Exercise_Location || []);
    setFileList(exercise.Files || []);
    setScore(exercise.Base_Score || 0);
    setYouTubeLink('');
  };
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const validationSchema = Yup.object({
    title: Yup.string().required('This field is required.'),
    description: Yup.string().required('This field is required.'),
    instruction: Yup.string().required('This field is required.'),
    score: Yup.number()
      .min(1, 'This field is required.')
      .required('This field is required.'),
  });
  const formik = useFormik({
    initialValues: {
      title: exercise.Title || '',
      description: exercise.Description || '',
      instruction: exercise.Instruction || '',
      score: exercise.Base_Score || 0,
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: () => {
      // Handle submit
    },
  });
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [showFileValidation, setShowFileValidation] = useState(false);
  const isFileSizeValid = (file: File) => {
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
    return file.size <= maxSize;
  };
  useEffect(() => {
    setTitle(formik.values.title);
    setDescription(formik.values.description);
    setInstruction(formik.values.instruction);
    setScore(formik.values.score);
  }, [formik.values]);

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?[a-zA-Z0-9_-]{11}/;
    return youtubeRegex.test(url);
  };
  console.log(youTubeError);

  return (
    <MainModal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      <div className="w-[1107px] h-[503px] rounded-2xl p-4 shadow-800 bg-white text-Text-Primary relative">
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
              value={formik.values.title}
              onChange={(e) => {
                formik.setFieldValue('title', e.target.value);
                setTitle(e.target.value); // If you still need the local state
              }}
              errorMessage={
                showValidation && formik.errors.title
                  ? String(formik.errors.title)
                  : undefined
              }
              inValid={showValidation && Boolean(formik.errors.title)}
            />
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-Text-Primary">
                Description <span className="text-Red">*</span>
              </div>
              <textarea
                value={formik.values.description}
                onChange={(e) =>
                  formik.setFieldValue('description', e.target.value)
                }
                placeholder="Write the exercise's description..."
                className={`bg-[#FDFDFD] w-full rounded-[16px] mt-1 text-justify border ${
                  showValidation && formik.errors.description
                    ? 'border-Red'
                    : 'border-Gray-50'
                } placeholder:text-xs placeholder:font-light placeholder:text-[#B0B0B0] text-[12px] px-3 outline-none resize-none h-fit min-h-[62px] py-2`}
              />
              {showValidation && formik.errors.description && (
                <div className="text-Red text-[10px]">
                  {String(formik.errors.description)}
                </div>
              )}
            </div>

            {/* <TextField
              type="text"
              newStyle
              label="Description"
              placeholder="Write the exercise’s description..."
              value={description}
              largeHeight
              onChange={(e) => setDescription(e.target.value)}
            /> */}
            <RangeCard
              question="Base Score"
              value={formik.values.score}
              onSubmit={(score) => {
                formik.setFieldValue('score', score);
                setScore(score);
              }}
              showValidation={showValidation}
              error={Boolean(formik.errors.score)}
              required={true}
            />
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-Text-Primary">
                Instruction <span className="text-Red">*</span>
              </div>
              <textarea
                value={formik.values.instruction}
                onChange={(e) =>
                  formik.setFieldValue('instruction', e.target.value)
                }
                placeholder="Write the exercise's Instruction..."
                className={`bg-[#FDFDFD] w-full rounded-[16px] mt-1 text-justify border ${
                  showValidation && formik.errors.instruction
                    ? 'border-Red'
                    : 'border-Gray-50'
                } placeholder:text-xs placeholder:font-light placeholder:text-[#B0B0B0] text-[12px] px-3 outline-none resize-none h-fit min-h-[62px] py-2`}
              />
              {showValidation && formik.errors.instruction && (
                <div className="text-Red text-[10px]">
                  {String(formik.errors.instruction)}
                </div>
              )}
            </div>
            {/* <TextField
              newStyle
              type="text"
              placeholder="Write the exercise’s Instruction..."
              label="Instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            /> */}
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
                isMulti
                selectedOption={terms}
                onOptionSelect={(option: any) => setTerms(option)}
              />
              <CustomSelect
                placeHolder="Condition"
                options={ConditionsOptions}
                isMulti
                selectedOption={condition}
                onOptionSelect={(option: any) => setCondition(option)}
              />
              <CustomSelect
                placeHolder="Muscle"
                options={MuscleOptions}
                selectedOption={muscle}
                isMulti
                onOptionSelect={(option: string) => setMuscle(option)}
              />
              <CustomSelect
                placeHolder="Equipment"
                isMulti
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
              disabled={fileUploaded}
              value={youTubeLink}
              newStyle
              type="text"
              label="YouTube link"
              placeholder="Enter YouTube link ..."
              onChange={(e) => handleYouTubeLinkChange(e.target.value)}
              errorMessage={showYouTubeValidation ? youTubeError : undefined}
              inValid={showYouTubeValidation && Boolean(youTubeError)}
            />
            <div className="w-full text-center text-xs font-medium">OR</div>
            <label
              className={`w-full h-[174px] rounded-2xl border ${
                showFileValidation && fileError
                  ? 'border-Red'
                  : 'border-Gray-50'
              } bg-white shadow-100 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer`}
            >
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi,video/mkv,video/wmv"
                style={{ display: 'none' }}
                id="video-upload"
                onChange={handleFileUpload}

                // onChange={handleFileChange}
              />
              <img src="/icons/upload-test.svg" alt="" />
              <div className="text-[10px] text-[#B0B0B0] text-center">
                Supported Formats:{' '}
                <span className="text-Text-Secondary">
                  {' '}
                  PNG, SVG, JPG, JPEG
                </span>{' '}
                Maximum Size: <span className="text-Text-Secondary">4.5MB</span>
              </div>
              <div className="text-Primary-DeepTeal underline text-xs font-medium">
                Upload Video
              </div>
            </label>
            {showFileValidation && fileError && (
              <div className="text-Red text-[10px]">{fileError}</div>
            )}
            <div className="overflow-auto h-[75px]">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full relative px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px]">
                  <div className="w-full flex justify-between">
                    <div>
                      <div className="text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                        Uploading...
                      </div>
                      <div className="text-Text-Secondary text-[10px] md:text-[12px] mt-1">
                        {uploadProgress}% • 30 seconds remaining
                      </div>
                    </div>
                    <img
                      onClick={handleCancelUpload}
                      className="cursor-pointer"
                      src="/icons/close.svg"
                      alt=""
                    />
                  </div>
                  <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
                    <div
                      className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                      style={{ width: uploadProgress + '%' }}
                    ></div>
                  </div>
                </div>
              )}
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
                        <div
                          className="text-xs font-semibold select-none"
                          title={
                            file.Title.length > 20 ? file.Title : undefined
                          } // Tooltip for long titles
                        >
                          {file.Title.length > 20
                            ? `${file.Title.substring(0, 20)}...`
                            : file.Title}
                        </div>{' '}
                      </div>
                      <img
                        onClick={() => removeFile(file.Title)}
                        className="cursor-pointer size-4"
                        src="/icons/trash-blue.svg"
                        alt=""
                      />
                    </div>
                  ))}
              </div>
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
            onClick={handleSubmit}
            className="text-Primary-DeepTeal cursor-pointer text-sm font-medium"
          >
            {isEdit ? 'Save' : 'Add'}
          </div>
        </div>
      </div>
    </MainModal>
  );
};
export default ExerciseModal;
