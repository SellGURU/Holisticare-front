import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  MessageCircle,
  Eye,
  CalendarClock,
  Flag,
} from 'lucide-react';
import { getInitials } from '../../../../utils/getInitials';
import EmptyState from '../Dashboard/EmptyState';
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  PLAN_CONFIG,
  URGENCY_CONFIG,
} from './constants';
import type { Client, SortCol, SortDir } from './types';

interface ClientTableProps {
  clients: Client[];
  filteredCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  hoveredRow: string | null;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  onRowHover: (id: string) => void;
  onRowLeave: () => void;
  onMessageClick?: (client: Client) => void;
  onClientOpen?: (client: Client) => void;
  className?: string;
  isLoading?: boolean;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const buildPageList = (
  current: number,
  total: number,
): Array<number | 'ellipsis'> => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
};

const SortableTh = ({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
  className = '',
}: {
  label: string;
  col: SortCol;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  className?: string;
}) => (
  <th
    className={`text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide cursor-pointer hover:text-gray-600 transition-colors duration-150 bg-white ${className}`}
    onClick={() => onSort(col)}
  >
    <span className="flex items-center gap-1">
      {label}{' '}
      {sortCol === col && (
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${
            sortDir === 'desc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </span>
  </th>
);

const ClientAvatar = ({
  picture,
  name,
  ringClass,
  textClass,
}: {
  picture?: string;
  name: string;
  ringClass: string;
  textClass: string;
}) => {
  const [broken, setBroken] = useState(false);
  const showImage = picture && !broken;

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 overflow-hidden ${ringClass} ${textClass}`}
    >
      {showImage ? (
        <img
          src={picture}
          alt={name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

const SkeletonBar = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <SkeletonBar className="h-3 w-32" />
          <SkeletonBar className="h-2 w-20" />
        </div>
      </div>
    </td>
    <td className="px-3 py-3">
      <SkeletonBar className="h-5 w-20 rounded-full" />
    </td>
    <td className="hidden lg:table-cell px-3 py-3">
      <div className="min-w-[110px] space-y-1.5">
        <SkeletonBar className="h-3 w-14" />
        <SkeletonBar className="h-1 w-full rounded-full" />
      </div>
    </td>
    <td className="hidden xl:table-cell px-3 py-3">
      <SkeletonBar className="h-5 w-24 rounded-full" />
    </td>
    <td className="hidden md:table-cell px-3 py-3">
      <SkeletonBar className="h-4 w-16 rounded" />
    </td>
    <td className="hidden md:table-cell px-3 py-3">
      <SkeletonBar className="h-4 w-14 rounded" />
    </td>
    <td className="hidden sm:table-cell px-3 py-3">
      <SkeletonBar className="h-3 w-12" />
    </td>
    <td className="hidden lg:table-cell px-3 py-3">
      <SkeletonBar className="h-3 w-20" />
    </td>
    <td className="px-4 py-3">
      <SkeletonBar className="h-3 w-16 ml-auto" />
    </td>
  </tr>
);

const ClientTable = ({
  clients,
  filteredCount,
  totalCount,
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
  hoveredRow,
  sortCol,
  sortDir,
  onSort,
  onRowHover,
  onRowLeave,
  onMessageClick,
  onClientOpen,
  className = '',
  isLoading = false,
}: ClientTableProps) => {
  const hasData = clients.length > 0;
  const skeletonRowCount = Math.min(perPage, 8);
  const pageList = buildPageList(currentPage, totalPages);
  const rangeStart = filteredCount === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, filteredCount);
  const canPrev = !isLoading && currentPage > 1;
  const canNext = !isLoading && currentPage < totalPages;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200/80 flex flex-col overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100 flex-shrink-0 flex-wrap">
        <p className="text-[11px] text-gray-500">
          {isLoading ? (
            <span className="inline-flex items-center gap-2 text-gray-400">
              <span className="w-3 h-3 rounded-full border-2 border-gray-200 border-t-[#10B981] animate-spin" />
              Loading clients…
            </span>
          ) : filteredCount === 0 ? (
            'No clients to show'
          ) : (
            <>
              Showing{' '}
              <span className="font-semibold text-gray-700">
                {rangeStart}–{rangeEnd}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-700">
                {filteredCount}
              </span>
              {filteredCount !== totalCount && (
                <span className="text-gray-400">
                  {' '}
                  (filtered from {totalCount})
                </span>
              )}
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500">
            <span>Rows</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-1.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => canPrev && onPageChange(currentPage - 1)}
              className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {pageList.map((p, i) =>
              p === 'ellipsis' ? (
                <span
                  key={`e-${i}`}
                  className="w-5 text-center text-[11px] text-gray-400 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium transition-colors duration-150 ${
                    p === currentPage
                      ? 'bg-[#10B981] text-white font-bold'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={!canNext}
              onClick={() => canNext && onPageChange(currentPage + 1)}
              className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
            <tr>
              <SortableTh
                label="PATIENT"
                col="name"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                className="px-4"
              />
              <SortableTh
                label="URGENCY"
                col="urgency"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="hidden lg:table-cell text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide bg-white">
                ACTIVE ENROLLMENT
              </th>
              <th className="hidden xl:table-cell text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide bg-white">
                MOBILE APP
              </th>
              <SortableTh
                label="CATEGORY"
                col="category"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                className="hidden md:table-cell"
              />
              <th className="hidden md:table-cell text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide bg-white">
                PLAN
              </th>
              <SortableTh
                label="CHECK-IN"
                col="lastCheckIn"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
                className="hidden sm:table-cell"
              />
              <th className="hidden lg:table-cell text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide bg-white">
                ASSIGNED
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[130px] bg-white">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRowCount }).map((_, idx) => (
                <SkeletonRow key={`sk-${idx}`} />
              ))
            ) : !hasData ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState message="No clients found" />
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const uConf = URGENCY_CONFIG[client.urgency];
                const pConf = PLAN_CONFIG[client.planStatus];
                const catColor =
                  CATEGORY_COLORS[client.category] ?? DEFAULT_CATEGORY_COLOR;
                const isHovered = hoveredRow === client.id;
                const enrollProgress =
                  client.enrollment.totalWeeks > 0
                    ? Math.round(
                        (client.enrollment.week /
                          client.enrollment.totalWeeks) *
                          100,
                      )
                    : 0;
                const checkInWarning = client.lastCheckIn > 14;
                const checkInCaution =
                  client.lastCheckIn > 7 && client.lastCheckIn <= 14;

                return (
                  <tr
                    key={client.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer group"
                    onMouseEnter={() => onRowHover(client.id)}
                    onMouseLeave={onRowLeave}
                    onClick={() => onClientOpen?.(client)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ClientAvatar
                          picture={client.picture}
                          name={client.name}
                          ringClass={uConf.avatarBg}
                          textClass={uConf.avatarText}
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                            {client.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {client.gender} · {client.age}y · {client.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${uConf.bg} ${uConf.text} ${uConf.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${uConf.ring}`}
                        />
                        {uConf.label}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-3">
                      <div className="min-w-[110px]">
                        <p className="text-[11px] font-medium text-gray-700 leading-tight">
                          {client.enrollment.startDate}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                enrollProgress === 100
                                  ? 'bg-[#10B981]'
                                  : 'bg-[#0D9488]'
                              }`}
                              style={{ width: `${enrollProgress}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-gray-400 flex-shrink-0">
                            {enrollProgress}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-3 py-3">
                      {client.connectedApps.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Smartphone className="w-3 h-3" /> In Use
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                          <Smartphone className="w-3 h-3" /> Not Connected
                        </span>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-3 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catColor}`}
                      >
                        {client.category}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${pConf.bg} ${pConf.text} ${pConf.border}`}
                      >
                        {pConf.label}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3">
                      <span
                        className={`text-[12px] font-medium ${
                          checkInWarning
                            ? 'text-red-600'
                            : checkInCaution
                              ? 'text-amber-600'
                              : 'text-gray-700'
                        }`}
                      >
                        {client.lastCheckIn}d ago
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-3">
                      <span className="text-[12px] text-gray-600">
                        {client.assigned}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`flex items-center justify-end gap-0.5 transition-opacity duration-150 ${
                          isHovered ? 'opacity-100' : 'opacity-100 sm:opacity-0'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMessageClick?.(client);
                          }}
                          className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150"
                          title="Message"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClientOpen?.(client);
                          }}
                          className="w-7 h-7 rounded-md hover:bg-emerald-50 flex items-center justify-center transition-colors duration-150"
                          title="View Plan"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="hidden sm:flex w-7 h-7 rounded-md hover:bg-amber-50 items-center justify-center transition-colors duration-150"
                          title="Schedule"
                        >
                          <CalendarClock className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="hidden sm:flex w-7 h-7 rounded-md hover:bg-red-50 items-center justify-center transition-colors duration-150"
                          title="Flag"
                        >
                          <Flag className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
