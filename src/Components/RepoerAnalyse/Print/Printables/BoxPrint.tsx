interface BoxPrintProps {
  height: number;
}
const BoxPrint: React.FC<BoxPrintProps> = ({ height }) => {
  return (
    <>
      <div className="w-full bg-gray-100 " style={{ height: height + 'px' }}></div>
    </>
  );
};

export default BoxPrint;
