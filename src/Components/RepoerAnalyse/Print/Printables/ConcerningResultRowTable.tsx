import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ConcerningResultRowTableProps {
  el: any;
}

const ConcerningResultRowTable: React.FC<ConcerningResultRowTableProps> = ({
  el,
}) => {
  return (
    <>
      <div className="w-full  bg-white  py-3 px-3 flex justify-between items-center">
        <div
          className=" text-gray-800"
          style={{
            fontSize: '12px',
            color: '#383838',
            width: 200,
          }}
        >
          <div>{el.subcategory}</div>
          <div>{el.name}</div>
        </div>
        <div
          className=" text-gray-800 text-center"
          style={{
            fontSize: '12px',
            width: '80px',
            // color: colorsText[index % 4],
          }}
        >
          {el.Result != '' ? el.Result : '-'}
        </div>
        <div
          className=" text-gray-800 text-center"
          style={{
            fontSize: '12px',
            width: '80px',
            color: '#888888',
          }}
        >
          {el.Units != '' ? el.Units : '-'}
        </div>
        <div
          className=" text-gray-800 text-center"
          style={{
            fontSize: '12px',
            width: '100px',
            color: '#888888',
          }}
        >
          {el['Lab Ref Range'] != '' ? el['Lab Ref Range'] : '-'}
        </div>
        <div
          className=" text-gray-800 text-center"
          style={{
            fontSize: '12px',
            width: '100px',
            color: '#888888',
          }}
        >
          {el['Optimal Range'] != '' ? el['Optimal Range'] : '-'}
        </div>
      </div>
    </>
  );
};

export default ConcerningResultRowTable;
