import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton for a single class card on the Dashboard
 */
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
 * High-fidelity Skeleton for Announcements
 */
export function AnnouncementSkeleton() {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32" /> {/* Author Name */}
                            <Skeleton className="h-3 w-24" /> {/* Date */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 pt-0 space-y-2">
                <Skeleton className="h-5 w-3/4" /> {/* Title */}
                <div className="space-y-1 pt-2">
                    <Skeleton className="h-4 w-full" /> {/* Content lines */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
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
/**
 * Generic Table Skeleton (fallback)
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
 * High-fidelity Skeleton for Attendance Table
 * Matches columns: Date, Code, Status, Attendance, Rate, Action
 */
export function AttendanceSkeleton() {
    return (
        <div className="rounded-lg border">
            <div className="border-b bg-muted/50 p-4">
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" /> {/* Date Header */}
                    <Skeleton className="h-4 w-16" /> {/* Code Header */}
                    <Skeleton className="h-4 w-20" /> {/* Status Header */}
                    <Skeleton className="h-4 w-24" /> {/* Attendance Header */}
                    <Skeleton className="h-4 w-12" /> {/* Rate Header */}
                    <Skeleton className="h-4 w-24 ml-auto" /> {/* Action Header */}
                </div>
            </div>
            <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="h-4 w-24" /> {/* Date */}
                        <Skeleton className="h-5 w-16 rounded" /> {/* Code badge */}
                        <Skeleton className="h-5 w-20 rounded-full" /> {/* Status badge */}
                        <Skeleton className="h-4 w-24" /> {/* Count */}
                        <Skeleton className="h-4 w-12" /> {/* Rate */}
                        <Skeleton className="h-8 w-24 ml-auto rounded" /> {/* Action button */}
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * High-fidelity Skeleton for Assignments Table/Cards
 * Matches both desktop table and mobile card layouts
 */
export function AssignmentsSkeleton() {
    return (
        <>
            {/* Desktop Table Skeleton */}
            <div className="hidden md:block rounded-lg border">
                <div className="border-b bg-muted/50 p-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-48 flex-1" /> {/* Title Header */}
                        <Skeleton className="h-4 w-32" /> {/* Due Date Header */}
                        <Skeleton className="h-4 w-16" /> {/* Points Header */}
                        <Skeleton className="h-4 w-20 ml-auto" /> {/* Action Header */}
                    </div>
                </div>
                <div className="divide-y">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <Skeleton className="h-4 w-48 flex-1" /> {/* Title */}
                            <Skeleton className="h-4 w-32" /> {/* Due Date */}
                            <Skeleton className="h-4 w-16" /> {/* Points */}
                            <Skeleton className="h-8 w-20 ml-auto rounded" /> {/* Grade Button */}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Card Skeleton */}
            <div className="md:hidden space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                ))}
            </div>
        </>
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
