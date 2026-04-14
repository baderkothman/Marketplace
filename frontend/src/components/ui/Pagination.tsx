interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  )

  const withEllipsis: (number | '...')[] = []
  let prev = 0
  for (const p of visible) {
    if (p - prev > 1) withEllipsis.push('...')
    withEllipsis.push(p)
    prev = p
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>

      {withEllipsis.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-2 text-text-muted text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={[
              'w-9 h-9 rounded-md text-sm font-medium transition-colors',
              p === page
                ? 'bg-brand text-text-inverse'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-3',
            ].join(' ')}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </nav>
  )
}
