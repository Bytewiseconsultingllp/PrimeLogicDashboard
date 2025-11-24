"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, CreditCard, Link as LinkIcon, CheckCircle2, AlertTriangle, DollarSign, CalendarClock, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/useAuth"
import { getUserDetails } from "@/lib/api/storage"

interface StripeStatus {
  isConnected: boolean
  status: "NOT_CONNECTED" | "PENDING" | "ACTIVE" | "RESTRICTED" | "DISABLED" | string
  verified: boolean
  accountId?: string | null
  accountDetails?: {
    id?: string
    chargesEnabled?: boolean
    payoutsEnabled?: boolean
    detailsSubmitted?: boolean
    requirementsCurrentlyDue?: string[]
    requirementsPastDue?: string[]
  } | null
}

interface PaymentDetailsResponse {
  freelancer?: {
    id: string
    stripeAccountId?: string | null
    stripeAccountStatus?: StripeStatus["status"]
    paymentDetailsVerified?: boolean
  }
}

interface PayoutRow {
  id: string
  amount: number
  currency: string
  status: string
  payoutType: string
  description?: string | null
  createdAt: string
  paidAt?: string | null
  project?: {
    id: string
    details?: {
      companyName?: string
    }
  } | null
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages?: number
  totalPages?: number
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500",
    PROCESSING: "bg-blue-500",
    PAID: "bg-green-600",
    FAILED: "bg-red-600",
    CANCELLED: "bg-gray-500",
  }
  const cls = map[status] ?? "bg-gray-500"
  return <Badge className={`${cls} text-white`}>{status}</Badge>
}

function StripeStatusBadge({ status }: { status: StripeStatus["status"] }) {
  const map: Record<string, { label: string; className: string }> = {
    NOT_CONNECTED: { label: "Not Connected", className: "bg-gray-500" },
    PENDING: { label: "Pending", className: "bg-yellow-500" },
    ACTIVE: { label: "Active", className: "bg-green-600" },
    RESTRICTED: { label: "Restricted", className: "bg-orange-500" },
    DISABLED: { label: "Disabled", className: "bg-red-600" },
  }
  const cfg = map[status] ?? { label: status || "Unknown", className: "bg-gray-500" }
  return <Badge className={`${cfg.className} text-white`}>{cfg.label}</Badge>
}

