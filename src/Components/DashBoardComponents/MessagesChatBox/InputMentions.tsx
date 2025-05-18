import { useRef, useState } from 'react';

interface InputMentionsProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  changeBenchMarks: (benchs: Array<string>) => void;
  onUpload?: (file: File) => void;
  handleDeleteImage?: (indexToDelete: number) => void;
  PlaceHolder?: string;
}
const InputMentions: React.FC<InputMentionsProps> = ({
  value,
  onChange,
  onSubmit,
  changeBenchMarks,
  onUpload,
  handleDeleteImage,
  PlaceHolder = 'Write message here ...',
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };
  const handelChange = (e: string) => {
    const inputValue = e;

    const mentionRegex = /@\w+(\s\w+)?/g;

    onChange(inputValue);

    const foundMentions = inputValue.match(mentionRegex) || [];
    changeBenchMarks(foundMentions);
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview([...imagePreview, base64String]); // Update preview state
        if (onUpload) {
          onUpload(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDeleteImagePreview = (indexToDelete: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== indexToDelete));
    if (handleDeleteImage) {
      handleDeleteImage(indexToDelete);
    }
  };
  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <>
      <div className="w-[98%]  bg-[#E9F0F2] left-1 md:left-2  absolute bottom-0  mb-2  py-2 px-4 flex items-center gap-3 rounded-[16px]">
        {onUpload && (
          <img
            className="cursor-pointer"
            src="/icons/attach-svgrepo-com 1.svg"
            alt=""
            onClick={() => {
              if (imagePreview.length < 6) {
                handleAttachClick();
              }
            }}
          />
        )}
        <input
          className="hidden"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          ref={fileInputRef} // Reference the file input
          onChange={handleFileChange} // Handle file changes
        />
        <input
          className="w-full rounded-md outline-none  py-1 text-xs bg-transparent text-Text-Primary"
          type="text"
          placeholder={PlaceHolder}
          value={value}
          onChange={(e) => {
            handelChange(e.target.value);
          }}
          onKeyPress={handleKeyPress}
        />
        <div className="flex items-center gap-2">
          <img
            className="cursor-pointer"
            onClick={() => {
              if (value) {
                onSubmit();
                setImagePreview([...[]]);
              }
            }}
            src="/icons/send.svg"
            alt=""
          />
        </div>
        {imagePreview && (
          <div className="absolute bottom-10 left-1 md:left-2 mb-2 flex flex-row gap-2">
            {imagePreview.map((image, index) => {
              return (
                <div className="relative">
                  <img
                    src={image}
                    alt="Image Preview"
                    className="h-20 w-20 object-cover rounded-md"
                    key={index}
                  />
                  <img
                    src="/icons/close-circle-red.svg"
                    alt=""
                    className="w-4 h-4 absolute -top-1 -right-1 cursor-pointer bg-bg-color rounded-lg"
                    onClick={() => handleDeleteImagePreview(index)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default InputMentions;
