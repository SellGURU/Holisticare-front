import React from 'react';
import Circleloader from '../../CircleLoader';

interface LoaderBoxProps {
  text: string;
}

const LoaderBox: React.FC<LoaderBoxProps> = ({ text }) => {
  return (
    <>
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
        {' '}
        <Circleloader></Circleloader>
        <div className="text-Text-Primary TextStyle-Body-1 mt-3 mx-6 text-center lg:mx-0">
          {text}
        </div>
      </div>
    </>
  );
};

export default LoaderBox;
