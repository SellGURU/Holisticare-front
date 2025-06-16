/* eslint-disable @typescript-eslint/no-explicit-any */
interface PrintHeaderProps {
  usrInfoData: any;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ usrInfoData }) => {
  return (
    <div className="print-header z-50 ">
      <img
        className="print-headerImage "
        style={{ position: 'fixed', right: '0', top: '0', zIndex: 10 }}
        src="/icons/wwe.svg"
        alt=""
      />
      <div className="flex justify-between items-center px-6 relative z-50 py-2">
        <div>
          <div style={{ color: '#383838', fontSize: '12px' }}>
            {usrInfoData?.name}
          </div>
          <div style={{ color: '#888888', fontSize: '12px' }}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
        <div style={{ color: '#005F73', fontSize: '14px', fontWeight: '500' }}>
          Comprehensive Health Plan
        </div>
      </div>
      <div
        className="w-full relative z-50"
        style={{ height: '2px', backgroundColor: '#005F73', opacity: 0.3 }}
      ></div>
    </div>
  );
};

export default PrintHeader;
