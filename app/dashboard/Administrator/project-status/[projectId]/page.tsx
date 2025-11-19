"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  CreditCard,
  Save
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

  // Edit milestone state
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null)
  const [msTitle, setMsTitle] = useState("")
  const [msDescription, setMsDescription] = useState("")
  const [msDueDate, setMsDueDate] = useState("")
  const [msProgress, setMsProgress] = useState<string | number>("")
  const [savingMilestone, setSavingMilestone] = useState(false)

  // Create single milestone state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createDueDate, setCreateDueDate] = useState("")
  const [creatingMilestone, setCreatingMilestone] = useState(false)

  // Create multiple milestones state
  const [isMultiDialogOpen, setIsMultiDialogOpen] = useState(false)
  const [multiMilestones, setMultiMilestones] = useState<{ title: string; description: string; dueDate: string }[]>([
    { title: "", description: "", dueDate: "" },
  ])
  const [creatingMultiple, setCreatingMultiple] = useState(false)
  const [paymentStatusData, setPaymentStatusData] = useState<{status: string, amount: number, currency: string} | null>(null)
  const [viewPayment, setViewPayment] = useState<any | null>(null)
  const [bids, setBids] = useState<any[]>([])
  const [bidsLoading, setBidsLoading] = useState(false)
  const [viewBid, setViewBid] = useState<any | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewReason, setReviewReason] = useState("")

  useEffect(() => {
    if (isAuthorized && projectId) {
      fetchProjectDetails()
    }
  }, [isAuthorized, projectId])

  useEffect(() => {
    if (isAuthorized && projectId) {
      fetchPaymentStatus()
    }
  }, [isAuthorized, projectId])

  useEffect(() => {
    if (isAuthorized && projectId) {
      fetchBids()
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

  const resetCreateState = () => {
    setCreateTitle("")
    setCreateDescription("")
    setCreateDueDate("")
  }

  const openMilestoneDialog = (milestone: any | null) => {
    setEditingMilestone(milestone)
    setMsTitle(milestone?.milestoneName || "")
    setMsDescription(milestone?.description || "")
    const dateStr = milestone?.deadline ? new Date(milestone.deadline).toISOString().slice(0, 10) : ""
    setMsDueDate(dateStr)
    setMsProgress(typeof milestone?.progress === "number" ? milestone.progress : "")
    setIsMilestoneDialogOpen(true)
  }

  const saveMilestoneUpdates = async () => {
    if (!editingMilestone) return
    setSavingMilestone(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const basicPayload: any = {}
      if (msTitle) basicPayload.title = msTitle
      if (msDescription) basicPayload.description = msDescription
      if (msDueDate) basicPayload.dueDate = msDueDate

      if (Object.keys(basicPayload).length > 0) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/milestone/updateMilestone/${editingMilestone.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basicPayload),
        })
        if (!res.ok) {
          const msg = await res.text()
          throw new Error(msg || "Failed to update milestone details")
        }
      }

      if (msProgress !== "" && !Number.isNaN(Number(msProgress))) {
        const res2 = await fetch(`${process.env.NEXT_PUBLIC_PLS}/milestone/updateMilestoneProgress/${editingMilestone.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ progress: Number(msProgress) }),
        })
        if (!res2.ok) {
          const msg = await res2.text()
          throw new Error(msg || "Failed to update milestone progress")
        }
      }

      toast.success("Milestone updated")
      setIsMilestoneDialogOpen(false)
      setEditingMilestone(null)
      await fetchProjectDetails()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to update milestone")
    } finally {
      setSavingMilestone(false)
    }
  }

  const createMilestone = async () => {
    if (!createTitle || !createDescription || !createDueDate) {
      toast.error("Please fill in title, description and due date")
      return
    }
    setCreatingMilestone(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/milestone/createMilestone/${projectId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: createTitle,
          description: createDescription,
          dueDate: createDueDate,
        }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to create milestone")
      }

      toast.success("Milestone created")
      setIsCreateDialogOpen(false)
      resetCreateState()
      await fetchProjectDetails()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to create milestone")
    } finally {
      setCreatingMilestone(false)
    }
  }

  const addMultiRow = () => {
    setMultiMilestones((prev) => [...prev, { title: "", description: "", dueDate: "" }])
  }

  const updateMultiRow = (index: number, field: "title" | "description" | "dueDate", value: string) => {
    setMultiMilestones((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeMultiRow = (index: number) => {
    setMultiMilestones((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))
  }

  const createMultipleMilestones = async () => {
    const payload = multiMilestones.filter(m => m.title && m.description && m.dueDate)
    if (!payload.length) {
      toast.error("Please add at least one complete milestone row")
      return
    }
    setCreatingMultiple(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/milestone/createMultipleMilestones/${projectId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ milestones: payload }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to create milestones")
      }

      toast.success("Milestones created")
      setIsMultiDialogOpen(false)
      setMultiMilestones([{ title: "", description: "", dueDate: "" }])
      await fetchProjectDetails()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to create milestones")
    } finally {
      setCreatingMultiple(false)
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    if (!window.confirm("Delete this milestone? This action cannot be undone.")) return
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/milestone/deleteMilestone/${milestoneId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to delete milestone")
      }

      toast.success("Milestone deleted")
      await fetchProjectDetails()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to delete milestone")
    }
  }

  const completeMilestone = async (milestoneId: string) => {
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/milestone/completeMilestone/${milestoneId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to complete milestone")
      }

      toast.success("Milestone marked as completed")
      await fetchProjectDetails()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to complete milestone")
    }
  }

  const fetchPaymentStatus = async () => {
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/payment/project/${projectId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        const data = await res.json()
        setPaymentStatusData(data?.data || null)
      }
    } catch (e) {
      console.warn("Failed to fetch payment status", e)
    }
  }

  const fetchBids = async () => {
    setBidsLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) return
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/projects/${projectId}/bids`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        const data = await res.json()
        setBids(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (e) {
      console.warn("Failed to fetch bids", e)
    } finally {
      setBidsLoading(false)
    }
  }

  const reviewBid = async (action: "ACCEPT" | "REJECT") => {
    if (!viewBid?.id) return
    if (action === "REJECT" && !reviewReason.trim()) {
      toast.error("Please provide a reason to reject the bid")
      return
    }
    setReviewLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/bids/${viewBid.id}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...(action === "REJECT" ? { reason: reviewReason.trim() } : {}) })
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to review bid")
      }
      toast.success(action === "ACCEPT" ? "Bid accepted" : "Bid rejected")
      setViewBid(null)
      setReviewReason("")
      fetchBids()
      fetchProjectDetails()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || "Failed to review bid")
    } finally {
      setReviewLoading(false)
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
              {/* Project ID */}
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs text-muted-foreground">Project ID</p>
                <p className="font-mono text-sm">{project.id}</p>
              </div>
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
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Milestones
                {project.milestones && (
                  <Badge variant="secondary">{project.milestones.length}</Badge>
                )}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetCreateState()
                    setIsCreateDialogOpen(true)
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMultiMilestones([{ title: "", description: "", dueDate: "" }])
                    setIsMultiDialogOpen(true)
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add Multiple
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{milestone.milestoneName}</h4>
                          <Badge variant={milestone.isMilestoneCompleted ? "default" : "secondary"}>
                            {milestone.isMilestoneCompleted ? "COMPLETED" : milestone.status || "PENDING"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                          {!milestone.isMilestoneCompleted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeMilestone(milestone.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMilestoneDialog(milestone)}
                          >
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => deleteMilestone(milestone.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {milestone.deadline && (
                          <span>
                            Due: {new Date(milestone.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {typeof milestone.progress === "number" && (
                          <span>Progress: {milestone.progress}%</span>
                        )}
                        {milestone.assignedFreelancer && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span>
                              {milestone.assignedFreelancer.fullName || milestone.assignedFreelancer.name}
                            </span>
                          </span>
                        )}
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

              {/* Edit milestone dialog */}
              <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
                <DialogContent className="max-w-lg">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Update Milestone</DialogTitle>
                      <DialogDescription className="text-blue-100">
                        Edit details and progress, then save changes
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  {editingMilestone ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={msTitle}
                          onChange={(e) => setMsTitle(e.target.value)}
                          placeholder="Milestone title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={msDescription}
                          onChange={(e) => setMsDescription(e.target.value)}
                          placeholder="Describe the milestone"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={msDueDate}
                            onChange={(e) => setMsDueDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Progress (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={msProgress}
                            onChange={(e) => setMsProgress(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsMilestoneDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={saveMilestoneUpdates} disabled={savingMilestone}>
                          {savingMilestone ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Select a milestone to edit
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Create single milestone dialog */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-lg">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Create Milestone</DialogTitle>
                      <DialogDescription className="text-emerald-100">
                        Add a new milestone for this project
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        placeholder="Milestone title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={createDescription}
                        onChange={(e) => setCreateDescription(e.target.value)}
                        placeholder="Describe the milestone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={createDueDate}
                        onChange={(e) => setCreateDueDate(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false)
                          resetCreateState()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createMilestone} disabled={creatingMilestone}>
                        {creatingMilestone ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Create multiple milestones dialog */}
              <Dialog open={isMultiDialogOpen} onOpenChange={setIsMultiDialogOpen}>
                <DialogContent className="max-w-3xl">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white -m-6 mb-6 p-6 rounded-t-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Create Multiple Milestones</DialogTitle>
                      <DialogDescription className="text-indigo-100">
                        Add several milestones at once. Each row represents one milestone.
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {multiMilestones.map((ms, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1.2fr_auto] gap-3 items-end"
                      >
                        <div className="space-y-1">
                          <Label>Title</Label>
                          <Input
                            value={ms.title}
                            onChange={(e) => updateMultiRow(index, "title", e.target.value)}
                            placeholder="Design Phase"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Description</Label>
                          <Input
                            value={ms.description}
                            onChange={(e) => updateMultiRow(index, "description", e.target.value)}
                            placeholder="Short description"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={ms.dueDate}
                            onChange={(e) => updateMultiRow(index, "dueDate", e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-end pb-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => removeMultiRow(index)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm" onClick={addMultiRow}>
                        + Add Row
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsMultiDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createMultipleMilestones}
                          disabled={creatingMultiple}
                        >
                          {creatingMultiple ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Create Milestones
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Payment Status</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold">{paymentStatusData?.amount ? `$${paymentStatusData.amount.toLocaleString()}` : '--'}</span>
                      <span className="text-sm text-muted-foreground">{paymentStatusData?.currency?.toUpperCase() || ''}</span>
                    </div>
                  </div>
                  <div>
                    {paymentStatusData?.status && (
                      <Badge className="px-3 py-1">{paymentStatusData.status}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {project.payments && project.payments.length > 0 ? (
                <div className="space-y-3">
                  {project.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium">{'$'}{payment.amount}</p>
                        <p className="text-xs text-muted-foreground">ID: {payment.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={payment.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setViewPayment(payment)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No payment records found</p>
                </div>
              )}

              <Dialog open={!!viewPayment} onOpenChange={(o) => !o && setViewPayment(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                    <DialogDescription>All recorded fields for this payment</DialogDescription>
                  </DialogHeader>
                  {viewPayment && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Payment ID</span><span className="font-medium">{viewPayment.id}</span></div>
                      {'currency' in viewPayment && <div className="flex items-center justify-between"><span className="text-muted-foreground">Currency</span><span className="font-medium">{String(viewPayment.currency).toUpperCase()}</span></div>}
                      {'amount' in viewPayment && <div className="flex items-center justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{'$'}{viewPayment.amount}</span></div>}
                      {'status' in viewPayment && <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{viewPayment.status}</span></div>}
                      {'createdAt' in viewPayment && <div className="flex items-center justify-between"><span className="text-muted-foreground">Created</span><span className="font-medium">{new Date(viewPayment.createdAt).toLocaleString()}</span></div>}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Bids */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Project Bids {bids && bids.length > 0 && <Badge variant="secondary">{bids.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidsLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading bids...
                </div>
              ) : bids && bids.length > 0 ? (
                <div className="space-y-3">
                  {bids.map((bid: any) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold">{'$'}{bid.bidAmount}</span>
                          {bid.status && <Badge variant={bid.status === 'ACCEPTED' ? 'default' : 'secondary'}>{bid.status}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">by {bid.freelancer?.fullName || 'Unknown'} {bid.submittedAt && `• ${new Date(bid.submittedAt).toLocaleString()}`}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewBid(bid)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No bids for this project</p>
                </div>
              )}

              <Dialog open={!!viewBid} onOpenChange={(o) => !o && setViewBid(null)}>
                <DialogContent className="max-w-xl overflow-hidden p-0">
                  <div className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white p-6">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Bid Details</DialogTitle>
                      <DialogDescription className="text-fuchsia-100">Review bid information and freelancer profile</DialogDescription>
                    </DialogHeader>
                  </div>
                  {viewBid && (
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border bg-gray-50">
                          <p className="text-xs text-muted-foreground">Bid Amount</p>
                          <p className="text-lg font-semibold">{'$'}{viewBid.bidAmount}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-50">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-lg font-semibold">{viewBid.status}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-50">
                          <p className="text-xs text-muted-foreground">Bid Time</p>
                          <p className="text-lg font-semibold">{viewBid.submittedAt ? new Date(viewBid.submittedAt).toLocaleTimeString() : '-'}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-gray-50">
                          <p className="text-xs text-muted-foreground">Bid Date</p>
                          <p className="text-lg font-semibold">{viewBid.submittedAt ? new Date(viewBid.submittedAt).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Project Name</p>
                          <p className="font-medium">{project.details.companyName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Project ID: {project.id}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Freelancer</p>
                          <p className="font-medium">{viewBid.freelancer?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground mt-1">Freelancer ID: {viewBid.freelancer?.id || '-'}</p>
                          {viewBid.freelancer?.id && (
                            <Button size="sm" className="mt-2" onClick={() => router.push(`/dashboard/Administrator/freelancer-profiles/${viewBid.freelancer.id}`)}>
                              View Freelancer
                            </Button>
                          )}
                        </div>
                      </div>

                      {viewBid.proposalText && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Proposal</p>
                          <div className="p-3 rounded-lg border bg-white text-sm whitespace-pre-wrap">
                            {viewBid.proposalText}
                          </div>
                        </div>
                      )}

                      <Separator />
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label>Reason (required for reject)</Label>
                          <Input value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} placeholder="Add an optional note or a required reason when rejecting" />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setViewBid(null)}>Close</Button>
                          <Button variant="destructive" disabled={reviewLoading} onClick={() => reviewBid("REJECT")}>
                            {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Reject
                          </Button>
                          <Button disabled={reviewLoading} onClick={() => reviewBid("ACCEPT")}>
                            {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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
