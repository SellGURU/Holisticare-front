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
  const [loadingCall, setLoadingCall] = useState(false);
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
    setLoading(true);
    Application.getSupplementList().then((res) => {
      setTableData(res.data);
      setLoading(false);
    });
  };
  const getLifestyles = () => {
    setLoading(true);
    Application.getLifestyleList().then((res) => {
      setTableData(res.data);
      setLoading(false);
    });
  };
  const getDiets = () => {
    setLoading(true);
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
      setLoadingCall(true);

      if (pageType === 'Supplement') {
        Application.editSupplement({
          Sup_Id: selectedRow.Sup_Id,
          ...values,
        })
          .then(() => {
            getSupplements(); // Refresh data after closing
            setLoadingCall(false);
            setAddShowModal(false);
            setSelectedRow(null);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
          });
      } else if (pageType === 'Lifestyle') {
        Application.editLifestyle({
          Life_Id: selectedRow.Life_Id,
          ...values,
        })
          .then(() => {
            getLifestyles(); // Refresh data after closing
            setLoadingCall(false);
            setAddShowModal(false);
            setSelectedRow(null);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
          });
      } else {
        Application.editDiet({
          Diet_Id: selectedRow.Diet_Id,
          ...values,
        })
          .then(() => {
            getDiets(); // Refresh data after closing
            setLoadingCall(false);
            setAddShowModal(false);
            setSelectedRow(null);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
          });
      }
    } else {
      setLoadingCall(true);

      if (pageType === 'Supplement') {
        Application.addSupplement(values)
          .then(() => {
            getSupplements(); // Refresh data after closing
            setLoadingCall(false);
            setAddShowModal(false);
            setSelectedRow(null);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
          });
      } else if (pageType === 'Lifestyle') {
        Application.addLifestyle(values)
          .then(() => {
            getLifestyles(); // Refresh data after closing
            setLoadingCall(false);
            setAddShowModal(false);
            setSelectedRow(null);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
          });
      } else {
        Application.addDiet(values)
          .then(() => {
            getDiets(); // Refresh data after closing
            setLoadingCall(false);
            setAddShowModal(false);
            setSelectedRow(null);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
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
            found.
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
        <>
          {filteredData.length ? (
            <TableNoPaginateForLibraryThreePages
              pageType={pageType}
              tableData={filteredData}
              onDelete={(id) => {
                if (pageType === 'Supplement') {
                  setLoading(true);
                  Application.deleteSupplement(id).then(() => {
                    getSupplements();
                    setLoading(false);
                  });
                } else if (pageType === 'Lifestyle') {
                  setLoading(true);
                  Application.deleteLifestyle(id).then(() => {
                    getLifestyles();
                    setLoading(false);
                  });
                } else {
                  setLoading(true);
                  Application.deleteDiet(id).then(() => {
                    getDiets();
                    setLoading(false);
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
          ) : (
            <div className="w-full h-full h-sm:h-[500px] flex flex-col justify-center items-center text-base font-medium text-Text-Primary ">
              <img src="/icons/search-status.svg" alt="" />
              <span className="-mt-6"> No results found.</span>
            </div>
          )}
        </>
      )}
      <AddModalLibraryTreePages
        addShowModal={addShowModal}
        handleCloseModal={handleCloseModal}
        pageType={pageType}
        onSubmit={onSave}
        selectedRow={selectedRow}
        setSelectedRow={() => setSelectedRow(null)}
        loadingCall={loadingCall}
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
