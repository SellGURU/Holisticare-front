import { Tooltip } from 'react-tooltip';

interface PointProps {
  top: number;
  left: number;
  onClick?: () => void;
  name: string;
  status?: 'At risk' | 'Normal' | 'Need action' | 'Excelent';
}

const Point: React.FC<PointProps> = ({ top, left, onClick, status, name }) => {
  const resolveColor = () => {
    if (status == 'At risk') {
      return '#FBAD37';
    }
    if (status == 'Excelent') {
      return '#7F39FB';
    }
    if (status == 'Normal') {
      return '#0CBC84';
    }
    return '#FF3E5D';
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
          className={`absolute cursor-pointer   ${status == 'Need action' ? 'bg-[#FF3E5D] w-[20px] h-[20px] animate-ping' : 'bg-primary-color'}  rounded-full`}
          style={{ top: top - 5, left: left - 4 }}
        ></div>
      </div>
      <Tooltip id={'point'}></Tooltip>
    </>
  );
};

export default Point;
