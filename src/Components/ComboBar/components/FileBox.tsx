import { useParams } from 'react-router-dom';
import Application from '../../../api/app';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FileBoxProps {
  el: any;
}
const FileBox: React.FC<FileBoxProps> = ({ el }) => {
  const { id } = useParams<{ id: string }>();
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
    <>
      <div className=" bg-white border border-Gray-50 mb-1 p-1 md:p-3 h-[48px] w-full rounded-[12px] flex justify-between items-center text-Text-Primary text-[10px]">
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
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
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
                link.download = el.file_name; // Specify the file name

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
    </>
  );
};

export default FileBox;
