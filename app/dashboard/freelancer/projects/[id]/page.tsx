"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Github,
  MessageSquare,
  CreditCard,
  Star,
  Send,
  ExternalLink
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import Link from "next/link"

interface Milestone {
  id: string
  title: string
  description: string
  progress: number
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
  dueDate: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  estimatedHours?: number
  actualHours?: number
  budgetEstimate?: number
}

interface PaymentInfo {
  id: string
  amount: number
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED"
  currency: string
  amountPaid?: number
  amountRemaining?: number
  paidAt?: string
}

interface ProjectDetail {
  id: string
  details?: {
    fullName: string
    businessEmail: string
    companyName: string
    businessType?: string
    phoneNumber?: string
    companyWebsite?: string
    businessAddress?: string
  }
  services?: any[]
  industries?: any[]
  technologies?: any[]
  features?: any[]
  timeline?: {
    option: string
    estimatedDays: number
    description?: string
  }
  estimate?: {
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  calculatedTotal?: string | number
  paymentStatus?: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED"
  acceptingBids?: boolean
  milestones?: Milestone[]
  paymentDetails?: PaymentInfo
  discordChatUrl?: string
  githubRepoUrl?: string
  createdAt?: string
  updatedAt?: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true)
        
        // Get authentication token
        const userDetails = getUserDetails()
        if (!userDetails) {
          throw new Error("No authentication found")
        }
        
        const token = userDetails.accessToken
        console.log("🔄 Fetching project details for ID:", projectId)
        
        // Fetch project details
        const projectResponse = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/my-projects/${projectId}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        
        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          console.log("✅ Project Details:", projectData)
          