export default function FreelancerPaymentsPage() {
  const { isAuthorized } = useAuth(["FREELANCER"])
  const router = useRouter()

  const [loadingStripe, setLoadingStripe] = useState(true)
  const [submittingStripe, setSubmittingStripe] = useState(false)
  const [stripeInput, setStripeInput] = useState("")
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse | null>(null)
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [connectUrlLoading, setConnectUrlLoading] = useState(false)

  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [page, setPage] = useState(1)

  const getToken = () => {
    const userDetails = getUserDetails()
    const token = userDetails?.accessToken
    if (!token) {
      toast.error("Authentication required. Please login again.")
      router.push("/login")
      throw new Error("No access token")
    }
    return token
  }

  useEffect(() => {
    if (!isAuthorized) return
    fetchStripeInfo()
  }, [isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return
    fetchPayouts(page)
  }, [isAuthorized, page])

  const fetchStripeInfo = async () => {
    setLoadingStripe(true)
    try {
      const token = getToken()

      // /freelancer/payment-details
      const detailsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/payment-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (detailsRes.ok) {
        const json = await detailsRes.json()
        setPaymentDetails(json.data as PaymentDetailsResponse)
        const currentStripeId = (json.data?.freelancer?.stripeAccountId as string | null) || ""
        setStripeInput(currentStripeId)
      } else {
        console.error("Failed to fetch freelancer payment details", await detailsRes.text())
      }

      // /api/v1/freelancer/stripe-connect-status
      const statusRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/stripe-connect-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (statusRes.ok) {
        const json = await statusRes.json()
        setStripeStatus(json.data as StripeStatus)
      } else {
        console.error("Failed to fetch Stripe connect status", await statusRes.text())
      }
    } catch (error) {
      console.error("Error loading Stripe info", error)
      toast.error("Failed to load Stripe account details")
    } finally {
      setLoadingStripe(false)
    }
  }

  const handleSaveStripeAccountId = async () => {
    if (!stripeInput || !stripeInput.startsWith("acct_")) {
      toast.error("Please enter a valid Stripe account ID starting with 'acct_'")
      return
    }

    setSubmittingStripe(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/payment-details`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripeAccountId: stripeInput.trim() }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        console.error("Stripe account update failed", res.status, json)
        toast.error(json?.message || "Failed to update Stripe account")
        return
      }

      toast.success("Stripe account updated successfully")
      await fetchStripeInfo()
    } catch (error) {
      console.error("Error updating Stripe account", error)
      toast.error("Network error while updating Stripe account")
    } finally {
      setSubmittingStripe(false)
    }
  }

  const handleOpenConnectFlow = async () => {
    setConnectUrlLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/stripe-connect-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        console.error("Failed to get Stripe connect URL", res.status, json)
        toast.error(json?.message || "Failed to start Stripe connect flow")
        return
      }

      const url = json.data?.connectUrl as string | undefined
      if (url) {
        window.location.href = url
      } else {
        toast.error("Connect URL not returned by server")
      }
    } catch (error) {
      console.error("Error getting Stripe connect URL", error)
      toast.error("Network error while starting Stripe connect flow")
    } finally {
      setConnectUrlLoading(false)
    }
  }

  const fetchPayouts = async (pageNumber: number) => {
    setPayoutLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/payouts?page=${pageNumber}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        console.error("Failed to fetch payouts", res.status, await res.text())
        toast.error("Failed to load payouts")
        return
      }

      const json = await res.json()
      const data = json.data || {}
      setPayouts((data.payouts || []) as PayoutRow[])
      const p = (data.pagination || {}) as any
      setPagination({
        page: p.page ?? pageNumber,
        limit: p.limit ?? 10,
        total: p.total ?? data.payouts?.length ?? 0,
        pages: p.pages ?? p.totalPages,
        totalPages: p.totalPages ?? p.pages,
      })
    } catch (error) {
      console.error("Error fetching payouts", error)
      toast.error("Network error while loading payouts")
    } finally {
      setPayoutLoading(false)
    }
  }

  if (!isAuthorized) return null

  const currentStripeId = paymentDetails?.freelancer?.stripeAccountId || stripeStatus?.accountId
  const effectiveStatus = paymentDetails?.freelancer?.stripeAccountStatus || stripeStatus?.status || "NOT_CONNECTED"
  const verified = paymentDetails?.freelancer?.paymentDetailsVerified ?? stripeStatus?.verified ?? false

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        {/* Stripe Account Card */}
        <Card className="border border-[#003087]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Stripe Payout Account</CardTitle>
                  <p className="text-xs text-blue-100">Connect your Stripe account to receive payouts</p>
                </div>
              </div>
              {!loadingStripe && (
                <div className="flex items-center gap-2 text-xs">
                  <StripeStatusBadge status={effectiveStatus} />
                  {verified && (
                    <span className="flex items-center gap-1 text-green-100">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            {loadingStripe ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#003087]" />
                <span className="ml-2 text-sm text-muted-foreground">Loading Stripe account details...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You can either connect via Stripe's secure onboarding flow or manually enter
                    your Stripe account ID (for advanced users).
                  </p>
                  {stripeStatus?.accountDetails && (
                    <div className="grid gap-2 text-xs md:grid-cols-2 bg-white/40 border border-white/60 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-[#003087]">Account Capabilities</p>
                        <p className="mt-1 flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> Charges: {stripeStatus.accountDetails.chargesEnabled ? "Enabled" : "Disabled"}
                        </p>
                        <p className="flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> Payouts: {stripeStatus.accountDetails.payoutsEnabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-[#003087]">Requirements</p>
                        {(stripeStatus.accountDetails.requirementsCurrentlyDue?.length || 0) === 0 ? (
                          <p className="mt-1 text-xs text-green-700">No immediate requirements due.</p>
                        ) : (
                          <ul className="mt-1 list-disc pl-4 text-xs text-red-700">
                            {stripeStatus.accountDetails.requirementsCurrentlyDue?.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
                  <label className="text-xs font-medium text-muted-foreground">Stripe Account ID (optional manual entry)</label>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <Input
                      placeholder="acct_XXXXXXXXXXXXXXXX"
                      value={stripeInput}
                      onChange={(e) => setStripeInput(e.target.value)}
                      className="md:flex-1"
                    />
                    <Button
                      onClick={handleSaveStripeAccountId}
                      disabled={submittingStripe}
                      className="bg-[#003087] hover:bg-[#002060] text-white"
                    >
                      {submittingStripe && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save ID
                    </Button>
                  </div>
                  {currentStripeId && (
                    <p className="text-xs text-muted-foreground">
                      Current Stripe account: <span className="font-mono">{currentStripeId}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <LinkIcon className="h-4 w-4 text-[#003087]" />
                    <span className="font-medium text-[#003087]">Connect via Stripe</span>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-muted-foreground max-w-xl">
                      Use Stripe&apos;s secure onboarding to connect your account in a few clicks. This is the
                      recommended option for most freelancers.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleOpenConnectFlow}
                      disabled={connectUrlLoading}
                      className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10"
                    >
                      {connectUrlLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Connect with Stripe
                    </Button>
                  </div>
                  {effectiveStatus !== "ACTIVE" && (
                    <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">
                      <AlertTriangle className="mt-0.5 h-3 w-3" />
                      <p>
                        Your Stripe account is not fully active yet. You may need to complete additional
                        verification steps in Stripe to start receiving payouts.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card className="border border-[#003087]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#003087]/10 to-[#FF6B35]/10">
            <CardTitle className="text-sm font-semibold text-[#003087]">Payout Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white border border-[#003087]/10 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Total Payouts</span>
                <span className="text-xl font-bold text-[#003087]">
                  {pagination?.total ?? payouts.length}
                </span>
              </div>
              <div className="rounded-lg bg-white border border-[#FF6B35]/10 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Current Page</span>
                <span className="text-xl font-bold text-[#FF6B35]">
                  {pagination?.page ?? page}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-[#003087]/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#003087]" />
              <span>
                Below is your payout history. Use the <strong>View</strong> action to open the related project
                details and see all payments for that project.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="border border-[#003087]/10 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
          <CardTitle className="flex items-center justify-between text-[#003087]">
            <span>Payout History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {payoutLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#003087]" />
              <span className="ml-2 text-sm text-muted-foreground">Loading payouts...</span>
            </div>
          ) : payouts.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <DollarSign className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">No payouts yet</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Once you start completing milestones or projects and your payouts are processed, they will
                appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Payment Amount</TableHead>
                      <TableHead>Date &amp; Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((p) => {
                      const projectId = p.project?.id
                      const companyName = p.project?.details?.companyName || "Project"
                      const amountFormatted = `${p.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ${p.currency.toUpperCase()}`

                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="font-medium">{companyName}</span>
                              {projectId && (
                                <span className="font-mono text-xs text-muted-foreground">{projectId}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span>{amountFormatted}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{formatDateTime(p.paidAt || p.createdAt)}</TableCell>
                          <TableCell className="text-xs uppercase">{p.payoutType}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#003087] text-[#003087] hover:bg-[#003087]/10"
                              disabled={!projectId}
                              onClick={() => {
                                if (!projectId) return
                                router.push(`/dashboard/freelancer/projects/${projectId}`)
                              }}
                            >
                              <Eye className="mr-1 h-4 w-4" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && (pagination.totalPages || pagination.pages) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages ?? pagination.pages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const maxPage = (pagination.totalPages ?? pagination.pages) || 1
                        setPage((prev) => Math.min(prev + 1, maxPage))
                      }}
                      disabled={
                        (pagination.totalPages ?? pagination.pages ?? 1) <= (pagination.page ?? 1)
                      }
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

