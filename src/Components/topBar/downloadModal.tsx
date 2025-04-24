/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { ButtonPrimary } from '../Button/ButtonPrimary';

interface DownloadModalProps {
  onclose: () => void;
  onconfirm: (data: Array<any>) => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const DownloadModal: React.FC<DownloadModalProps> = ({
  onclose,
  onconfirm,
}) => {
  const [downloadSelect, setDownloadSelect] = useState([
    {
      name: 'Client Summary',
      checked: true,
    },
    {
      name: 'Needs Focus Biomarker',
      checked: true,
    },
    {
      name: 'Detailed Analysis',
      checked: true,
    },
    {
      name: 'Holistic Plan',
      checked: true,
    },
    {
      name: 'Action Plan',
      checked: false,
      disabled: true,
    },
  ]);

  const removeAll = () => {
    setDownloadSelect((pre) => {
      return pre.map((el) => {
        return {
          ...el,
          checked: false,
        };
      });
    });
  };

  const select = (active: number) => {
    setDownloadSelect((pre) => {
      return pre.map((el, index: number) => {
        if (index == active) {
          return {
            ...el,
            checked: !el.checked,
          };
        } else {
          return { ...el };
        }
      });
    });
  };
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="text-[10px] text-Text-Secondary">
          {downloadSelect.filter((el: any) => el.checked == true).length}/
          {downloadSelect
          .filter((el) => !el.disabled).length} selected
        </div>
        <div
          onClick={removeAll}
          className="text-[12px] text-Primary-DeepTeal font-medium cursor-pointer"
        >
          Remove All
        </div>
      </div>

      <div className="grid gap-2 mt-2">
        {downloadSelect
          .filter((el) => !el.disabled)
          .map((el, index: number) => {
            return (
              <div className="flex justify-between items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={el.checked}
                    onClick={() => {
                      // onCheck();
                      select(index);
                    }}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded  border border-Primary-DeepTeal  ${
                      el.checked ? 'bg-Primary-DeepTeal' : 'bg-white'
                    }`}
                  >
                    {el.checked && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </label>

                <div
                  onClick={() => {
                    select(index);
                  }}
                  className="flex-grow h-[24px] cursor-pointer flex justify-start items-center px-3 bg-backgroundColor-Main rounded-[6px] border border-gray-50"
                >
                  <div className="text-[10px] text-Text-Primary">
                    {index + 1}.{' ' + el.name}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="w-full flex justify-between items-center mt-6">
        <ButtonPrimary
          onClick={() => {
            onclose();
          }}
          size="small"
          outLine
        >
          <div className=" w-[60px] xs:w-[110px]">Cancel</div>
        </ButtonPrimary>
        <ButtonPrimary
          onClick={() => {
            onconfirm(downloadSelect);
          }}
          size="small"
        >
          <div className=" w-[60px] xs:w-[110px]">Confirm</div>
        </ButtonPrimary>
      </div>
    </>
  );
};

export default DownloadModal;
