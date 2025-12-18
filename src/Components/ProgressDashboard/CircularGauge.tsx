import React, { useEffect, useState } from 'react';

interface CircularGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  valueText?: string;
  subText?: string;
}

interface ColorBand {
  min: number;
  max: number;
  color: string;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  size = 200,
  strokeWidth = 16,
  showValue = true,
  valueText,
  subText,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Color bands for different score ranges
  const colorBands: ColorBand[] = [
    { min: 0, max: 30, color: '#EF4444' }, // Red - Critical
    { min: 30, max: 50, color: '#F97316' }, // Orange - Low
    { min: 50, max: 70, color: '#FBBF24' }, // Yellow - Medium
    { min: 70, max: 85, color: '#10B981' }, // Green - Good
    { min: 85, max: 100, color: '#3B82F6' }, // Blue - Excellent
  ];

  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  // Get color for current value
  const getCurrentColor = (val: number): string => {
    for (const band of colorBands) {
      if (val >= band.min && val < band.max) {
        return band.color;
      }
    }
    return colorBands[colorBands.length - 1].color; // Default to highest band
  };

  // Animation on mount and value change
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();
    const startValue = animatedValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (clampedValue - startValue) * eased;

      setAnimatedValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedValue(clampedValue);
      }
    };

    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedValue]);

  // SVG calculations
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Semi-circle arc: from -90 to 90 degrees (180 degrees total - bottom half)
  const arcStartAngle = -90;
  const arcEndAngle = 90;
  const arcTotalAngle = arcEndAngle - arcStartAngle; // 180 degrees

  // Calculate current angle based on value (0-100 maps to arcStartAngle to arcEndAngle)
  const currentAngle = arcStartAngle + (animatedValue / 100) * arcTotalAngle;

  // Convert angles to radians
  const startAngleRad = (arcStartAngle * Math.PI) / 180;
  const currentAngleRad = (currentAngle * Math.PI) / 180;

  // Calculate arc path
  const getArcPath = (start: number, end: number): string => {
    const startX = center + radius * Math.cos(start);
    const startY = center + radius * Math.sin(start);
    const endX = center + radius * Math.cos(end);
    const endY = center + radius * Math.sin(end);
    const largeArcFlag = end - start > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Calculate position for indicator dot
  const indicatorX = center + radius * Math.cos(currentAngleRad);
  const indicatorY = center + radius * Math.sin(currentAngleRad);

  // Get all color band segments with opacity based on whether they've been reached
  const getAllBands = () => {
    const bands: Array<{ path: string; color: string; opacity: number }> = [];

    colorBands.forEach((band) => {
      // Map band range (0-100) to arc angles
      const bandStartAngle = arcStartAngle + (band.min / 100) * arcTotalAngle;
      const bandEndAngle = arcStartAngle + (band.max / 100) * arcTotalAngle;
      const bandStartRad = (bandStartAngle * Math.PI) / 180;
      const bandEndRad = (bandEndAngle * Math.PI) / 180;

      // Determine opacity: if band is reached, use higher opacity, otherwise lower
      let opacity = 0.25; // Default for unreached bands
      if (animatedValue >= band.max) {
        opacity = 0.5; // Fully reached bands
      } else if (animatedValue > band.min) {
        opacity = 0.4; // Partially reached bands
      }

      bands.push({
        path: getArcPath(bandStartRad, bandEndRad),
        color: band.color,
        opacity,
      });
    });

    return bands;
  };

  const allBands = getAllBands();
  const currentColor = getCurrentColor(animatedValue);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform overflow-visible -rotate-90"
      >
        <defs>
          {/* Shadow filter for indicator */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Background arc (trail) - semi-circle */}
        <path
          d={getArcPath(startAngleRad, (arcEndAngle * Math.PI) / 180)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.2}
        />

        {/* Color band segments with varying opacity */}
        {allBands.map((band, index) => (
          <path
            key={index}
            d={band.path}
            fill="none"
            stroke={band.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={band.opacity}
            className="transition-opacity duration-300"
          />
        ))}

        {/* Active progress arc up to current value - bold and vibrant */}
        {animatedValue > 0 && (
          <path
            d={getArcPath(startAngleRad, currentAngleRad)}
            fill="none"
            stroke={currentColor}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            className="transition-all duration-300"
            opacity={1}
          />
        )}

        {/* Indicator dot */}
        {animatedValue > 0 && (
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={strokeWidth / 2 + 3}
            fill="white"
            stroke={currentColor}
            strokeWidth={4}
            filter="url(#shadow)"
            className="transition-all duration-300"
          />
        )}
      </svg>

      {/* Center text */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: currentColor }}
          >
            {valueText || Math.round(animatedValue)}
          </div>
          {subText && (
            <div className="text-xs text-gray-500 mt-1">{subText}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularGauge;
