import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Circleloader from '../CircleLoader';
import Admin from '../../api/Admin';
import SearchBox from '../SearchBox';
const ClinicList = () => {
  const [isLoading, setIsLoading] = useState(true);
  interface Clinic {
    clinic_email: string;
    clinic_name: string | null;
    clinic_logo?: string | null;
  }
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const getEmailInitials = (email: string) => {
    const localPart = (email || '').split('@')[0] || '';
    if (!localPart) return '?';
    const cleaned = localPart.replace(/[^a-zA-Z0-9]/g, '');
    const firstTwo = cleaned.slice(0, 2).toUpperCase();
    return firstTwo || '?';
  };
  const getClinics = () => {
    // setIsLoading(false);
    Admin.getClinics().then((res) => {
      console.log(res.data);
      if (res.data != 'Internal Server Error') {
        setClinics(res.data);
      } else {
        localStorage.clear();
        setClinics([]);
      }
      setIsLoading(false);
    });
  };
  useEffect(() => {
    getClinics();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      ) : (
        <>
          <div className="sticky p-4 top-0 pt-6 bg-bg-color z-10  pb-1 mb-3 flex items-center justify-between gap-3">
            <div className="text-sm text-Text-Primary font-medium">
              Clinic List
            </div>
            <SearchBox
              placeHolder="Search by email or clinic name..."
              value={search}
              onSearch={(val) => setSearch(val)}
            />
            {/* <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or clinic name..."
              className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-Primary-DeepTeal/40"
              type="text"
            /> */}
          </div>
          <div className="p-4">
            <div>
              {clinics?.length === 0 ? (
                <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center">
                  <p className="text-sm text-gray-500">No clinics found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {clinics
                    ?.filter((c) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      const email = (c.clinic_email || '').toLowerCase();
                      const name = (c.clinic_name || '').toLowerCase();
                      return email.includes(q) || name.includes(q);
                    })
                    ?.map((clinic, idx) => (
                      <Link
                        key={clinic.clinic_email + idx}
                        to={'/log/' + clinic.clinic_email}
                        className="bg-white rounded-xl shadow border border-gray-100 p-4 hover:shadow-lg hover:border-Primary-DeepTeal transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {clinic.clinic_logo ? (
                            <img
                              src={clinic.clinic_logo}
                              alt={clinic.clinic_name ?? clinic.clinic_email}
                              className="h-16 w-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700 flex-shrink-0">
                              {getEmailInitials(clinic.clinic_email)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-Text-Primary truncate">
                              {clinic.clinic_name ?? '-'}
                            </p>
                            <p className="text-[10px] text-Primary-DeepTeal truncate mt-1">
                              {clinic.clinic_email}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClinicList;
