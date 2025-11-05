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

interface ClientPayment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
  projectId?: string
  project?: {
    details: {
      companyName: string
    }
  }
}

interface ClientProfile {
  id: string
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
  profilePicture?: string
  projects?: ClientProject[]
  payments?: ClientPayment[]
  totalProjectsCount?: number
  totalSpent?: number
  discordId?: string
  discordUsername?: string
}

export default function ClientDetailPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const params = useParams()
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId

  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectingDiscord, setConnectingDiscord] = useState(false)

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
        toast.error("Authentication required")
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

  const handleDiscordConnect = async () => {
    if (!client) return

    setConnectingDiscord(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      // This would typically redirect to Discord OAuth or open a modal
      // For now, we'll show a placeholder message
      toast.info("Discord integration feature coming soon!")
      
      // Example API call for Discord integration:
      // const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/clients/${client.id}/discord/connect`, {
      //   method: 'POST',
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json"
      //   }
      // })

    } catch (error) {
      console.error("Error connecting Discord:", error)
      toast.error("Failed to connect Discord")
    } finally {
      setConnectingDiscord(false)
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
          <p className="text-muted-foreground">Complete Client Profile & Activity Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={client.isActive ? "default" : "secondary"}>
            {client.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline" className="font-mono">
            ID: {client.uid}
          </Badge>
        </div>
      </div>

      {/* Client Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Client Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              {client.profilePicture ? (
                <AvatarImage src={client.profilePicture} alt={client.fullName} />
              ) : (
                <AvatarFallback className="bg-[#003087] text-white text-3xl">
                  {client.fullName
                    ?.split(" ")
                    .map(word => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "CL"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{client.fullName}</h3>
              <p className="text-muted-foreground text-lg">@{client.username}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">Client ID: {client.uid}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Role: {client.role}</span>
                </div>
              </div>
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
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Account Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(client.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email Verification</p>
                    <Badge variant={client.emailVerifiedAt ? "default" : "secondary"}>
                      {client.emailVerifiedAt ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discord Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Discord Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5865F2] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Discord Connection</h4>
                <p className="text-muted-foreground">
                  {client.discordUsername 
                    ? `Connected as ${client.discordUsername}` 
                    : "Connect client to Discord for better communication"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDiscordConnect}
              disabled={connectingDiscord}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              {connectingDiscord ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              {client.discordUsername ? "Update Discord" : "Connect Discord"}
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/Administrator/project-status')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Projects
            </Button>
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

      {/* Payments Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment History
              {client.payments && (
                <Badge variant="secondary">{client.payments.length}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                ${(client.totalSpent || 0).toLocaleString()} Total
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.payments && client.payments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {payment.id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {payment.project?.details?.companyName || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Project ID: {payment.projectId?.slice(0, 8) || "N/A"}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">
                            {payment.amount.toLocaleString()} {payment.currency?.toUpperCase() || 'USD'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.paymentMethod || "Card"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
              <p className="text-muted-foreground">
                This client hasn't made any payments yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
