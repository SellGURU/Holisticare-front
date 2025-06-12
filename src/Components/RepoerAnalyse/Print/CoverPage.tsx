const CoverPage = () => {
  return (
    <div
    className=" w-full relative min-h-full"
    style={{
        pageBreakAfter: 'always',
        height: 'auto',
        overflow: 'hidden',
        backgroundColor: '#E9F0F2',
        zIndex: 1000000,
    }}
    >
    <div
        className="w-full flex justify-center "
        style={{ paddingTop: '500px' }}
    >
        <div className="ml-20">
        <div
            className="text-white uppercase text-center"
            style={{
            fontSize: '40px',
            color: '#383838',
            letterSpacing: '8px',
            fontWeight: 600,
            fontStyle: 'italic',
            }}
        >
            Comprehensive
        </div>
        <div
            className="text-white uppercase  text-center"
            style={{
            fontSize: '40px',
            color: '#383838',
            letterSpacing: '8px',
            fontWeight: 600,
            fontStyle: 'italic',
            }}
        >
            Health Plan
        </div>
        </div>
    </div>
    <div className=" justify-end mt-2 hidden items-center">
        <div
        className=""
        style={{
            backgroundColor: '#B0B0B0',
            width: '500px',
            height: '2px',
        }}
        ></div>
    </div>
    <div className="absolute left-10 top-0">
        <div
        className="rounded-full rounded-t-none "
        style={{
            backgroundColor: '#005F73',
            width: '12px',
            height: '200px',
            marginLeft: '95px',
        }}
        ></div>
        <img
        className="mt-6"
        style={{ width: '200px' }}
        src="/icons/poweredBy.svg"
        alt=""
        />
        <div
        className="rounded-full mt-6 rounded-b-none "
        style={{
            backgroundColor: '#005F73',
            width: '12px',
            height: '680px',
            marginLeft: '95px',
        }}
        ></div>
    </div>
    <div className="absolute bottom-4 right-4">
        <div className="text-sm " style={{ color: '#888888' }}>
        Powered by:{' '}
        <span className="" style={{ color: '#383838' }}>
            HolistiCare.io
        </span>
        </div>
    </div>
    </div>
  )
};

export default CoverPage;