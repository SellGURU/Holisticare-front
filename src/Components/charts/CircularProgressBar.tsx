import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CircularProgressBarProps {
  percentage: number;
  size?: number;
  startColor?: string;
  endColor?: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size = 40, 
  startColor = '#005F73', 
  endColor = '#6CC24A', 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div style={{ width: size, height: size }}>
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="gradientColors" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>
        </svg>
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: '#000',
            pathColor: 'url(#gradientColors)',
            trailColor: '#6CC24A',
            textSize: '24px',
          })}
        />
      </div>
    </div>
  );
};

export default CircularProgressBar;