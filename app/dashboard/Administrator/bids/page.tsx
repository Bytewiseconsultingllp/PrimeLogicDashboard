"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Star,
  Briefcase
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface Bid {
  id: string
  bidAmount: number
  proposalText: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  submittedAt: string
  reviewedAt?: string
  freelancer: {
    id: string
    fullName: string
    email: string
    username: string
    profilePicture?: string
    experience?: string
    skills?: string[]
  }
  project: {
    id: string
    details: {
      companyName: string
      fullName: string
    }
    services?: Array<{ name: string }>
  }
}

interface BidStats {
  totalBids: number
  pendingBids: number
  acceptedBids: number
  rejectedBids: number
  averageBidAmount: number
}

export default function BidsManagementPage() {
  const { isAuthorized } = useAuth(["ADMIN"])
  const router = useRouter()
  const [bids, setBids] = useState<Bid[]>([])
  const [stats, setStats] = useState<BidStats>({
    totalBids: 0,
    pendingBids: 0,
    acceptedBids: 0,
    rejectedBids: 0,
    averageBidAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<"ACCEPT" | "REJECT" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    if (isAuthorized) {
      fetchAllBids()
    }
  }, [isAuthorized, currentPage, statusFilter])

  const fetchAllBids = async () => {
    setLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        console.error("❌ No access token found")
        toast.error("Authentication required. Please login again.")
        router.push('/login')
        return
      }

      // First, get all projects to fetch bids from
      console.log("🔄 Fetching projects to get bids...")
      const projectsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/projects?page=1&limit=100&acceptingBids=true`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects")
      }

      const projectsData = await projectsResponse.json()
      const projects = projectsData.data?.projects || []

      // Fetch bids for all projects
      const allBids: Bid[] = []
      for (const project of projects.slice(0, 10)) { // Limit to first 10 projects for demo
        try {
          const statusQuery = statusFilter !== "ALL" ? `&status=${statusFilter}` : ""
          const bidsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_PLS}/admin/projects/${project.id}/bids?page=1&limit=50${statusQuery}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          )

          if (bidsResponse.ok) {
            const bidsData = await bidsResponse.json()
            const projectBids = bidsData.data?.bids || []
            
            // Add project info to each bid
            const bidsWithProject = projectBids.map((bid: any) => ({
              ...bid,
              project: {
                id: project.id,
                details: project.details,
                services: project.services
              }
            }))
            
            allBids.push(...bidsWithProject)
          }
        } catch (error) {
          console.error(`Error fetching bids for project ${project.id}:`, error)
        }
      }

      setBids(allBids)
      
      // Calculate stats
      const pendingCount = allBids.filter(bid => bid.status === "PENDING").length
      const acceptedCount = allBids.filter(bid => bid.status === "ACCEPTED").length
      const rejectedCount = allBids.filter(bid => bid.status === "REJECTED").length
      const avgAmount = allBids.length > 0 
        ? allBids.reduce((sum, bid) => sum + bid.bidAmount, 0) / allBids.length
        : 0

      setStats({
        totalBids: allBids.length,
        pendingBids: pendingCount,
        acceptedBids: acceptedCount,
        rejectedBids: rejectedCount,
        averageBidAmount: avgAmount
      })

      // Simple pagination (client-side for demo)
      setTotalPages(Math.ceil(allBids.length / itemsPerPage))
      
      toast.success(`Loaded ${allBids.length} bids`)
    } catch (error) {
      console.error("Error fetching bids:", error)
      toast.error("Failed to load bids")
    } finally {
      setLoading(false)
    }
  }

  const reviewBid = async (bidId: string, action: "ACCEPT" | "REJECT", reason?: string) => {
    setActionLoading(bidId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const requestBody: any = { action }
      if (action === "REJECT" && reason) {
        requestBody.reason = reason
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/bids/${bidId}/review`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        toast.success(`Bid ${action.toLowerCase()}ed successfully`)
        setIsReviewDialogOpen(false)
        setSelectedBid(null)
        setReviewAction(null)
        setRejectionReason("")
        fetchAllBids()
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to review bid:", errorData)
        toast.error("Failed to review bid")
      }
    } catch (error) {
      console.error("Error reviewing bid:", error)
      toast.error("Failed to review bid")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", icon: Clock },
      ACCEPTED: { color: "bg-green-500", icon: CheckCircle },
      REJECTED: { color: "bg-red-500", icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const filteredBids = bids
    .filter(bid => {
      const matchesSearch = 
        bid.freelancer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.freelancer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.project.details.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.proposalText.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "ALL" || bid.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bids...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Bids Management</h1>
          <p className="text-muted-foreground">Review and manage freelancer bids on projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBids}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBids}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.acceptedBids}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedBids}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Bid Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageBidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by freelancer, project, or proposal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bids Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Bid Amount</TableHead>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {bid.freelancer.profilePicture ? (
                            <AvatarImage src={bid.freelancer.profilePicture} alt={bid.freelancer.fullName} />
                          ) : (
                            <AvatarFallback className="bg-[#003087] text-white">
                              {bid.freelancer.fullName
                                ?.split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "FL"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{bid.freelancer.fullName}</p>
                          <p className="text-sm text-muted-foreground">@{bid.freelancer.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bid.project.details.companyName}</p>
                        <p className="text-sm text-muted-foreground">{bid.project.details.fullName}</p>
                        {bid.project.services && bid.project.services.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {bid.project.services.slice(0, 2).map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service.name}
                              </Badge>
                            ))}
                            {bid.project.services.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{bid.project.services.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="font-medium text-green-600">
                          {bid.bidAmount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {bid.proposalText}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(bid.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(bid.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/Administrator/bids/${bid.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {bid.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBid(bid)
                                setReviewAction("ACCEPT")
                                setIsReviewDialogOpen(true)
                              }}
                              disabled={actionLoading === bid.id}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {actionLoading === bid.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBid(bid)
                                setReviewAction("REJECT")
                                setIsReviewDialogOpen(true)
                              }}
                              disabled={actionLoading === bid.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {actionLoading === bid.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "ACCEPT" ? "Accept" : "Reject"} Bid
            </DialogTitle>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Bid Details</h4>
                <p><strong>Freelancer:</strong> {selectedBid.freelancer.fullName}</p>
                <p><strong>Amount:</strong> ${selectedBid.bidAmount.toLocaleString()}</p>
                <p><strong>Project:</strong> {selectedBid.project.details.companyName}</p>
              </div>
              
              {reviewAction === "REJECT" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rejection Reason
                  </label>
                  <Textarea
                    placeholder="Please provide a reason for rejecting this bid..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReviewDialogOpen(false)
                    setSelectedBid(null)
                    setReviewAction(null)
                    setRejectionReason("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedBid && reviewAction) {
                      reviewBid(selectedBid.id, reviewAction, rejectionReason)
                    }
                  }}
                  disabled={reviewAction === "REJECT" && !rejectionReason.trim()}
                  className={reviewAction === "ACCEPT" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {reviewAction === "ACCEPT" ? "Accept Bid" : "Reject Bid"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
