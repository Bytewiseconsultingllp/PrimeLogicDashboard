"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  User, Mail, MapPin, Clock, Briefcase, Award, Globe, Target, Users, DollarSign, 
  ArrowLeft, Edit, Save, Plus, Eye, MessageCircle, Star, TrendingUp, Calendar,
  ExternalLink, Settings, Trash2, RefreshCw, CheckCircle, XCircle
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { selectFreelancerForProject } from "@/lib/api/projects"

interface FreelancerProfile {
  id: string
  status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED"
  userId?: string
  createdAt: string
  updatedAt: string
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  details: {
    fullName: string
    email: string
    country: string
    timeZone: string
    primaryDomain: string
    professionalLinks?: string[]
    eliteSkillCards?: string[]
    tools?: string[]
    selectedIndustries?: string[]
    otherNote?: string
  }
  user?: {
    uid: string
    username: string
    email: string
    role: string
    kpiRankPoints: number
    kpiRank: string
    // Optional fields from alternate responses
    kpiPoints?: number
    kpi_score?: number
    rank?: string
    kpiLevel?: string
    kpiUpdatedAt?: string
    updatedAt?: string
  }
  assignedProjects?: Array<{
    id: string
    title: string
    status: string
    progress?: number
    client: {
      name: string
    }
  }>
  completedProjects?: Array<{
    id: string
    title: string
    completedAt: string
    client: {
      name: string
    }
  }>
  bids?: Array<{
    id: string
    bidAmount: number
    status: "PENDING" | "ACCEPTED" | "REJECTED"
    submittedAt?: string
    project?: { 
      id?: string; 
      title?: string; 
      name?: string; 
      projectName?: string; 
      slug?: string;
      client?: { name?: string }; 
      clientName?: string 
    }
  }>
}

interface Project {
  id: string
  title: string
  description: string
  status: string
  client: {
    name: string
  }
}

