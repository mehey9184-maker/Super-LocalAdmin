import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bike, ChevronLeft, ChevronRight, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import {
  AdminApiError,
  adminApi,
  type AdminRider,
  type AdminShopPagination,
  type RiderVerificationStatus,
} from '../services/adminApi';

type RequestState = 'idle' | 'loading' | 'ready' | 'error';

const PAGE_LIMIT = 25;
const STATUS_FILTERS: readonly RiderVerificationStatus[] = [
  'pending', 'approved', 'rejected', 'suspended',
];
const STATUS_STYLES: Record<RiderVerificationStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  suspended: 'border-red-300 bg-red-50 text-red-900',
};
const ALLOWED_TARGETS: Record<RiderVerificationStatus, readonly RiderVerificationStatus[]> = {
  pending: ['approved', 'rejected'],
  approved: [],
  rejected: ['pending', 'approved'],
  suspended: ['approved', 'pending'],
};

const label = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
const display = (value: string | null): string => value?.trim() || 'Not provided';

const safeErrorMessage = (error: unknown): string => {
  if (!(error instanceof AdminApiError)) return 'An unexpected error occurred. Please try again.';
  if (error.code === 'RIDER_DEMOTION_REQUIRES_ATOMIC_GUARD') {
    return 'Approved Rider demotion is locked until active-delivery safety is atomic. No change was made.';
  }
  if (error.status === 409) return 'Rider state changed. Refresh and try again.';
  if (error.status === 404) return 'Rider not found. Refresh the list and try again.';
  if (error.status === null) return 'The LocalEats Admin API could not be reached. Check the connection and try again.';
  if (error.status >= 500) return 'The LocalEats Admin API encountered a server error. Please try again.';
  return 'The LocalEats Admin API request failed. Please try again.';
};

interface RiderReviewQueueProps {
  onAuthorizationFailure: (status: 401 | 403) => void;
}

