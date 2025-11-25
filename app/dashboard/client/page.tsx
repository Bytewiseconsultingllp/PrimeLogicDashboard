"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Clock, Briefcase, Plus, User, CreditCard, MessageSquare, Loader2, DollarSign } from "lucide-react"
import { getCurrentUserDetails } from "@/lib/api/auth"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { getToken } from "@/lib/auth"

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  clientName: string
  clientEmail: string
  createdAt: string
  paidAt?: string
}

interface Project {
  id: string
  clientId: string
  visitorId?: string | null
  discordChatUrl?: string
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  details: {
    fullName: string
    businessEmail: string
    phoneNumber?: string
    companyName: string
    companyWebsite?: string
    businessAddress?: string
    businessType: string
    referralSource?: string
  }
  services?: Array<{
    name: string
    childServices: string[]
  }>
  industries?: Array<{
    category: string
    subIndustries: string[]
  }>
  technologies?: Array<{
    category: string
    technologies: string[]
  }>
  features?: Array<{
    category: string
    features: string[]
  }>
  discount?: {
    type: string
    percent: number
    notes?: string
  }
  timeline?: {
    option: string
    rushFeePercent: number
    estimatedDays: number
    description?: string
  }
  estimate?: {
    estimateAccepted: boolean
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  serviceAgreement?: {
    documentUrl: string
    agreementVersion: string
    accepted: boolean
    ipAddress?: string
    userAgent?: string
    locale?: string
  }
  milestones?: Array<{
    id: string
    title?: string
    description?: string
    dueDate?: string
    progress: number
    isCompleted: boolean
    projectId: string
    milestoneName: string
    deadline: string
    isMilestoneCompleted: boolean
    status: string
    startedAt?: string
    completedAt?: string
    priority?: string
    phase?: string
    riskLevel?: string
    blocked?: boolean
    blockerReason?: string
    deliverableUrl?: string
    tags?: string[]
    estimatedHours?: number
    actualHours?: number
    budgetEstimate?: number
    actualCost?: number
    assignedFreelancerId?: string
    assignedFreelancer?: {
      id: string
      details: {
        fullName: string
        email: string
      }
    }
    assigneeName?: string
    assigneeEmail?: string
    notes?: string
    moderatorApprovalRequired?: boolean
    moderatorApproved?: boolean
    moderatorApprovedBy?: string
    moderatorApprovedAt?: string
    moderatorNotes?: string
    approvedBy?: string
    approvedAt?: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }>
  client?: {
    uid: string
    username: string
    fullName: string
    email: string
    role: string
  }
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
  calculatedTotal?: string | number
  paymentDetails?: {
    id: string
    amount: number
    status: string
    paidAt?: string
    amountPaid?: number
    amountRemaining?: number
  }
}

interface ClientProfile {
  uid: string
  fullName: string
  email: string
  username: string
  role: string
  phone?: string
  address?: string
  detail?: string
  createdAt?: string
  updatedAt?: string
  isVerified?: boolean
  profilePicture?: string
}

interface ClientKPI {
  totalProjects: number
  completedProjects: number
  pendingProjects: number
  totalSpent: number
  averageProjectValue: number
  projectSuccessRate: number
  totalMilestones: number
  completedMilestones: number
}

export default function DashboardHome() {
  // Add CSS animation for circle drawing
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes drawCircle {
        from {
          stroke-dasharray: 0 440;
        }
        to {
          stroke-dasharray: var(--dash-array) 440;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [clientKPI, setClientKPI] = useState<ClientKPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState<string | null>(null)

  // Calculate project statistics
  const totalProjects = projects.length;
  
  // Improved project status calculation
  const completedProjects = projects.filter(project => {
    // If project has milestones, check if all are completed
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones.every(milestone => 
        milestone.status === 'COMPLETED' || milestone.isMilestoneCompleted === true
      );
    }
    // If no milestones, check payment status
    return project.paymentStatus === 'SUCCEEDED';
  }).length;
  
  const inProgressProjects = projects.filter(project => {
    // Project is in progress if it has at least one completed milestone but not all
    if (project.milestones && project.milestones.length > 0) {
      const completedMilestones = project.milestones.filter(milestone => 
        milestone.status === 'COMPLETED' || milestone.isMilestoneCompleted === true
      ).length;
      return completedMilestones > 0 && completedMilestones < project.milestones.length;
    }
    // If no milestones and payment is pending, it's in progress
    return project.paymentStatus === 'PENDING';
  }).length;
  
  const pendingProjects = totalProjects - completedProjects - inProgressProjects;
  
  // Calculate total spent from payments or project totals
  const totalSpent = clientKPI?.totalSpent || projects.reduce((sum, project) => {
    if (project.paymentDetails?.status === 'SUCCEEDED' && project.paymentDetails.amountPaid) {
      return sum + (project.paymentDetails.amountPaid || 0);
    }
    return sum;
  }, 0);

  // Fetch client profile and authentication
  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        console.log("🔄 Fetching client profile...")
        const userDetails = await getCurrentUserDetails()
        console.log("👤 Client profile response:", userDetails)
        
        if (userDetails.success) {
          setClientProfile(userDetails.data)
          console.log("✅ Client profile loaded:", userDetails.data)
          toast.success(`Welcome, ${userDetails.data.fullName || 'Client'}!`)
        } else {
          console.error("❌ Failed to get client profile:", userDetails)
          toast.error("Failed to load profile")
        }
      } catch (error) {
        console.error("❌ Client profile fetch error:", error)
        toast.error("Failed to load profile")
      }
    }

