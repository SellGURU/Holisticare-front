import './index.css';

const Circleloader = () => {
  const dotCount = 8; // Number of dots
  const size = 48; // Diameter of the loader
  const dotSize = 8; // Diameter of each dot

  const dots = Array.from({ length: dotCount }); // Generate an array of dots
  return (
    <>
      <div className="circle-loader" style={{ width: size, height: size }}>
        {dots.map((_, i) => {
          const angle = (i / dotCount) * 2 * Math.PI; // Calculate angle for each dot
          const x =
            size / 2 + (size / 2 - dotSize) * Math.cos(angle) - dotSize / 2;
          const y =
            size / 2 + (size / 2 - dotSize) * Math.sin(angle) - dotSize / 2;

          return (
            <div
              key={i}
              className="dot"
              style={{
                width: dotSize,
                height: dotSize,
                top: y,
                left: x,
                animationDelay: `${(i / dotCount) * 1.5}s`, // Staggered animation
              }}
            ></div>
          );
        })}
      </div>
    </>
  );
};

export default Circleloader;
