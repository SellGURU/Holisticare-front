interface InformationBoxProps {
  text: string;
}
const InformationBox: React.FC<InformationBoxProps> = ({ text }) => {
  return (
    <div
      style={{ color: '#383838', fontSize: '14px', zIndex: 60 }}
      className="text-justify relative  mt-4"
    >
      {text}
    </div>
  );
};

export default InformationBox;
