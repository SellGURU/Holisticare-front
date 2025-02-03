import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
export const Questionary = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // setIsLoading(true);
    Application.getQuestionary_tracking({ member_id: id })
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
        <div className="w-full text-[10px] md:text-[12px] px-2 xs:px-3 md:px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div>Questionary Name</div>
          <div>State</div>
          <div>Action</div>
        </div>

        <>
          {data?.length > 0 ? (
            <>
              <div className="flex justify-center w-full items-start overflow-auto h-[240px]">
                <div className="w-full mt-2">
                  {data?.map((el: any) => {
                    return (
                      <div className=" bg-white border border-Gray-50 mb-1 px-2 xs:px-3 md:px-5 py-3 h-[48px] w-full rounded-[12px] flex justify-between items-center">
                        <div className=" text-[9px] xs:text-[10px]  text-Text-Primary">
                          {el.Data}
                        </div>

                        <div className="text-[8px] ">
                          <div
                            className={`rounded-full px-1.5  xs:px-2.5 py-1 text-Text-Primary flex items-center gap-1 ${
                              el['State'] == 'Complete'
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
                                el['State'] == 'Complete'
                                  ? 'bg-[#06C78D]'
                                  : 'bg-[#FFBD59]'
                              }`}
                            ></div>
                            {el['State']}
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            Application.Questionary_tracking_action({
                              form_name: el['Data'],
                              member_id: id,
                            }).then((res) => {
                              if (res.data && res.data.link) {
                                window.open(res.data.link, '_blank');
                              }
                            });
                          }}
                        >
                          {el['State'] === 'Complete' ? (
                            <img src="/icons/eye-green.svg" alt="" />
                          ) : (
                            // Render this if action is not "Complete"
                            <img
                              className="cursor-pointer"
                              onClick={() => {
                                Application.questionaryLink({})
                                  .then((res) => {
                                    const url =
                                      res.data['Personal Information'];
                                    if (url) {
                                      window.open(url, '_blank');
                                    }
                                  })
                                  .catch((err) => {
                                    console.error(
                                      'Error fetching the link:',
                                      err,
                                    );
                                  });
                              }}
                              src="/icons/Fiilout-Form.svg"
                              alt=""
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] ">
              <img
                className=" object-contain"
                src="/icons/document-text.svg"
                alt=""
              />
              <div className="text-[12px] text-[#383838] mt-1">
                No Data Found
              </div>
              <p className="text-[10px] text-Text-Secondary mt-4 mb-3 text-center">
                For more accurate results, please complete the questionnaire
              </p>
              <ButtonPrimary
                onClick={() => {
                  Application.questionaryLink({})
                    .then((res) => {
                      const url = res.data['Personal Information'];
                      if (url) {
                        window.open(url, '_blank');
                      }
                    })
                    .catch((err) => {
                      console.error('Error fetching the link:', err);
                    });
                }}
              >
                Complete Questionary
              </ButtonPrimary>
            </div>
          )}
        </>
      </div>
    </div>
  );
};
