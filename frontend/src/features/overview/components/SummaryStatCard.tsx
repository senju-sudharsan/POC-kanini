import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface SummaryStatCardProps {
  label: string
  value: number | null | undefined
  icon: LucideIcon
  index?: number
  className?: string
}

export function SummaryStatCard({ label, value, icon: Icon, index = 0, className }: SummaryStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className={cn('flex flex-col gap-4', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
          <Icon className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.75} />
        </div>
        <span className="tabular-nums text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {formatNumber(value)}
        </span>
      </Card>
    </motion.div>
  )
}
