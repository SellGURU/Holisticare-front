import React, { useEffect, useRef } from 'react';

interface SvgIconProps {
  src: string;
  color: string;
  width?: string; // Optional width prop
  height?: string; // Optional height prop
  stroke?: string;
  onClick?: () => void; // Optional onClick prop
}

const SvgIcon: React.FC<SvgIconProps> = ({
  src,
  color,
  width,
  height,
  stroke,
  onClick,
}) => {
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(src)
      .then((response) => response.text())
      .then((svgText) => {
        if (svgRef.current) {
          svgRef.current.innerHTML = svgText;
          const svgElement = svgRef.current.querySelector('svg');
          if (svgElement) {
            if (width) svgElement.setAttribute('width', width);
            if (height) svgElement.setAttribute('height', height);
          }
          const svgPaths = svgRef.current.querySelectorAll('path');
          svgPaths.forEach((path) => {
            path.setAttribute('fill', color);
            if (stroke) path.setAttribute('stroke', stroke);
          });
        }
      })
      .catch((error) => console.error('Error loading SVG:', error));
  }, [src, color, width, height]);

  return <div className="cursor-pointer" ref={svgRef} onClick={onClick}></div>;
};

export default SvgIcon;
