export function LeaderboardLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="กำลังโหลดอันดับ" className="animate-pulse">
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
      <p className="sr-only" role="status">กำลังโหลดอันดับ</p>
    </div>
  );
}
