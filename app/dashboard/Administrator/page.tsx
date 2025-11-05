"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, CheckCircle, Clock, Briefcase, Users, User, Settings, Loader2, DollarSign, UserCheck, UserX, Building, Eye } from "lucide-react"
import { getCurrentUserDetails } from "@/lib/api/auth"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface AdminProfile {
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
  isActive?: boolean
  profilePicture?: string
}

interface AdminStats {
  totalFreelancers: number
  totalClients: number
  totalProjects: number
  totalModerators: number
  totalVisitors: number
  acceptedFreelancers: number
  pendingFreelancers: number
  rejectedFreelancers: number
  activeClients: number
  inactiveClients: number
  completedProjects: number
  pendingProjects: number
}

interface Project {
  id: string
  createdAt: string
  updatedAt: string
  paymentStatus: string
  acceptingBids: boolean
  details: {
    fullName: string
    businessEmail: string
    companyName: string
    businessType: string
  }
  client: {
    uid: string
    username: string
    fullName: string
    email: string
  }
}

interface Freelancer {
  id: string
  status: string
  createdAt: string
  details: {
    fullName: string
    email: string
    primaryDomain: string
    country: string
  }
  user?: {
    uid: string
    username: string
    fullName: string
  }
}

export default function AdministratorDashboard() {
  const { isAuthorized } = useAuth(["ADMIN"])
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [latestFreelancers, setLatestFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        console.log("🔄 Fetching admin profile...")
        const userDetails = await getCurrentUserDetails()
        console.log("👤 Admin profile response:", userDetails)
        
        if (userDetails.success) {
          setAdminProfile(userDetails.data)
          console.log("✅ Admin profile loaded:", userDetails.data)
          toast.success(`Welcome, ${userDetails.data.fullName || 'Admin'}!`)
        } else {
          console.error("❌ Failed to get admin profile:", userDetails)
          toast.error("Failed to load profile")
        }
      } catch (error) {
        console.error("❌ Admin profile fetch error:", error)
        toast.error("Failed to load profile")
      }
    }

    fetchAdminProfile()
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        console.log("📊 Starting admin dashboard data fetch...")
        
        const userDetails = getUserDetails()
        if (!userDetails) {
          console.error("❌ No userDetails found in cookies")
          throw new Error("No authentication found")
        }
        
        const token = userDetails.accessToken
        if (!token) {
          console.error("❌ No access token found in userDetails")
          throw new Error("No access token found")
        }

        // Fetch admin stats (projects, clients, freelancers, moderators, visitors)
        console.log("🔄 Fetching project stats...")
        const projectStatsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/projects/stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        console.log("🔄 Fetching client stats...")
        const clientStatsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/clients/stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        console.log("🔄 Fetching freelancer stats...")
        const freelancerStatsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        console.log("🔄 Fetching moderators...")
        const moderatorsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/moderators`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        console.log("🔄 Fetching visitors...")
        console.log("🔄 Visitors API URL:", `${process.env.NEXT_PUBLIC_PLS}/visitors?page=1&limit=1`)
        const visitorsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/visitors?page=1&limit=1`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        // Fetch recent projects
        console.log("🔄 Fetching recent projects...")
        const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/projects?page=1&limit=5`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        // Fetch latest freelancers
        console.log("🔄 Fetching latest freelancers...")
        const freelancersRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?page=1&limit=5`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        // Initialize stats object
        const stats: AdminStats = {
          totalFreelancers: 0,
          totalClients: 0,
          totalProjects: 0,
          totalModerators: 0,
          totalVisitors: 0,
          acceptedFreelancers: 0,
          pendingFreelancers: 0,
          rejectedFreelancers: 0,
          activeClients: 0,
          inactiveClients: 0,
          completedProjects: 0,
          pendingProjects: 0
        }

        // Process project stats
        if (projectStatsRes.ok) {
          const projectData = await projectStatsRes.json()
          console.log("✅ Project stats:", projectData)
          stats.totalProjects = projectData.data?.projects?.total || 0
          stats.pendingProjects = projectData.data?.projects?.pendingPayment || 0
          stats.completedProjects = projectData.data?.projects?.succeededPayment || 0
        } else {
          console.error("❌ Failed to fetch project stats:", await projectStatsRes.text())
        }

        // Process client stats
        if (clientStatsRes.ok) {
          const clientData = await clientStatsRes.json()
          console.log("✅ Client stats:", clientData)
          stats.totalClients = clientData.data?.clients?.total || 0
          stats.activeClients = clientData.data?.clients?.active || 0
          stats.inactiveClients = clientData.data?.clients?.inactive || 0
        } else {
          console.error("❌ Failed to fetch client stats:", await clientStatsRes.text())
        }

        // Process freelancer stats
        if (freelancerStatsRes.ok) {
          const freelancerData = await freelancerStatsRes.json()
          console.log("✅ Freelancer stats:", freelancerData)
          stats.totalFreelancers = freelancerData.data?.freelancers?.total || 0
          stats.acceptedFreelancers = freelancerData.data?.freelancers?.accepted || 0
          stats.pendingFreelancers = freelancerData.data?.freelancers?.pending || 0
          stats.rejectedFreelancers = freelancerData.data?.freelancers?.rejected || 0
        } else {
          console.error("❌ Failed to fetch freelancer stats:", await freelancerStatsRes.text())
        }

        // Process moderators
        if (moderatorsRes.ok) {
          const moderatorData = await moderatorsRes.json()
          console.log("✅ Moderators:", moderatorData)
          stats.totalModerators = moderatorData.data?.moderators?.length || 0
        } else {
          console.error("❌ Failed to fetch moderators:", await moderatorsRes.text())
        }

        // Process visitors
        if (visitorsRes.ok) {
          const visitorData = await visitorsRes.json()
          console.log("✅ Visitors:", visitorData)
          console.log("✅ Visitor count:", visitorData.data?.pagination?.total)
          stats.totalVisitors = visitorData.data?.pagination?.total || 0
        } else if (visitorsRes.status === 401) {
          console.error("❌ Authentication failed for visitors API")
          stats.totalVisitors = 0
        } else {
          const errorText = await visitorsRes.text()
          console.error("❌ Failed to fetch visitors:", errorText)
          console.error("❌ Visitors response status:", visitorsRes.status)
          // Set to 0 if API fails
          stats.totalVisitors = 0
        }

        setAdminStats(stats)

        // Process recent projects
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          console.log("✅ Recent projects:", projectsData)
          setRecentProjects(projectsData.data?.projects || [])
        }

        // Process latest freelancers
        if (freelancersRes.ok) {
          const freelancersData = await freelancersRes.json()
          console.log("✅ Latest freelancers:", freelancersData)
          setLatestFreelancers(freelancersData.data?.freelancers || [])
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Dashboard data fetch error:", err)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
      case "ACCEPTED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "PENDING":
      case "PENDING_REVIEW":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "FAILED":
      case "REJECTED":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  // Check authorization after all hooks
  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading admin dashboard...</p>
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
              {adminProfile?.fullName || "Administrator"}
            </h1>
          </div>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            System Overview: {adminStats?.totalProjects || 0} projects, {adminStats?.totalClients || 0} clients, {adminStats?.totalFreelancers || 0} freelancers
          </p>
        </div>
        <div className="hidden md:flex justify-end items-center">
          <div className="text-center">
            <div className="text-7xl font-bold text-blue-200 opacity-60">👨‍💼</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card 
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[#003087]"
          onClick={() => window.location.href = '/dashboard/Administrator/freelancer-profiles'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Freelancers</p>
                <p className="text-3xl font-bold text-[#003087]">{adminStats?.totalFreelancers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#003087]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-green-600"
          onClick={() => window.location.href = '/dashboard/Administrator/client-profiles'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Clients</p>
                <p className="text-3xl font-bold text-green-600">{adminStats?.totalClients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[#FF6B35]"
          onClick={() => window.location.href = '/dashboard/Administrator/project-status'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-[#FF6B35]">{adminStats?.totalProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-[#FF6B35]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-purple-600"
          onClick={() => window.location.href = '/dashboard/Administrator/moderators'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Moderators</p>
                <p className="text-3xl font-bold text-purple-600">{adminStats?.totalModerators || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-600"
          onClick={() => window.location.href = '/dashboard/Administrator/visitors'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Visitors</p>
                <p className="text-3xl font-bold text-blue-600">{adminStats?.totalVisitors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side - Profile Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Complete Profile Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
              <CardTitle className="text-xl text-[#003087]">Complete Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {adminProfile ? (
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
                        <p className="font-semibold text-foreground">{adminProfile.fullName || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="font-semibold text-foreground text-sm break-all">{adminProfile.email || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Username</p>
                        <p className="font-semibold text-foreground">{adminProfile.username || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="font-semibold text-foreground">{adminProfile.phone || "Not provided"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-semibold text-foreground">{adminProfile.address || "Not provided"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">User ID</p>
                        <p className="font-semibold text-foreground text-sm font-mono">{adminProfile.uid || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Account Role</p>
                        <Badge className="bg-[#003087] text-white">
                          {adminProfile.role || "ADMIN"}
                        </Badge>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Account Status</p>
                        <Badge className={adminProfile.isActive ? "bg-green-500" : "bg-red-500"}>
                          {adminProfile.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {adminProfile.createdAt && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Member Since</p>
                          <p className="font-semibold text-foreground">
                            {new Date(adminProfile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {adminProfile.updatedAt && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="font-semibold text-foreground">
                            {new Date(adminProfile.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Additional Details Section */}
                    {adminProfile.detail && (
                      <div className="mt-6">
                        <h4 className="text-md font-semibold text-[#003087] mb-3 flex items-center gap-2">
                          <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                          Additional Details
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{adminProfile.detail}</p>
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

          {/* Recent Projects */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
              <CardTitle className="text-xl text-[#003087] flex items-center justify-between">
                <span>Recent Projects</span>
                <Link href="/dashboard/Administrator/project-status">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-[#003087]" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{project.details?.companyName || "Unknown Company"}</p>
                            <p className="text-sm text-muted-foreground">{project.client?.fullName || "Unknown Client"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={project.paymentStatus === "SUCCEEDED" ? "bg-green-500" : "bg-yellow-500"}>
                          {project.paymentStatus}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent projects found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Profile Card and Latest Freelancers */}
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Admin Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Avatar className="w-24 h-24 mx-auto border-4 border-[#003087]">
                <AvatarImage src={adminProfile?.profilePicture || "/placeholder-user.jpg"} alt={adminProfile?.fullName} />
                <AvatarFallback className="bg-[#003087] text-white text-xl">
                  {adminProfile?.fullName
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{adminProfile?.fullName || "Administrator"}</p>
                <p className="text-sm text-muted-foreground">{adminProfile?.role || "System Administrator"}</p>
              </div>
              <Link href="/dashboard/Administrator/settings">
                <Button className="w-full bg-[#003087] hover:bg-[#002060] text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Latest Freelancers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base md:text-lg">Latest Freelancers</CardTitle>
              <Link href="/dashboard/Administrator/freelancer-profiles">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">View All</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestFreelancers.length > 0 ? (
                latestFreelancers.map((freelancer) => (
                  <div key={freelancer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {freelancer.details?.fullName
                            ?.split(" ")
                            .map((word: string) => word[0])
                            .join("")
                            .toUpperCase() || "FL"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{freelancer.details?.fullName || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{freelancer.details?.primaryDomain || "No domain"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(freelancer.status)}
                      <Badge 
                        className={
                          freelancer.status === "ACCEPTED" ? "bg-green-500" :
                          freelancer.status === "PENDING_REVIEW" ? "bg-yellow-500" : "bg-red-500"
                        }
                      >
                        {freelancer.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No freelancers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

