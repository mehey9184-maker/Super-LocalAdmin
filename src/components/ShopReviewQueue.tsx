import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Store,
} from 'lucide-react';
import {
  AdminApiError,
  adminApi,
  type AdminShop,
  type AdminShopPagination,
  type AdminShopSummary,
  type ApprovalAction,
  type ApprovalStatus,
  type ShopApprovalTransition,
} from '../services/adminApi';
import { ShopReviewDetail, type TransitionResult } from './ShopReviewDetail';

type RequestState = 'idle' | 'loading' | 'ready' | 'error';
type NoticeTone = 'success' | 'warning' | 'error';

const PAGE_LIMIT = 25;

const STATUS_FILTERS: ReadonlyArray<{ value: ApprovalStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  suspended: 'border-slate-300 bg-slate-100 text-slate-800',
};

const NOTICE_TONE_STYLES: Record<NoticeTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-ZA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface Notice {
  tone: NoticeTone;
  message: string;
}

interface ShopReviewQueueProps {
  onAuthorizationFailure: (status: 401 | 403) => void;
}

const formatLabel = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return DATE_FORMATTER.format(date);
};

const displayValue = (value: string | null): string =>
  value === null || value === '' ? 'Not provided' : value;

const getSafeRequestMessage = (error: unknown): string => {
  if (!(error instanceof AdminApiError)) {
    return 'An unexpected error prevented the request. Please try again.';
  }

  if (error.status === null) {
    return 'The LocalEats Admin API could not be reached. Check the connection and try again.';
  }

  switch (error.status) {
    case 400:
      return 'The LocalEats Admin API did not accept this request.';
    case 404:
      return 'Shop not found.';
    case 409:
      return 'This shop changed since you opened it. Refresh before choosing another action.';
    case 422:
      return 'A reason is required for this approval action.';
    default:
      return error.status >= 500
        ? 'The LocalEats Admin API encountered a server error. Please try again.'
        : 'The LocalEats Admin API request failed. Please try again.';
  }
};

const isAllowedTransition = (status: ApprovalStatus, action: ApprovalAction): boolean => {
  switch (status) {
    case 'pending':
      return action === 'approve' || action === 'reject';
    case 'rejected':
      return action === 'approve';
    case 'approved':
      return action === 'suspend';
    case 'suspended':
      return action === 'reinstate';
  }
};

const getTransitionSuccessMessage = (shopName: string, action: ApprovalAction): string => {
  switch (action) {
    case 'approve':
      return `${shopName} was approved.`;
    case 'reject':
      return `${shopName} was rejected.`;
    case 'suspend':
      return `${shopName} was suspended.`;
    case 'reinstate':
      return `${shopName} was reinstated to Approved.`;
  }
};

