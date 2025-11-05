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
  DollarSign,
  Users,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface ClientProfile {
  uid: string
  fullName: string
  email: string
  username: string
  emailVerifiedAt?: string
  role: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  address?: string
  phone?: string
  kpi?: {
    points: number
    rank: string
  }
  projects?: Array<{
    id: string
    details: {
      companyName: string
    }
    paymentStatus: string
    createdAt: string
  }>
  totalProjectsCount?: number
  totalSpent?: number
}

export default function ClientProfilesPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [filteredClients, setFilteredClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    if (isAuthorized) {
      fetchClients()
    }
  }, [isAuthorized, currentPage])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, statusFilter])

  const fetchClients = async () => {
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

      console.log("🔄 Fetching clients with token:", token.substring(0, 20) + "...")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/clients?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Clients data:", data)
        console.log("✅ First client UID:", data.data?.clients?.[0]?.uid)
        setClients(data.data?.clients || [])
        setTotalPages(data.data?.pagination?.totalPages || 1)
        toast.success(`Loaded ${data.data?.clients?.length || 0} clients`)
      } else if (response.status === 401) {
        console.error("❌ Authentication failed - token may be expired")
        toast.error("Session expired. Please login again.")
        // Clear stored credentials
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch clients:", errorData)
        toast.error(`Failed to load clients: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Failed to load clients")
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(client => {
        if (statusFilter === "ACTIVE") return client.isActive
        if (statusFilter === "INACTIVE") return !client.isActive
        return true
      })
    }

    setFilteredClients(filtered)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return
    }

    setActionLoading(clientId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        toast.success("Client deleted successfully")
        fetchClients() // Refresh the list
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to delete client:", errorData)
        toast.error("Failed to delete client")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      toast.error("Failed to delete client")
    } finally {
      setActionLoading(null)
    }
  }

  const viewClientDetails = (clientId: string) => {
    console.log("🔄 Navigating to client details for ID:", clientId)
    router.push(`/dashboard/Administrator/client-profiles/${clientId}`)
  }

  const getKPIBadge = (rank: string) => {
    const colors = {
      BRONZE: "bg-amber-600",
      SILVER: "bg-gray-400",
      GOLD: "bg-yellow-500",
      PLATINIUM: "bg-blue-500",
      DIAMOND: "bg-purple-500",
      CROWN: "bg-pink-500",
      ACE: "bg-red-500",
      CONQUERER: "bg-black"
    }
    return <Badge className={colors[rank as keyof typeof colors] || "bg-gray-500"}>{rank}</Badge>
  }

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading clients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Client Profiles</h1>
          <p className="text-muted-foreground">Manage and monitor all client accounts</p>
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
                placeholder="Search by name, email, or username..."
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Clients ({filteredClients.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#003087] text-white">
                              {client.fullName
                                ?.split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "CL"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.fullName}</p>
                            <p className="text-sm text-muted-foreground">@{client.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="secondary">{client.totalProjectsCount || 0}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">
                            ${(client.totalSpent || 0).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.isActive ? "default" : "secondary"}>
                          {client.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(client.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewClientDetails(client.uid)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client.uid)}
                            disabled={actionLoading === client.uid}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {actionLoading === client.uid ? (
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
              <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "ALL" 
                  ? "No clients match your current filters." 
                  : "No clients have been registered yet."}
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
