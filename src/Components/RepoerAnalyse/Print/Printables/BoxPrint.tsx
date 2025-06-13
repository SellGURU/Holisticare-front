interface BoxPrintProps {
  height: number;
}
const BoxPrint: React.FC<BoxPrintProps> = ({ height }) => {
  return (
    <>
      <div
        className="w-full bg-green-500"
        style={{ height: height + 'px' }}
      ></div>
    </>
  );
};

export default BoxPrint;
