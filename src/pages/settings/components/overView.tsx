import React from 'react';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';

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
                className="bg-white border outline-none placeholder:text-Text-Triarty border-Boarder h-10 rounded-lg p-2 text-Text-Secondary  text-lg"
                placeholder="Sample clinic name"
                type="text"
              />
            </div>
            <img
              className="w-6 h-6 cursor-pointer absolute right-5"
              src="/icons/edit.svg"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="bg-backgroundColor-Card rounded-2xl p-4 shadow-100 text-Text-Primary mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl mb-6">Billing and subscription</h2>
        <span className="text-xs text-Text-Secondary">Last update: 2024/02/02</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className='pr-6'>
          <h3 className="text-sm font-medium mb-3">Current Plan</h3>
          <p className="text-sm text-Text-Secondary mb-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
          </p>
          <div style={{ background: 'linear-gradient(to right, #005F73 25%, #6CC24A 100%)' }}  className="mt-4 rounded-lg p-4 text-white relative text-center overflow-hidden">
            <img className='absolute inset-0 w-full' src="/images/billingBg.svg" alt="" />
            <p className="text-lg text-white">Pro</p>
            <p className="text-[10px] text-white">Since September 27th, 2024</p>
          </div>
        </div>
        <div className="border-l border-Boarder pl-10">
          <h3 className="text-sm font-meidum">Manage Subscription</h3>
          <p className="text-sm text-Text-Secondary mt-3">
            You have 23 days left in your package. If you cancel the subscription now, no refund will be issued but you can still use the remaining days.
          </p>
          <div className="mt-4 w-full flex justify-center gap-8 ">
            <button className="text-Primary-DeepTeal text-xs font-medium">Downgrade Subscription</button>
           
            <ButtonSecondary>Upgrade Subscription</ButtonSecondary>
           
          </div>
          <div className=' mt-3 w-full flex justify-center'>
          <ButtonSecondary ClassName='shadow-100' style={{backgroundColor: '#FDFDFD' , color:'#005F73' , width:'100%'}}>Upgrade Subscription</ButtonSecondary>
          </div>
        
        </div>
      </div>
    </div>
    </>
  );
};
export default OverView;
