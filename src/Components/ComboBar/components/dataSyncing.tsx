import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
export const DataSyncing = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // setIsLoading(true);
    Application.getDataSyncing({ member_id: id })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
        // setError("Failed to fetch client data");
      })
      .finally(() => {
        // setIsLoading(false);
      });
  }, [id]);

  return (
    <div className=" w-full">
      <div className="px-2">
        <div className="w-full text-[12px] px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div>Data</div>
          <div>Last Sync</div>
          <div className="pr-2">State</div>
        </div>

        <>
          {data?.length > 0 ? (
            <>
              <div className="flex justify-center w-full items-start overflow-auto h-[440px]">
                <div className="w-full mt-2">
                  {data?.map((el: any) => {
                    return (
                      <div className=" bg-white border border-Gray-50 mb-1 pl-5 pr-2 py-3 h-[48px] w-full rounded-[12px] flex justify-between items-center text-Text-Primary text-[10px]">
                        <div className="text-[10px] w-[50px]  text-Text-Primary">
                          {el.Data}
                        </div>
                        <div className="w-[30px] text-right">
                          {el['Last Sync']} aa
                        </div>
                        <div className="text-[8px] ">
                          <div
                            className={`rounded-full  px-2.5 py-1 text-Text-Primary flex justify-end items-center gap-1 ${
                              el['State'] == 'Connected'
                                ? 'bg-[#DEF7EC]'
                                : 'bg-[#F9DEDC]'
                            }`}
                            //   style={{
                            //     backgroundColor: 'red'
                            //       resolveStatusColor(
                            //         el["State"]
                            //       ),
                            //   }}
                          >
                            <div
                              className={`w-3 h-3 rounded-full  ${
                                el['State'] == 'Connected'
                                  ? 'bg-[#06C78D]'
                                  : 'bg-[#FFBD59]'
                              }`}
                            ></div>
                            {el['State']}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px]">
              <img
                className=" object-contain"
                src="/icons/document-text.svg"
                alt=""
              />
              <div className="text-[12px] text-[#383838]">No Data Found</div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};
