import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { format, subDays } from 'date-fns';
import AdminApi from '../api/admin';

interface AdminClinicOption {
  clinic_email: string;
  clinic_name: string;
}

interface AdminContextValue {
  clinics: AdminClinicOption[];
  loadingClinics: boolean;
  selectedClinicEmail: string;
  startDate: string;
  endDate: string;
  setSelectedClinicEmail: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setDateRange: (start: string, end: string) => void;
  refreshClinics: () => Promise<void>;
}

const defaultStartDate = format(subDays(new Date(), 29), 'yyyy-MM-dd');
const defaultEndDate = format(new Date(), 'yyyy-MM-dd');

const AdminContext = createContext<AdminContextValue | null>(null);

const getStoredValue = (key: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return localStorage.getItem(key) || fallback;
};

const AdminContextProvider = ({ children }: { children: ReactNode }) => {
  const [clinics, setClinics] = useState<AdminClinicOption[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [selectedClinicEmail, setSelectedClinicEmailState] = useState(() =>
    getStoredValue('adminSelectedClinicEmail', ''),
  );
  const [startDate, setStartDateState] = useState(() =>
    getStoredValue('adminStartDate', defaultStartDate),
  );
  const [endDate, setEndDateState] = useState(() =>
    getStoredValue('adminEndDate', defaultEndDate),
  );

  const persist = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  const setSelectedClinicEmail = (value: string) => {
    setSelectedClinicEmailState(value);
    persist('adminSelectedClinicEmail', value);
  };

  const setStartDate = (value: string) => {
    setStartDateState(value);
    persist('adminStartDate', value);
  };

  const setEndDate = (value: string) => {
    setEndDateState(value);
    persist('adminEndDate', value);
  };

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const refreshClinics = useCallback(async () => {
    setLoadingClinics(true);
    try {
      const res = await AdminApi.getClinics();
      const nextClinics = Array.isArray(res.data) ? res.data : [];
      setClinics(nextClinics);
    } finally {
      setLoadingClinics(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      clinics,
      loadingClinics,
      selectedClinicEmail,
      startDate,
      endDate,
      setSelectedClinicEmail,
      setStartDate,
      setEndDate,
      setDateRange,
      refreshClinics,
    }),
    [clinics, endDate, loadingClinics, refreshClinics, selectedClinicEmail, startDate],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminContextProvider');
  }

  return context;
};

export default AdminContextProvider;
