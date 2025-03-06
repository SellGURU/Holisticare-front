/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { blobToBase64 } from '../../../help';

interface ItemUploadProps {
  name: string;
  onUpload?: (strem: string) => void;
}

const ItemUpload: React.FC<ItemUploadProps> = ({ name, onUpload }) => {
  const refUpload = useRef<any>(null);
  const [image, setImage] = useState<string>('');
  useEffect(() => {
    if (onUpload) {
      onUpload(image);
    }
  }, [image]);
  return (
    <>
      <div>
        <div
          onClick={() => {
            if (image == '') {
              refUpload.current.click();
            }
          }}
          className="w-[80px] overflow-hidden relative flex justify-center items-center cursor-pointer h-[96px] bg-[#E5E5E5] rounded-[8px]"
        >
          {image != '' ? (
            <>
              <img className="w-full h-full object-cover" src={image} alt="" />
              <div
                onClick={() => {
                  setImage('');
                }}
                className="absolute shadow-200 top-1 z-20 flex justify-center items-center right-1 bg-white w-[20px] h-[20px] rounded-[4px]"
              >
                <img className="w-[12px]" src="./icons/trash-red.svg" alt="" />
              </div>
            </>
          ) : (
            <img src="./icons/uploadEmty.svg" alt="" />
          )}
          <input
            onChange={(e) => {
              if (e.target.files) {
                blobToBase64(e.target.files[0]).then((resolve: any) => {
                  setImage(resolve);
                });
              }
            }}
            ref={refUpload}
            type="file"
            className="invisible w-full h-full top-0 left-0 absolute"
          />
        </div>
        <div className="text-[10px] text-[#B0B0B0] text-center mt-2">
          {name}
        </div>
      </div>
    </>
  );
};

export default ItemUpload;
