import { useState } from 'react';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import { useNavigate } from 'react-router-dom';
import SvgIcon from '../../utils/svgIcon';
import SearchBox from '../../Components/SearchBox';
import FilterModal from '../../Components/FilterModal';
import TablePaginationInside from '../../Components/TablePaginationInside';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<
    {
      No: number;
      name: string;
      reportWriter: string;
      id: number;
      gender: string;
      testResults: boolean;
      dateOfReport: string;
      enrollDate: string;
    }[]
  >([
    {
      No: 1,
      name: 'David Smith',
      reportWriter: 'Dr.Charlotte Walker',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 2,
      name: 'Leslie Alexander',
      reportWriter: 'Ethan Davis',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 3,
      name: 'Robert Garcia',
      reportWriter: 'Isabella Moore',
      id: 21548461651,
      gender: 'Male',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 4,
      name: 'Sarah Thompson',
      reportWriter: 'Dr.Elijah King',
      id: 21548461651,
      gender: 'Female',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 5,
      name: 'Daniel Carter',
      reportWriter: 'Dr.Amelia Robinson',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 6,
      name: 'Sophia Bennett',
      reportWriter: 'Dr.Amelia Robinson',
      id: 21548461651,
      gender: 'Female',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 7,
      name: 'Liam Anderson',
      reportWriter: 'Dr.Charlotte Walker',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 8,
      name: 'Emma Wilson',
      reportWriter: 'Isabella Moore',
      id: 21548461651,
      gender: 'Female',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 9,
      name: 'James Taylor',
      reportWriter: 'Dr.Amelia Robinson',
      id: 21548461651,
      gender: 'Female',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
  ]);
  const [reportsFiltered, setReportsFiltered] = useState<
    {
      No: number;
      name: string;
      reportWriter: string;
      id: number;
      gender: string;
      testResults: boolean;
      dateOfReport: string;
      enrollDate: string;
    }[]
  >([
    {
      No: 1,
      name: 'David Smith',
      reportWriter: 'Dr.Charlotte Walker',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 2,
      name: 'Leslie Alexander',
      reportWriter: 'Ethan Davis',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 3,
      name: 'Robert Garcia',
      reportWriter: 'Isabella Moore',
      id: 21548461651,
      gender: 'Male',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 4,
      name: 'Sarah Thompson',
      reportWriter: 'Dr.Elijah King',
      id: 21548461651,
      gender: 'Female',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 5,
      name: 'Daniel Carter',
      reportWriter: 'Dr.Amelia Robinson',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 6,
      name: 'Sophia Bennett',
      reportWriter: 'Dr.Amelia Robinson',
      id: 21548461651,
      gender: 'Female',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 7,
      name: 'Liam Anderson',
      reportWriter: 'Dr.Charlotte Walker',
      id: 21548461651,
      gender: 'Male',
      testResults: true,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 8,
      name: 'Emma Wilson',
      reportWriter: 'Isabella Moore',
      id: 21548461651,
      gender: 'Female',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
    {
      No: 9,
      name: 'James Taylor',
      reportWriter: 'Dr.Amelia Robinson',
      id: 21548461651,
      gender: 'Female',
      testResults: false,
      dateOfReport: '04/25/2024',
      enrollDate: '04/25/2024',
    },
  ]);
  const [activeList, setActiveList] = useState<string>('list');
  const [showSearch, setshowSearch] = useState<boolean>(false);
  const [showFilterModal, setshowFilterModal] = useState(false);
  const handleSearch = (searchTerm: string) => {
    const searchResult = reports.filter((report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setReportsFiltered(searchResult);
  };
  return (
    <div className="px-6 pt-8 ">
      <div className="w-full flex justify-between items-center">
        <div className="text-Text-Primary font-medium opacity-[87%]">
          Reports
        </div>
        <ButtonSecondary
          style={{ borderRadius: '20px' }}
          onClick={() => {
            setReports(reports);
            navigate('/reports');
          }}
        >
          <img className="mr-1" src="/icons/note-add.svg" alt="note-add" />
          Add a new report
        </ButtonSecondary>
      </div>
      <div className="w-full h-[1px] bg-white my-3"></div>
      <div className="w-full select-none flex justify-between mb-3">
        <div
          className={`flex items-center gap-1 text-Text-Secondary cursor-pointer text-sm`}
        >
          Total reports : 120
        </div>
        <div className="flex gap-3 relative">
          {showSearch ? (
            <div>
              <SearchBox
                id="searchBar"
                ClassName={`rounded-md`}
                onSearch={handleSearch}
                placeHolder="Search for reports ..."
                onBlur={() => {
                  setshowSearch(false);
                }}
              ></SearchBox>
            </div>
          ) : (
            <div
              onClick={() => {
                setshowSearch(true);
                setTimeout(() => {
                  document.getElementById('searchBar')?.focus();
                }, 200);
              }}
              className="bg-backgroundColor-Secondary cursor-pointer rounded-md px-4 py-2 flex justify-center items-center shadow-100"
            >
              <img src="/icons/search.svg" alt="" />
            </div>
          )}

          <div
            // onClick={() => setshowFilterModal(!showFilterModal)}
            className="rounded-md bg-backgroundColor-Secondary shadow-100 py-2 px-4 cursor-pointer"
          >
            <img src="/icons/filter.svg" alt="" />
          </div>
          {showFilterModal && (
            <FilterModal
              filters={[]}
              onApplyFilters={() => {}}
              onClearFilters={() => {}}
              onClose={() => {
                setshowFilterModal(false);
              }}
            />
          )}
          <div className="flex w-[96px] h-[32px] rounded-md ">
            <div
              onClick={() => setActiveList('grid')}
              className={` ${
                activeList === 'grid' ? 'bg-Primary-DeepTeal' : 'bg-white'
              }  w-full flex items-center justify-center rounded-md rounded-r-none cursor-pointer`}
            >
              <SvgIcon
                src="/icons/grid-1.svg"
                color={activeList == 'grid' ? '#FFF' : '#38383899'}
              />
            </div>
            <div
              onClick={() => setActiveList('list')}
              className={` ${
                activeList === 'list' ? 'bg-Primary-DeepTeal' : 'bg-white'
              } flex items-center w-full justify-center rounded-md rounded-l-none cursor-pointer`}
            >
              <SvgIcon
                src="/icons/textalign-left.svg"
                color={activeList == 'list' ? '#FFF' : '#38383899'}
              />
            </div>
          </div>
        </div>
      </div>
      {activeList === 'list' ? (
        <TablePaginationInside
          classData={reportsFiltered}
          setReportsFiltered={setReportsFiltered}
        ></TablePaginationInside>
      ) : (
        ''
      )}
    </div>
  );
};

export default Reports;
