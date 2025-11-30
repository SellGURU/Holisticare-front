/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState } from 'react';
import SearchBox from '../../SearchBox';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import SvgIcon from '../../../utils/svgIcon';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';

interface HeaderLibraryTreePagesProps {
  pageType: string;
  tableDataLength: number;
  handleChangeSearch: (event: any) => void;
  handleOpenModal: () => void;
  currentSortLabel: string;
  onChangeSort: (sortId: string) => void;
}

const HeaderLibraryTreePages: FC<HeaderLibraryTreePagesProps> = ({
  pageType,
  tableDataLength,
  handleChangeSearch,
  handleOpenModal,
  currentSortLabel,
  onChangeSort,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { id: 'title_asc', label: 'Title (A → Z)' },
    { id: 'title_desc', label: 'Title (Z → A)' },
    // { id: 'dose_asc', label: 'Dose (Low → High)' },
    // { id: 'dose_desc', label: 'Dose (High → Low)' },
    { id: 'priority_asc', label: 'Priority Weight (Low → High)' },
    { id: 'priority_desc', label: 'Priority Weight (High → Low)' },
    { id: 'added_desc', label: 'Added on (Newest first)' },
    { id: 'added_asc', label: 'Added on (Oldest first)' },
  ];
  const btnRef = useRef(null);
  const modalRef = useRef(null);
  useModalAutoClose({
    buttonRefrence: btnRef,
    refrence: modalRef,
    close: () => {
      setIsSortOpen(false);
    },
  });

  return (
    <>
      {!tableDataLength ? (
        <div className="text-Text-Primary font-medium text-base w-full">
          {pageType}
        </div>
      ) : (
        <div className="w-full flex items-center justify-between flex-wrap gap-3 md:gap-5">
          <div className="text-Text-Primary font-medium text-base">
            {pageType}
          </div>
          <div className="flex items-center gap-3 md:gap-5 flex-wrap relative">
            <SearchBox
              ClassName="rounded-2xl !min-w-[243px] !h-8 md:!min-w-[283px] !py-[0px] !px-3 !shadow-[unset]"
              placeHolder={`Search ${pageType === 'Supplement' ? 'supplements' : pageType === 'Lifestyle' ? 'lifestyles' : 'diets'}...`}
              onSearch={handleChangeSearch}
            />

            <div className=" flex items-center gap-2">
              <div className="flex gap-1 items-center text-nowrap text-xs text-Primary-DeepTeal">
                <img src="/icons/sort.svg" alt="" />
                Sort by:
              </div>
              <div ref={btnRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortOpen((v) => !v)}
                  className={`h-8  rounded-[20px] border w-fit min-w-[183px]  border-[#E2F1F8] px-[12px] py-[10px] bg-white text-xs text-Text-Primary text-nowrap flex items-center justify-between gap-2 shadow-100 ${isSortOpen ? 'rounded-b-none' : ''}`}
                >
                  {currentSortLabel}
                  <div
                    className={` transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                  >
                    <SvgIcon
                      color="#005F73"
                      width="16px"
                      height="16px"
                      src="/icons/arrow-down.svg"
                    />
                  </div>
                </button>

                {isSortOpen && (
                  <div
                    ref={modalRef}
                    className={`absolute w-full top-8 z-20  right-0  bg-white rounded-[20px] px-2 py-3   shadow-md  ${isSortOpen ? 'rounded-t-none' : ''}`}
                  >
                    <div className="flex flex-col gap-4">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            onChangeSort(opt.id);
                            setIsSortOpen(false);
                          }}
                          className="w-full text-left text-[#888888] text-[10px]   flex items-center gap-2"
                        >
                          <span
                            className={`inline-block w-4 h-4 rounded-full  border-Primary-DeepTeal ${currentSortLabel === opt.label ? 'border-[3.5px]' : 'border-[.5px]'}`}
                          ></span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <ButtonSecondary
              ClassName="w-[180px] h-[32px] rounded-[20px] shadow-Btn"
              onClick={handleOpenModal}
            >
              <img src="/icons/add-square.svg" alt="" />
              Add {pageType}
            </ButtonSecondary>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderLibraryTreePages;
