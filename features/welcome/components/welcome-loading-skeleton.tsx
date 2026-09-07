export function WelcomeLoadingSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="กำลังโหลด"
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4"
    >
      <div className="w-full max-w-lg space-y-6 animate-pulse">
        <div className="mx-auto h-48 w-48 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 shadow-xl" />
        <div className="mx-auto h-5 w-36 rounded-full bg-purple-200/70" />
        <div className="mx-auto w-full max-w-md space-y-4 rounded-[2rem] bg-white p-8 shadow-2xl">
          <div className="mx-auto h-7 w-56 rounded-full bg-gray-200" />
          <div className="h-12 rounded-xl bg-purple-100" />
          <div className="h-12 rounded-xl bg-gradient-to-r from-pink-300 to-purple-300" />
        </div>
      </div>
      <p className="sr-only" role="status">กำลังโหลด</p>
    </main>
  );
}
