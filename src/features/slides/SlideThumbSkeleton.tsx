import { Skeleton } from "@/shared/components/ui/skeleton";

export default function SlideThumbSkeleton() {
  return (
    <li className="relative">
      <div className="group w-full overflow-hidden rounded-xl border border-white/5 bg-white/5 text-left">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag handle skeleton */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <Skeleton className="h-4 w-4 rounded" />
            </div>

            {/* Number skeleton */}
            <div className="flex h-10 w-10 items-center justify-center">
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>

            {/* Content skeleton */}
            <div className="min-w-0 flex-1 pr-6 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-5/6 rounded" />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
