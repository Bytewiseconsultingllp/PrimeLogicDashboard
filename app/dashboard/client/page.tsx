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

  // Use KPI data if available, otherwise calculate from projects
  const totalProjects = clientKPI?.totalProjects ?? projects.length
  const completedProjects = clientKPI?.completedProjects ?? projects.filter(p => 
    p.milestones?.every(m => m.isMilestoneCompleted === true) || 
    p.milestones?.every(m => m.status === "COMPLETED")
  ).length
  const pendingProjects = clientKPI?.pendingProjects ?? (totalProjects - completedProjects)

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
        console.log("🔄 Fetching payment history from:", `${process.env.NEXT_PUBLIC_PLS}/api/v1/payment/history`)
        
        const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/payment/history`, {
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
        console.log("🔄 Fetching client KPI data from:", `${process.env.NEXT_PUBLIC_PLS}/api/v1/kpi/client/dashboard`)
        
        const kpiRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/kpi/client/dashboard`, {
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

  // Handle payment redirect
  const handlePaymentRedirect = async (projectId: string) => {
    try {
      const userDetails = getUserDetails()
      if (!userDetails) return
      
      const token = userDetails.accessToken

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/payment/project/create-checkout-session`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId,
          successUrl: `${window.location.origin}/dashboard/client?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard/client?payment=cancelled`
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.data.url
      } else {
        toast.error("Failed to create payment session")
      }
    } catch (error) {
      console.error("Payment redirect error:", error)
      toast.error("Failed to redirect to payment")
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
      <div className="bg-gradient-to-r from-[#4C63D2] to-[#6B5DD6] rounded-xl p-6 md:p-8 text-white grid md:grid-cols-2 gap-6 items-center shadow-lg">
        <div className="space-y-3">
          <div>
            <p className="text-blue-100 text-sm md:text-base font-medium">Welcome back,</p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-[#003087]">{totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-[#003087]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedProjects}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-[#FF6B35]">{pendingProjects}</p>
              </div>
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#FF6B35]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${clientKPI?.totalSpent?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white cursor-pointer hover:shadow-lg transition-all transform hover:scale-105">
          <CardContent className="p-6">
            <Link href="/dashboard/client/create-project">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Create New</p>
                  <p className="text-2xl font-bold text-white">Project</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
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
                <div className="text-xs text-muted-foreground mb-4 space-y-1">
                  <p>API Endpoint: /api/v1/projects/my-projects</p>
                  <p>Check browser console for detailed logs</p>
                  <p>Client Profile: {clientProfile ? '✅ Loaded' : '❌ Not loaded'}</p>
                  <p>Auth Status: {getUserDetails() ? '✅ Authenticated' : '❌ Not authenticated'}</p>
                  <p>User Role: {getUserDetails()?.role || 'Unknown'}</p>
                </div>
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
                {/* Animated Payment Progress Circle */}
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                      {/* Background Circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="12"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={selectedProject?.paymentDetails?.status === "SUCCEEDED" ? "#10b981" : "#FF6B35"}
                        strokeWidth="12"
                        strokeDasharray={`${
                          selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                            ? 440 
                            : selectedProject?.paymentDetails?.amountPaid && (selectedProject?.calculatedTotal || selectedProject?.paymentDetails?.amount)
                              ? (selectedProject.paymentDetails.amountPaid / parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "1")) * 440
                              : 0
                        } 440`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{
                          animation: "drawCircle 2s ease-out forwards"
                        }}
                      />
                      {/* Pending/Remaining Circle */}
                      {selectedProject?.paymentDetails?.status !== "SUCCEEDED" && (
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          strokeDasharray="15 10"
                          className="opacity-50"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#003087] mb-1">
                          {selectedProject?.paymentDetails?.status === "SUCCEEDED" 
                            ? "100%" 
                            : selectedProject?.paymentDetails?.amountPaid && (selectedProject?.calculatedTotal || selectedProject?.paymentDetails?.amount)
                              ? Math.round((selectedProject.paymentDetails.amountPaid / parseFloat(selectedProject.calculatedTotal?.toString() || selectedProject.paymentDetails?.amount?.toString() || "1")) * 100)
                              : "0"
                          }%
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {selectedProject?.paymentDetails?.status === "SUCCEEDED" ? "Payment Complete" : "Payment Progress"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Legend */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      ${selectedProject?.paymentDetails?.amountPaid?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[#FF6B35] rounded-full"></div>
                      <span className="text-sm text-gray-600">Remaining</span>
                    </div>
                    <span className="text-sm font-medium text-[#FF6B35]">
                      ${selectedProject?.paymentDetails?.status === "SUCCEEDED" ? "0" : 
                        parseFloat(selectedProject?.calculatedTotal?.toString() || selectedProject?.paymentDetails?.amount?.toString() || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-600">Total Project Value</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 font-semibold">
                      ${parseFloat(selectedProject?.calculatedTotal?.toString() || selectedProject?.paymentDetails?.amount?.toString() || "0").toLocaleString()}
                    </span>
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

                  {/* Payment Action Button */}
                  {selectedProject.paymentDetails?.status !== "SUCCEEDED" && (
                    <Button
                      onClick={() => handlePaymentRedirect(selectedProject.id)}
                      className="w-full bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90 text-white font-medium py-3"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </Button>
                  )}
                  
                  {selectedProject.paymentDetails?.status === "SUCCEEDED" && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700">Payment Completed Successfully!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Thank you for your payment. Your project is now fully funded.
                      </p>
                    </div>
                  )}
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
