"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Loader2, ChevronLeft, ChevronRight, Calendar, DollarSign, Eye, Users, User, Briefcase } from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface AdminPaymentProject {
  id: string
  amount: number
  currency: string
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  projectId?: string | null
  createdAt: string
  paidAt?: string | null
  clientEmail: string
  clientName?: string | null
  project?: {
    id: string
    details?: {
      companyName?: string
    }
  } | null
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

interface ClientPaymentSummary {
  uid: string
  fullName: string
  email: string
  totalSpent?: number
}

interface FreelancerPayoutRow {
  id: string
  amount: number
  currency: string
  status: string
  payoutType: string
  createdAt: string
  paidAt?: string | null
  freelancer: {
    id: string
    details?: {
      fullName?: string
      email?: string
    }
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

function PaymentStatusBadge({ status }: { status: AdminPaymentProject["status"] }) {
  const map: Record<AdminPaymentProject["status"], { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-yellow-500" },
    SUCCEEDED: { label: "Completed", className: "bg-green-600" },
    FAILED: { label: "Failed", className: "bg-red-600" },
    CANCELED: { label: "Canceled", className: "bg-gray-500" },
    REFUNDED: { label: "Refunded", className: "bg-blue-600" },
  }
  const cfg = map[status] ?? map.PENDING
  return (
    <Badge className={`${cfg.className} text-white`}>{cfg.label}</Badge>
  )
}

interface PaginatedProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationControls({ page, totalPages, onPageChange }: PaginatedProps) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"project" | "client" | "freelancer">("project")

  const [projectPayments, setProjectPayments] = useState<AdminPaymentProject[]>([])
  const [projectPagination, setProjectPagination] = useState<PaginationMeta | null>(null)
  const [projectPage, setProjectPage] = useState(1)
  const [projectLoading, setProjectLoading] = useState(false)

  const [clients, setClients] = useState<ClientPaymentSummary[]>([])
  const [clientPagination, setClientPagination] = useState<PaginationMeta | null>(null)
  const [clientPage, setClientPage] = useState(1)
  const [clientLoading, setClientLoading] = useState(false)

  const [payouts, setPayouts] = useState<FreelancerPayoutRow[]>([])
  const [payoutPagination, setPayoutPagination] = useState<PaginationMeta | null>(null)
  const [payoutPage, setPayoutPage] = useState(1)
  const [payoutLoading, setPayoutLoading] = useState(false)

  useEffect(() => {
    if (!isAuthorized) return
    fetchProjectPayments(projectPage)
  }, [isAuthorized, projectPage])

  useEffect(() => {
    if (!isAuthorized) return
    if (activeTab === "client") {
      fetchClientSummaries(clientPage)
    } else if (activeTab === "freelancer") {
      fetchFreelancerPayouts(payoutPage)
    }
  }, [activeTab, clientPage, payoutPage, isAuthorized])

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

  const fetchProjectPayments = async (page: number) => {
    setProjectLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/payments?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Failed to fetch payments", res.status, text)
        toast.error("Failed to load project payments")
        return
      }

      const json = await res.json()
      const data = json.data || {}
      setProjectPayments((data.payments || []) as AdminPaymentProject[])
      if (data.pagination) {
        setProjectPagination(data.pagination as PaginationMeta)
      } else {
        setProjectPagination({ total: data.payments?.length || 0, page, limit: 10, totalPages: page })
      }
    } catch (err) {
      console.error("Error fetching payments", err)
      toast.error("Network error while loading project payments")
    } finally {
      setProjectLoading(false)
    }
  }

  const fetchClientSummaries = async (page: number) => {
    setClientLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/clients?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Failed to fetch clients for payments", res.status, text)
        toast.error("Failed to load client payments view")
        return
      }

      const json = await res.json()
      const data = json.data || {}
      const clientsList = (data.clients || []) as any[]
      const mapped: ClientPaymentSummary[] = clientsList.map((c) => ({
        uid: c.uid,
        fullName: c.fullName,
        email: c.email,
        totalSpent: c.totalSpent ?? c.summary?.totalAmount ?? undefined,
      }))
      setClients(mapped)
      if (data.pagination) {
        setClientPagination(data.pagination as PaginationMeta)
      } else {
        setClientPagination({ total: mapped.length, page, limit: 10, totalPages: page })
      }
    } catch (err) {
      console.error("Error fetching clients for payments", err)
      toast.error("Network error while loading client payments view")
    } finally {
      setClientLoading(false)
    }
  }

  const fetchFreelancerPayouts = async (page: number) => {
    setPayoutLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/payouts?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Failed to fetch payouts", res.status, text)
        toast.error("Failed to load freelancer payments")
        return
      }

      const json = await res.json()
      const data = json.data || {}
      setPayouts((data.payouts || []) as FreelancerPayoutRow[])
      if (data.pagination) {
        setPayoutPagination(data.pagination as PaginationMeta)
      } else {
        setPayoutPagination({ total: data.payouts?.length || 0, page, limit: 10, totalPages: page })
      }
    } catch (err) {
      console.error("Error fetching payouts", err)
      toast.error("Network error while loading freelancer payments")
    } finally {
      setPayoutLoading(false)
    }
  }

  if (!isAuthorized) return null

  const renderProjectTab = () => (
    <Card>
      <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
        <CardTitle className="flex items-center gap-2 text-[#003087]">
          <Briefcase className="h-5 w-5 text-[#FF6B35]" />
          Project Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {projectLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#003087]" />
            <span className="ml-2 text-muted-foreground">Loading project payments...</span>
          </div>
        ) : projectPayments.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <Briefcase className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No payments found</p>
            <p className="text-sm text-muted-foreground">There are no project payments to display yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectPayments.map((p) => {
                    const projectId = p.project?.id || p.projectId || "-"
                    const companyName = p.project?.details?.companyName || "-"
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{companyName}</span>
                            <span className="text-xs text-muted-foreground">{projectId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{p.clientName || "Client"}</span>
                            <span className="text-xs text-muted-foreground">{p.clientEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDateTime(p.paidAt || p.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>{(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.currency.toUpperCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#003087] text-[#003087] hover:bg-[#003087]/10"
                            disabled={!projectId || projectId === "-"}
                            onClick={() => router.push(`/dashboard/Administrator/project-status/${projectId}`)}
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
            {projectPagination && (
              <PaginationControls
                page={projectPagination.page}
                totalPages={projectPagination.totalPages}
                onPageChange={setProjectPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  const renderClientTab = () => (
    <Card>
      <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
        <CardTitle className="flex items-center gap-2 text-[#003087]">
          <User className="h-5 w-5 text-[#FF6B35]" />
          Client Payments Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {clientLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#003087]" />
            <span className="ml-2 text-muted-foreground">Loading clients...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <User className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No clients found</p>
            <p className="text-sm text-muted-foreground">There are no client payment records to display yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow key={c.uid}>
                      <TableCell className="font-mono text-xs">{c.uid}</TableCell>
                      <TableCell>{c.fullName}</TableCell>
                      <TableCell className="text-sm">{c.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {(c.totalSpent ?? 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#003087] text-[#003087] hover:bg-[#003087]/10"
                          onClick={() => router.push(`/dashboard/Administrator/client-profiles/${c.uid}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {clientPagination && (
              <PaginationControls
                page={clientPagination.page}
                totalPages={clientPagination.totalPages}
                onPageChange={setClientPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  const renderFreelancerTab = () => (
    <Card>
      <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
        <CardTitle className="flex items-center gap-2 text-[#003087]">
          <Users className="h-5 w-5 text-[#FF6B35]" />
          Freelancer Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {payoutLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#003087]" />
            <span className="ml-2 text-muted-foreground">Loading freelancer payouts...</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <Users className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No payouts found</p>
            <p className="text-sm text-muted-foreground">There are no freelancer payouts to display yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => {
                    const name = p.freelancer?.details?.fullName || "Freelancer"
                    const email = p.freelancer?.details?.email
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">{name}</span>
                            {email && <span className="text-xs text-muted-foreground">{email}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.currency.toUpperCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs uppercase">{p.payoutType}</TableCell>
                        <TableCell>
                          <Badge className="bg-[#003087] text-white">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDateTime(p.paidAt || p.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#003087] text-[#003087] hover:bg-[#003087]/10"
                            onClick={() => router.push(`/dashboard/Administrator/freelancer-profiles/${p.freelancer.id}`)}
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
            {payoutPagination && (
              <PaginationControls
                page={payoutPagination.page}
                totalPages={payoutPagination.totalPages}
                onPageChange={setPayoutPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#003087]">Payments</h1>
        <p className="text-sm text-muted-foreground">
          View and manage project payments, client payment summaries, and freelancer payouts.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as typeof activeTab)
        }}
      >
        <TabsList className="mb-4 flex justify-start space-x-2 bg-[#003087]/5">
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="freelancer">Freelancer</TabsTrigger>
        </TabsList>

        <TabsContent value="project">{renderProjectTab()}</TabsContent>
        <TabsContent value="client">{renderClientTab()}</TabsContent>
        <TabsContent value="freelancer">{renderFreelancerTab()}</TabsContent>
      </Tabs>
    </div>
  )
}

