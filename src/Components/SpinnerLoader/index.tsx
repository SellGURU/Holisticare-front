/* eslint-disable @typescript-eslint/no-explicit-any */
import './index.css';
interface SpinnerLoaderProps {
  color?: string;
}
const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({ color = '#FFF' }) => {
  return (
    <>
        <div className="spinnerLoader"  style={{ ['--spinner-color' as any]: color }} >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`spinner-segment segment-${i + 1}`}></div>
        ))}
      </div>
    </>
  );
};

export default SpinnerLoader;
