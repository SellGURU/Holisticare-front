/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import SearchBox from '../../SearchBox';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import useIsDemo from '../../../hooks/useIsDemo';
import type { EnabledFilter } from '../../../utils/catalogEnabled';
import EnabledStatusSelect from '../../EnabledStatusSelect';
import LibrarySortSelect from '../../LibrarySortSelect';

interface HeaderLibraryTreePagesProps {
  pageType: string;
  tableDataLength: number;
  handleChangeSearch: (event: any) => void;
  handleOpenModal: () => void;
  sortId: string;
  onChangeSort: (sortId: string) => void;
  enabledFilter: EnabledFilter;
  onChangeEnabledFilter: (filter: EnabledFilter) => void;
  onManageTypes?: () => void;
}

const HeaderLibraryTreePages: FC<HeaderLibraryTreePagesProps> = ({
  pageType,
  tableDataLength,
  handleChangeSearch,
  handleOpenModal,
  sortId,
  onChangeSort,
  enabledFilter,
  onChangeEnabledFilter,
  onManageTypes,
}) => {
  const isDemo = useIsDemo();

  return (
    <>
      {!tableDataLength ? (
        <div className="text-Text-Primary font-medium text-base w-full">
          {pageType}
        </div>
      ) : (
        <div className="w-full flex items-center justify-between flex-wrap gap-2">
          <div className="text-Text-Primary font-medium text-base">
            {pageType}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBox
              ClassName="rounded-xl !h-8 !min-w-[200px] md:!min-w-[240px] !py-[0px] !px-3 !shadow-[unset]"
              placeHolder={`Search ${pageType === 'Supplement' ? 'supplements' : pageType === 'Lifestyle' ? 'lifestyles' : pageType === 'Peptide' ? 'peptides' : pageType === 'Other' ? 'other' : 'diets'}...`}
              onSearch={handleChangeSearch}
            />
            <EnabledStatusSelect
              value={enabledFilter}
              onChange={onChangeEnabledFilter}
            />
            <LibrarySortSelect
              pageType={pageType}
              value={sortId}
              onChange={onChangeSort}
            />
            {onManageTypes && (
              <ButtonSecondary
                size="small"
                ClassName="h-8 w-auto min-w-0 rounded-[20px] shadow-Btn"
                disabled={isDemo}
                title={
                  isDemo
                    ? 'Demo version cannot add or edit data. Upgrade for full access.'
                    : undefined
                }
                onClick={() => {
                  if (isDemo) return;
                  onManageTypes();
                }}
              >
                Manage types
              </ButtonSecondary>
            )}
            <ButtonSecondary
              size="small"
              ClassName="h-8 w-auto min-w-0 rounded-[20px] shadow-Btn"
              disabled={isDemo}
              title={
                isDemo
                  ? 'Demo version cannot add or edit data. Upgrade for full access.'
                  : undefined
              }
              onClick={() => {
                if (isDemo) return;
                handleOpenModal();
              }}
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
