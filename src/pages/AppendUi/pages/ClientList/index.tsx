import { ChangeEvent, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Application from '../../../../api/app';
import { AppContext } from '../../../../store/app';
import ClientListHeader from './ClientListHeader';
import ClientFilters, { type ClientFiltersState } from './ClientFilters';
import ClientTable from './ClientTable';
import AddClientModal from './AddClientModal';
import { URGENCY_ORDER } from './constants';
import { mapPatientToClient, type BackendPatient } from './mapPatient';
import { EMPTY_NEW_CLIENT, type Client, type SortCol } from './types';

const INITIAL_FILTERS: ClientFiltersState = {
  searchQuery: '',
  urgencyFilter: 'all',
  categoryFilter: 'all',
  planFilter: 'all',
  assignedFilter: 'all',
  mobileAppFilter: 'all',
  checkInFilter: 'all',
};

const ClientListPage = () => {
  const navigate = useNavigate();
  const { setPatientsList } = useContext(AppContext);

  const [clients, setClients] = useState<Client[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Application.getPatients()
      .then((res) => {
        if (cancelled) return;
        const raw: BackendPatient[] = res?.data?.patients_list_data ?? [];
        const mapped = raw.map(mapPatientToClient);
        setClients(mapped);
        setTotalCount(mapped.length);

        setPatientsList(
          raw.map((p) => ({
            member_id: p.member_id,
            profile_picture: p.picture,
            name: p.name,
          })),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error getting clients list:', err);
        setClients([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setPatientsList]);

  const [filters, setFilters] = useState<ClientFiltersState>(INITIAL_FILTERS);
  const [sortCol, setSortCol] = useState<SortCol>('urgency');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState(EMPTY_NEW_CLIENT);

  const filteredClients = useMemo(() => {
    const {
      searchQuery,
      urgencyFilter,
      categoryFilter,
      planFilter,
      assignedFilter,
      mobileAppFilter,
      checkInFilter,
    } = filters;

    const result = clients.filter((c) => {
      const lowerQuery = searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(lowerQuery) ||
        c.id.toLowerCase().includes(lowerQuery);
      const matchUrgency =
        urgencyFilter === 'all' || c.urgency === urgencyFilter;
      const matchCategory =
        categoryFilter === 'all' || c.category === categoryFilter;
      const matchPlan = planFilter === 'all' || c.planStatus === planFilter;
      const matchAssigned =
        assignedFilter === 'all' || c.assigned === assignedFilter;
      const hasMobileApp = c.connectedApps.length > 0;
      const matchMobile =
        mobileAppFilter === 'all' ||
        (mobileAppFilter === 'inuse' && hasMobileApp) ||
        (mobileAppFilter === 'notconnected' && !hasMobileApp);
      const matchCheckIn =
        checkInFilter === 'all' ||
        (checkInFilter === 'overdue7' && c.lastCheckIn > 7) ||
        (checkInFilter === 'overdue14' && c.lastCheckIn > 14);

      return (
        matchSearch &&
        matchUrgency &&
        matchCategory &&
        matchPlan &&
        matchAssigned &&
        matchMobile &&
        matchCheckIn
      );
    });

    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'urgency') {
        cmp = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
      } else if (sortCol === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortCol === 'lastCheckIn') {
        cmp = a.lastCheckIn - b.lastCheckIn;
      } else if (sortCol === 'category') {
        cmp = a.category.localeCompare(b.category);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return sorted;
  }, [clients, filters, sortCol, sortDir]);

  const filteredCount = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / perPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, perPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const pageClients = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredClients.slice(start, start + perPage);
  }, [filteredClients, currentPage, perPage]);

  const hasActiveFilters =
    filters.urgencyFilter !== 'all' ||
    filters.categoryFilter !== 'all' ||
    filters.planFilter !== 'all' ||
    filters.assignedFilter !== 'all' ||
    filters.mobileAppFilter !== 'all' ||
    filters.checkInFilter !== 'all' ||
    filters.searchQuery !== '';

  const activeFilterCount = [
    filters.urgencyFilter,
    filters.categoryFilter,
    filters.planFilter,
    filters.assignedFilter,
    filters.mobileAppFilter,
    filters.checkInFilter,
  ].filter((f) => f !== 'all').length;

  const updateFilter =
    <K extends keyof ClientFiltersState>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClearFilters = () => setFilters(INITIAL_FILTERS);
  const handleToggleFilters = () => setShowFilters((prev) => !prev);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const handleMessageClient = (client: Client) => {
    const params = new URLSearchParams({
      id: String(client.memberId),
      username: client.name,
      status: 'false',
    });
    navigate(`/messages?${params.toString()}`);
  };

  const handleOpenClient = (client: Client) => {
    navigate(
      `/report/${client.memberId}/${encodeURIComponent(client.name)}`,
    );
  };

  const handleOpenAddClient = () => setShowAddClient(true);
  const handleCloseAddClient = () => {
    setShowAddClient(false);
    setNewClient(EMPTY_NEW_CLIENT);
  };

  const updateClient =
    <K extends keyof typeof EMPTY_NEW_CLIENT>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setNewClient((prev) => ({ ...prev, [key]: e.target.value }));

  const handleToggleUnlimited = () =>
    setNewClient((prev) => ({
      ...prev,
      unlimited: !prev.unlimited,
      activeWeeks: !prev.unlimited ? '' : prev.activeWeeks,
    }));

  return (
    <div className="h-[calc(100vh-60px)] px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <ClientListHeader
          visibleCount={filteredClients.length}
          totalCount={totalCount}
          isLoading={isLoading}
          onAddClick={handleOpenAddClient}
        />
        <ClientFilters
          filters={filters}
          showFilters={showFilters}
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={updateFilter('searchQuery')}
          onUrgencyChange={updateFilter('urgencyFilter')}
          onCategoryChange={updateFilter('categoryFilter')}
          onPlanChange={updateFilter('planFilter')}
          onAssignedChange={updateFilter('assignedFilter')}
          onMobileAppChange={updateFilter('mobileAppFilter')}
          onCheckInChange={updateFilter('checkInFilter')}
          onToggleFilters={handleToggleFilters}
          onClearFilters={handleClearFilters}
        />
      </div>
      <ClientTable
        className="flex-1 min-h-0"
        clients={pageClients}
        filteredCount={filteredCount}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={setPerPage}
        hoveredRow={hoveredRow}
        sortCol={sortCol}
        sortDir={sortDir}
        onSort={handleSort}
        onRowHover={setHoveredRow}
        onRowLeave={() => setHoveredRow(null)}
        onMessageClick={handleMessageClient}
        onClientOpen={handleOpenClient}
        isLoading={isLoading}
      />
      <AddClientModal
        open={showAddClient}
        client={newClient}
        onClose={handleCloseAddClient}
        onChangeFirstName={updateClient('firstName')}
        onChangeLastName={updateClient('lastName')}
        onChangeEmail={updateClient('email')}
        onChangePhone={updateClient('phone')}
        onChangeDob={updateClient('dob')}
        onChangeSex={updateClient('sex')}
        onChangeEthnicity={updateClient('ethnicity')}
        onChangePractitioner={updateClient('practitioner')}
        onChangeCategory={updateClient('category')}
        onChangeActiveWeeks={updateClient('activeWeeks')}
        onToggleUnlimited={handleToggleUnlimited}
      />
    </div>
  );
};

export default ClientListPage;
