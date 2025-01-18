interface TagProps {
  value: string;
}
const Tag: React.FC<TagProps> = ({ value }) => {
  const resolveColor = () => {
    if (value == 'Need Focus') {
      return '#FC5474]';
    }
    return '#FBAD37';
  };
  return (
    <>
      <div
        className="w-[60px] h-[16px] rounded-[16px] flex justify-center items-center text-[8px] text-[#1E1E1E] bg-[#FC5474]"
        style={{ backgroundColor: resolveColor() }}
      >
        {value}
      </div>
    </>
  );
};
export default Tag;
