import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton for a single class card on the Dashboard
 */
export function ClassCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full" />
        </div>
    )
}

/**
 * Skeleton for the Dashboard grid of class cards
 */
export function DashboardSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <ClassCardSkeleton key={i} />
            ))}
        </div>
    )
}

/**
 * Skeleton for a table with rows
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div className="rounded-lg border">
            <div className="border-b bg-muted/50 p-4">
                <div className="flex gap-4">
                    {[...Array(columns)].map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
            </div>
            <div className="divide-y">
                {[...Array(rows)].map((_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-4 p-4">
                        {[...Array(columns)].map((_, colIdx) => (
                            <Skeleton key={colIdx} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Skeleton for statistics cards
 */
export function StatsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton for roster table with avatars
 */
export function RosterSkeleton({ rows = 5 }) {
    return (
        <div className="rounded-lg border">
            <div className="border-b bg-muted/50 p-4">
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48 flex-1" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="divide-y">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
        </div>
    )
}
