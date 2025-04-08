import React from 'react';
import ProgressBar from 'react-customizable-progressbar';

interface SemiCircularProgressBarProps {
  percentage: number;
  startColor?: string;
  endColor?: string;
}

const SemiCircularProgressBar: React.FC<SemiCircularProgressBarProps> = ({
  percentage,
  startColor = '#005F73',
  endColor = '#6CC24A',
}) => {
  return (
    <ProgressBar
      radius={50}
      progress={percentage}
      strokeWidth={6}
      strokeColor={`url(#half-circle-gradient)`}
      trackStrokeColor="#E9EDF5"
      cut={180}
      rotate={180}
      strokeLinecap="round"
      trackStrokeWidth={6}
    >
      <svg width="0" height="0">
        <defs>
          <linearGradient id="half-circle-gradient" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute top-[42%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-[10px] text-Text-Primary">
        {percentage}%
      </div>
    </ProgressBar>
  );
};

export default SemiCircularProgressBar;
