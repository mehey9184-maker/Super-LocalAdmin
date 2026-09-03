import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Check,
  Clock3,
  ImageIcon,
  LoaderCircle,
  RotateCcw,
  ShieldX,
  X,
} from 'lucide-react';
import type { AdminShop, ApprovalAction, ApprovalStatus } from '../services/adminApi';

export type TransitionResult = 'success' | 'conflict' | 'error';

interface ShopReviewDetailProps {
  shop: AdminShop | null;
  loading: boolean;
  errorMessage: string | null;
  transitionPending: boolean;
  transitionError: string | null;
  onClose: () => void;
  onRetry: () => void;
  onClearTransitionError: () => void;
  onTransition: (action: ApprovalAction, reason?: string) => Promise<TransitionResult>;
}

interface ActionDefinition {
  label: string;
  title: string;
  description: string;
  submitLabel: string;
  reasonLabel?: string;
  tone: 'primary' | 'danger';
}

const ACTION_DEFINITIONS: Record<ApprovalAction, ActionDefinition> = {
  approve: {
    label: 'Approve',
    title: 'Approve this shop?',
    description:
      'Approval permits the shop to enter the approved lifecycle state. It does not open the shop for operations.',
    submitLabel: 'Confirm approval',
    tone: 'primary',
  },
  reject: {
    label: 'Reject',
    title: 'Reject this shop?',
    description: 'The reason will be recorded with the authoritative approval transition.',
    submitLabel: 'Confirm rejection',
    reasonLabel: 'Rejection reason',
    tone: 'danger',
  },
  suspend: {
    label: 'Suspend',
    title: 'Suspend this shop?',
    description: 'Suspension makes the shop operationally inactive. The database owns that change.',
    submitLabel: 'Confirm suspension',
    reasonLabel: 'Suspension reason',
    tone: 'danger',
  },
  reinstate: {
    label: 'Reinstate',
    title: 'Reinstate this shop?',
    description:
      'Reinstatement returns approval to Approved. It does not automatically open the shop for operations.',
    submitLabel: 'Confirm reinstatement',
    tone: 'primary',
  },
};

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  suspended: 'border-slate-300 bg-slate-100 text-slate-800',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-ZA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatLabel = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return DATE_FORMATTER.format(date);
};

const displayValue = (value: string | number | null): string => {
  if (value === null || value === '') return 'Not provided';
  return String(value);
};

const getAvailableActions = (status: ApprovalStatus): ApprovalAction[] => {
  switch (status) {
    case 'pending':
      return ['approve', 'reject'];
    case 'rejected':
      return ['approve'];
    case 'approved':
      return ['suspend'];
    case 'suspended':
      return ['reinstate'];
  }
};

const DetailField = ({ label, value }: { label: string; value: string | number | null }) => (
  <div>
    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</dt>
    <dd className="mt-1 break-words text-sm leading-6 text-gray-900">{displayValue(value)}</dd>
  </div>
);

interface ConfirmationDialogProps {
  action: ApprovalAction;
  shopName: string;
  pending: boolean;
  serverError: string | null;
  onCancel: () => void;
  onConfirm: (reason?: string) => Promise<TransitionResult>;
}

