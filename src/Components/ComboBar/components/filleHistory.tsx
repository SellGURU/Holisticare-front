import { useState, useEffect } from 'react';
import Application from '../../../api/app';
import { useParams } from 'react-router-dom';
export const FilleHistory = () => {
  const [data, setData] = useState<any>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // setIsLoading(true);
    Application.getFilleList({ member_id: id })
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };
  return (
    <div className=" w-full">
      <div className="px-2">
        <div className="w-full text-[12px] px-5 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div>File Name</div>
          <div>Upload Date</div>
          <div>Action</div>
        </div>

        <>
          {data?.length > 0 ? (
            <>
              <div className="flex justify-center w-full items-start overflow-auto h-[240px]">
                <div className="w-full mt-2">
                  {data?.map((el: any) => {
                    return (
                      <div className=" bg-white border border-Gray-50 mb-1 p-3 h-[48px] w-full rounded-[12px] flex justify-between items-center text-Text-Primary text-[10px]">
                        <div
                          className="text-[10px] w-[75px] text-Text-Primary select-none  overflow-hidden whitespace-nowrap text-ellipsis"
                          title={el.file_name}
                        >
                          {el.file_name}
                        </div>
                        <div className="w-[70px] text-center">
                          {formatDate(el.date_uploaded)}
                        </div>
                        <div className="flex w-[55px] justify-center gap-1">
                          {/* <img
                            className="cursor-pointer"
                            src="/icons/eye-green.svg"
                            alt=""
                          /> */}
                          <img
                            onClick={() => {
                              Application.downloadFille({
                                file_id: el.file_id,
                                member_id: id,
                              }).then((res) => {
                                const base64Data = res.data.replace(
                                  /^data:application\/pdf;base64,/,
                                  '',
                                );
                                console.log(base64Data);

                                // Convert base64 string to a binary string
                                const byteCharacters = atob(base64Data);

                                // Create an array for each character's byte
                                const byteNumbers = new Array(
                                  byteCharacters.length,
                                );
                                for (
                                  let i = 0;
                                  i < byteCharacters.length;
                                  i++
                                ) {
                                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }

                                // Convert the array to a Uint8Array
                                const byteArray = new Uint8Array(byteNumbers);

                                // Create a Blob from the Uint8Array
                                const blob = new Blob([byteArray], {
                                  type: 'application/pdf',
                                });

                                // Create a link element
                                const link = document.createElement('a');
                                link.href = window.URL.createObjectURL(blob);
                                link.download = 'downloaded-file.pdf'; // Specify the file name

                                // Append to the body, click and remove
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              });
                            }}
                            className="cursor-pointer -mt-[3px]"
                            src="/icons/import.svg"
                            alt=""
                          />
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
