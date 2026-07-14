import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none',
  {
    variants: {
      variant: {
        neutral: 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]',
        success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
        warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
        danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
        accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Renders a small status dot before the label — used for run/validation status only. */
  dot?: boolean
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-[var(--color-text-muted)]': variant === 'neutral' || !variant,
            'bg-[var(--color-success)]': variant === 'success',
            'bg-[var(--color-warning)]': variant === 'warning',
            'bg-[var(--color-danger)]': variant === 'danger',
            'bg-[var(--color-accent)]': variant === 'accent',
          })}
        />
      )}
      {children}
    </span>
  )
}
