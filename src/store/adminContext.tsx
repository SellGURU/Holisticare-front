import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { format, subDays } from 'date-fns';
import AdminApi from '../api/admin';

/** Bump when default filter semantics change (one-time localStorage refresh). */
const ADMIN_FILTERS_VERSION = '2';

export const defaultAdminStartDate = () =>
  format(subDays(new Date(), 6), 'yyyy-MM-dd');
export const defaultAdminEndDate = () => format(new Date(), 'yyyy-MM-dd');

const ensureAdminFilterDefaults = () => {
  if (typeof window === 'undefined') {
    return;
  }
  if (localStorage.getItem('adminFiltersVersion') === ADMIN_FILTERS_VERSION) {
    return;
  }
  localStorage.setItem('adminStartDate', defaultAdminStartDate());
  localStorage.setItem('adminEndDate', defaultAdminEndDate());
  localStorage.removeItem('adminSelectedClinicEmail');
  localStorage.setItem('adminFiltersVersion', ADMIN_FILTERS_VERSION);
};

ensureAdminFilterDefaults();

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
  analyticsLoading: boolean;
  setAnalyticsLoading: (value: boolean) => void;
}

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
    getStoredValue('adminStartDate', defaultAdminStartDate()),
  );
  const [endDate, setEndDateState] = useState(() =>
    getStoredValue('adminEndDate', defaultAdminEndDate()),
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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
      if (nextClinics.length > 0 && !selectedClinicEmail) {
        const firstEmail = nextClinics[0].clinic_email;
        setSelectedClinicEmailState(firstEmail);
        persist('adminSelectedClinicEmail', firstEmail);
      }
    } finally {
      setLoadingClinics(false);
    }
  }, [selectedClinicEmail]);

  useEffect(() => {
    if (clinics.length > 0 && !selectedClinicEmail) {
      const firstEmail = clinics[0].clinic_email;
      setSelectedClinicEmailState(firstEmail);
      persist('adminSelectedClinicEmail', firstEmail);
    }
  }, [clinics, selectedClinicEmail]);

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
      analyticsLoading,
      setAnalyticsLoading,
    }),
    [
      analyticsLoading,
      clinics,
      endDate,
      loadingClinics,
      refreshClinics,
      selectedClinicEmail,
      startDate,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminContextProvider');
  }

  return context;
};

/** Sync page-level analytics loading state to the shared admin shell banner. */
export const useAdminAnalyticsLoading = (loading: boolean) => {
  const { setAnalyticsLoading } = useAdminContext();

  useEffect(() => {
    setAnalyticsLoading(loading);
    return () => setAnalyticsLoading(false);
  }, [loading, setAnalyticsLoading]);
};

export default AdminContextProvider;
