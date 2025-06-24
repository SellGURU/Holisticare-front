import  { useState } from 'react';
import Select from '../../../Components/Select';
import { Tooltip } from 'react-tooltip';

export const ClinicPreferences = () => {
    const [Preferences, setPreferences] = useState('Simple and Clear')
    const [textValue, settextValue] = useState('')
    const Options = [
        "Simple and Clear","Professional and Concise","Detailed and Informative","Motivational and Supportive","Brief Summary","Brief Summary"
    ]
    console.log(textValue);
    console.log(Preferences);
    
    
  return (
    <div className="bg-backgroundColor-Card min-h-[348px] w-full rounded-2xl relative shadow-100 p-4 text-Text-Primary">
      <div className='text-sm font-medium text-Text-Primary'>ClinicPreferences</div>
      <div className='text-[10px] text-[#888888] my-4'>Adjust how the system generates and presents content to match your clinic’s preferences. Ensure all outputs align with your operational needs.</div>
      <div className='w-full flex justify-between gap-4'>
        <div className='flex flex-col gap-2 w-[50%] text-xs font-medium  '>
        Text Preferences
        <Select isLarge options={Options} onChange={(value)=>{setPreferences(value)}}/>
        </div>
        <div className=' w-[50%] flex flex-col gap-2 text-xs font-medium  '>
            <div className='flex items-start'>
            Clinic-Specific Requests or Focus Areas
            <img data-tooltip-id='text-info' src="/icons/info-circle.svg" alt="" />
            <Tooltip place='top'className='!w-[177px] !text-[10px] !bg-white !text-[#888888]
            !text-justify !border !border-Gray-50 !shadow-100 !rounded-xl !z-[99] !leading-5' id='text-info'>Let us know any special focus areas, equipment you use (e.g., EMS), or preferences you'd like the system to consider when generating plans for your clients.</Tooltip>
            </div>
      
        <textarea onChange={(e)=>settextValue(e.target.value)} placeholder='Enter any specific requests or areas of focus for your clinic' className='appearance-none resize-none w-full min-h-[116px] rounded-2xl border border-Gray-50 bg-[#FDFDFD] text-xs px-3 py-1 outline-none placeholder:text-[#B0B0B0] placeholder:font-light'/>
        </div>
        
      </div>
    </div>
  );
};
