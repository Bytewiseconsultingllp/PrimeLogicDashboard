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
  kpi?: {
    points: number
    rank: string
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

  // Payout & payment state
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null)
  const [stripeAccount, setStripeAccount] = useState<any | null>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [isPayoutLoading, setIsPayoutLoading] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [payoutCurrency, setPayoutCurrency] = useState("usd")
  const [payoutType, setPayoutType] = useState<"MILESTONE" | "PROJECT" | "BONUS" | "MANUAL">("MILESTONE")
  const [payoutDescription, setPayoutDescription] = useState("")
  const [payoutNotes, setPayoutNotes] = useState("")
  const [payoutProjectId, setPayoutProjectId] = useState("")
  const [payoutMilestoneId, setPayoutMilestoneId] = useState("")

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

        // Build KPI object same way as AllFreelancers list (from user KPI fields)
        const user = payload.user
        console.log("User data:", user);
        const kpi = user
          ? {
              points: user.kpiRankPoints || 0,
              rank: user.kpiRank || "BRONZE",
            }
          : undefined

        setFreelancer({ ...payload, assignedProjects: assigned, kpi })
        
        // Initialize KPI data used by KPI card from the same source
        if (kpi) {
          setKpiData({
            points: kpi.points,
            rank: kpi.rank,
            lastUpdated: (user?.kpiUpdatedAt ?? user?.updatedAt ?? new Date().toISOString()) as string,
          })
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

  // Fetch KPI & payout data after freelancer data is loaded
  useEffect(() => {
    if (freelancer) {
      fetchKpiData()
      fetchPaymentDetails()
      fetchPayoutHistory()
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

  const fetchPaymentDetails = async () => {
    try {
      setIsPaymentLoading(true)
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) return

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/payment-details`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        const d = data.data || {}
        setPaymentDetails(d.freelancer || d)
        setStripeAccount(d.stripeAccountDetails || null)
      }
    } catch (error) {
      console.warn("Error fetching payment details", error)
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const fetchPayoutHistory = async () => {
    try {
      setIsPayoutLoading(true)
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) return

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/payouts?page=1&limit=5`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        const d = data.data || {}
        setPayouts(Array.isArray(d.payouts) ? d.payouts : [])
      }
    } catch (error) {
      console.warn("Error fetching payout history", error)
    } finally {
      setIsPayoutLoading(false)
    }
  }

  const initiatePayout = async () => {
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      toast.error("Enter a valid payout amount")
      return
    }

    setIsSaving(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const body: any = {
        amount: Number(payoutAmount),
        currency: payoutCurrency,
        payoutType,
      }
      if (payoutDescription) body.description = payoutDescription
      if (payoutNotes) body.notes = payoutNotes
      if (payoutProjectId) body.projectId = payoutProjectId
      if (payoutMilestoneId) body.milestoneId = payoutMilestoneId

      const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/payout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to initiate payout")
      }

      toast.success("Payout initiated successfully")
      setPayoutAmount("")
      setPayoutDescription("")
      setPayoutNotes("")
      setPayoutProjectId("")
      setPayoutMilestoneId("")
      fetchPayoutHistory()
    } catch (error: any) {
      console.error("Error initiating payout", error)
      toast.error(error?.message || "Failed to initiate payout")
    } finally {
      setIsSaving(false)
    }
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
 console.log("Freelancer data:", freelancer);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003087] to-[#ff6b35] text-white">
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
                  {freelancer.kpi && (
                    <div className="flex items-center gap-2">
                      {getKPIBadge(freelancer.kpi.rank)}
                      <span className="text-xs text-blue-100">
                        {freelancer.kpi.points} pts
                      </span>
                    </div>
                  )}
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
            <Card className="border-l-4 border-l-[#003087]">
              <CardHeader className="bg-[#003087]/5">
                <CardTitle className="text-xl flex items-center gap-2 text-[#003087]">
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
            <Card className="border-l-4 border-l-[#003087]">
              <CardHeader className="bg-[#003087]/5">
                <CardTitle className="text-xl flex items-center gap-2 text-[#003087]">
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
                    <div className="bg-gradient-to-r from-[#003087] to-[#ff6b35] text-white p-6">
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
            <Card className="border-l-4 border-l-[#003087]">
              <CardHeader className="bg-[#003087]/5">
                <CardTitle className="text-xl flex items-center gap-2 text-[#003087]">
                  <Briefcase className="w-5 h-5" />
                  Assigned Projects
                  {freelancer.assignedProjects?.length ? (
                    <Badge variant="secondary" className="ml-2">
                      {freelancer.assignedProjects.length}
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {freelancer.assignedProjects?.length ? (
                  <div className="space-y-3">
                    {freelancer.assignedProjects.map((project) => {
                      const anyProj: any = project as any
                      const title = anyProj.details?.companyName || project.title || anyProj.name || "Untitled Project"
                      const clientName = project.client?.name || anyProj.clientName || anyProj.details?.clientName || "-"
                      const status = project.status || anyProj.projectStatus || anyProj.status || "-"
                      return (
                        <div key={project.id} className="p-4 bg-[#003087]/5 rounded-lg border border-[#003087]/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 truncate max-w-[30ch]">{title}</h4>
                              <p className="text-xs text-gray-500 break-all mt-1">ID: {project.id}</p>
                              <p className="text-sm text-gray-600 mt-1">Client: {clientName}</p>
                              <Badge variant="outline" className="mt-1 text-xs border-[#003087] text-[#003087] bg-white">{status}</Badge>
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
                                <div className="bg-[#003087] h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No projects assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments & Payouts */}
            <Card className="border-l-4 border-l-[#ff6b35] shadow-md">
              <CardHeader className="bg-gradient-to-r from-[#003087] to-[#ff6b35] text-white">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Freelancer Payments
                  </div>
                  {paymentDetails?.stripeAccountStatus && (
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      {paymentDetails.stripeAccountStatus}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Stripe Account Details - Top Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Stripe Account Details
                  </h3>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Stripe Account ID</p>
                        <p className="text-sm font-medium text-gray-900 break-all">
                          {paymentDetails?.stripeAccountId || "Not connected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            paymentDetails?.stripeAccountStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm font-medium">
                            {paymentDetails?.stripeAccountStatus?.toUpperCase() || 'INACTIVE'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Charges</p>
                        <Badge variant={stripeAccount?.chargesEnabled ? 'default' : 'secondary'} className="text-xs">
                          {stripeAccount?.chargesEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payouts</p>
                        <Badge variant={stripeAccount?.payoutsEnabled ? 'default' : 'secondary'} className="text-xs">
                          {stripeAccount?.payoutsEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                    {stripeAccount?.detailsSubmitted !== undefined && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Verification</p>
                        <div className="flex items-center gap-2">
                          {stripeAccount.detailsSubmitted ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-xs">
                            {stripeAccount.detailsSubmitted 
                              ? 'KYC details submitted and verified' 
                              : 'KYC details pending submission'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Initiate Payout - Middle Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Initiate Payout
                  </h3>
                  <div className="p-4 rounded-lg bg-white border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">Amount (USD)</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="mt-1 h-9"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Payout Type</Label>
                        <Select
                          value={payoutType}
                          onValueChange={(v) => setPayoutType(v as any)}
                        >
                          <SelectTrigger className="mt-1 h-9 text-xs">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MILESTONE">Milestone</SelectItem>
                            <SelectItem value="PROJECT">Project</SelectItem>
                            <SelectItem value="BONUS">Bonus</SelectItem>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Project ID (optional)</Label>
                        <Input
                          value={payoutProjectId}
                          onChange={(e) => setPayoutProjectId(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          placeholder="Project UUID"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Milestone ID (optional)</Label>
                        <Input
                          value={payoutMilestoneId}
                          onChange={(e) => setPayoutMilestoneId(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          placeholder="Milestone UUID"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Description</Label>
                        <Input
                          value={payoutDescription}
                          onChange={(e) => setPayoutDescription(e.target.value)}
                          className="mt-1 h-9 text-sm"
                          placeholder="Payment for milestone completion"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Admin Notes</Label>
                        <Textarea
                          rows={2}
                          className="mt-1 text-sm"
                          value={payoutNotes}
                          onChange={(e) => setPayoutNotes(e.target.value)}
                          placeholder="Internal notes (optional)"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-3">
                      <Button
                        size="sm"
                        className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white"
                        onClick={initiatePayout}
                        disabled={isSaving || !stripeAccount?.payoutsEnabled}
                      >
                        {isSaving ? (
                          <RefreshCw className="w-3 h-3 animate-spin mr-2" />
                        ) : (
                          <DollarSign className="w-3 h-3 mr-2" />
                        )}
                        {stripeAccount?.payoutsEnabled ? 'Send Payout' : 'Payouts Disabled'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Payout History - Bottom Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Payouts
                    </h3>
                    {isPayoutLoading && (
                      <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
                    )}
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    {payouts.length > 0 ? (
                      <div className="divide-y">
                        {payouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    ${parseFloat(payout.amount).toFixed(2)} {payout.currency?.toUpperCase?.() || "USD"}
                                  </span>
                                  <Badge
                                    variant={payout.status === "PAID" ? "default" : "secondary"}
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    {payout.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {payout.payoutType} • {payout.description || "No description"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {payout.createdAt ? new Date(payout.createdAt).toLocaleString() : ""}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            {payout.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                {payout.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <p>No payouts recorded yet.</p>
                        <p className="text-xs mt-1">Initiate a payout to see it here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - KPI & Actions */}
          <div className="space-y-8">
            {/* KPI Management */}
            <Card className="border-l-4 border-l-[#003087]">
              <CardHeader className="bg-[#003087]/5">
                <CardTitle className="text-xl flex items-center justify-between text-[#003087]">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    KPI Rank
                  </div>
                  <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-[#003087] hover:bg-[#003087]/90 text-white">
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
                    <RefreshCw className="w-8 h-8 text-[#003087] mx-auto animate-spin" />
                    <p className="text-gray-500">Loading KPI data...</p>
                  </div>
                ) : kpiData || freelancer.user ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">KPI Points</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {kpiData?.points || freelancer.user?.kpiRankPoints || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Rank</p>
                        <div className="mt-1">
                          {getKPIBadge((kpiData?.rank || freelancer.user?.kpiRank || "BRONZE").toUpperCase())}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-xs text-gray-500">
                      Last updated: {kpiData?.lastUpdated 
                        ? new Date(kpiData.lastUpdated).toLocaleDateString() 
                        : freelancer.user?.kpiUpdatedAt 
                          ? new Date(freelancer.user.kpiUpdatedAt).toLocaleDateString()
                          : 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Award className="w-12 h-12 text-[#003087]/40 mx-auto" />
                    <p className="text-gray-500">No KPI data available</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={fetchKpiData}
                      className="mt-2 border-[#003087] text-[#003087]"
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
              <Card className="border-l-4 border-l-[#ff6b35]">
                <CardHeader className="bg-[#ff6b35]/5">
                  <CardTitle className="text-xl flex items-center gap-2 text-[#ff6b35]">
                    <Star className="w-5 h-5" />
                    Elite Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {freelancer.details.eliteSkillCards.map((skill: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/40"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Links */}
            {freelancer.details.professionalLinks?.length && (
              <Card className="border-l-4 border-l-[#003087]">
                <CardHeader className="bg-[#003087]/5">
                  <CardTitle className="text-xl flex items-center gap-2 text-[#003087]">
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
                        <ExternalLink className="w-4 h-4 text-[#003087]" />
                        <span className="text-[#003087] hover:underline truncate">{link}</span>
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
