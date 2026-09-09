import { AppToolbarSkeleton } from '@/features/shared/components/app-toolbar-skeleton';

export function LeaderboardSkeleton() {
  return (
    <main className="relative flex min-h-screen items-center justify-center isolate overflow-hidden bg-slate-50 p-4 pt-20 font-sans sm:p-8">
      <div className="fixed inset-x-0 top-0 z-30 px-4">
        <AppToolbarSkeleton />
      </div>
      <section
        aria-busy="true"
        aria-label="กำลังโหลดอันดับ"
        className="relative z-10 mx-auto w-full max-w-3xl animate-pulse rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
      >
      <div className="space-y-3 text-center">
        <div className="mx-auto h-4 w-28 rounded-full bg-purple-200/70" />
        <div className="mx-auto h-9 w-52 rounded-full bg-gradient-to-r from-pink-200 to-purple-200" />
        <div className="mx-auto h-4 w-48 rounded-full bg-gray-200" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-10 rounded-xl bg-purple-100" />
        ))}
      </div>

      <div className="mt-5 h-11 rounded-xl bg-pink-100" />

      <div className="mt-5 overflow-hidden rounded-2xl border border-purple-100">
        <div className="h-11 bg-purple-100/80" />
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2rem_2.5rem_minmax(0,1fr)_3.5rem_4.5rem] items-center gap-2 border-t border-purple-50 px-2 py-4 sm:grid-cols-[4rem_9rem_1fr_7rem_7rem] sm:px-4"
          >
            <span className="mx-auto h-4 w-5 rounded bg-gray-200" />
            <span className="mx-auto h-9 w-9 rounded-full bg-purple-100" />
            <span className="h-4 w-3/4 rounded bg-gray-200" />
            <span className="ml-auto h-4 w-10 rounded bg-gray-200" />
            <span className="ml-auto h-4 w-14 rounded bg-pink-100" />
          </div>
        ))}
      </div>

      <div className="mx-auto mt-5 flex w-full max-w-md gap-3">
        <div className="h-11 flex-1 rounded-xl bg-purple-100" />
        <div className="h-11 flex-1 rounded-xl bg-pink-100" />
      </div>
      <p className="sr-only" role="status">กำลังโหลดอันดับ</p>
      </section>
    </main>
  );
}
