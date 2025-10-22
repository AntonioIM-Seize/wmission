import { Skeleton } from '@/components/ui/skeleton';

export default function DevotionListLoading() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-6 w-28 max-w-[120px]" />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-28" />
        </div>
      </header>

      <Skeleton className="h-px w-full" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="space-y-3 rounded-3xl border border-border/60 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-md" />
          </article>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
