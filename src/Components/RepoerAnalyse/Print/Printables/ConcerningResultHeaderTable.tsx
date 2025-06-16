const ConcerningResultHeaderTable = () => {
  return (
    <>
      <div className="relative" style={{ zIndex: 60 }}>
        <div className="w-full  bg-white rounded-md py-4 px-3 flex justify-between items-center">
          <div
            className="text-gray-700 font-medium "
            style={{ width: 200, fontSize: 12, color: '#383838' }}
          >
            Name
          </div>
          <div
            className="text-gray-700 text-center font-medium "
            style={{ fontSize: 12, width: '80px', color: '#383838' }}
          >
            Result
          </div>
          <div
            className="text-gray-700 text-center font-medium "
            style={{ fontSize: 12, width: '80px', color: '#383838' }}
          >
            Units
          </div>
          <div
            className="text-gray-700 text-center font-medium "
            style={{ fontSize: 12, width: '100px', color: '#383838' }}
          >
            Lab Ref Range
          </div>
          {/* <div
                    className="text-gray-700 text-center font-medium "
                    style={{ fontSize: 12, width: '60px', color: '#383838' }}
                >
                    Baseline
                </div> */}
          <div
            className="text-gray-700 text-center font-medium "
            style={{ fontSize: 12, width: '100px', color: '#383838' }}
          >
            Optimal Range
          </div>
          {/* <div
                    className="text-gray-700 text-center font-medium "
                    style={{ fontSize: 12, width: '60px', color: '#383838' }}
                >
                    Changes
                </div> */}
        </div>
      </div>
    </>
  );
};

export default ConcerningResultHeaderTable;