    fetchClientProfile()
  }, [])

  // Handle payment redirect results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    const projectId = urlParams.get('projectId')
    
    if (paymentStatus && projectId) {
      if (paymentStatus === 'success') {
        setPaymentCompleted(projectId)
        setPaymentProcessing(null)
        toast.success("Payment completed successfully!")
        
        // Update project payment status in state
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { 
                ...p, 
                paymentStatus: "SUCCEEDED" as const,
                paymentDetails: {
                  id: p.paymentDetails?.id || projectId,
                  amount: p.paymentDetails?.amount || parseFloat(p.calculatedTotal?.toString() || "0"),
                  status: "SUCCEEDED",
                  paidAt: new Date().toISOString(),
                  amountPaid: parseFloat(p.calculatedTotal?.toString() || "0"),
                  amountRemaining: 0
                }
              }
            : p
        ))
        
        // Clear URL parameters
        window.history.replaceState({}, '', '/dashboard/client')
      } else if (paymentStatus === 'cancelled') {
        setPaymentProcessing(null)
        toast.error("Payment was cancelled")
        
        // Clear URL parameters
        window.history.replaceState({}, '', '/dashboard/client')
      }
    }
  }, [])

  // Fetch projects and payments
  useEffect(() => {
    console.log("🚀 useEffect for fetchData is running!")
    
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("📊 Starting data fetch process...")
        
        // Get authentication token using the same method as useAuth hook
        const userDetails = getUserDetails()
        if (!userDetails) {
          console.error("❌ No userDetails found in cookies")
          throw new Error("No authentication found")
        }
        
        console.log("👤 User details from cookies:", userDetails)
        const token = userDetails.accessToken

        if (!token) {
          console.error("❌ No access token found in userDetails")
          throw new Error("No access token found")
        }

        // Fetch client projects with pagination
        console.log("🔄 Fetching client projects from:", `${process.env.NEXT_PUBLIC_PLS}/projects/my-projects?page=1&limit=10`)
        console.log("🔑 Using token:", token ? `${token.substring(0, 20)}...` : "NO TOKEN")
        
        const projectRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/projects/my-projects?page=1&limit=10`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        
        console.log("📡 Projects API Response Status:", projectRes.status)
        
        if (projectRes.ok) {
          const data = await projectRes.json()
          console.log("✅ Projects API Response Data:", data)
          console.log("📊 Projects found:", data.data?.projects?.length || 0)
          
          // Log calculatedTotal for each project
          data.data?.projects?.forEach((project: any) => {
            console.log(`💰 Project ${project.id} calculatedTotal:`, project.calculatedTotal)
          })
          
          setProjects(data.data?.projects || [])
          
          if (data.data?.projects?.length > 0) {
            toast.success(`Loaded ${data.data.projects.length} projects`)
          } else {
            console.log("ℹ️ No projects found in response")
            toast.info("No projects found")
          }
        } else {
          const errorData = await projectRes.text()
          console.error("❌ Projects API Error:", projectRes.status, errorData)
          toast.error(`Failed to load projects: ${projectRes.status}`)
        }

        // Fetch payment history
        console.log("🔄 Fetching payment history from:", `${process.env.NEXT_PUBLIC_PLS}/payment/history`)
        
        const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/payment/history`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        
        console.log("📡 Payment API Response Status:", paymentRes.status)
        
        if (paymentRes.ok) {
          const data = await paymentRes.json()
          console.log("✅ Payment API Response Data:", data)
          setPayments(data.data?.payments || [])
          
          if (data.data?.payments?.length > 0) {
            console.log("💳 Payments found:", data.data.payments.length)
          } else {
            console.log("ℹ️ No payments found in response")
          }
        } else {
          const errorData = await paymentRes.text()
          console.error("❌ Payment API Error:", paymentRes.status, errorData)
          // Don't show error toast for payments as it's not critical
        }

        // Fetch client KPI data
        console.log("🔄 Fetching client KPI data from:", `${process.env.NEXT_PUBLIC_PLS}/kpi/client/dashboard`)
        
        const kpiRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/kpi/client/dashboard`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        
        console.log("📡 KPI API Response Status:", kpiRes.status)
        
        if (kpiRes.ok) {
          const data = await kpiRes.json()
          console.log("✅ KPI API Response Data:", data)
          if (data.success && data.data) {
            setClientKPI(data.data)
            console.log("📊 KPI data loaded:", data.data)
          }
        } else {
          const errorData = await kpiRes.text()
          console.error("❌ KPI API Error:", kpiRes.status, errorData)
          // Don't show error toast for KPI as it's not critical
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Data fetch error:", err)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Remove clientProfile dependency to trigger immediately on mount

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "FAILED":
      case "CANCELED":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  // Handle project selection and payment status check
  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project)
    setLoadingPaymentDetails(true)
    
    // Fetch payment details for this project
    try {
      const userDetails = getUserDetails()
      if (!userDetails) {
        setLoadingPaymentDetails(false)
        return
      }
      
      const token = userDetails.accessToken

      // Use calculatedTotal from the project data instead of fetching payment API
      console.log("💰 Using calculatedTotal from project:", project.calculatedTotal)
      
      const calculatedAmount = parseFloat(project.calculatedTotal?.toString() || "0")
      const currentStatus = project.paymentStatus || "PENDING"
      
      // Create payment details based on calculatedTotal and current payment status
      const paymentDetails = {
        id: project.id,
        amount: calculatedAmount,
        status: currentStatus,
        currency: "usd",
        amountPaid: currentStatus === "SUCCEEDED" ? calculatedAmount : 0,
        amountRemaining: currentStatus === "SUCCEEDED" ? 0 : calculatedAmount
      }
      
      // Update the project with payment details
      setProjects(prev => prev.map(p => 
        p.id === project.id 
          ? { 
              ...p, 
              paymentDetails
            }
          : p
      ))
      
      // Update selected project with payment details
      setSelectedProject(prev => prev ? {
        ...prev,
        paymentDetails
      } : null)
      
      toast.success(`Payment details loaded - Total: $${calculatedAmount.toLocaleString()}`)
    } catch (error) {
      console.error("Failed to fetch payment details:", error)
      toast.error("Error loading payment information")
      // Still set the project as selected even if payment fetch fails
      setSelectedProject(project)
    } finally {
      setLoadingPaymentDetails(false)
    }
  }

  // Handle payment redirect with processing states
  const handlePaymentRedirect = async (projectId: string) => {
  try {
    setPaymentProcessing(projectId)
    toast.info("Processing payment...")
    
    const token = getToken()
    if (!token) {
      setPaymentProcessing(null)
      toast.error("Authentication required. Please log in again.")
      window.location.href = '/login'
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/project/create-checkout-session`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId,
        successUrl: `${window.location.origin}/dashboard/client?payment=success&projectId=${projectId}`,
        cancelUrl: `${window.location.origin}/dashboard/client?payment=cancelled&projectId=${projectId}`
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create payment session")
    }

    const data = await response.json()
    
    if (data.data?.url) {
      // Store payment session info
      localStorage.setItem(
        "paymentSession",
        JSON.stringify({
          sessionId: data.data.sessionId,
          paymentId: data.data.paymentId,
          projectId: projectId,
          timestamp: new Date().toISOString(),
        })
      )
      
      // Redirect to payment page
      window.location.href = data.data.url
    } else {
      throw new Error("No payment URL received from server")
    }
  } catch (error) {
    console.error("Payment redirect error:", error)
    toast.error(error instanceof Error ? error.message : "Failed to process payment")
    setPaymentProcessing(null)
  }
}

  // Handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback")
      return
    }

    setFeedbackSubmitting(true)
    try {
      const userDetails = getUserDetails()
      if (!userDetails) {
        throw new Error("No authentication found")
      }
      
      const token = userDetails.accessToken
      console.log("🔄 Submitting feedback to API...")

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/feedback/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: feedbackText.trim(),
          type: "general",
          source: "client_dashboard"
        })
      })

      console.log("📡 Feedback API Response Status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Feedback submitted successfully:", data)
        toast.success("Feedback submitted successfully!")
        setFeedbackText("")
      } else {
        const errorData = await response.text()
        console.error("❌ Feedback API Error:", response.status, errorData)
        throw new Error(`Failed to submit feedback: ${response.status}`)
      }
    } catch (error) {
      console.error("Feedback submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting Card */}
      <div className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white rounded-xl p-6 md:p-8 text-white grid md:grid-cols-2 gap-6 items-center shadow-lg">
        <div className="space-y-3">
          <div>
            <p className="text-blue-100 text-sm md:text-base font-medium">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              {clientProfile?.fullName || "Client"}
            </h1>
          </div>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            You have {totalProjects} total projects. {completedProjects} completed, {pendingProjects} in progress.
          </p>
        </div>
        <div className="hidden md:flex justify-end items-center">
          <div className="text-center">
            <div className="text-7xl font-bold text-blue-200 opacity-60">👨‍💼</div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-[#003087]">{totalProjects}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalProjects === 0 ? 'No projects yet' : `${completedProjects} completed`}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {totalProjects > 0 && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(completedProjects / totalProjects) * 100}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Projects Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedProjects}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {completedProjects === 0 ? 'No projects completed yet' : 
                   `${Math.round((completedProjects / totalProjects) * 100)}% of total`}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {totalProjects > 0 && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(completedProjects / totalProjects) * 100}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-orange-50">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-[#FF6B35]">{inProgressProjects}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {inProgressProjects === 0 ? 'No active projects' : `${pendingProjects} pending start`}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {totalProjects > 0 && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${(inProgressProjects / totalProjects) * 100}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Spent Card */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {projects.length > 0 ? `Avg. $${(totalSpent / projects.length).toLocaleString(undefined, { maximumFractionDigits: 0 })} per project` : 'No spending data'}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            {projects.length > 0 && (
              <div className="mt-4 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">100%</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create New Project Card */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white cursor-pointer transform hover:scale-[1.02]">
          <CardContent className="p-5 h-full flex flex-col justify-center">
            <Link href="/dashboard/client/get-started" className="h-full">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90 mb-1">Start New</p>
                  <h3 className="text-xl font-bold text-white mb-3">Create Project</h3>
                  <p className="text-xs text-white/80 mb-4">
                    Launch your next project with our expert team
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Plus className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">Get Started</span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Complete Profile Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
          <CardTitle className="text-xl text-[#003087]">Complete Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {clientProfile ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#003087] mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-semibold text-foreground">{clientProfile.fullName || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="font-semibold text-foreground text-sm break-all">{clientProfile.email || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="font-semibold text-foreground">{clientProfile.username || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="font-semibold text-foreground">{clientProfile.phone || "Not provided"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-semibold text-foreground">{clientProfile.address || "Not provided"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="font-semibold text-foreground text-sm font-mono">{clientProfile.uid || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Account Role</p>
                    <Badge className="bg-[#003087] text-white">
                      {clientProfile.role || "CLIENT"}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Account Status</p>
                    <Badge className={clientProfile.isVerified ? "bg-green-500" : "bg-yellow-500"}>
                      {clientProfile.isVerified ? "Verified" : "Pending Verification"}
                    </Badge>
                  </div>
                  {clientProfile.createdAt && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="font-semibold text-foreground">
                        {new Date(clientProfile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {clientProfile.updatedAt && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="font-semibold text-foreground">
                        {new Date(clientProfile.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Additional Details Section */}
                {clientProfile.detail && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-[#003087] mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                      Additional Details
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{clientProfile.detail}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional KPI Metrics */}
      {clientKPI && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
            <CardTitle className="text-xl text-[#003087] flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Project Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Average Project Value</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ${clientKPI.averageProjectValue?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-green-800">
                      {clientKPI.projectSuccessRate?.toFixed(1) || "0"}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-700" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Milestones Completed</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {clientKPI.completedMilestones || 0} / {clientKPI.totalMilestones || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects and Payments Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-[#003087] flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Projects ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">⚠️ {error}</p>
              </div>
            )}
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No projects found</p>
                
                <Link href="/dashboard/client/create-project">
                  <Button className="mt-4 bg-[#003087] hover:bg-[#003087]/90">
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 4).map((project, index) => (
                  <div
                    key={project.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedProject?.id === project.id ? 'border-[#003087] bg-[#003087]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[#003087] text-white text-sm">
                          {project.details?.companyName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {project.details?.companyName || `Project #${project.id.slice(-6)}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Working on {project.details?.businessType || "Business Project"}
                        </p>
                        {project.calculatedTotal && (
                          <p className="text-xs text-[#FF6B35] font-medium">
                            Value: ${parseFloat(project.calculatedTotal.toString()).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          project.paymentStatus === "SUCCEEDED"
                            ? "default"
                            : project.paymentStatus === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          project.paymentStatus === "SUCCEEDED"
                            ? "bg-green-100 text-green-800"
                            : project.paymentStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {project.paymentStatus === "SUCCEEDED" ? "Completed" : 
                         project.paymentStatus === "PENDING" ? "In Progress" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {projects.length > 4 && (
                  <div className="text-center pt-4">
                    <Link href="/dashboard/client/projects">
                      <Button variant="outline" className="text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white">
                        View All {projects.length} Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-[#003087] flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loadingPaymentDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#003087] mr-3" />
                <p className="text-muted-foreground">Loading payment details...</p>
              </div>
            ) : selectedProject ? (
              <div className="space-y-6">
                {/* Dynamic Payment Progress Bar */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#003087] mb-1">
                      {selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                        ? "100%" 
                        : selectedProject?.paymentDetails?.amountPaid && (selectedProject?.calculatedTotal || selectedProject?.paymentDetails?.amount)
                          ? Math.round((selectedProject.paymentDetails.amountPaid / parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "1")) * 100)
                          : "25"
                      }%
                    </div>
                    <div className="text-sm text-gray-500 font-medium mb-4">
                      {selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                        ? "Payment Complete" 
                        : selectedProject?.paymentDetails?.amountPaid 
                          ? "Payment Progress" 
                          : "Initial Deposit (25%)"}
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                          ? 'bg-green-500' 
                          : 'bg-gradient-to-r from-blue-500 to-[#003087]'}`}
                        style={{
                          width: selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                            ? '100%' 
                            : selectedProject?.paymentDetails?.amountPaid 
                              ? `${Math.min(100, Math.round((selectedProject.paymentDetails.amountPaid / parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "1")) * 100))}%`
                              : '25%',
                          transition: 'width 1s ease-in-out'
                        }}
                      >
                        {/* Default 25% indicator */}
                        {!selectedProject?.paymentDetails?.amountPaid && (
                          <div className="absolute h-4 w-0.5 bg-white ml-[25%] opacity-70"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Labels */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                      <span>0%</span>
                      {!selectedProject?.paymentDetails?.amountPaid && (
                        <span className="text-blue-600 font-medium">25%</span>
                      )}
                      {selectedProject?.paymentDetails?.amountPaid && (
                        <span className="text-blue-600 font-medium">
                          {Math.round((selectedProject.paymentDetails.amountPaid / parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "1")) * 100)}%
                        </span>
                      )}
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Payment Legend */}
                <div className="space-y-4">
                  {/* Deposited Percentage */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">Deposited</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-700">
                          {selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                            ? "100%" 
                            : selectedProject?.paymentDetails?.amountPaid && (selectedProject?.calculatedTotal || selectedProject?.paymentDetails?.amount)
                              ? Math.round((selectedProject.paymentDetails.amountPaid / parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "1")) * 100) + "%"
                              : "0%"}
                        </div>
                        <div className="text-sm text-blue-600">
                          ${selectedProject?.paymentDetails?.amountPaid?.toLocaleString() || "0.00"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium text-gray-700">Remaining</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-700">
                          ${selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                            ? "0.00" 
                            : (parseFloat(selectedProject?.calculatedTotal?.toString() || selectedProject?.paymentDetails?.amount?.toString() || "0") - 
                               (selectedProject?.paymentDetails?.amountPaid || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Project Value */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-sm font-medium text-gray-700">Total Project Value</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${parseFloat(selectedProject?.calculatedTotal?.toString() || selectedProject?.paymentDetails?.amount?.toString() || "0").toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {selectedProject.details?.companyName}
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    {selectedProject.details?.businessType}
                  </p>
                  
                  {/* Payment Status Badge */}
                  <div className="mb-4">
                    <Badge
                      className={
                        selectedProject.paymentDetails?.status === "SUCCEEDED"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : selectedProject.paymentDetails?.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {selectedProject.paymentDetails?.status === "SUCCEEDED" ? "✓ Payment Complete" : 
                       selectedProject.paymentDetails?.status === "PENDING" ? "⏳ Payment Pending" : "❌ Payment Required"}
                    </Badge>
                  </div>

                  {/* Calculated Total Amount */}
                  {(selectedProject.calculatedTotal || selectedProject.paymentDetails?.amount) && (
                    <div className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 p-4 rounded-lg mb-4 border border-[#003087]/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Calculated Total:</span>
                          <p className="text-xs text-gray-500 mt-1">From project estimate</p>
                        </div>
                        <span className="text-2xl font-bold text-[#003087]">
                          ${parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "0").toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Payment ID</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedProject.paymentDetails?.id || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Payment Status</p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedProject.paymentDetails?.status || 'PENDING')}
                        <span className="text-sm font-medium capitalize">
                          {selectedProject.paymentDetails?.status?.toLowerCase() || 'Pending'}
                        </span>
                      </div>
                    </div>
                    {selectedProject.paymentDetails?.paidAt && (
                      <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                        <p className="text-xs text-gray-500">Paid On</p>
                        <p className="text-sm font-medium">
                          {new Date(selectedProject.paymentDetails.paidAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Action Button */}
                <div className="space-y-3">
                  {selectedProject.paymentDetails?.status !== "SUCCEEDED" && (
                    <>
                      <Button
                        onClick={() => handlePaymentRedirect(selectedProject.id)}
                        disabled={paymentProcessing === selectedProject.id}
                        className="w-full bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90 text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {paymentProcessing === selectedProject.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            {selectedProject.paymentDetails?.amountRemaining ? 
                              `Pay $${selectedProject.paymentDetails.amountRemaining.toLocaleString()}` : 
                              'Complete Payment'}
                          </>
                        )}
                      </Button>
                      {selectedProject.paymentDetails?.amountRemaining && (
                        <p className="text-xs text-center text-gray-500">
                          ${selectedProject.paymentDetails.amountPaid?.toLocaleString() || '0'} of ${selectedProject.paymentDetails.amount?.toLocaleString()} paid
                        </p>
                      )}
                    </>
                  )}
                  
                  {selectedProject.paymentDetails?.status === "SUCCEEDED" && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-700">Payment Completed Successfully!</p>
                          <p className="text-sm text-green-600 mt-1">
                            Thank you for your payment of ${selectedProject.paymentDetails.amountPaid?.toLocaleString()}. Your project is now fully funded.
                          </p>
                        </div>
                      </div>
                      {selectedProject.paymentDetails.paidAt && (
                        <p className="text-xs text-green-600 mt-2 text-right">
                          Paid on {new Date(selectedProject.paymentDetails.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500">Select a project to view payment details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Form */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
          <CardTitle className="text-xl text-[#003087] flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Form
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Please share your feedback about our services..."
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