          if (projectData.success && projectData.data) {
            setProject(projectData.data)
            
            // Fetch milestones for this project
            const milestonesResponse = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/my-projects/${projectId}/milestones`, {
              headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            })
            
            if (milestonesResponse.ok) {
              const milestonesData = await milestonesResponse.json()
              console.log("✅ Milestones Data:", milestonesData)
              setMilestones(milestonesData.success ? milestonesData.data : [])
            }
            
            // Fetch payment information
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/payment/project/${projectId}/status`, {
              headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            })
            
            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json()
              console.log("✅ Payment Data:", paymentData)
              if (paymentData.success && paymentData.data) {
                setPaymentInfo({
                  id: projectId,
                  amount: paymentData.data.amount || 0,
                  status: paymentData.data.status || "PENDING",
                  currency: paymentData.data.currency || "usd",
                  amountPaid: paymentData.data.status === "SUCCEEDED" ? paymentData.data.amount : 0,
                  amountRemaining: paymentData.data.status === "SUCCEEDED" ? 0 : paymentData.data.amount
                })
              }
            }
          } else {
            throw new Error(projectData.message || "Failed to fetch project details")
          }
        } else {
          throw new Error(`Failed to fetch project: ${projectResponse.status}`)
        }
      } catch (error) {
        console.error("Error fetching project data:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load project")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback")
      return
    }

    try {
      setSubmittingFeedback(true)
      // This would typically submit to a feedback API
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Feedback submitted successfully!")
      setFeedbackText("")
    } catch (error) {
      toast.error("Failed to submit feedback")
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleDiscordConnect = () => {
    if (project?.discordChatUrl) {
      window.open(project.discordChatUrl, '_blank')
    } else {
      toast.info("Discord integration will be available once set up by the client")
    }
  }

  const handleGithubConnect = () => {
    if (project?.githubRepoUrl) {
      window.open(project.githubRepoUrl, '_blank')
    } else {
      toast.info("GitHub repository will be available once set up")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500 text-white"
      case "IN_PROGRESS": return "bg-blue-500 text-white"
      case "BLOCKED": return "bg-red-500 text-white"
      case "PLANNED": return "bg-gray-500 text-white"
      default: return "bg-gray-400 text-white"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-100 text-red-800 border-red-200"
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProjectProgress = () => {
    if (!milestones || milestones.length === 0) return 0
    const completedMilestones = milestones.filter(m => m.status === "COMPLETED").length
    return Math.round((completedMilestones / milestones.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" />
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          Project not found
        </div>
      </div>
    )
  }

  const totalAmount = parseFloat(project.calculatedTotal?.toString() || paymentInfo?.amount?.toString() || "0")
  const progress = getProjectProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={project.paymentStatus === "SUCCEEDED" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
            {project.paymentStatus || "PENDING"}
          </Badge>
          <Badge className={project.acceptingBids ? "bg-green-500" : "bg-gray-500"}>
            {project.acceptingBids ? "Accepting Bids" : "Closed"}
          </Badge>
        </div>
      </div>

      {/* Project Header Card */}
      <Card className="border-2 border-[#003087]/20 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {project.details?.companyName || "Project Details"}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Client: {project.details?.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {project.timeline?.estimatedDays 
                      ? `${project.timeline.estimatedDays} days` 
                      : project.timeline?.option || "Timeline TBD"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{progress}%</div>
              <div className="text-sm text-white/80">Complete</div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#003087]">{milestones.length}</div>
              <div className="text-sm text-muted-foreground">Total Milestones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter(m => m.status === "COMPLETED").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF6B35]">
                {milestones.filter(m => m.status === "IN_PROGRESS").length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF6B35]">
                ${totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Project Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#003087]" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p className="font-semibold">{project.details?.businessType || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Project Value</p>
                  <p className="font-semibold text-[#FF6B35]">
                    ${totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="font-semibold">
                    {project.timeline?.estimatedDays ? `${project.timeline.estimatedDays} days` : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="font-semibold text-sm">{progress}%</span>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: any, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                        {typeof tech === 'string' ? tech : tech.name || tech.category || 'Tech'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {project.services && project.services.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Services Required</h4>
                  <div className="space-y-1">
                    {project.services.map((service: any, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{typeof service === 'string' ? service : service.name || 'Service'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 w-5 text-[#003087]" />
                Project Milestones ({milestones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No milestones defined for this project yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <Card key={milestone.id} className="border-l-4 border-l-[#003087]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#003087] mb-1">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status}
                            </Badge>
                            {milestone.priority && (
                              <Badge className={getPriorityColor(milestone.priority)} variant="outline">
                                {milestone.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <Progress value={milestone.progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          </div>
                          {milestone.budgetEstimate && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>${milestone.budgetEstimate.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {milestone.status === "BLOCKED" && (
                          <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span>This milestone is currently blocked</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#003087]" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-[#003087]">
                        ${paymentInfo.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${(paymentInfo.amountPaid || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Amount Paid</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-[#FF6B35]">
                        ${(paymentInfo.amountRemaining || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Badge className={paymentInfo.status === "SUCCEEDED" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                      {paymentInfo.status === "SUCCEEDED" ? "✓ Payment Complete" : "⏳ Payment Pending"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Payment information not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#003087]" />
                Project Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback">Share your feedback about this project</Label>
                <Textarea
                  id="feedback"
                  placeholder="How is the project going? Any concerns or suggestions?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback || !feedbackText.trim()}
                className="w-full bg-[#003087] hover:bg-[#003087]/90"
              >
                {submittingFeedback ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#003087]" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#003087] text-white">
                    {project.details?.fullName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.details?.companyName}</p>
                  <p className="text-sm text-muted-foreground">{project.details?.fullName}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm break-all">{project.details?.businessEmail}</p>
                </div>
                {project.details?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{project.details.phoneNumber}</p>
                  </div>
                )}
                {project.details?.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={project.details.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {project.details.companyWebsite}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Integration Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[#003087]" />
                Project Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleDiscordConnect}
                variant="outline" 
                className="w-full justify-start gap-2 hover:bg-[#5865F2] hover:text-white"
              >
                <MessageSquare className="w-4 h-4" />
                Connect to Discord
              </Button>
              <Button 
                onClick={handleGithubConnect}
                variant="outline" 
                className="w-full justify-start gap-2 hover:bg-gray-900 hover:text-white"
              >
                <Github className="w-4 h-4" />
                Connect to GitHub
              </Button>
            </CardContent>
          </Card>

          {/* Project Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/freelancer/project-status`}>
                <Button variant="outline" className="w-full">
                  View All Projects
                </Button>
              </Link>
              {project.acceptingBids && (
                <Link href={`/dashboard/freelancer/place-bid?projectId=${project.id}`}>
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                    Place Your Bid
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
