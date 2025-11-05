"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Eye, 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface ProjectDetails {
  fullName: string
  businessEmail: string
  phoneNumber: string
  companyName: string
  companyWebsite?: string
  businessAddress?: string
  businessType?: string
  referralSource?: string
}

interface Service {
  name: string
  childServices: string[]
}

interface Industry {
  category: string
  subIndustries: string[]
}

interface Technology {
  category: string
  technologies: string[]
}

interface Feature {
  category: string
  features: string[]
}

interface Discount {
  type: string
  value: number
  description?: string
}

interface Timeline {
  option: string
  estimatedDuration?: string
}

interface Estimate {
  totalCost: number
  breakdown?: any
}

interface AdminProject {
  id: string
  createdAt: string
  updatedAt: string
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  acceptingBids: boolean
  discordChatUrl?: string
  details: ProjectDetails
  services: Service[]
  industries: Industry[]
  technologies: Technology[]
  features: Feature[]
  discount?: Discount
  timeline?: Timeline
  estimate?: Estimate
  client?: {
    id: string
    fullName: string
    email: string
    kpi?: {
      points: number
      rank: string
    }
  }
  moderator?: {
    id: string
    fullName: string
    email: string
  }
  milestones?: any[]
  bids?: any[]
  selectedFreelancers?: any[]
  payments?: any[]
}

export default function ProjectStatusPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [filteredProjects, setFilteredProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    if (isAuthorized) {
      fetchProjects()
    }
  }, [isAuthorized, currentPage])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter])

  const fetchProjects = async () => {
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

      console.log("🔄 Fetching projects with token:", token.substring(0, 20) + "...")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/projects?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Projects data:", data)
        setProjects(data.data?.projects || [])
        setTotalPages(data.data?.pagination?.totalPages || 1)
        toast.success(`Loaded ${data.data?.projects?.length || 0} projects`)
      } else if (response.status === 401) {
        console.error("❌ Authentication failed - token may be expired")
        toast.error("Session expired. Please login again.")
        // Clear stored credentials
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch projects:", errorData)
        toast.error(`Failed to load projects: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.details.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.details.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.details.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(project => project.paymentStatus === statusFilter)
    }

    setFilteredProjects(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", icon: Clock },
      SUCCEEDED: { color: "bg-green-500", icon: CheckCircle },
      FAILED: { color: "bg-red-500", icon: XCircle },
      CANCELED: { color: "bg-gray-500", icon: XCircle },
      REFUNDED: { color: "bg-blue-500", icon: AlertCircle }
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

  const viewProjectDetails = (projectId: string) => {
    router.push(`/dashboard/Administrator/project-status/${projectId}`)
  }

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Project Status</h1>
          <p className="text-muted-foreground">Manage and monitor all projects</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/Administrator/project-status/create-project')}
          className="bg-[#003087] hover:bg-[#003087]/90"
        >
          Create New Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by company name, client name, or email..."
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
                <option value="PENDING">Pending</option>
                <option value="SUCCEEDED">Succeeded</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELED">Canceled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[#003087] text-white">
                        {project.details.companyName
                          ?.split(" ")
                          .map(word => word[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "CO"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#003087] line-clamp-1">
                        {project.details.companyName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {project.details.fullName}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(project.paymentStatus)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Project Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Business Type:</span>
                    <span className="font-medium">{project.details.businessType || "N/A"}</span>
                  </div>

                  {project.services?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Services:</span>
                      <Badge variant="outline" className="text-xs">
                        {project.services[0].name} {project.services.length > 1 && `+${project.services.length - 1}`}
                      </Badge>
                    </div>
                  )}

                  {project.industries?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Industry:</span>
                      <Badge variant="outline" className="text-xs">
                        {project.industries[0].category}
                      </Badge>
                    </div>
                  )}

                  {project.technologies?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Technology:</span>
                      <Badge variant="outline" className="text-xs">
                        {project.technologies[0].category}
                      </Badge>
                    </div>
                  )}

                  {project.timeline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium">{project.timeline.option}</span>
                    </div>
                  )}

                  {project.estimate && project.estimate.totalCost && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Estimate:</span>
                      <span className="font-medium">${project.estimate.totalCost.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {project.bids && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Bids:</span>
                      <Badge variant="secondary">{project.bids.length}</Badge>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => viewProjectDetails(project.id)}
                  className="w-full bg-[#003087] hover:bg-[#003087]/90"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "ALL" 
                ? "No projects match your current filters." 
                : "No projects have been created yet."}
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
            ) : (
              <Button
                onClick={() => router.push('/dashboard/Administrator/project-status/create-project')}
                className="bg-[#003087] hover:bg-[#003087]/90"
              >
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
    </div>
  )
}
