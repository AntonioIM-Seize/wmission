import { Skeleton } from '@/components/ui/skeleton';

export default function PrayerListLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </header>

      <Skeleton className="h-44 w-full rounded-2xl" />

      <Skeleton className="h-px w-full" />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="space-y-4 rounded-2xl border border-border/60 p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </article>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