export const RiderReviewQueue = ({ onAuthorizationFailure }: RiderReviewQueueProps) => {
  const [statusFilter, setStatusFilter] = useState<RiderVerificationStatus>('pending');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [pagination, setPagination] = useState<AdminShopPagination>({ limit: PAGE_LIMIT, offset: 0, returned: 0 });
  const [listState, setListState] = useState<RequestState>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [selectedRider, setSelectedRider] = useState<AdminRider | null>(null);
  const [detailState, setDetailState] = useState<RequestState>('idle');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<RiderVerificationStatus | null>(null);
  const [transitionPending, setTransitionPending] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const listSequence = useRef(0);
  const detailSequence = useRef(0);

  const handleAuthorizationFailure = useCallback((error: unknown): boolean => {
    if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
      onAuthorizationFailure(error.status);
      return true;
    }
    return false;
  }, [onAuthorizationFailure]);

  const loadList = useCallback(async (filter: RiderVerificationStatus, pageOffset: number): Promise<void> => {
    const sequence = ++listSequence.current;
    setListState('loading');
    setListError(null);
    try {
      const result = await adminApi.listRiders({ verification_status: filter, limit: PAGE_LIMIT, offset: pageOffset });
      if (sequence !== listSequence.current) return;
      setRiders(result.riders);
      setPagination(result.pagination);
      setListState('ready');
    } catch (error) {
      if (sequence !== listSequence.current || handleAuthorizationFailure(error)) return;
      setRiders([]);
      setPagination({ limit: PAGE_LIMIT, offset: pageOffset, returned: 0 });
      setListError(safeErrorMessage(error));
      setListState('error');
    }
  }, [handleAuthorizationFailure]);

  useEffect(() => {
    void loadList(statusFilter, offset);
    return () => { listSequence.current += 1; };
  }, [loadList, offset, statusFilter]);

  const loadDetail = useCallback(async (riderId: string): Promise<void> => {
    const sequence = ++detailSequence.current;
    setSelectedRiderId(riderId);
    setSelectedRider(null);
    setDetailState('loading');
    setDetailError(null);
    setTransitionError(null);
    setTargetStatus(null);
    setSuccessMessage(null);
    try {
      const rider = await adminApi.getRider(riderId);
      if (sequence !== detailSequence.current) return;
      setSelectedRider(rider);
      setDetailState('ready');
    } catch (error) {
      if (sequence !== detailSequence.current || handleAuthorizationFailure(error)) return;
      setDetailError(safeErrorMessage(error));
      setDetailState('error');
    }
  }, [handleAuthorizationFailure]);

  const closeDetail = () => {
    detailSequence.current += 1;
    setSelectedRiderId(null);
    setSelectedRider(null);
    setDetailState('idle');
    setDetailError(null);
    setTransitionError(null);
    setTargetStatus(null);
  };

  const changeFilter = (filter: RiderVerificationStatus) => {
    if (filter === statusFilter) return;
    listSequence.current += 1;
    closeDetail();
    setSuccessMessage(null);
    setSearch('');
    setStatusFilter(filter);
    setOffset(0);
  };

  const refresh = async () => {
    setSuccessMessage(null);
    await Promise.all([
      loadList(statusFilter, offset),
      selectedRiderId ? loadDetail(selectedRiderId) : Promise.resolve(),
    ]);
  };

  const confirmTransition = async () => {
    const rider = selectedRider;
    const target = targetStatus;
    if (!rider || !target || transitionPending) return;
    if (!ALLOWED_TARGETS[rider.verification_status].includes(target)) {
      setTargetStatus(null);
      setTransitionError('This action is not available for the Rider’s current verification state.');
      return;
    }

    setTransitionPending(true);
    setTransitionError(null);
    try {
      const updated = await adminApi.updateRiderVerification(rider.id, target);
      if (updated.id !== rider.id || updated.verification_status !== target) {
        throw new AdminApiError('The Rider update response did not match the requested action.', null);
      }
      setSelectedRider(updated);
      setTargetStatus(null);
      setSuccessMessage(`${display(updated.full_name)} is now ${label(updated.verification_status)}.`);
      if (updated.verification_status !== statusFilter) {
        setRiders((current) => current.filter((item) => item.id !== updated.id));
      }
      await loadList(statusFilter, offset);
    } catch (error) {
      if (handleAuthorizationFailure(error)) return;
      setTransitionError(safeErrorMessage(error));
      setTargetStatus(null);
    } finally {
      setTransitionPending(false);
    }
  };

  const canGoPrevious = offset > 0 && listState !== 'loading' && !transitionPending;
  const canGoNext = listState === 'ready' && !transitionPending && pagination.returned === pagination.limit;
  const searchTerm = search.trim().toLowerCase();
  const visibleRiders = searchTerm
    ? riders.filter((rider) => [rider.full_name, rider.phone, rider.id, rider.vehicle_type]
        .some((value) => value?.toLowerCase().includes(searchTerm)))
    : riders;
  const onlineOnPage = riders.filter((rider) => rider.is_online).length;

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A36]">Rider governance</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">{label(statusFilter)} Riders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Review Rider profiles and confirm each verification decision through the LocalEats API.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={listState === 'loading' || transitionPending}
          className="flex items-center gap-2 self-start rounded-sm border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-800 disabled:opacity-50 md:self-auto">
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${listState === 'loading' ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <section className="mb-6 grid grid-cols-3 gap-2 sm:gap-4" aria-label="Riders on the loaded page">
        {[
          { label: 'Loaded on this page', value: riders.length },
          { label: 'Online on this page', value: onlineOnPage },
          { label: 'Offline on this page', value: riders.length - onlineOnPage },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xl font-extrabold text-gray-950 sm:text-2xl">{listState === 'ready' ? item.value : '—'}</p>
            <p className="mt-1 text-xs font-medium leading-4 text-gray-600">{item.label}</p>
          </div>
        ))}
      </section>

      <nav className="mb-6 overflow-x-auto border-b border-gray-200" aria-label="Rider verification status filters">
        <div className="flex min-w-max gap-1">
          {STATUS_FILTERS.map((filter) => (
            <button key={filter} type="button" onClick={() => changeFilter(filter)} disabled={transitionPending}
              aria-pressed={statusFilter === filter}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 ${statusFilter === filter ? 'border-[#FF5A36] text-[#FF5A36]' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'}`}>
              {label(filter)}{statusFilter === filter && listState === 'ready' ? <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[11px]">{pagination.returned} on page</span> : null}
            </button>
          ))}
        </div>
      </nav>

      {successMessage ? <p className="mb-5 rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{successMessage}</p> : null}

      <p className="mb-4 text-xs text-gray-600">Counts and search cover only the currently loaded page, not every Rider in the system.</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm" aria-labelledby="rider-list-heading">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 id="rider-list-heading" className="text-sm font-extrabold text-gray-950">{label(statusFilter)} Riders</h2>
              <p className="mt-1 text-xs text-gray-500">{pagination.returned ? `Rows ${pagination.offset + 1}–${pagination.offset + pagination.returned}` : 'No rows on this page'}</p>
            </div>
            {listState === 'loading' ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-[#FF5A36]" /> : null}
          </div>
          <div className="border-b border-gray-100 px-4 py-3">
            <label htmlFor="rider-page-search" className="mb-2 block text-xs font-bold text-gray-700">Find on this page</label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input id="rider-page-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, phone, Rider ID or vehicle" className="min-h-11 w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-950 placeholder:text-gray-500 focus:border-[#FF5A36] focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>
          {listState === 'loading' ? <p className="flex items-center gap-2 p-6 text-sm text-gray-600" role="status"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-[#FF5A36]" /> Loading {label(statusFilter).toLowerCase()} Riders…</p> : null}
          {listState === 'error' ? (
            <div className="p-6" role="alert">
              <AlertTriangle aria-hidden="true" className="h-7 w-7 text-red-700" />
              <h3 className="mt-3 font-extrabold text-gray-950">Rider list unavailable</h3>
              <p className="mt-2 text-sm text-gray-600">{listError}</p>
              <button type="button" onClick={() => void loadList(statusFilter, offset)} className="mt-5 min-h-11 rounded-md bg-[#FF5A36] px-4 py-2 text-sm font-bold text-white">Retry loading</button>
            </div>
          ) : null}
          {listState === 'ready' && riders.length === 0 ? (
            <div className="p-8 text-center">
              <Bike aria-hidden="true" className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-3 font-extrabold text-gray-900">No {statusFilter} Riders on this page</h3>
              <p className="mt-1 text-sm text-gray-600">This page has no matching profiles. Check another status or refresh the list.</p>
            </div>
          ) : null}
          {listState === 'ready' && riders.length > 0 && visibleRiders.length === 0 ? (
            <p className="p-6 text-sm text-gray-600">No Riders on this page match “{search}”. Try another term or page.</p>
          ) : null}
          {listState === 'ready' && riders.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {visibleRiders.map((rider) => (
                <li key={rider.id}>
                  <button type="button" onClick={() => void loadDetail(rider.id)} disabled={transitionPending}
                    aria-pressed={selectedRiderId === rider.id}
                    className={`min-h-24 w-full p-4 text-left hover:bg-orange-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF5A36] disabled:opacity-50 ${selectedRiderId === rider.id ? 'bg-orange-50 ring-1 ring-inset ring-[#FF5A36]/30' : 'bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="font-extrabold text-gray-950">{display(rider.full_name)}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[rider.verification_status]}`}>{label(rider.verification_status)}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">{display(rider.phone)} · {display(rider.vehicle_type)}</p>
                    <p className="mt-2 text-xs font-medium text-gray-600">{rider.is_online ? 'Online' : 'Offline'} · Work status: {rider.status}</p>
                    <p className="mt-1 break-all text-xs text-gray-500">Rider ID: {rider.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
            <button type="button" disabled={!canGoPrevious} onClick={() => { closeDetail(); setSearch(''); setOffset((current) => Math.max(0, current - PAGE_LIMIT)); }}
              className="flex items-center gap-1 rounded-sm border border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-800 disabled:opacity-40"><ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous</button>
            <span className="text-xs text-gray-600">Page {Math.floor(offset / PAGE_LIMIT) + 1}</span>
            <button type="button" disabled={!canGoNext} onClick={() => { closeDetail(); setSearch(''); setOffset((current) => current + PAGE_LIMIT); }}
              className="flex items-center gap-1 rounded-sm border border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-800 disabled:opacity-40">Next <ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </section>

        <section className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm" aria-labelledby="rider-detail-heading">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <h2 id="rider-detail-heading" className="text-sm font-extrabold text-gray-950">Rider detail</h2>
            {selectedRiderId ? <button type="button" onClick={closeDetail} disabled={transitionPending} className="text-xs font-bold uppercase text-gray-600 underline disabled:opacity-50">Close</button> : null}
          </div>
          {!selectedRiderId ? <p className="py-8 text-sm text-gray-600">Select a Rider from the list to review their profile and available actions.</p> : null}
          {detailState === 'loading' ? <p className="flex items-center gap-2 py-8 text-sm text-gray-500"><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> Loading Rider…</p> : null}
          {detailState === 'error' ? (
            <div className="py-6" role="alert">
              <p className="text-sm text-red-800">{detailError}</p>
              <button type="button" onClick={() => { if (selectedRiderId) void loadDetail(selectedRiderId); }} className="mt-3 text-xs font-bold uppercase text-[#FF5A36] underline">Retry Rider detail</button>
            </div>
          ) : null}
          {detailState === 'ready' && selectedRider ? (
            <div className="space-y-5 pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-950">{display(selectedRider.full_name)}</h3>
                  <p className="mt-1 break-all text-xs text-gray-500">Rider ID: {selectedRider.id}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[selectedRider.verification_status]}`}>{label(selectedRider.verification_status)}</span>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs font-bold uppercase text-gray-500">Phone</dt><dd className="mt-1 text-gray-900">{display(selectedRider.phone)}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-500">Vehicle</dt><dd className="mt-1 text-gray-900">{display(selectedRider.vehicle_type)}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-500">Verification</dt><dd className="mt-1 text-gray-900">{label(selectedRider.verification_status)}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-500">Work status</dt><dd className="mt-1 text-gray-900">{selectedRider.status} · {selectedRider.is_online ? 'Online' : 'Offline'}</dd></div>
              </dl>
              {selectedRider.verification_status === 'approved' ? (
                <p className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Approved Rider demotion is temporarily locked until active-delivery safety is atomic.</p>
              ) : (
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Verification actions</p>
                  <div className="flex flex-wrap gap-2">
                    {ALLOWED_TARGETS[selectedRider.verification_status].map((target) => (
                      <button key={target} type="button" disabled={transitionPending} onClick={() => { setTransitionError(null); setTargetStatus(target); }}
                        className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm font-bold text-gray-800 hover:border-[#FF5A36] disabled:opacity-50">{target === 'pending' ? 'Move to pending' : label(target)}</button>
                    ))}
                  </div>
                </div>
              )}
              {transitionError ? <p className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">{transitionError}</p> : null}
            </div>
          ) : null}
        </section>
      </div>

      {targetStatus && selectedRider ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="rider-confirm-heading" className="w-full max-w-md rounded-sm bg-white p-6 shadow-xl">
            <h2 id="rider-confirm-heading" className="text-lg font-extrabold text-gray-950">Confirm Rider verification</h2>
            <p className="mt-3 text-sm leading-6 text-gray-700">Move {display(selectedRider.full_name)} from {label(selectedRider.verification_status)} to {label(targetStatus)}?</p>
            <p className="mt-2 text-sm text-gray-600">This decision is sent to the LocalEats API. The Rider’s status changes only after the API confirms it.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" autoFocus disabled={transitionPending} onClick={() => setTargetStatus(null)} className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm font-bold text-gray-800 disabled:opacity-50">Keep current status</button>
              <button type="button" disabled={transitionPending} onClick={() => void confirmTransition()} className="min-h-11 rounded-md bg-[#FF5A36] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{transitionPending ? 'Updating…' : `Confirm ${label(targetStatus)}`}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
