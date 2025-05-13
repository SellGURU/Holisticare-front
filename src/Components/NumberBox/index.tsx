import Card from '../card';
import React from 'react';

interface numberBoxProps {
  title: string;
  icon: string;
  value: number;
  mode: string;
}

const NumberBox: React.FC<numberBoxProps> = ({ mode, title, value, icon }) => {
  // const resolveModeText = () => {
  //   if (mode == 'added') {
  //     return '2 new client added!';
  //   }
  //   if (mode == 'increase') {
  //     return '10% increase compared to last month';
  //   }
  //   return '10% reduction compared to last month';
  // };
  // const resolveIcon = () => {
  //   if (mode == 'increase') {
  //     return 'increase.svg';
  //   }
  //   if (mode == 'added') {
  //     return 'Added.svg';
  //   }
  //   return 'dicress.svg';
  // };
  console.log(mode);
  
  return (
    <Card>
      <div
        className={
          'text-Text-Primary flex items-start justify-center flex-col  gap-2'
        }
      >
        <div className={'flex items-center justify-between w-full'}>
          <h1
            className={
              'font-medium text-2xl text-light-primary-text dark:text-primary-text'
            }
          >
            {value}
          </h1>
          <div
            className={
              'flex justify-center items-center w-[42px] h-[42px] rounded-full bg-[#E2F1F8]'
            }
          >
            <img
              src={icon}
              alt="icon"
              className={'text-brand-primary-color w-5 h-5'}
            />
          </div>
        </div>
        <h1 className={'text-xs text-Text-Primary'}>{title} </h1>
        {/* <div className="flex justify-start items-center">
          <div
            className={`size-[15px] flex items-center justify-center rounded-full bg-opacity-10 ${mode === 'reduction' ? ' bg-[#FC5474]' : 'bg-[#005F73]'}`}
          >
            <img src={'/icons/' + resolveIcon()} alt="" />
          </div>

          <div className={'text-[10px] text-Text-Secondary ml-1'}>
            {resolveModeText()}
          </div>
        </div> */}
      </div>
    </Card>
  );
};

export default NumberBox;
