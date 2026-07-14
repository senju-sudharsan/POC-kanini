import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">404</p>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
        Check the link, or head back to the overview.
      </p>
      <Link to="/overview">
        <Button variant="primary" className="mt-2">
          Go to Overview
        </Button>
      </Link>
    </div>
  )
}
