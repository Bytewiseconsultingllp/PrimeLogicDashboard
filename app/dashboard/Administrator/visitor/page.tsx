// Previously: client component with "Next" button and card grid using VisitorCard.
// Now: async server component that fetches via /api/visitors (no SWR) and renders a responsive table.

type Visitor = {
  id?: string
  fullName?: string
  businessEmail?: string
  phoneNumber?: string | null
  companyName?: string | null
  companyWebsite?: string | null
  businessAddress?: string | null
  businessType?: string | null
  referralSource?: string | null
  createdAt?: string
  updatedAt?: string
}

type VisitorsApiShape = {
  success?: boolean
  status?: number
  message?: string
  data?: {
    visitors?: Visitor[]
    pagination?: {
      currentPage?: number
      totalPages?: number
      totalCount?: number
      limit?: number
    }
  }
}

// Helper to normalize various possible upstream responses into a list + pagination
function normalizeVisitorsResponse(json: any): {
  visitors: Visitor[]
  pagination: { currentPage: number; totalPages: number; totalCount: number; limit: number }
} {
  const defaultPagination = { currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 }

  // Expected shape from pasted-text: { data: { visitors: [], pagination: { ... } } }
  if (json?.data?.visitors && Array.isArray(json.data.visitors)) {
    return {
      visitors: json.data.visitors as Visitor[],
      pagination: {
        currentPage: json.data.pagination?.currentPage ?? defaultPagination.currentPage,
        totalPages: json.data.pagination?.totalPages ?? defaultPagination.totalPages,
        totalCount: json.data.pagination?.totalCount ?? json.data.visitors.length ?? defaultPagination.totalCount,
        limit: json.data.pagination?.limit ?? defaultPagination.limit,
      },
    }
  }

  // If array is returned directly
  if (Array.isArray(json)) {
    return { visitors: json as Visitor[], pagination: { ...defaultPagination, totalCount: (json as any[]).length } }
  }

  // If object is returned directly
  if (json && typeof json === "object") {
    return { visitors: [json as Visitor], pagination: { ...defaultPagination, totalCount: 1 } }
  }

  return { visitors: [], pagination: defaultPagination }
}

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  const s = sp.toString()
  return s ? `?${s}` : ""
}

import { VisitorRow } from "@/components/visitor-row"

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams?.page === "string" ? searchParams!.page : "1"
  const limit = typeof searchParams?.limit === "string" ? searchParams!.limit : "10"
  const businessType = typeof searchParams?.businessType === "string" ? searchParams!.businessType : undefined
  const referralSource = typeof searchParams?.referralSource === "string" ? searchParams!.referralSource : undefined

  const query = buildQuery({ page, limit, businessType, referralSource })
  const res = await fetch(`/api/visitors${query}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return (
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="rounded-md border border-border bg-card p-4 text-card-foreground">
          <p className="text-sm text-destructive">Failed to load visitors: {text || `Status ${res.status}`}</p>
        </div>
      </main>
    )
  }

  const json = (await res.json().catch(() => ({}))) as VisitorsApiShape | any
  const { visitors, pagination } = normalizeVisitorsResponse(json)

  const currentPage = Number.isFinite(Number(page)) ? Number(page) : 1
  const totalPages = pagination.totalPages || 1
  const prevPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)

  const prevQuery = buildQuery({ page: String(prevPage), limit, businessType, referralSource })
  const nextQuery = buildQuery({ page: String(nextPage), limit, businessType, referralSource })

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Filters (optional) */}
      <form className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4" action="/dashboard/visitors" method="get">
        <input
          name="businessType"
          defaultValue={businessType}
          placeholder="Filter by business type"
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
          aria-label="Filter by business type"
        />
        <input
          name="referralSource"
          defaultValue={referralSource}
          placeholder="Filter by referral source"
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
          aria-label="Filter by referral source"
        />
        <input
          name="limit"
          defaultValue={limit}
          type="number"
          min={1}
          max={100}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
          aria-label="Items per page"
          placeholder="Items per page"
        />
        <button type="submit" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Apply
        </button>
      </form>

      {/* Responsive table wrapper */}
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="min-w-[800px] w-full text-left text-sm text-card-foreground">
          <thead className="bg-muted/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
              <th className="whitespace-nowrap">Full Name</th>
              <th className="whitespace-nowrap">Email</th>
              <th className="whitespace-nowrap">Phone</th>
              <th className="whitespace-nowrap">Company</th>
              <th className="whitespace-nowrap">Website</th>
              <th className="whitespace-nowrap">Address</th>
              <th className="whitespace-nowrap">Business Type</th>
              <th className="whitespace-nowrap">Referral Source</th>
              <th className="whitespace-nowrap">Created</th>
              <th className="whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(odd)]:bg-muted/30">
            {visitors.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-3 text-muted-foreground">
                  No visitors found.
                </td>
              </tr>
            ) : (
              visitors.map((v, i) => <VisitorRow key={v.id ?? i} visitor={v} index={i} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} • {pagination.totalCount ?? visitors.length} total
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/dashboard/visitors${prevQuery}`}
            aria-disabled={currentPage <= 1}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Previous
          </a>
          <a
            href={`/dashboard/visitors${nextQuery}`}
            aria-disabled={currentPage >= totalPages}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Next
          </a>
        </div>
      </div>
    </main>
  )
}
