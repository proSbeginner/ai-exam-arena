import { AppToolbarSkeleton } from '@/features/shared/components/app-toolbar-skeleton';

export function QuizSetupSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="กำลังโหลดการตั้งค่าข้อสอบ"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pt-16"
    >
      <div className="fixed inset-x-0 top-0 z-30 px-4">
        <AppToolbarSkeleton />
      </div>
      <section className="w-full max-w-lg animate-pulse space-y-6 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-purple-200/70" />
          <div className="h-9 w-64 rounded-full bg-gray-200" />
          <div className="h-4 w-56 rounded-full bg-gray-200" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-purple-100" />
          ))}
        </div>
        <div className="h-12 rounded-xl bg-purple-100" />
        <div className="h-14 rounded-xl bg-gradient-to-r from-pink-200 to-purple-200" />
      </section>
      <p className="sr-only" role="status">กำลังโหลดการตั้งค่าข้อสอบ</p>
    </main>
  );
}
