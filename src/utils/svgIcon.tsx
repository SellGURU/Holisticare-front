import React, { useEffect, useRef } from 'react';

interface SvgIconProps {
  src: string;
  color: string;
}

const SvgIcon: React.FC<SvgIconProps> = ({ src, color }) => {
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(src)
      .then((response) => response.text())
      .then((svgText) => {
        if (svgRef.current) {
          svgRef.current.innerHTML = svgText;
          // Select all path elements within the SVG
          const svgPaths = svgRef.current.querySelectorAll('path');
          svgPaths.forEach((path) => {
            path.setAttribute('fill', color);
          });
        }
      })
      .catch((error) => console.error('Error loading SVG:', error));
  }, [src, color]);

  return <div ref={svgRef}></div>;
};

export default SvgIcon;