import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bike,
  ClipboardCheck,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Siren,
  Store,
  WalletCards,
} from 'lucide-react';
import type { AdminIdentity } from '../services/adminApi';
import { BrandLogo } from './BrandLogo';
import { ShopReviewQueue } from './ShopReviewQueue';

interface ControlCenterShellProps {
  admin: AdminIdentity;
  signOutPending: boolean;
  onSignOut: () => Promise<void>;
  onAuthorizationFailure: (status: 401 | 403) => void;
}

interface ControlCenterModule {
  label: string;
  icon: LucideIcon;
  enabled: boolean;
}

const CONTROL_CENTER_MODULES: readonly ControlCenterModule[] = [
  { label: 'Overview', icon: LayoutDashboard, enabled: false },
  { label: 'Shop Review', icon: ClipboardCheck, enabled: true },
  { label: 'Merchants', icon: Store, enabled: false },
  { label: 'Orders', icon: ShoppingBag, enabled: false },
  { label: 'Riders', icon: Bike, enabled: false },
  { label: 'Finance', icon: WalletCards, enabled: false },
  { label: 'Incidents', icon: Siren, enabled: false },
  { label: 'System Health', icon: Activity, enabled: false },
  { label: 'Settings', icon: Settings, enabled: false },
];

const ModuleButton = ({ module, compact = false }: { module: ControlCenterModule; compact?: boolean }) => {
  const Icon = module.icon;

  return (
    <button
      type="button"
      disabled={!module.enabled}
      aria-current={module.enabled ? 'page' : undefined}
      title={module.enabled ? module.label : `${module.label}: backend not enabled`}
      className={`group flex shrink-0 items-center gap-3 rounded-md border text-left transition ${
        compact ? 'min-h-11 px-3 py-2' : 'w-full px-3 py-2.5'
      } ${
        module.enabled
          ? 'border-orange-200 bg-orange-50 text-orange-950 shadow-sm'
          : 'cursor-not-allowed border-transparent text-slate-400'
      }`}
    >
      <Icon
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 ${module.enabled ? 'text-[#FF5A36]' : 'text-slate-400'}`}
      />
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.08em]">{module.label}</span>
        {!module.enabled && !compact ? (
          <span className="mt-0.5 block text-[10px] font-medium text-slate-400">Backend not enabled</span>
        ) : null}
      </span>
      {!module.enabled && !compact ? (
        <LockKeyhole aria-label="Backend not enabled" className="ml-auto h-3.5 w-3.5 shrink-0" />
      ) : null}
    </button>
  );
};

export const ControlCenterShell = ({
  admin,
  signOutPending,
  onSignOut,
  onAuthorizationFailure,
}: ControlCenterShellProps) => (
  <div className="min-h-screen bg-slate-50 text-slate-950">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-white lg:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <BrandLogo variant="full" size={174} textColor="#FFFFFF" />
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300">
          Control Center
        </p>
      </div>

      <div className="mx-4 mt-4 flex items-center gap-3 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-3">
        <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-300" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-emerald-100">Secure session</p>
          <p className="mt-0.5 text-[10px] text-emerald-200/70">Authorized by LocalEats API</p>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-4 pb-5" aria-label="Control Center modules">
        {CONTROL_CENTER_MODULES.map((module) => (
          <div key={module.label}>
            <ModuleButton module={module} />
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 min-w-0 px-2">
          <p className="truncate text-xs font-bold text-white">{admin.email ?? 'Authenticated admin'}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">
            {admin.role.replace('_', ' ')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          disabled={signOutPending}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-white/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          {signOutPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>

    <div className="min-w-0 lg:pl-72">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <BrandLogo variant="full" size={142} />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Control Center / Shop Review
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">Merchant approval operations</p>
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-52 truncate text-xs font-bold text-slate-900">
                {admin.email ?? 'Authenticated admin'}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {admin.role.replace('_', ' ')} · secure
              </p>
            </div>
            <button
              type="button"
              onClick={() => void onSignOut()}
              disabled={signOutPending}
              aria-label={signOutPending ? 'Signing out' : 'Sign out'}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-bold uppercase tracking-wider text-slate-800 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">{signOutPending ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </div>
        </div>

        <nav className="overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden" aria-label="Control Center modules">
          <div className="flex min-w-max gap-2">
            {CONTROL_CENTER_MODULES.map((module) => (
              <div key={module.label}>
                <ModuleButton module={module} compact />
              </div>
            ))}
          </div>
        </nav>
      </header>

      <ShopReviewQueue onAuthorizationFailure={onAuthorizationFailure} />
    </div>
  </div>
);
