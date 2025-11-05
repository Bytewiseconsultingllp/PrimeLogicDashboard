"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  Edit,
  Github,
  MessageSquare,
  Award,
  Briefcase,
  Target,
  CreditCard
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

interface AdminProject {
  id: string
  createdAt: string
  updatedAt: string
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  acceptingBids: boolean
  discordChatUrl?: string
  githubRepoUrl?: string
  details: ProjectDetails
  services?: any[]
  industries?: any[]
  technologies?: any[]
  features?: any[]
  discount?: any
  timeline?: any
  estimate?: any
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

export default function ProjectDetailPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<AdminProject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthorized && projectId) {
      fetchProjectDetails()
    }
  }, [isAuthorized, projectId])

  const fetchProjectDetails = async () => {
    setLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/projects/${projectId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Project details:", data)
        setProject(data.data)
        toast.success("Project details loaded")
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch project details:", errorData)
        toast.error("Failed to load project details")
        router.push('/dashboard/Administrator/project-status')
      }
    } catch (error) {
      console.error("Error fetching project details:", error)
      toast.error("Failed to load project details")
      router.push('/dashboard/Administrator/project-status')
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
        <p className="ml-3 text-muted-foreground">Loading project details...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
        <Button onClick={() => router.push('/dashboard/Administrator/project-status')}>
          Back to Projects
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
          onClick={() => router.push('/dashboard/Administrator/project-status')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#003087]">{project.details.companyName}</h1>
          <p className="text-muted-foreground">Project Details & Management</p>
        </div>
        {getStatusBadge(project.paymentStatus)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => project.client && router.push(`/dashboard/Administrator/client-profiles/${project.client.id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[#003087] text-white text-lg">
                    {project.details.fullName
                      ?.split(" ")
                      .map(word => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "CL"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{project.details.fullName}</h3>
                  <p className="text-muted-foreground">{project.details.businessEmail}</p>
                  {project.client?.kpi && (
                    <div className="flex items-center gap-2 mt-2">
                      {getKPIBadge(project.client.kpi.rank)}
                      <span className="text-sm text-muted-foreground">
                        {project.client.kpi.points} KPI Points
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{project.details.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{project.details.companyName}</span>
                  </div>
                  {project.details.companyWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={project.details.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {project.details.companyWebsite}
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {project.details.businessAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{project.details.businessAddress}</span>
                    </div>
                  )}
                  {project.details.businessType && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{project.details.businessType}</span>
                    </div>
                  )}
                  {project.details.referralSource && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Found via: {project.details.referralSource}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Freelancer */}
              {project.selectedFreelancers && project.selectedFreelancers.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Assigned Freelancer</h4>
                    {project.selectedFreelancers.map((freelancer: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {freelancer.fullName
                                ?.split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .toUpperCase() || "FL"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{freelancer.fullName}</p>
                            <p className="text-sm text-muted-foreground">{freelancer.email}</p>
                            {freelancer.kpi && (
                              <div className="flex items-center gap-2 mt-1">
                                {getKPIBadge(freelancer.kpi.rank)}
                                <span className="text-xs text-muted-foreground">
                                  {freelancer.kpi.points} pts
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/Administrator/freelancer-profiles/${freelancer.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Services */}
              {project.services && project.services.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Services Required</h4>
                  <div className="space-y-2">
                    {project.services.map((service: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{service.name}</p>
                        {service.childServices && service.childServices.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.childServices.map((child: string, childIndex: number) => (
                              <Badge key={childIndex} variant="secondary" className="text-xs">
                                {child}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industries */}
              {project.industries && project.industries.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Target Industries</h4>
                  <div className="space-y-2">
                    {project.industries.map((industry: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{industry.category}</p>
                        {industry.subIndustries && industry.subIndustries.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {industry.subIndustries.map((sub: string, subIndex: number) => (
                              <Badge key={subIndex} variant="secondary" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Technologies</h4>
                  <div className="space-y-2">
                    {project.technologies.map((tech: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{tech.category}</p>
                        {tech.technologies && tech.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tech.technologies.map((technology: string, techIndex: number) => (
                              <Badge key={techIndex} variant="secondary" className="text-xs">
                                {technology}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Required Features</h4>
                  <div className="space-y-2">
                    {project.features.map((feature: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{feature.category}</p>
                        {feature.features && feature.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {feature.features.map((feat: string, featIndex: number) => (
                              <Badge key={featIndex} variant="secondary" className="text-xs">
                                {feat}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline & Estimate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.timeline && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Timeline</h4>
                    </div>
                    <p className="text-blue-800">{project.timeline.option}</p>
                    {project.timeline.estimatedDuration && (
                      <p className="text-sm text-blue-600 mt-1">
                        Duration: {project.timeline.estimatedDuration}
                      </p>
                    )}
                  </div>
                )}

                {project.estimate && project.estimate.totalCost && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-green-900">Estimate</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-800">
                      ${project.estimate.totalCost.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Discount */}
              {project.discount && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">Discount Applied</h4>
                  </div>
                  <p className="text-orange-800">
                    {project.discount.type}: {project.discount.value}
                    {project.discount.type === 'PERCENTAGE' ? '%' : '$'} off
                  </p>
                  {project.discount.description && (
                    <p className="text-sm text-orange-600 mt-1">{project.discount.description}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Milestones
                {project.milestones && (
                  <Badge variant="secondary">{project.milestones.length}</Badge>
                )}
              </CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Update
              </Button>
            </CardHeader>
            <CardContent>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <Badge variant={milestone.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        <span>Budget: ${milestone.budget}</span>
                        {milestone.progress && <span>Progress: {milestone.progress}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No milestones created yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.payments && project.payments.length > 0 ? (
                <div className="space-y-3">
                  {project.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">${payment.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={payment.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No payment records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Quick Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => project.githubRepoUrl ? window.open(project.githubRepoUrl, '_blank') : toast.info("No GitHub repository connected")}
              >
                <Github className="w-4 h-4 mr-2" />
                Connect to GitHub
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => project.discordChatUrl ? window.open(project.discordChatUrl, '_blank') : toast.info("No Discord server connected")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Connect to Discord
              </Button>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accepting Bids</span>
                <Badge variant={project.acceptingBids ? "default" : "secondary"}>
                  {project.acceptingBids ? "Yes" : "No"}
                </Badge>
              </div>
              {project.bids && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Bids</span>
                  <Badge variant="secondary">{project.bids.length}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moderator Info */}
          {project.moderator && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Moderator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {project.moderator.fullName
                        ?.split(" ")
                        .map(word => word[0])
                        .join("")
                        .toUpperCase() || "MO"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.moderator.fullName}</p>
                    <p className="text-sm text-muted-foreground">{project.moderator.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
