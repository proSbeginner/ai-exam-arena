export function AppToolbarSkeleton() {
  return (
    <div aria-hidden className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <div className="size-9 rounded-full bg-purple-200/70" />
        <div className="h-4 w-24 rounded-full bg-gray-200" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 rounded-full bg-purple-100" />
        <div className="h-4 w-16 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
