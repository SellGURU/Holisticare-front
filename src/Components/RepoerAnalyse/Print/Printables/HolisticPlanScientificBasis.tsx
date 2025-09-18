interface HolisticPlanScientificBasisProps {
  value: string;
}
const HolisticPlanScientificBasis: React.FC<
  HolisticPlanScientificBasisProps
> = ({ value }) => {
  return (
    <>
      <div
        className="flex items-center gap-1 pt-3 pl-3"
        style={{
          color: '#005f73',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          backgroundColor: '#FDFDFD',
        }}
      >
        <img src="/icons/book.svg" alt="" className="ml-[-2px]" />
        Scientific Basis
      </div>
      <div
        style={{
          color: '#888888',
          fontSize: '0.75rem',
          lineHeight: '1.25rem',
          backgroundColor: '#FDFDFD',
        }}
        className="pt-1.5 pl-3"
      >
        {value}
      </div>
    </>
  );
};

export default HolisticPlanScientificBasis;
