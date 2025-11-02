import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Circleloader from '../CircleLoader';
import Admin from '../../api/Admin';

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
      if(res.data != 'Internal Server Error'){
        setClinics(res.data);
      }else{
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
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or clinic name..."
              className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-Primary-DeepTeal/40"
              type="text"
            />
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100 max-h-[75vh] overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Logo
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Clinic name
                  </th>
                </tr>
              </thead>
              <tbody>
                {clinics?.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-500" colSpan={2}>
                      No clinics found.
                    </td>
                  </tr>
                ) : (
                  clinics
                    ?.filter((c) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      const email = (c.clinic_email || '').toLowerCase();
                      const name = (c.clinic_name || '').toLowerCase();
                      return email.includes(q) || name.includes(q);
                    })
                    ?.map((clinic, idx) => (
                      <tr
                        key={clinic.clinic_email + idx}
                        className={idx % 2 === 1 ? 'bg-gray-50' : ''}
                      >
                        <td className="px-4 py-3">
                          {clinic.clinic_logo ? (
                            <img
                              src={clinic.clinic_logo}
                              alt={clinic.clinic_name ?? clinic.clinic_email}
                              className="h-12 w-12 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                              {getEmailInitials(clinic.clinic_email)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-Primary-DeepTeal">
                          <Link
                            to={'/log/' + clinic.clinic_email}
                            className="hover:underline"
                          >
                            {clinic.clinic_email}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-Text-Primary">
                          {clinic.clinic_name ?? '-'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default ClinicList;
