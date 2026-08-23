import React from 'react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full font-sans pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-[#1A1A1A]';
        let bgClass = 'bg-[#1A1A1A] text-white';
        let iconName = 'info';
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          borderClass = 'border-green-600';
          iconName = 'check_circle';
          iconColor = 'text-green-500';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500';
          iconName = 'warning';
          iconColor = 'text-amber-500';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-600';
          iconName = 'error';
          iconColor = 'text-rose-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border-l-4 ${borderClass} ${bgClass} p-4 rounded-sm shadow-xl flex items-start justify-between gap-3 transform transition-all duration-300 animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-[20px] ${iconColor} shrink-0 mt-0.5`}>
                {iconName}
              </span>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-white">{toast.title}</p>
                {toast.message && <p className="text-[11px] text-gray-300 mt-0.5 font-medium">{toast.message}</p>}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white p-0.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
