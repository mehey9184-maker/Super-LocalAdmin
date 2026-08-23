import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-[#1A1A1A] pb-16 md:pb-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-gray-200 rounded-sm" />
          <div className="h-3 w-80 bg-gray-200 rounded-sm" />
        </div>
        <div className="h-7 w-36 bg-gray-200 rounded-sm" />
      </div>

      {/* KPI Cards Grid Skeleton (Auto-fit auto-adjusting desktop grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 md:p-6 border border-gray-200 rounded-sm shadow-2xs space-y-3 flex flex-col justify-between h-[120px]"
          >
            <div className="h-3 w-24 bg-gray-200 rounded-sm" />
            <div className="h-8 w-36 bg-gray-200 rounded-sm" />
            <div className="h-3 w-28 bg-gray-200 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Operational Pillars Skeleton */}
      <div className="bg-white border border-gray-200 shadow-2xs p-5 md:p-6 rounded-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-sm" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-gray-200 rounded-sm" />
              <div className="h-3 w-64 bg-gray-200 rounded-sm" />
            </div>
          </div>
          <div className="h-5 w-28 bg-gray-200 rounded-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-gray-200 rounded-sm" />
                <div className="h-4 w-12 bg-gray-200 rounded-sm" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-sm" />
              <div className="h-3 w-4/5 bg-gray-200 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Feed Widget (Spans 8 cols on desktop) */}
        <div className="xl:col-span-8 bg-white border border-gray-200 shadow-2xs p-4 md:p-6 rounded-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <div className="h-4 w-44 bg-gray-200 rounded-sm" />
              <div className="h-3 w-56 bg-gray-200 rounded-sm" />
            </div>
            <div className="h-7 w-32 bg-gray-200 rounded-sm" />
          </div>

          {/* Histogram bar placeholder */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-sm space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-32 bg-gray-200 rounded-sm" />
              <div className="h-3 w-24 bg-gray-200 rounded-sm" />
            </div>
            <div className="flex items-end gap-1.5 h-[50px] pt-2">
              {[30, 45, 25, 60, 80, 95, 75, 90, 50, 40, 30, 65].map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className="w-full bg-gray-200 rounded-2xs"
                />
              ))}
            </div>
          </div>

          {/* Table rows placeholder */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="h-4 w-16 bg-gray-200 rounded-sm" />
                <div className="h-4 w-28 bg-gray-200 rounded-sm" />
                <div className="h-4 w-24 bg-gray-200 rounded-sm" />
                <div className="h-4 w-16 bg-gray-200 rounded-sm" />
                <div className="h-5 w-20 bg-gray-200 rounded-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Suburb Chart Widget (Spans 4 cols on desktop) */}
        <div className="xl:col-span-4 bg-white border border-gray-200 shadow-2xs p-5 md:p-6 rounded-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5 pb-2 border-b border-gray-100">
              <div className="h-4 w-40 bg-gray-200 rounded-sm" />
              <div className="h-3 w-32 bg-gray-200 rounded-sm" />
            </div>

            <div className="space-y-4 pt-2">
              {[42, 24, 18, 10, 6].map((percentage, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-gray-200 rounded-sm" />
                    <div className="h-3 w-24 bg-gray-200 rounded-sm" />
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-none overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-gray-300 h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-10 w-full bg-gray-200 rounded-sm mt-6" />
        </div>
      </div>
    </div>
  );
};
