/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import HeaderLibraryTreePages from './components/Header';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import AddModalLibraryTreePages from './components/AddModal';
import Application from '../../api/app';
import TableNoPaginateForLibraryThreePages from './components/TableNoPaginate';
import PreviewModalLibraryTreePages from './components/PreviewModal';
import Circleloader from '../CircleLoader';

interface LibraryThreePagesProps {
  pageType: string;
}

const LibraryThreePages: FC<LibraryThreePagesProps> = ({ pageType }) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const handleChangeSearch = (value: any) => {
    setSearchQuery(value);
  };
  const [addShowModal, setAddShowModal] = useState(false);
  const handleCloseModal = () => {
    setAddShowModal(false);
  };
  const handleOpenModal = () => {
    setAddShowModal(true);
  };
  const [previewShowModal, setPreviewShowModal] = useState(false);
  const handlePreviewCloseModal = () => {
    setPreviewShowModal(false);
  };
  const handlePreviewOpenModal = () => {
    setPreviewShowModal(true);
  };
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const getSupplements = () => {
    Application.getSupplementList().then((res) => {
      setTableData(res.data);
      setLoading(false);
    });
  };
  const getLifestyles = () => {
    Application.getLifestyleList().then((res) => {
      setTableData(res.data);
      setLoading(false);
    });
  };
  const getDiets = () => {
    Application.getDietList().then((res) => {
      setTableData(res.data);
      setLoading(false);
    });
  };
  useEffect(() => {
    if (pageType === 'Supplement') {
      getSupplements();
    } else if (pageType === 'Lifestyle') {
      getLifestyles();
    } else {
      getDiets();
    }
  }, [pageType]);
  const onSave = (values: any) => {
    if (selectedRow !== null) {
        // Close the modal immediately
        setLoading(true)
        setAddShowModal(false);
        setSelectedRow(null);

        if (pageType === 'Supplement') {
            Application.editSupplement({
                Sup_Id: selectedRow.Sup_Id,
                ...values,
            }).then(() => {
                getSupplements(); // Refresh data after closing
                setLoading(false);
            });
        } else if (pageType === 'Lifestyle') {
            Application.editLifestyle({
                Life_Id: selectedRow.Life_Id,
                ...values,
            }).then(() => {
                getLifestyles(); // Refresh data after closing
                setLoading(false);
            });
        } else {
            Application.editDiet({
                Diet_Id: selectedRow.Diet_Id,
                ...values,
            }).then(() => {
              
                getDiets(); // Refresh data after closing
                setLoading(false);
            });
        }
    } else {
        // Close the modal immediately
        setLoading(true)
        setAddShowModal(false);

        if (pageType === 'Supplement') {
            Application.addSupplement(values).then(() => {
                getSupplements(); // Refresh data after closing
                setLoading(false)

            });
        } else if (pageType === 'Lifestyle') {
            Application.addLifestyle(values).then(() => {
                getLifestyles(); // Refresh data after closing
                setLoading(false)

            });
        } else {
            Application.addDiet(values).then(() => {
                getDiets(); // Refresh data after closing
                setLoading(false)

            });
        }
    }
};
  const filteredData = tableData.filter((item) =>
    item.Title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <HeaderLibraryTreePages
        pageType={pageType}
        tableDataLength={tableData.length}
        handleChangeSearch={handleChangeSearch}
        handleOpenModal={handleOpenModal}
      />
      {!filteredData.length ? (
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
          onDelete={(id) => {
            if (pageType === 'Supplement') {
              Application.deleteSupplement(id).then(() => {
                getSupplements();
              });
            } else if (pageType === 'Lifestyle') {
              Application.deleteLifestyle(id).then(() => {
                getLifestyles();
              });
            } else {
              Application.deleteDiet(id).then(() => {
                getDiets();
              });
            }
          }}
          onEdit={(row) => {
            setSelectedRow(row);
            handleOpenModal();
          }}
          onPreview={(row) => {
            setSelectedRow(row);
            handlePreviewOpenModal();
          }}
        />
      )}
      <AddModalLibraryTreePages
        addShowModal={addShowModal}
        handleCloseModal={handleCloseModal}
        pageType={pageType}
        onSubmit={onSave}
        selectedRow={selectedRow}
      />
      <PreviewModalLibraryTreePages
        previewShowModal={previewShowModal}
        handlePreviewCloseModal={handlePreviewCloseModal}
        pageType={pageType}
        selectedRow={selectedRow}
        handleOpenModal={handleOpenModal}
      />
    </>
  );
};

export default LibraryThreePages;
