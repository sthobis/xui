import MuiSkeleton from "@mui/material/Skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import type { Section } from "../types"

// skeleton.tsx's own class list ("animate-pulse rounded-md bg-muted") carries no intrinsic
// size - callers always supply width/height via className, same convention followed here for
// both the line and circle shapes. The circle shape isn't a built-in skeleton.tsx variant; it's
// the same base component with a caller-supplied `rounded-full` className (twMerge resolves the
// conflicting radius utility, replacing the base `rounded-md`), mirrored on the MUI side by
// `variant="circular"`.
export const skeletonSection: Section = {
  title: "Skeleton",
  pairs: [
    {
      id: "skeleton-line",
      shadcn: <Skeleton className="h-4 w-[120px]" />,
      mui: <MuiSkeleton variant="rectangular" width={120} height={16} />,
    },
    {
      id: "skeleton-circle",
      shadcn: <Skeleton className="size-10 rounded-full" />,
      mui: <MuiSkeleton variant="circular" width={40} height={40} />,
    },
  ],
}
