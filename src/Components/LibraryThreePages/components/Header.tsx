/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import SearchBox from '../../SearchBox';
import { ButtonSecondary } from '../../Button/ButtosSecondary';

interface HeaderLibraryTreePagesProps {
  pageType: string;
  tableDataLength: number;
  handleChangeSearch: (event: any) => void;
  handleOpenModal: () => void;
}

const HeaderLibraryTreePages: FC<HeaderLibraryTreePagesProps> = ({
  pageType,
  tableDataLength,
  handleChangeSearch,
  handleOpenModal,
}) => {
  return (
    <>
      {!tableDataLength ? (
        <div className="text-Text-Primary font-medium text-base w-full">
          {pageType}
        </div>
      ) : (
        <div className="w-full flex items-center justify-between flex-wrap gap-5">
          <div className="text-Text-Primary font-medium text-base">
            {pageType}
          </div>
          <div className="flex items-center gap-5 flex-wrap w-full justify-between">
            <SearchBox
              ClassName="rounded-xl !min-w-[243px] !h-8 md:!min-w-[283px] !py-[0px] !px-3 !shadow-[unset]"
              placeHolder={`Search in ${pageType === 'Supplement' ? 'supplement' : pageType === 'Lifestyle' ? 'lifestyle' : 'diet'}...`}
              onSearch={handleChangeSearch}
            />
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
