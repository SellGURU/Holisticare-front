const PrintFooter = ({ pageNumber }: { pageNumber: number }) => {
  return (
    <div className="print-footer absolute bottom-9 w-full  z-50">
      <div
        className="w-full"
        style={{ height: '1px', backgroundColor: '#005F73', opacity: 0.3 }}
      ></div>
      <div className="flex justify-between items-center px-4 py-2">
        <div className="text-xs invisible" style={{ color: '#383838' }}>
          © HolistiCare
        </div>
        <div className="text-xs" style={{ color: '#383838' }}>
          <span className="pageNumber">{pageNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default PrintFooter;
