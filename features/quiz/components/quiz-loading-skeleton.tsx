import { AppToolbarSkeleton } from '@/features/shared/components/app-toolbar-skeleton';

export function QuizLoadingSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="กำลังโหลด"
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4"
    >
      <div className="w-full max-w-lg space-y-6 animate-pulse">
        <AppToolbarSkeleton />
        <div className="mx-auto h-48 w-48 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 shadow-xl" />
        <div className="mx-auto h-5 w-36 rounded-full bg-purple-200/70" />
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-xl">
          <div className="h-4 w-24 rounded-full bg-blue-100" />
          <div className="h-5 w-full rounded-full bg-gray-200" />
          <div className="h-5 w-4/5 rounded-full bg-gray-200" />
          <div className="h-16 rounded-2xl bg-purple-100" />
          <div className="h-16 rounded-2xl bg-gray-100" />
        </div>
      </div>
      <p className="sr-only" role="status">กำลังโหลด</p>
    </main>
  );
}