const NoticeBanner = ({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) => {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-sm border px-4 py-3 text-sm ${NOTICE_TONE_STYLES[notice.tone]}`} role="status">
      <p>{notice.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-xs font-bold uppercase tracking-wider underline underline-offset-2"
      >
        Dismiss
      </button>
    </div>
  );
};

export const ShopReviewQueue = ({ onAuthorizationFailure }: ShopReviewQueueProps) => {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus>('pending');
  const [offset, setOffset] = useState(0);
  const [shops, setShops] = useState<AdminShopSummary[]>([]);
  const [pagination, setPagination] = useState<AdminShopPagination>({
    limit: PAGE_LIMIT,
    offset: 0,
    returned: 0,
  });
  const [listState, setListState] = useState<RequestState>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<AdminShop | null>(null);
  const [detailState, setDetailState] = useState<RequestState>('idle');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [transitionPending, setTransitionPending] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const listRequestSequence = useRef(0);
  const detailRequestSequence = useRef(0);

  const failClosedForAuthorization = useCallback(
    (error: unknown): boolean => {
      if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
        onAuthorizationFailure(error.status);
        return true;
      }

      return false;
    },
    [onAuthorizationFailure],
  );

  const loadList = useCallback(
    async (approvalStatus: ApprovalStatus, pageOffset: number): Promise<void> => {
      const sequence = ++listRequestSequence.current;
      setListState('loading');
      setListError(null);

      try {
        const result = await adminApi.listShops({
          approval_status: approvalStatus,
          limit: PAGE_LIMIT,
          offset: Math.max(0, pageOffset),
        });

        if (listRequestSequence.current !== sequence) return;

        setShops(result.shops);
        setPagination(result.pagination);
        setListState('ready');
      } catch (error) {
        if (listRequestSequence.current !== sequence) return;
        if (failClosedForAuthorization(error)) return;

        setShops([]);
        setPagination({ limit: PAGE_LIMIT, offset: Math.max(0, pageOffset), returned: 0 });
        setListError(getSafeRequestMessage(error));
        setListState('error');
      }
    },
    [failClosedForAuthorization],
  );

  useEffect(() => {
    void loadList(statusFilter, offset);
  }, [loadList, offset, statusFilter]);

  const loadDetail = useCallback(
    async (shopId: string): Promise<void> => {
      const sequence = ++detailRequestSequence.current;
      setSelectedShopId(shopId);
      setSelectedShop(null);
      setDetailState('loading');
      setDetailError(null);
      setTransitionError(null);

      try {
        const shop = await adminApi.getShop(shopId);

        if (detailRequestSequence.current !== sequence) return;

        setSelectedShop(shop);
        setDetailState('ready');
      } catch (error) {
        if (detailRequestSequence.current !== sequence) return;
        if (failClosedForAuthorization(error)) return;

        if (error instanceof AdminApiError && error.status === 404) {
          setSelectedShopId(null);
          setSelectedShop(null);
          setDetailState('idle');
          setNotice({ tone: 'warning', message: 'Shop not found. The current list has been refreshed.' });
          await loadList(statusFilter, offset);
          return;
        }

        setDetailError(getSafeRequestMessage(error));
        setDetailState('error');
      }
    },
    [failClosedForAuthorization, loadList, offset, statusFilter],
  );

  const closeDetail = () => {
    detailRequestSequence.current += 1;
    setSelectedShopId(null);
    setSelectedShop(null);
    setDetailState('idle');
    setDetailError(null);
    setTransitionError(null);
  };

  const handleFilterChange = (nextStatus: ApprovalStatus) => {
    if (nextStatus === statusFilter) return;

    listRequestSequence.current += 1;
    closeDetail();
    setNotice(null);
    setStatusFilter(nextStatus);
    setOffset(0);
  };

  const handleRefresh = async () => {
    setNotice(null);

    if (selectedShopId) {
      await Promise.all([
        loadList(statusFilter, offset),
        loadDetail(selectedShopId),
      ]);
      return;
    }

    await loadList(statusFilter, offset);
  };

  const handleTransition = async (
    action: ApprovalAction,
    reason?: string,
  ): Promise<TransitionResult> => {
    const shop = selectedShop;

    if (!shop || transitionPending) return 'error';

    if (!isAllowedTransition(shop.approval_status, action)) {
      setTransitionError('This action is not valid for the shop’s current approval status.');
      return 'error';
    }

    const reasonRequired = action === 'reject' || action === 'suspend';
    const normalizedReason = reason?.trim() ?? '';

    if (reasonRequired && !normalizedReason) {
      setTransitionError('A reason is required for this approval action.');
      return 'error';
    }

    const transition: ShopApprovalTransition = {
      action,
      expected_status: shop.approval_status,
    };

    if (reasonRequired) {
      transition.reason = normalizedReason;
    }

    setTransitionPending(true);
    setTransitionError(null);

    try {
      const updatedShop = await adminApi.transitionShopApproval(shop.id, transition);
      setSelectedShop(updatedShop);
      setDetailState('ready');
      setNotice({ tone: 'success', message: getTransitionSuccessMessage(updatedShop.name, action) });

      await loadList(statusFilter, offset);

      if (updatedShop.approval_status !== statusFilter) {
        closeDetail();
      }

      return 'success';
    } catch (error) {
      if (failClosedForAuthorization(error)) return 'error';

      if (error instanceof AdminApiError && error.status === 409) {
        setNotice({
          tone: 'warning',
          message: 'This shop changed since you opened it. The latest status has been refreshed.',
        });
        setTransitionError(null);
        await Promise.all([
          loadDetail(shop.id),
          loadList(statusFilter, offset),
        ]);
        return 'conflict';
      }

      if (error instanceof AdminApiError && error.status === 404) {
        setNotice({ tone: 'warning', message: 'Shop not found. The current list has been refreshed.' });
        closeDetail();
        await loadList(statusFilter, offset);
        return 'error';
      }

      setTransitionError(getSafeRequestMessage(error));
      return 'error';
    } finally {
      setTransitionPending(false);
    }
  };

  const canGoPrevious = offset > 0 && listState !== 'loading' && !transitionPending;
  const canGoNext =
    listState !== 'loading' && !transitionPending && pagination.returned === pagination.limit;
  const firstRow = pagination.returned > 0 ? pagination.offset + 1 : 0;
  const lastRow = pagination.offset + pagination.returned;

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A36]">Shop governance</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
            {statusFilter === 'pending' ? 'Pending Review' : `${formatLabel(statusFilter)} shops`}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Review authoritative shop records and perform one deliberate lifecycle transition at a time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={listState === 'loading' || transitionPending}
          className="flex items-center justify-center gap-2 self-start rounded-sm border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-800 transition hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${listState === 'loading' ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      <nav className="mb-6 overflow-x-auto border-b border-gray-200" aria-label="Approval status filters">
        <div className="flex min-w-max gap-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilterChange(filter.value)}
              disabled={transitionPending}
              aria-pressed={statusFilter === filter.value}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
                statusFilter === filter.value
                  ? 'border-[#FF5A36] text-[#FF5A36]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </nav>

      {notice ? (
        <div className="mb-5">
          <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <section className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm" aria-labelledby="shop-list-heading">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 id="shop-list-heading" className="text-sm font-extrabold text-gray-950">
                {formatLabel(statusFilter)} shops
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {pagination.returned > 0
                  ? `Rows ${firstRow}–${lastRow} on this page`
                  : 'No rows on this page'}
              </p>
            </div>
            {listState === 'loading' ? (
              <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-[#FF5A36]" />
            ) : null}
          </div>

          {listState === 'error' ? (
            <div className="p-6" role="alert">
              <AlertTriangle aria-hidden="true" className="h-7 w-7 text-red-700" />
              <h3 className="mt-3 text-base font-extrabold text-gray-950">Shop list unavailable</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{listError}</p>
              <button
                type="button"
                onClick={() => void loadList(statusFilter, offset)}
                className="mt-5 rounded-sm bg-[#FF5A36] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
              >
                Retry
              </button>
            </div>
          ) : null}

          {listState !== 'error' && listState !== 'loading' && shops.length === 0 ? (
            <div className="p-8 text-center">
              <Store aria-hidden="true" className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-3 text-base font-extrabold text-gray-900">
                No {statusFilter} shops on this page
              </h3>
              <p className="mt-1 text-sm text-gray-500">Use Refresh to request the latest API data.</p>
            </div>
          ) : null}

          {shops.length > 0 ? (
            <ul className="divide-y divide-gray-100" aria-busy={listState === 'loading'}>
              {shops.map((shop) => (
                <li key={shop.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(shop.id)}
                    disabled={transitionPending || listState === 'loading'}
                    className={`w-full p-4 text-left transition hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedShopId === shop.id ? 'bg-orange-50 ring-1 ring-inset ring-[#FF5A36]/30' : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-3">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-sm border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-400">
                          <ImageIcon aria-hidden="true" className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="break-words text-sm font-extrabold text-gray-950">{shop.name}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[shop.approval_status]}`}>
                            Approval: {formatLabel(shop.approval_status)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">{displayValue(shop.category)}</p>
                        <p className="mt-1 break-words text-xs text-gray-500">{displayValue(shop.location)}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
                          <span>{displayValue(shop.phone)}</span>
                          <span>Operations: {shop.is_active ? 'Open' : 'Inactive'}</span>
                          <span>Created {formatDate(shop.created_at)}</span>
                        </div>
                        {shop.approval_reason ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-amber-800">
                            Reason: {shop.approval_reason}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                closeDetail();
                setOffset((current) => Math.max(0, current - PAGE_LIMIT));
              }}
              disabled={!canGoPrevious}
              className="flex items-center gap-1 rounded-sm border border-gray-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              Previous
            </button>
            <span className="text-xs font-medium text-gray-500">Offset {offset}</span>
            <button
              type="button"
              onClick={() => {
                closeDetail();
                setOffset((current) => current + PAGE_LIMIT);
              }}
              disabled={!canGoNext}
              className="flex items-center gap-1 rounded-sm border border-gray-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </section>

        <ShopReviewDetail
          shop={selectedShop}
          loading={detailState === 'loading'}
          errorMessage={detailError}
          transitionPending={transitionPending}
          transitionError={transitionError}
          onClose={closeDetail}
          onRetry={() => {
            if (selectedShopId) {
              void loadDetail(selectedShopId);
            }
          }}
          onClearTransitionError={() => setTransitionError(null)}
          onTransition={handleTransition}
        />
      </div>
    </main>
  );
};
