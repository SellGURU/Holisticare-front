/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import HeaderLibraryTreePages from './components/Header';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import AddModalLibraryTreePages from './components/AddModal';
import Application from '../../api/app';
import TableNoPaginateForLibraryThreePages from './components/TableNoPaginate';

interface LibraryThreePagesProps {
  pageType: string;
}

const LibraryThreePages: FC<LibraryThreePagesProps> = ({ pageType }) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const handleChangeSearch = (event: any) => {
    setSearchQuery(event.target.value);
  };
  console.log('tableData => ', tableData);
  const [editLibraryId, setEditLibraryId] = useState(null);
  const [addShowModal, setAddShowModal] = useState(false);
  const handleCloseModal = () => {
    setAddShowModal(false);
  };
  const handleOpenModal = () => {
    setAddShowModal(true);
  };
  const getSupplements = () => {
    Application.getSupplementList().then((res) => {
      setTableData(res.data);
    });
  };
  useEffect(() => {
    if (pageType === 'Supplement') {
      getSupplements();
    }
  }, [pageType]);
  const onSave = (values: any) => {
    if (editLibraryId !== null) {
      Application.addSupplement({
        Sup_Id: editLibraryId,
        ...values,
      }).then(() => {
        setEditLibraryId(null);
        getSupplements();
        setAddShowModal(false);
      });
    } else {
      Application.addSupplement(values).then(() => {
        getSupplements();
        setAddShowModal(false);
      });
    }
  };
  const filteredData = tableData.filter((item) =>
    item.Title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <>
      <HeaderLibraryTreePages
        pageType={pageType}
        tableDataLength={tableData.length}
        handleChangeSearch={handleChangeSearch}
        handleOpenModal={handleOpenModal}
      />
      {!tableData.length ? (
        <div
          className={`w-full flex justify-center items-center flex-col mt-16`}
        >
          <img
            src={`/icons/${pageType === 'Supplement' ? 'supplement-empty' : pageType === 'Lifestyle' ? 'lifestyle-empty' : 'diet-empty'}.svg`}
            alt=""
            className="mt-16"
          />
          <div className="font-medium text-base text-Text-Primary mt-8">
            No{' '}
            {pageType === 'Supplement'
              ? 'supplement'
              : pageType === 'Lifestyle'
                ? 'lifestyle'
                : 'diet'}{' '}
            existed yet.
          </div>
          <ButtonSecondary
            ClassName="w-[210px] rounded-[20px] shadow-Btn mt-4"
            onClick={handleOpenModal}
          >
            <img src="/icons/add-square.svg" alt="" />
            Add {pageType}
          </ButtonSecondary>
        </div>
      ) : (
        <TableNoPaginateForLibraryThreePages
          pageType={pageType}
          tableData={filteredData}
        />
      )}
      <AddModalLibraryTreePages
        addShowModal={addShowModal}
        handleCloseModal={handleCloseModal}
        pageType={pageType}
        onSubmit={onSave}
      />
    </>
  );
};

export default LibraryThreePages;
