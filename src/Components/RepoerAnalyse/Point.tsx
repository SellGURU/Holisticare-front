import { Tooltip } from 'react-tooltip';

interface PointProps {
  top: number;
  left: number;
  onClick?: () => void;
  name: string;
  status?:
    | 'CriticalRange'
    | 'DiseaseRange'
    | 'BorderlineRange'
    | 'HealthyRange'
    | 'OptimalRange';
}

const Point: React.FC<PointProps> = ({ top, left, onClick, status, name }) => {
  const resolveColor = () => {
    if (status == 'CriticalRange') {
      return '#B2302E';
    }
    if (status == 'BorderlineRange') {
      return '#D8D800';
    }
    if (status == 'DiseaseRange') {
      return '#BA5225';
    }
    if (status == 'HealthyRange') {
      return '#72C13B';
    }
    if (status == 'OptimalRange') {
      return '#37B45E';
    }
    return '#B2302E';
  };
  return (
    <>
      <div onClick={onClick}>
        <div
          data-tooltip-id="point"
          data-tooltip-content={name}
          className={`absolute cursor-pointer  w-[12px] h-[12px] rounded-full`}
          style={{ top: top, left: left, backgroundColor: resolveColor() }}
        ></div>
        <div
          data-tooltip-id="point"
          data-tooltip-content={name}
          className={`absolute cursor-pointer   ${status == 'CriticalRange' ? 'bg-[#FF3E5D] w-[20px] h-[20px] animate-ping' : 'bg-primary-color'}  rounded-full`}
          style={{ top: top - 5, left: left - 4 }}
        ></div>
      </div>
      <Tooltip
        id={'point'}
        className="text-Text-Primary text-[10px]"
        style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '5px 10px',
          fontSize: '10px',
          zIndex: '5000',
          color: '#383838',
        }}
      ></Tooltip>
    </>
  );
};

export default Point;
