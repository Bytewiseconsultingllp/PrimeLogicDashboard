"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  MessageSquare,
  ExternalLink,
  Loader2,
  Star,
  Target,
  Zap,
  Code,
  Briefcase
} from "lucide-react"
import { getProjectById, submitProjectFeedback, updateProjectDiscordUrl } from "@/lib/api/client-projects"
import { getProjectPaymentStatus, createProjectCheckoutSession } from "@/lib/api/payment"
import { toast } from "sonner"
import { ProjectPaymentModal } from "@/components/payment/project-payment-modal"
import { DocumentUpload } from "@/components/project/document-upload"

interface Project {
  id: string
  clientId: string
  visitorId?: string | null
  assignedModeratorId?: string | null
  discordChatUrl?: string | null
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  acceptingBids: boolean
  details: {
    id: string
    projectId: string
    fullName: string
    businessEmail: string
    phoneNumber?: string
    companyName: string
    companyWebsite?: string
    businessAddress?: string
    businessType: string
    referralSource?: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }
  services?: Array<{
    id: string
    projectId: string
    name: string
    childServices: string[]
    selectedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }>
  industries?: Array<{
    id: string
    projectId: string
    category: string
    subIndustries: string[]
    selectedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }>
  technologies?: Array<{
    id: string
    projectId: string
    category: string
    technologies: string[]
    selectedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }>
  features?: Array<{
    id: string
    projectId: string
    category: string
    features: string[]
    selectedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }>
  discount?: {
    id: string
    projectId: string
    type: string
    percent: number
    notes?: string | null
    selectedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }
  timeline?: {
    id: string
    projectId: string
    option: string
    rushFeePercent?: number
    estimatedDays: number
    description?: string | null
    selectedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }
  estimate?: {
    id: string
    projectId: string
    estimateAccepted: boolean
    estimateFinalPriceMin: string
    estimateFinalPriceMax: string
    isManuallyAdjusted: boolean
    baseCost: string
    discountAmount: string
    rushFeeAmount: string
    calculatedTotal: string
    calculatedAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }
  milestones?: Array<{
    id: string
    milestoneName: string
    description?: string
    deadline: string
    progress: number
    isMilestoneCompleted: boolean
    status: string
    assignedFreelancer?: {
      id: string
      details: {
        fullName: string
        email: string
      }
    }
  }>
  selectedFreelancers?: Array<{
    id: string
    details: {
      fullName: string
      email: string
      primaryDomain?: string
    }
  }>
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [discordUrl, setDiscordUrl] = useState("")
  const [updatingDiscord, setUpdatingDiscord] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string
    amount: number
    currency: string
  } | null>(null)
  
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(undefined)
  const [documentName, setDocumentName] = useState<string | undefined>(undefined)

  const fetchPaymentStatus = useCallback(async () => {
    try {
      const status = await getProjectPaymentStatus(projectId)
      setPaymentStatus(status)
    } catch (error) {
      console.error("Error fetching payment status:", error)
      toast.error("Failed to load payment status")
    }
  }, [projectId])

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getProjectById(projectId)
      
      if (response.success) {
        setProject(response.data)
        setDiscordUrl(response.data.discordChatUrl || "")
        // Fetch document URL if available
        try {
          const docResponse = await fetch(`${process.env.NEXT_PUBLIC_PLS}/projects/${projectId}/client-brief`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          })
          
          if (docResponse.ok) {
            const docData = await docResponse.json()
            if (docData.success && docData.data) {
              setDocumentUrl(docData.data.documentUrl)
              setDocumentName(docData.data.fileName || 'project_document.pdf')
            }
          }
        } catch (error) {
          console.error('Error fetching document:', error)
          // Don't show error toast here as the document might not exist yet
        }
        toast.success("Project details loaded")
      } else {
        toast.error("Failed to load project details")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      toast.error("Failed to load project details")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
      fetchPaymentStatus()
    }
  }, [projectId, fetchProjectDetails, fetchPaymentStatus])

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback")
      return
    }

    setFeedbackSubmitting(true)
    try {
      await submitProjectFeedback(projectId, {
        message: feedbackText.trim(),
        rating: feedbackRating,
        type: "project_feedback"
      })
      
      toast.success("Feedback submitted successfully!")
      setFeedbackText("")
      setFeedbackRating(5)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback")
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const handleDiscordUpdate = async () => {
    if (!discordUrl.trim()) {
      toast.error("Please enter a Discord URL")
      return
    }

    setUpdatingDiscord(true)
    try {
      await updateProjectDiscordUrl(projectId, discordUrl.trim())
      toast.success("Discord URL updated successfully!")
      
      // Update local state
      setProject(prev => prev ? { ...prev, discordChatUrl: discordUrl.trim() } : null)
    } catch (error) {
      console.error("Error updating Discord URL:", error)
      toast.error("Failed to update Discord URL")
    } finally {
      setUpdatingDiscord(false)
    }
  }

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
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Link href="/dashboard/client/projects">
          <Button className="bg-[#003087] hover:bg-[#003087]/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  const estimatedValue = project.estimate?.calculatedTotal 
    ? parseFloat(project.estimate.calculatedTotal)
    : project.estimate 
      ? (parseFloat(project.estimate.estimateFinalPriceMin) + parseFloat(project.estimate.estimateFinalPriceMax)) / 2
      : 0

  const completedMilestones = project.milestones?.filter(m => m.isMilestoneCompleted).length || 0
  const totalMilestones = project.milestones?.length || 0
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Payment Status Banner */}
        
        <Link href="/dashboard/client/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">{project.details.companyName}</h1>
          <p className="text-muted-foreground">{project.details.businessType}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 4 Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Project Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#003087]" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {project.details.companyWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Website:</span>
                      <a href={project.details.companyWebsite} target="_blank" rel="noopener noreferrer" 
                         className="font-medium text-[#003087] hover:underline">
                        {project.details.companyWebsite}
                      </a>
                    </div>
                  )}
                  {project.details.businessAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="font-medium">{project.details.businessAddress}</p>
                      </div>
                    </div>
                  )}
                  {project.details.referralSource && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Referral Source:</span>
                      <span className="font-medium">{project.details.referralSource}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Accepting Bids:</span>
                    <Badge variant={project.acceptingBids ? "default" : "secondary"}>
                      {project.acceptingBids ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Services */}
              {project.services && project.services.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Services Required
                  </h4>
                  <div className="space-y-3">
                    {project.services.map((service, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-900 mb-2">
                          {service.name.replace(/_/g, ' ')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {service.childServices.map((child, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {child}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industries */}
              {project.industries && project.industries.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Target Industries
                  </h4>
                  <div className="space-y-3">
                    {project.industries.map((industry, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-900 mb-2">
                          {industry.category.replace(/_/g, ' ')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {industry.subIndustries.map((sub, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {sub.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Technology Stack
                  </h4>
                  <div className="space-y-3">
                    {project.technologies.map((tech, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-900 mb-2">
                          {tech.category.replace(/_/g, ' ')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tech.technologies.map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {t.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Required Features
                  </h4>
                  <div className="space-y-3">
                    {project.features.map((feature, index) => (
                      <div key={index} className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-purple-900 mb-2">
                          {feature.category.replace(/_/g, ' ')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {feature.features.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              {f.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {project.timeline && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Project Timeline
                  </h4>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Timeline Option:</span>
                        <p className="font-medium">{project.timeline.option.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Estimated Duration:</span>
                        <p className="font-medium">{project.timeline.estimatedDays} days</p>
                      </div>
                      {project.timeline.rushFeePercent && (
                        <div>
                          <span className="text-sm text-gray-600">Rush Fee:</span>
                          <p className="font-medium">{project.timeline.rushFeePercent}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Information */}
              {project.discount && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Discount Information
                  </h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Discount Type:</span>
                        <p className="font-medium">{project.discount.type.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Discount Percentage:</span>
                        <p className="font-medium">{project.discount.percent}%</p>
                      </div>
                    </div>
                    {project.discount.notes && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Notes:</span>
                        <p className="font-medium">{project.discount.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Milestones Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#003087]" />
                Project Milestones
              </CardTitle>
              <CardDescription>
                Track progress across all project milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{milestone.milestoneName}</h4>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          )}
                        </div>
                        <Badge className={
                          milestone.isMilestoneCompleted 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }>
                          {milestone.isMilestoneCompleted ? "Completed" : milestone.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{milestone.progress}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-[#003087] to-[#FF6B35] h-2 rounded-full"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Due: {new Date(milestone.deadline).toLocaleDateString()}
                        </span>
                        {milestone.assignedFreelancer && (
                          <span className="text-gray-600">
                            Assigned to: {milestone.assignedFreelancer.details.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No milestones created yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Payment Information Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#003087]" />
                  Payment Information
                </CardTitle>
                <Button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-[#003087] hover:bg-[#003087]/90"
                  disabled={isProcessingPayment || !project}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Make Payment'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Status */}
              {paymentStatus && (
                <div className={`p-4 rounded-lg ${paymentStatus.status === 'SUCCEEDED' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center">
                    {paymentStatus.status === 'SUCCEEDED' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        Payment Status: <span className={paymentStatus.status === 'SUCCEEDED' ? 'text-green-700' : 'text-yellow-700'}>
                          {paymentStatus.status === 'SUCCEEDED' ? 'Paid' : 'Pending'}
                        </span>
                      </p>
                      {paymentStatus.status === 'SUCCEEDED' ? (
                        <p className="text-sm text-gray-600">
                          Amount: ${paymentStatus.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {paymentStatus.currency.toUpperCase()}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Please complete your payment to proceed with the project
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Payment Status and Total */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <Badge className={
                      project.paymentStatus === "SUCCEEDED" 
                        ? "bg-green-100 text-green-800" 
                        : project.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }>
                      {project.paymentStatus === "SUCCEEDED" ? "Paid" : 
                       project.paymentStatus === "PENDING" ? "Pending" : "Unpaid"}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[#003087]/10 to-[#FF6B35]/10 p-4 rounded-lg border border-[#003087]/20">
                  <span className="text-sm text-gray-600">Final Amount</span>
                  <p className="text-2xl font-bold text-[#003087]">
                    ${estimatedValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Calculated Total</p>
                </div>
              </div>

              {/* Detailed Estimate Breakdown */}
              {project.estimate && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Project Estimate Breakdown</h4>
                  
                  {/* Price Range */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-3 text-blue-900">Estimated Price Range</h5>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Minimum Price:</span>
                        <p className="font-medium text-lg">${parseFloat(project.estimate.estimateFinalPriceMin).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Maximum Price:</span>
                        <p className="font-medium text-lg">${parseFloat(project.estimate.estimateFinalPriceMax).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="text-gray-600">Estimate Status:</span>
                      <Badge className="ml-2" variant={project.estimate.estimateAccepted ? "default" : "secondary"}>
                        {project.estimate.estimateAccepted ? "✓ Accepted" : "⏳ Pending"}
                      </Badge>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-3 text-green-900">Cost Breakdown</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Cost:</span>
                        <span className="font-medium">${parseFloat(project.estimate.baseCost).toLocaleString()}</span>
                      </div>
                      
                      {parseFloat(project.estimate.rushFeeAmount) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rush Fee:</span>
                          <span className="font-medium text-orange-600">+${parseFloat(project.estimate.rushFeeAmount).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {parseFloat(project.estimate.discountAmount) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium text-green-600">-${parseFloat(project.estimate.discountAmount).toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-green-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Final Total:</span>
                          <span className="font-bold text-xl text-[#003087]">${parseFloat(project.estimate.calculatedTotal).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Manually Adjusted:</span>
                        <Badge className="ml-2" variant={project.estimate.isManuallyAdjusted ? "destructive" : "secondary"}>
                          {project.estimate.isManuallyAdjusted ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Calculated On:</span>
                        <p className="font-medium">{new Date(project.estimate.calculatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Action */}
              {project.paymentStatus !== "SUCCEEDED" && (
                <div className="pt-4 border-t">
                  <Button className="w-full bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90 text-white font-medium py-3">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Complete Payment (${estimatedValue.toLocaleString()})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Documentation Card */}
          <DocumentUpload 
            projectId={projectId} 
            documentUrl={documentUrl}
            fileName={documentName}
            onDocumentUploaded={(url, fileName) => {
              setDocumentUrl(url)
              setDocumentName(fileName)
            }}
          />

          {/* 5. Feedback Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#003087]" />
                Project Feedback
              </CardTitle>
              <CardDescription>
                Share your feedback about this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              
              <div>
                
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts about this project..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              <Button
                onClick={handleFeedbackSubmit}
                disabled={feedbackSubmitting || !feedbackText.trim()}
                className="w-full bg-[#003087] hover:bg-[#003087]/90"
              >
                {feedbackSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 2 Cards */}
        <div className="space-y-6">
          {/* Project Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#003087] mb-1">{overallProgress}%</div>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completed Milestones</span>
                  <span className="font-medium">{completedMilestones}/{totalMilestones}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Payment Status</span>
                  <Badge className={
                    project.paymentStatus === "SUCCEEDED" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {project.paymentStatus === "SUCCEEDED" ? "Paid" : "Pending"}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Created</span>
                  <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                
                {project.timeline && (
                  <div className="flex justify-between text-sm">
                    <span>Timeline</span>
                    <span className="font-medium">{project.timeline.estimatedDays} days</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team & Communication Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assigned Freelancers */}
              {project.selectedFreelancers && project.selectedFreelancers.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3">Assigned Team</h4>
                  <div className="space-y-2">
                    {project.selectedFreelancers.map((freelancer) => (
                      <div key={freelancer.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {freelancer.details.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{freelancer.details.fullName}</p>
                          <p className="text-xs text-gray-600">{freelancer.details.email}</p>
                          {freelancer.details.primaryDomain && (
                            <p className="text-xs text-[#003087]">{freelancer.details.primaryDomain}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No team members assigned yet</p>
                </div>
              )}

              {/* Discord Communication */}
              <div>
                <h4 className="font-semibold mb-3">Discord Communication</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Discord channel URL"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleDiscordUpdate}
                    disabled={updatingDiscord}
                    className="w-full"
                    variant="outline"
                  >
                    {updatingDiscord ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Discord URL"
                    )}
                  </Button>
                  
                  {project.discordChatUrl && (
                    <a
                      href={project.discordChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join Discord Chat
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Payment Modal - Moved inside the main return */}
      {project && (
        <ProjectPaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          projectId={project.id}
          projectName={project.details.companyName}
          totalAmount={estimatedValue} paidAmount={0}        />
      )}
    </div>
  )
}
