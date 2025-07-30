const Legend = () => {
  return (
    <div
      className="w-full relative hidden  justify-end items-center gap-4 mt-4"
      style={{ zIndex: 60 }}
    >
      <div className="flex justify-start gap-1 items-center">
        <div
          className=""
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#7F39FB',
            borderRadius: '100%',
          }}
        ></div>
        <div style={{ color: '#888888', fontSize: '10px' }}>Excellent </div>
      </div>
      <div className="flex justify-start gap-1 items-center">
        <div
          className=""
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#06C78D',
            borderRadius: '100%',
          }}
        ></div>
        <div style={{ color: '#888888', fontSize: '10px' }}>Good </div>
      </div>
      <div className="flex justify-start gap-1 items-center">
        <div
          className=""
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#FBAD37',
            borderRadius: '100%',
          }}
        ></div>
        <div style={{ color: '#888888', fontSize: '10px' }}>Ok </div>
      </div>
      <div className="flex justify-start gap-1 items-center">
        <div
          className=""
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#FC5474',
            borderRadius: '100%',
          }}
        ></div>
        <div style={{ color: '#888888', fontSize: '10px' }}>Needs focus </div>
      </div>
    </div>
  );
};

export default Legend;
