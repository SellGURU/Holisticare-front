/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactJson from 'react-json-view';

interface EditModalProps {
  data:any
  onCancel:() => void
  onSave:() => void
}

const EditModal:React.FC<EditModalProps> = ({data,onCancel,onSave}) => {
  return (
    <>
      <div className=" w-[644px] p-4 max-w-[644px] relative bg-white min-h-[400px] h-[60%] rounded-[16px]">
        <div className="">
          <div className=" text-Text-Primary TextStyle-Headline-5">Edit</div>
          <div className="w-full h-1 border-b-2 mt-2 border-gray-50"></div>
        </div>

        <div className="h-[300px] overflow-y-auto">
          <ReactJson
            displayDataTypes={false} // hides data type labels
            enableClipboard={false} // disables clipboard icon
            displayObjectSize={false} // hides size info (e.g. "3 items")
            collapsed={false}
            src={data}
            onEdit={(e) => console.log(e.updated_src)}
            onAdd={(e) => console.log(e.updated_src)}
            onDelete={(e) => console.log(e.updated_src)}
          />
        </div>

        <div className=" w-full flex justify-end gap-4 items-center absolute bottom-4 right-4 ">
          <div onClick={onCancel} className="TextStyle-Headline-5 cursor-pointer text-Disable">
            Cancel
          </div>
          <div onClick={onSave} className="TextStyle-Headline-5 cursor-pointer text-Primary-DeepTeal">
            Save
          </div>
        </div>
      </div>
    </>
  );
};

export default EditModal;
