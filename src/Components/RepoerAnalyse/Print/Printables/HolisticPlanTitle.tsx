interface HolisticPlanTitleProps {
  value: string;
}
const HolisticPlanTitle: React.FC<HolisticPlanTitleProps> = ({ value }) => {
  return (
    <>
      <div
        style={{
          fontSize: '12px',
          color: '#383838',
          fontWeight: 500,
          backgroundColor: '#FDFDFD',
        }}
        className="pl-2 pt-3"
      >
        {value}
      </div>
    </>
  );
};

export default HolisticPlanTitle;