export default function FreelancerEditPage() {
  const params = useParams()
  const router = useRouter()
  const freelancerId = params.freelancerId as string

  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [kpiPoints, setKpiPoints] = useState("")
  const [kpiNote, setKpiNote] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [projectIdInput, setProjectIdInput] = useState("")
  const [kpiData, setKpiData] = useState<{points: number, rank: string, lastUpdated: string} | null>(null)
  const [isKpiLoading, setIsKpiLoading] = useState(false)
  const [viewBid, setViewBid] = useState<any | null>(null)

  // Helpers
  const getBidProjectTitle = (p?: { title?: string; name?: string; projectName?: string }) => {
    return p?.title || p?.name || p?.projectName || "Untitled Project"
  }

  const getBidClientName = (p?: { client?: { name?: string }; clientName?: string }) => {
    return p?.client?.name || p?.clientName || "-"
  }

  useEffect(() => {
    fetchFreelancerDetails()
    fetchAvailableProjects()
  }, [freelancerId])

  const fetchFreelancerDetails = async () => {
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        const payload = data.data || {}
        const assigned = payload.assignedProjects || payload.selectedProjects || payload.projectsAssigned || payload.projects || []
        setFreelancer({ ...payload, assignedProjects: assigned })
        
        // Set KPI data from freelancer data if available
        if (data.data?.user) {
          const u = data.data.user
          const points = (u.kpiRankPoints ?? u.kpiPoints ?? u.kpi_score ?? 0) as number
          const rank = (u.kpiRank ?? u.rank ?? u.kpiLevel ?? 'BRONZE') as string
          const lastUpdated = (u.kpiUpdatedAt ?? u.updatedAt ?? new Date().toISOString()) as string
          setKpiData({ points, rank, lastUpdated })
        }
      } else {
        toast.error("Failed to load freelancer details")
      }
    } catch (error) {
      console.error("Error fetching freelancer:", error)
      toast.error("Failed to load freelancer details")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchKpiData = async () => {
    try {
      setIsKpiLoading(true)
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        // If no token, try to use existing freelancer data
        if (freelancer?.user) {
          setKpiData({
            points: freelancer.user.kpiRankPoints || 0,
            rank: freelancer.user.kpiRank || 'BRONZE',
            lastUpdated: new Date().toISOString()
          })
        }
        return
      }

      // Try to fetch from dedicated KPI endpoint first
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/kpi`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (response.ok) {
          const data = await response.json()
          const kd = data.data ?? data
          const points = (kd?.kpiRankPoints ?? kd?.kpiPoints ?? kd?.kpi_score ?? 0) as number
          const rank = (kd?.kpiRank ?? kd?.rank ?? kd?.kpiLevel ?? 'BRONZE') as string
          const lastUpdated = (kd?.lastUpdated ?? kd?.updatedAt ?? new Date().toISOString()) as string
          setKpiData({ points, rank, lastUpdated })
          return
        }
      } catch (kpiError) {
        console.log("KPI endpoint not available, using freelancer data")
      }

      // Fallback: Fetch fresh freelancer data to get latest KPI info
      const freelancerResponse = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (freelancerResponse.ok) {
        const freelancerData = await freelancerResponse.json()
        if (freelancerData.data?.user) {
          const u = freelancerData.data.user
          const points = (u.kpiRankPoints ?? u.kpiPoints ?? u.kpi_score ?? 0) as number
          const rank = (u.kpiRank ?? u.rank ?? u.kpiLevel ?? 'BRONZE') as string
          const lastUpdated = (u.kpiUpdatedAt ?? u.updatedAt ?? new Date().toISOString()) as string
          setKpiData({ points, rank, lastUpdated })
        }
      } else {
        // Last fallback: use existing freelancer data
        if (freelancer?.user) {
          const u = freelancer.user
          const points = (u.kpiRankPoints ?? u.kpiPoints ?? u.kpi_score ?? 0) as number
          const rank = (u.kpiRank ?? u.rank ?? u.kpiLevel ?? 'BRONZE') as string
          const lastUpdated = (u.kpiUpdatedAt ?? u.updatedAt ?? new Date().toISOString()) as string
          setKpiData({ points, rank, lastUpdated })
        }
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error)
      // Final fallback to existing freelancer data
      if (freelancer?.user) {
        const u = freelancer.user
        const points = (u.kpiRankPoints ?? u.kpiPoints ?? u.kpi_score ?? 0) as number
        const rank = (u.kpiRank ?? u.rank ?? u.kpiLevel ?? 'BRONZE') as string
        const lastUpdated = (u.kpiUpdatedAt ?? u.updatedAt ?? new Date().toISOString()) as string
        setKpiData({ points, rank, lastUpdated })
      }
    } finally {
      setIsKpiLoading(false)
    }
  }

  // Fetch KPI data after freelancer data is loaded
  useEffect(() => {
    if (freelancer) {
      fetchKpiData()
    }
  }, [freelancer])

  const fetchAvailableProjects = async () => {
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/projects`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const updateKpiRank = async () => {
    if (!kpiPoints || !kpiNote) {
      toast.error("Please provide both points and note")
      return
    }

    setIsSaving(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/kpi`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          points: parseInt(kpiPoints),
          note: kpiNote
        })
      })

      if (response.ok) {
        toast.success("KPI updated successfully")
        setIsKpiDialogOpen(false)
        setKpiPoints("")
        setKpiNote("")
        fetchFreelancerDetails()
        fetchKpiData()
      } else {
        toast.error("Failed to update KPI")
      }
    } catch (error) {
      console.error("Error updating KPI:", error)
      toast.error("Failed to update KPI")
    } finally {
      setIsSaving(false)
    }
  }

  const assignProject = async () => {
    if (!projectIdInput.trim()) {
      toast.error("Please enter a project ID")
      return
    }

    setIsSaving(true)
    try {
      const projectSlug = projectIdInput.trim()
      const userName = freelancer?.user?.username || ""
      if (!userName) {
        toast.error("Freelancer username not available for assignment")
        return
      }

      const response = await selectFreelancerForProject(projectSlug, userName)

      if (response.status === 200) {
        toast.success("Project assigned successfully")
        setIsProjectDialogOpen(false)
        setProjectIdInput("")
        fetchFreelancerDetails()
      } else {
        toast.error("Failed to assign project")
      }
    } catch (error) {
      console.error("Error assigning project:", error)
      toast.error("Failed to assign project")
    } finally {
      setIsSaving(false)
    }
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
    return <Badge className={`${colors[rank as keyof typeof colors] || "bg-gray-500"} text-white`}>{rank}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#003087] mx-auto mb-4" />
          <p className="text-gray-600">Loading freelancer details...</p>
        </div>
      </div>
    )
  }

  if (!freelancer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Freelancer Not Found</h2>
          <p className="text-gray-600 mb-4">The requested freelancer could not be found.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003087] to-[#0066cc] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Avatar className="w-16 h-16 border-4 border-white/30">
                <AvatarFallback className="text-xl bg-white/20 text-white">
                  {freelancer.details.fullName
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase() || "FL"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{freelancer.details.fullName}</h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {freelancer.details.email}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {freelancer.details.primaryDomain}
                  </Badge>
                  {freelancer.user && getKPIBadge(freelancer.user.kpiRank)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Connect Discord
              </Button>
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <div className="mt-2">
                  <Label className="text-xs text-gray-500">Primary Domain</Label>
                  <div className="mt-1">
                    <Badge className="bg-[#003087] text-white px-3 py-1 text-sm">
                      {freelancer.details.primaryDomain}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{freelancer.details.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                      <p className="text-gray-900 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {freelancer.details.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Country</Label>
                      <p className="text-gray-900 flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {freelancer.details.country}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Timezone</Label>
                      <p className="text-gray-900 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {freelancer.details.timeZone}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">User ID</Label>
                      <p className="font-mono text-sm text-gray-600 mt-1">{freelancer.userId || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bids */}
            <Card className="border-l-4 border-l-fuchsia-500">
              <CardHeader className="bg-fuchsia-50">
                <CardTitle className="text-xl flex items-center gap-2 text-fuchsia-800">
                  <TrendingUp className="w-5 h-5" />
                  Bids
                  {freelancer.bids?.length ? (
                    <Badge variant="secondary" className="ml-2">{freelancer.bids.length}</Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {freelancer.bids?.length ? (
                  <div className="space-y-3">
                    {freelancer.bids.map((bid) => (
                      <div key={bid.id} className="p-4 rounded-lg border bg-white">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900 truncate max-w-[36ch]">{getBidProjectTitle(bid.project)}</h4>
                              <span className="text-xs text-gray-500">ID: {bid.project?.id || '-'}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Client: {getBidClientName(bid.project)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline">{bid.status}</Badge>
                              <Badge variant={bid.status === 'PENDING' ? 'default' : 'secondary'}>
                                {bid.status === 'PENDING' ? 'ACTIVE' : 'CLOSED'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-semibold text-gray-900">{'$'}{bid.bidAmount}</span>
                            <Button size="sm" variant="outline" onClick={() => setViewBid(bid)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No bids submitted</p>
                  </div>
                )}

                <Dialog open={!!viewBid} onOpenChange={(o) => !o && setViewBid(null)}>
                  <DialogContent className="max-w-2xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Bid Details</DialogTitle>
                        <DialogDescription className="text-fuchsia-100">Review the bid information for this project</DialogDescription>
                      </DialogHeader>
                    </div>
                    {viewBid && (
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded border">
                            <p className="text-xs text-muted-foreground">Project</p>
                            <p className="font-medium">{getBidProjectTitle(viewBid.project)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Project ID: {viewBid.project?.id || '-'}</p>
                            <p className="text-xs text-muted-foreground mt-1">Client: {getBidClientName(viewBid.project)}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded border">
                            <p className="text-xs text-muted-foreground">Bid</p>
                            <p className="font-medium">{'$'}{viewBid.bidAmount}</p>
                            <div className="mt-2 flex gap-2">
                              <Badge variant="outline">{viewBid.status}</Badge>
                              <Badge variant={viewBid.status === 'PENDING' ? 'default' : 'secondary'}>
                                {viewBid.status === 'PENDING' ? 'ACTIVE' : 'CLOSED'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded border">
                            <p className="text-xs text-muted-foreground">Bid Date</p>
                            <p className="font-medium">{viewBid.submittedAt ? new Date(viewBid.submittedAt).toLocaleDateString() : '-'}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded border">
                            <p className="text-xs text-muted-foreground">Bid Time</p>
                            <p className="font-medium">{viewBid.submittedAt ? new Date(viewBid.submittedAt).toLocaleTimeString() : '-'}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded border">
                          <p className="text-xs text-muted-foreground">Freelancer</p>
                          <p className="font-medium">{freelancer.details.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Freelancer ID: {freelancerId}</p>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Assigned Projects */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-xl flex items-center gap-2 text-green-800">
                  <Briefcase className="w-5 h-5" />
                  Assigned Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {freelancer.assignedProjects?.length ? (
                  <div className="space-y-3">
                    {freelancer.assignedProjects.map((project) => (
                      <div key={project.id} className="p-4 bg-blue-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{project.title}</h4>
                            <p className="text-sm text-gray-600">Client: {project.client?.name || (project as any)?.clientName || '-'}</p>
                            <Badge variant="outline" className="mt-1">{project.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        {project.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No projects assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - KPI & Actions */}
          <div className="space-y-8">
            {/* KPI Management */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-xl flex items-center justify-between text-purple-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    KPI Rank
                  </div>
                  <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Update KPI
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update KPI Rank</DialogTitle>
                        <DialogDescription>
                          Assign KPI points to this freelancer with a note explaining the reason
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>KPI Points</Label>
                          <Input
                            type="number"
                            value={kpiPoints}
                            onChange={(e) => setKpiPoints(e.target.value)}
                            placeholder="Enter points (positive or negative)"
                          />
                        </div>
                        <div>
                          <Label>Note</Label>
                          <Textarea
                            value={kpiNote}
                            onChange={(e) => setKpiNote(e.target.value)}
                            placeholder="Explain the reason for this KPI update..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsKpiDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={updateKpiRank} disabled={isSaving}>
                            {isSaving ? (
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Update KPI
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                {isKpiLoading ? (
                  <div className="space-y-4">
                    <RefreshCw className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
                    <p className="text-gray-500">Loading KPI data...</p>
                  </div>
                ) : kpiData ? (
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-purple-600">
                      {kpiData.points}
                    </div>
                    <div className="text-sm text-gray-500">Points</div>
                    {getKPIBadge(kpiData.rank)}
                    <Separator />
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(kpiData.lastUpdated).toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={fetchKpiData}
                      className="mt-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Award className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500">No KPI data available</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={fetchKpiData}
                      className="mt-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Load KPI Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {freelancer.details.eliteSkillCards?.length && (
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-xl flex items-center gap-2 text-orange-800">
                    <Star className="w-5 h-5" />
                    Elite Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {freelancer.details.eliteSkillCards.map((skill: string, index: number) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Links */}
            {freelancer.details.professionalLinks?.length && (
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="bg-indigo-50">
                  <CardTitle className="text-xl flex items-center gap-2 text-indigo-800">
                    <Globe className="w-5 h-5" />
                    Professional Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {freelancer.details.professionalLinks.map((link: string, index: number) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                        <span className="text-blue-600 hover:underline truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
