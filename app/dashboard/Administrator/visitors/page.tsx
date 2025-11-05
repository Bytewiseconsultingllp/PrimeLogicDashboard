"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Eye, 
  Edit,
  Trash2,
  Building, 
  Mail, 
  Phone,
  Calendar,
  Globe,
  MapPin,
  Users,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface VisitorDetails {
  id: string
  fullName: string
  businessEmail: string
  phoneNumber?: string
  companyName?: string
  companyWebsite?: string
  businessAddress?: string
  businessType?: string
  referralSource?: string
}

interface Visitor {
  id: string
  clientId?: string
  ipAddress?: string
  isConverted: boolean
  convertedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  details?: VisitorDetails
}

export default function VisitorsPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    if (isAuthorized) {
      fetchVisitors()
    }
  }, [isAuthorized, currentPage])

  useEffect(() => {
    filterVisitors()
  }, [visitors, searchTerm, statusFilter])

  const fetchVisitors = async () => {
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

      console.log("🔄 Fetching visitors with API:", `${process.env.NEXT_PUBLIC_PLS}/visitors?page=${currentPage}&limit=${itemsPerPage}`)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/visitors?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Visitors data:", data)
        setVisitors(data.data?.visitors || [])
        setTotalPages(Math.ceil((data.data?.pagination?.total || 0) / itemsPerPage))
        toast.success(`Loaded ${data.data?.visitors?.length || 0} visitors`)
      } else if (response.status === 401) {
        console.error("❌ Authentication failed - token may be expired")
        toast.error("Session expired. Please login again.")
        // Clear stored credentials
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch visitors:", errorData)
        toast.error(`Failed to load visitors: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching visitors:", error)
      toast.error("Failed to load visitors")
    } finally {
      setLoading(false)
    }
  }

  const filterVisitors = () => {
    let filtered = visitors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        (visitor.details?.fullName && visitor.details.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visitor.details?.businessEmail && visitor.details.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visitor.details?.companyName && visitor.details.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(visitor => {
        if (statusFilter === "CONVERTED") return visitor.isConverted
        if (statusFilter === "NOT_CONVERTED") return !visitor.isConverted
        return true
      })
    }

    setFilteredVisitors(filtered)
  }

  const handleDeleteVisitor = async (visitorId: string) => {
    if (!confirm("Are you sure you want to delete this visitor? This action cannot be undone.")) {
      return
    }

    setActionLoading(visitorId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/visitors/${visitorId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        toast.success("Visitor deleted successfully")
        fetchVisitors() // Refresh the list
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to delete visitor:", errorData)
        toast.error("Failed to delete visitor")
      }
    } catch (error) {
      console.error("Error deleting visitor:", error)
      toast.error("Failed to delete visitor")
    } finally {
      setActionLoading(null)
    }
  }

  const viewVisitorDetails = (visitorId: string) => {
    router.push(`/dashboard/Administrator/visitors/${visitorId}`)
  }

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading visitors...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Visitors</h1>
          <p className="text-muted-foreground">Manage and monitor all website visitors</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
              >
                <option value="ALL">All Status</option>
                <option value="CONVERTED">Converted</option>
                <option value="NOT_CONVERTED">Not Converted</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredVisitors.length} of {visitors.length} visitors
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Visitors ({filteredVisitors.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVisitors.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#003087] text-white">
                              {visitor.details?.fullName
                                ?.split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "VI"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{visitor.details?.fullName || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">ID: {visitor.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{visitor.details?.businessEmail || "N/A"}</span>
                          </div>
                          {visitor.details?.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">{visitor.details.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{visitor.details?.companyName || "N/A"}</span>
                          </div>
                          {visitor.details?.companyWebsite && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <a 
                                href={visitor.details.companyWebsite} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {visitor.details?.businessType || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {visitor.details?.referralSource || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {visitor.isConverted ? (
                            <Badge className="bg-green-500 text-white flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Converted
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Visitor
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(visitor.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewVisitorDetails(visitor.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVisitor(visitor.id)}
                            disabled={actionLoading === visitor.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {actionLoading === visitor.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Visitors Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "ALL" 
                  ? "No visitors match your current filters." 
                  : "No visitors have been recorded yet."}
              </p>
              {searchTerm || statusFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("ALL")
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}

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
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
    </div>
  )
}