const ConfirmationDialog = ({
  action,
  shopName,
  pending,
  serverError,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) => {
  const definition = ACTION_DEFINITIONS[action];
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedReason = reason.trim();

    if (definition.reasonLabel && !normalizedReason) {
      setValidationError(`${definition.reasonLabel} is required.`);
      return;
    }

    setValidationError(null);
    const result = await onConfirm(definition.reasonLabel ? normalizedReason : undefined);

    if (result === 'success' || result === 'conflict') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transition-dialog-title"
        className="w-full max-w-lg rounded-sm border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A36]">
              Approval lifecycle
            </p>
            <h2 id="transition-dialog-title" className="mt-2 text-xl font-extrabold text-gray-950">
              {definition.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            aria-label="Close confirmation"
            className="rounded-sm p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm font-semibold text-gray-900">{shopName}</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">{definition.description}</p>

        <form className="mt-5" onSubmit={handleSubmit}>
          {definition.reasonLabel ? (
            <div>
              <label
                htmlFor="approval-reason"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                {definition.reasonLabel}
              </label>
              <textarea
                id="approval-reason"
                rows={4}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setValidationError(null);
                }}
                disabled={pending}
                autoFocus
                className="w-full resize-y rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 disabled:bg-gray-100"
                placeholder="Enter a clear reason"
              />
            </div>
          ) : null}

          {validationError || serverError ? (
            <p className="mt-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {validationError ?? serverError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-sm border border-gray-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-800 transition hover:border-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className={`flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                definition.tone === 'danger'
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-[#FF5A36] hover:bg-[#e04a29]'
              }`}
            >
              {pending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              {pending ? 'Submitting…' : definition.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export const ShopReviewDetail = ({
  shop,
  loading,
  errorMessage,
  transitionPending,
  transitionError,
  onClose,
  onRetry,
  onClearTransitionError,
  onTransition,
}: ShopReviewDetailProps) => {
  const [activeAction, setActiveAction] = useState<ApprovalAction | null>(null);

  useEffect(() => {
    setActiveAction(null);
  }, [shop?.id, shop?.approval_status]);

  if (loading) {
    return (
      <section className="flex min-h-80 items-center justify-center rounded-sm border border-gray-200 bg-white p-8">
        <div className="text-center" role="status">
          <LoaderCircle aria-hidden="true" className="mx-auto h-7 w-7 animate-spin text-[#FF5A36]" />
          <p className="mt-3 text-sm font-semibold text-gray-600">Loading authoritative shop details…</p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-sm border border-red-200 bg-white p-6" role="alert">
        <AlertTriangle aria-hidden="true" className="h-7 w-7 text-red-700" />
        <h2 className="mt-3 text-lg font-extrabold text-gray-950">Shop details unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{errorMessage}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-sm bg-[#FF5A36] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-gray-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-800"
          >
            Close
          </button>
        </div>
      </section>
    );
  }

  if (!shop) {
    return (
      <section className="flex min-h-80 items-center justify-center rounded-sm border border-dashed border-gray-300 bg-white p-8 text-center">
        <div>
          <Clock3 aria-hidden="true" className="mx-auto h-8 w-8 text-gray-400" />
          <h2 className="mt-3 text-base font-extrabold text-gray-900">Select a shop to review</h2>
          <p className="mt-1 text-sm text-gray-500">Details and valid lifecycle actions will appear here.</p>
        </div>
      </section>
    );
  }

  const availableActions = getAvailableActions(shop.approval_status);

  return (
    <section className="rounded-sm border border-gray-200 bg-white shadow-sm" aria-labelledby="shop-detail-title">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 sm:p-6">
        <div className="flex min-w-0 gap-4">
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={`${shop.name} logo`}
              className="h-16 w-16 shrink-0 rounded-sm border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-400">
              <ImageIcon aria-hidden="true" className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <h2 id="shop-detail-title" className="break-words text-xl font-extrabold text-gray-950">
              {shop.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{displayValue(shop.category)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[shop.approval_status]}`}>
                Approval: {formatLabel(shop.approval_status)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  shop.is_active
                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                    : 'border-gray-300 bg-gray-100 text-gray-700'
                }`}
              >
                Operations: {shop.is_active ? 'Open' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shop details"
          className="rounded-sm p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-7 p-5 sm:p-6">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-700">Review details</h3>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            <DetailField label="Owner ID" value={shop.owner_id} />
            <DetailField label="Phone" value={shop.phone} />
            <DetailField label="Location" value={shop.location} />
            <DetailField label="Created" value={formatDate(shop.created_at)} />
            <DetailField label="Latitude" value={shop.latitude} />
            <DetailField label="Longitude" value={shop.longitude} />
            <DetailField label="Opening time" value={shop.opening_time} />
            <DetailField label="Closing time" value={shop.closing_time} />
          </dl>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-700">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {displayValue(shop.description)}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-700">Story</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{displayValue(shop.story)}</p>
        </div>

        <div
          className={`rounded-sm border p-4 ${
            shop.approval_reason
              ? 'border-amber-200 bg-amber-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <h3
            className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
              shop.approval_reason ? 'text-amber-900' : 'text-gray-700'
            }`}
          >
            Approval reason
          </h3>
          <p
            className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
              shop.approval_reason ? 'text-amber-900' : 'text-gray-600'
            }`}
          >
            {displayValue(shop.approval_reason)}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-700">Available action</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Only transitions valid from {formatLabel(shop.approval_status)} are available.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {availableActions.map((action) => {
              const definition = ACTION_DEFINITIONS[action];
              const Icon = action === 'approve' ? Check : action === 'reinstate' ? RotateCcw : ShieldX;

              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    onClearTransitionError();
                    setActiveAction(action);
                  }}
                  disabled={transitionPending}
                  className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    definition.tone === 'danger'
                      ? 'bg-red-700 hover:bg-red-800'
                      : 'bg-[#FF5A36] hover:bg-[#e04a29]'
                  }`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {definition.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeAction ? (
        <ConfirmationDialog
          action={activeAction}
          shopName={shop.name}
          pending={transitionPending}
          serverError={transitionError}
          onCancel={() => {
            if (!transitionPending) {
              setActiveAction(null);
              onClearTransitionError();
            }
          }}
          onConfirm={(reason) => onTransition(activeAction, reason)}
        />
      ) : null}
    </section>
  );
};
