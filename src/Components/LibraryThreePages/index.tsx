/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import HeaderLibraryTreePages from './components/Header';
import { ButtonSecondary } from '../Button/ButtosSecondary';
import AddModalLibraryTreePages from './components/AddModal2';
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
  const [sortId, setSortId] = useState<string>('title_asc');
  // const [clearData, setClearData] = useState(false);
  // const handleClearData = (value: boolean) => {
  //   setClearData(value);
  // };
  const handleChangeSearch = (value: any) => {
    setSearchQuery(value);
  };
  const [addShowModal, setAddShowModal] = useState(false);
  const handleCloseModal = () => {
    setAddShowModal(false);
  };
  const handleOpenModal = () => {
    setPreviewShowModal(false);
    setAddShowModal(true);
  };
  const [previewShowModal, setPreviewShowModal] = useState(false);
  const handlePreviewCloseModal = () => {
    setSelectedRow(null);
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
            // setClearData(true);
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
            // setClearData(true);
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
            // setClearData(true);
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
            // setClearData(true);
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
            // setClearData(true);
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
            // setClearData(true);
          })
          .catch((err) => {
            console.error(err);
            setLoadingCall(false);
          });
      }
    }
  };
  const onDelete = (id: string) => {
    if (pageType === 'Supplement') {
      setLoading(true);
      Application.deleteSupplement(id)
        .then(() => {
          getSupplements();
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (pageType === 'Lifestyle') {
      setLoading(true);
      Application.deleteLifestyle(id)
        .then(() => {
          getLifestyles();
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(true);
      Application.deleteDiet(id)
        .then(() => {
          getDiets();
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  const filteredData = tableData.filter((item) =>
    item.Title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedData = (() => {
    const data = [...filteredData];

    const getNum = (v: unknown): number => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = Number(v.replace(/[^0-9.-]/g, ''));
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    };

    const getDate = (v: unknown): number => {
      const d = new Date(v as string);
      return d.getTime() || 0;
    };

    const getAddedDate = (item: any) =>
      getDate(
        item['Added on'] ??
          item['Added On'] ??
          item.AddedOn ??
          item.CreatedAt ??
          item.Created,
      );

    const getPriorityValue = (item: any) =>
      getNum(
        item.Base_Score ?? item.PriorityWeight ?? item.Priority ?? item.Weight,
      );

    switch (sortId) {
      case 'title_asc':
        data.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
        break;
      case 'title_desc':
        data.sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
        break;
      case 'dose_asc':
        data.sort(
          (a, b) => getNum(a.Dose ?? a.Dosage) - getNum(b.Dose ?? b.Dosage),
        );
        break;
      case 'dose_desc':
        data.sort(
          (a, b) => getNum(b.Dose ?? b.Dosage) - getNum(a.Dose ?? a.Dosage),
        );
        break;
      case 'priority_asc':
        data.sort((a, b) => getPriorityValue(a) - getPriorityValue(b));
        break;
      case 'priority_desc':
        data.sort((a, b) => getPriorityValue(b) - getPriorityValue(a));
        break;
      case 'added_desc':
        data.sort((a, b) => getAddedDate(a) - getAddedDate(b));
        break;
      case 'added_asc':
        data.sort((a, b) => getAddedDate(b) - getAddedDate(a));
        break;
      default:
        break;
    }

    return data;
  })();

  const sortLabelMap: Record<string, string> = {
    title_asc: 'Title (A → Z)',
    title_desc: 'Title (Z → A)',
    dose_asc: 'Dose (Low → High)',
    dose_desc: 'Dose (High → Low)',
    priority_asc: 'Priority Weight (Low → High)',
    priority_desc: 'Priority Weight (High → Low)',
    added_desc: 'Added on (Newest first)',
    added_asc: 'Added on (Oldest first)',
  };
  const currentSortLabel = sortLabelMap[sortId] ?? sortLabelMap['title_asc'];
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
        currentSortLabel={currentSortLabel}
        onChangeSort={(id: string) => setSortId(id ?? 'title_asc')}
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
          {sortedData.length ? (
            <TableNoPaginateForLibraryThreePages
              pageType={pageType}
              tableData={sortedData}
              onDelete={(id) => onDelete(id)}
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
        onSubmit={onSave}
        loadingCall={loadingCall}
        pageType={pageType}
        mode={selectedRow ? 'edit' : 'add'}
        isOpen={addShowModal}
        editData={selectedRow}
        onClose={() => {
          handleCloseModal();
          setSelectedRow(null);
        }}
      />
      {/* <AddModalLibraryTreePages
        addShowModal={addShowModal}
        handleCloseModal={handleCloseModal}
        pageType={pageType}
        onSubmit={onSave}
        selectedRow={selectedRow}
        setSelectedRow={() => setSelectedRow(null)}
        loadingCall={loadingCall}
        clearData={clearData}
        handleClearData={handleClearData}
      /> */}
      <PreviewModalLibraryTreePages
        previewShowModal={previewShowModal}
        handlePreviewCloseModal={() => {
          handlePreviewCloseModal();
          // setSelectedRow(null);
        }}
        pageType={pageType}
        selectedRow={selectedRow}
        handleOpenModal={handleOpenModal}
      />
    </>
  );
};

export default LibraryThreePages;
