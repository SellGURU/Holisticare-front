import React from 'react';

export const OverView = () => {
  const handleFileClick = () => {
    document.getElementById('uploadFile')?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
    }
  };

  return (
    <>
      <div className="bg-backgroundColor-Card w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary">
        <div className="w-full flex justify-between items-center ">
          <div className="text-xl">Clinic information</div>
          <div className="text-xs font-medium text-Text-Secondary">
            Last update: 2024/02/02
          </div>
        </div>
        <div className="mt-4 flex w-full gap-10">
          <div className="flex flex-col gap-2 text-Text-Secondary">
            <div className="flex gap-10 text-sm font-medium">
              Total Patients
            </div>
            <div className="flex gap-10 text-sm font-medium">
              Active Patients
            </div>
            <div className="flex gap-10 text-sm font-medium">Staff</div>
          </div>
          <div className="flex flex-col text-sm text-Text-Secondary gap-2">
            {' '}
            <span>100 currently registered.</span>{' '}
            <span>80 actively receiving treatment or visiting regularly</span>
            <span>12 Medical staff</span>
          </div>
          <div className="flex border-l border-[#E2F1F8] pl-12">
            <div
              className="bg-white rounded-2xl border border-Primary-DeepTeal text-[21.2px] text-Text-Secondary text-center w-[100px] h-[100px] flex cursor-pointer items-center justify-center"
              onClick={handleFileClick}
            >
              Clinic Logo
              <input
                onChange={handleFileChange}
                className="hidden"
                id="uploadFile"
                type="file"
              />
            </div>
            <div className="flex flex-col gap-1 ml-3 justify-end">
              <div className="text-lg text-Text-Primary">Clinic name</div>
              <input
                className="bg-white border border-Boarder h-10 rounded-lg p-2 text-Text-Triarty text-lg"
                placeholder="Sample clinic name"
                type="text"
              />
            </div>
            <img
              className="w-6 h-6 cursor-pointer absolute right-5"
              src="/public/icons/edit.svg"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default OverView;
