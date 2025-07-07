/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import ReactJson from 'react-json-view';
import SpinnerLoader from '../../Components/SpinnerLoader';

interface EditModalProps {
  data: any;
  onCancel: () => void;
  onSave: (values: any) => void;
  loading: boolean;
  errorDetails: string;
  setErrorDetails: (errorDetails: string) => void;
}

const EditModal: FC<EditModalProps> = ({
  data,
  onCancel,
  onSave,
  loading,
  errorDetails,
  setErrorDetails,
}) => {
  const [jsonData, setJsonData] = useState(data);
  const handleJsonChange = (e: any) => {
    if (e.name === 'Biomarker') {
      return false;
    }
    setJsonData(e.updated_src);
  };
  return (
    <>
      <div className=" w-[644px] p-4 max-w-[644px] relative bg-white min-h-[500px] h-[60%] rounded-[16px]">
        {errorDetails && (
          <div className="absolute top-2 right-2 z-10 flex max-w-[493px] items-start rounded-2xl bg-[#F9DEDC] pb-3 pt-2 px-4">
            <img
              src="/icons/info-circle-orange.svg"
              alt=""
              className="w-4 h-4 mt-[3px]"
            />
            <div className="text-Text-Primary text-[10px] leading-5 px-2 text-wrap">
              {errorDetails}
            </div>
            <img
              src="/icons/close-black.svg"
              alt=""
              className="cursor-pointer w-5 h-5"
              onClick={() => setErrorDetails('')}
            />
          </div>
        )}
        <div className="">
          <div className=" text-Text-Primary TextStyle-Headline-5">Edit</div>
          <div className="w-full h-1 border-b-2 mt-2 border-gray-50"></div>
        </div>

        <div className="h-[400px] overflow-y-auto">
          <ReactJson
            displayDataTypes={false} // hides data type labels
            enableClipboard={false} // disables clipboard icon
            displayObjectSize={false} // hides size info (e.g. "3 items")
            collapsed={false}
            src={jsonData}
            onEdit={handleJsonChange}
            onAdd={handleJsonChange}
            onDelete={handleJsonChange}
          />
        </div>

        <div className=" w-full flex justify-end gap-4 items-center absolute bottom-4 right-4 ">
          <div
            onClick={onCancel}
            className="TextStyle-Headline-5 cursor-pointer text-Disable"
          >
            Cancel
          </div>
          <div
            onClick={() => {
              onSave(jsonData);
            }}
            className="TextStyle-Headline-5 cursor-pointer text-Primary-DeepTeal"
          >
            {loading ? <SpinnerLoader color="#005F73" /> : 'Save'}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditModal;
