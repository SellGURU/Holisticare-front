import './index.css';
const SpinnerLoader = () => {
  return (
    <>
      <div className="spinnerLoader">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`spinner-segment segment-${i + 1}`}></div>
        ))}
      </div>
    </>
  );
};

export default SpinnerLoader;
