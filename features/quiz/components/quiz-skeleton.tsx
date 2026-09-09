import { AppToolbarSkeleton } from '@/features/shared/components/app-toolbar-skeleton';

export function QuizSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="กำลังโหลดข้อสอบ"
      className="relative flex min-h-screen touch-pan-y flex-col items-center overflow-x-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans"
    >
      <div className="fixed inset-x-0 top-0 z-30 px-4">
        <AppToolbarSkeleton />
      </div>
      <div className="relative z-10 flex w-full max-w-lg flex-col gap-6 pb-24 pt-16 animate-pulse">
        <div className="relative flex h-48 w-full items-center">
          <div className="h-10 w-36 rounded-xl bg-white/70" />
        </div>

        <div className="relative w-full">
          <div className="h-2 w-full rounded-full bg-purple-200" />
        </div>

        <div className="w-full space-y-4 rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="h-7 w-20 rounded-full bg-blue-100" />
            <div className="h-4 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-full rounded-full bg-gray-200" />
            <div className="h-5 w-4/5 rounded-full bg-gray-200" />
          </div>
          <div className="h-20 rounded-xl bg-purple-100" />
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-14 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>

        <div className="flex w-full gap-4">
          <div className="h-12 flex-1 rounded-xl bg-gray-200" />
          <div className="h-12 flex-1 rounded-xl bg-gradient-to-r from-pink-200 to-purple-200" />
        </div>
        <div className="mx-auto h-4 w-28 rounded-full bg-purple-200/70" />
      </div>
      <p className="sr-only" role="status">กำลังโหลดข้อสอบ</p>
    </main>
  );
}
