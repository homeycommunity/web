import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm",
  {
    variants: {
      variant: {
        method: "",
        scope: "",
        status: "",
      },
      type: {
        // Method types
        get: "bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
        post: "bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
        put: "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
        delete:
          "bg-red-100/50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
        // Scope types
        read: "bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
        write:
          "bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
        // Status types
        success:
          "bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
        error:
          "bg-red-100/50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
        warning:
          "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      variant: "method",
      type: "get",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, type, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, type }), className)}
      {...props}
    />
  )
}
