"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
  Briefcase,
  CreditCard,
  Hash,
  Shield,
  ExternalLink,
  MessageCircle,
  Activity,
  FileText,
  TrendingUp,
  Wallet
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface ClientProject {
  id: string
  details: {
    companyName: string
    fullName: string
  }
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  acceptingBids: boolean
  createdAt: string
  updatedAt: string
  estimate?: {
    totalCost: number
  }
  services?: Array<{
    name: string
  }>
}

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
  projects?: ClientProject[]
  totalProjectsCount?: number
  totalSpent?: number
}

export default function ClientDetailPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const params = useParams()
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId

  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 Debug - params:", params)
    console.log("🔍 Debug - clientId:", clientId)
    console.log("🔍 Debug - isAuthorized:", isAuthorized)
    
    if (isAuthorized && clientId) {
      fetchClientDetails()
    }
  }, [isAuthorized, clientId])

  const fetchClientDetails = async () => {
    if (!clientId) {
      console.error("❌ No clientId provided")
      toast.error("Invalid client ID")
      router.push('/dashboard/Administrator/client-profiles')
      return
    }

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

      console.log("🔄 Fetching client details for ID:", clientId)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/clients/${clientId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Client details:", data)
        setClient(data.data)
        toast.success("Client details loaded")
      } else if (response.status === 401) {
        console.error("❌ Authentication failed - token may be expired")
        toast.error("Session expired. Please login again.")
        // Clear stored credentials
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch client details:", errorData)
        toast.error("Failed to load client details")
        router.push('/dashboard/Administrator/client-profiles')
      }
    } catch (error) {
      console.error("Error fetching client details:", error)
      toast.error("Failed to load client details")
      router.push('/dashboard/Administrator/client-profiles')
    } finally {
      setLoading(false)
    }
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
        <p className="ml-3 text-muted-foreground">Loading client details...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested client could not be found.</p>
        <Button onClick={() => router.push('/dashboard/Administrator/client-profiles')}>
          Back to Clients
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/Administrator/client-profiles')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#003087]">{client.fullName}</h1>
          <p className="text-muted-foreground">Client Profile & Project History</p>
        </div>
        <Badge variant={client.isActive ? "default" : "secondary"}>
          {client.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Client Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-[#003087] text-white text-2xl">
                {client.fullName
                  ?.split(" ")
                  .map(word => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "CL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{client.fullName}</h3>
              <p className="text-muted-foreground text-lg">@{client.username}</p>
              <p className="text-muted-foreground">{client.email}</p>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{client.totalProjectsCount || 0}</span>
                  <span className="text-muted-foreground">Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">${(client.totalSpent || 0).toLocaleString()}</span>
                  <span className="text-muted-foreground">Total Spent</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Account Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined: {new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Last Updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span>Email Verified: {client.emailVerifiedAt ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Client Projects
              {client.projects && (
                <Badge variant="secondary">{client.projects.length}</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.projects && client.projects.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{project.details.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            by {project.details.fullName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.services && project.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {project.services.slice(0, 2).map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service.name}
                              </Badge>
                            ))}
                            {project.services.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.services.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No services</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {project.estimate && project.estimate.totalCost ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">
                              ${project.estimate.totalCost.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No estimate</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(project.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewProjectDetails(project.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground">
                This client hasn't created any projects yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
