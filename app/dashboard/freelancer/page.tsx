"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, AlertCircle, Globe } from "lucide-react"
import { useAuthContext } from "@/contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FreelancerProfileCard } from "@/components/freelancer/FreelancerProfileCard"
import { getAssignedProjects } from "@/lib/api/freelancers"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

interface FreelancerProfile {
  id: string
  details: {
    fullName: string
    email: string
    primaryDomain: string
  }
  status: string
}

interface Project {
  id: string
  details?: {
    fullName: string
  }
}

interface Bid {
  id: string
  project?: {
    details?: {
      fullName: string
    }
  }
  status: string
}

interface IncomeData {
  month: string
  thisMonth: number
  previousMonth: number
}

interface InquiryData {
  name: string
  value: number
  color: string
}

interface TaskData {
  name: string
  value: number
}

interface CurrentProject {
  id: string
  name: string
  status: string
  progress: number
}

export default function HomePage() {
  console.log("🚀 HomePage component mounted/rendered")
  
  const { user, freelancerProfile, isLoading } = useAuthContext()
  const [currentProjects, setCurrentProjects] = useState<CurrentProject[]>([])
  const [lastClients, setLastClients] = useState<{ id: string; name: string }[]>([])
  const [avatar, setAvatar] = useState<string | null>(null)
  const [profileWarning, setProfileWarning] = useState(false)

  // State for locally fetched profile
  const [localProfile, setLocalProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log("🏠 HomePage - User:", user)
    console.log("🏠 HomePage - Freelancer Profile:", freelancerProfile)
    console.log("🏠 HomePage - Local Profile:", localProfile)
    console.log("🏠 HomePage - Is Loading:", isLoading)
  }, [user, freelancerProfile, localProfile, isLoading])

  // Monitor localProfile changes specifically
  useEffect(() => {
    if (localProfile) {
      console.log("🎯 localProfile STATE UPDATED!")
      console.log("🎯 Full Name in state:", localProfile?.details?.fullName)
      console.log("🎯 Email in state:", localProfile?.details?.email)
      console.log("🎯 Primary Domain in state:", localProfile?.details?.primaryDomain)
    }
  }, [localProfile])

  // Fetch freelancer profile directly from API
  useEffect(() => {
    console.log("⚡ useEffect for profile fetch is running!")
    
    const fetchFreelancerProfile = async () => {
      try {
        setProfileLoading(true)
        console.log("🔄 Starting profile fetch...")
        
        // First, check if profile exists in localStorage
        const cachedProfile = localStorage.getItem("freelancerProfile")
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile)
            console.log("💾 Found cached profile in localStorage:", parsedProfile)
            setLocalProfile(parsedProfile)
            console.log("✅ Loaded profile from cache")
          } catch (e) {
            console.error("❌ Failed to parse cached profile:", e)
          }
        }
        
        // Get token from localStorage
        console.log("📦 Checking localStorage for userDetails...")
        const userDetails = localStorage.getItem("userDetails")
        console.log("📦 userDetails raw:", userDetails ? "EXISTS" : "NULL")
        
        if (!userDetails) {
          console.error("❌ No user details found in localStorage")
          console.error("❌ Cannot fetch profile without authentication")
          setProfileLoading(false)
          return
        }
        
        console.log("📦 Parsing userDetails...")
        const parsedDetails = JSON.parse(userDetails)
        console.log("👤 User details found:", { 
          role: parsedDetails.role, 
          username: parsedDetails.username,
          hasToken: !!parsedDetails.accessToken
        })
        
        // Check if user is a freelancer
        if (parsedDetails.role !== "FREELANCER") {
          console.log("ℹ️ User is not a freelancer, skipping profile fetch")
          console.log("ℹ️ User role is:", parsedDetails.role)
          setProfileLoading(false)
          return
        }
        
        console.log("✅ User is FREELANCER, proceeding with fetch")
        
        const token = parsedDetails.accessToken
        
        if (!token) {
          console.error("❌ No access token found")
          console.error("❌ parsedDetails.accessToken is:", token)
          setProfileLoading(false)
          return
        }
        
        console.log("🔑 Token found, length:", token.length)
        console.log("🔑 Token preview:", token.substring(0, 20) + "...")
        console.log("🔑 Preparing to fetch profile from API...")

        // Fetch profile from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/freelancer/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        
        console.log("🌐 API URL:", `${process.env.NEXT_PUBLIC_PLS}/freelancer/profile`)

        console.log("📡 API Response Status:", response.status)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("✅ Profile fetched successfully:", data)
        console.log("📊 Data structure check:")
        console.log("  - data.success:", data.success)
        console.log("  - data.data exists:", !!data.data)
        console.log("  - data.data.details exists:", !!data.data?.details)
        console.log("  - Full Name:", data.data?.details?.fullName)
        console.log("  - Email:", data.data?.details?.email)
        console.log("  - Primary Domain:", data.data?.details?.primaryDomain)

        if (data.success && data.data) {
          setLocalProfile(data.data)
          console.log("✅ Profile data set to state:", data.data)
          console.log("✅ Full name from state:", data.data.details?.fullName)
          
          // Also store in localStorage for persistence
          localStorage.setItem("freelancerProfile", JSON.stringify(data.data))
          
          // Only show welcome toast if we didn't have cached data
          if (!cachedProfile) {
            toast.success(`Welcome back, ${data.data.details?.fullName || 'Freelancer'}!`)
          } else {
            console.log("🔄 Profile refreshed from API")
          }
        } else {
          console.error("❌ API returned unsuccessful response:", data)
          toast.error("Failed to load profile data")
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error)
        toast.error("Failed to fetch profile data")
      } finally {
        setProfileLoading(false)
      }
    }

    fetchFreelancerProfile()
  }, [user]) // Re-run when user changes (login/refresh)
 

  useEffect(() => {
    // Load avatar from localStorage if available
    const savedAvatar = localStorage.getItem("userAvatar")
    if (savedAvatar) {
      setAvatar(savedAvatar)
    }

    // Check if profile is available, show warning if not
    if (user && user.role === "FREELANCER" && !freelancerProfile) {
      setProfileWarning(true)
    } else {
      setProfileWarning(false)
    }
  }, [user, freelancerProfile])

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const response = await getAssignedProjects()
        if (response.success && response.data?.projects) {
          // Map API response to current projects format
          const projects = response.data.projects
            .filter((p: any) => p.bids?.some((b: any) => b.status === "ACCEPTED"))
            .slice(0, 2) // Show only first 2
            .map((project: any) => ({
              id: project.id,
              name: project.details?.companyName || "Project",
              status: "in-progress",
              progress: 50 // Default, can be calculated from milestones
            }))
          setCurrentProjects(projects)
        }
      } catch (error) {
        console.error("Failed to fetch assigned projects:", error)
      }
    }

    fetchAssignedProjects()

    setLastClients([
      { id: "1", name: "James Kirk" },
      { id: "2", name: "Tyler Minas" },
      { id: "3", name: "Nicholas" },
    ])
  }, [])

  // Use locally fetched profile with fallback to context profile
  const displayProfile = localProfile || freelancerProfile
  
  // Log what's being used for display
  console.log("🖼️ DISPLAY PROFILE:", {
    hasLocalProfile: !!localProfile,
    hasFreelancerProfile: !!freelancerProfile,
    hasDisplayProfile: !!displayProfile,
    displayProfileName: displayProfile?.details?.fullName,
    source: localProfile ? "localProfile" : freelancerProfile ? "freelancerProfile" : "none"
  })

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Warning Alert */}
      {profileWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>⚠️ Unable to load your freelancer profile. Some information may be incomplete.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="ml-4"
            >
              Refresh Page
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Profile Loading Info */}
      {user && user.role === "FREELANCER" && !displayProfile && !profileWarning && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading your profile data from database...
          </AlertDescription>
        </Alert>
      )}
      
      {/* Greeting Card */}
      <div className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white rounded-xl p-6 md:p-8 text-white grid md:grid-cols-2 gap-6 items-center shadow-lg">
        <div className="space-y-3">
          <div>
            <p className="text-blue-100 text-sm md:text-base font-medium">Welcome back,</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              {displayProfile?.details?.fullName || user?.username || "Freelancer"}
            </h1>
          </div>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            You have {currentProjects.length} active projects. Keep going to your goal!
          </p>
          {displayProfile?.details?.primaryDomain && (
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm font-medium">{displayProfile.details.primaryDomain}</p>
            </div>
          )}
        </div>
        <div className="hidden md:flex justify-end items-center">
          <div className="text-center">
            <div className="text-7xl font-bold text-blue-200 opacity-60">👨‍💻</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Profile Card */}
          {displayProfile && (
            <FreelancerProfileCard profile={displayProfile} />
          )}

          {/* Comprehensive Profile Data Card */}
          <Card className="border-2 border-[#003087]/20">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
              <CardTitle className="text-xl text-[#003087]">Complete Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {displayProfile ? (
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
                        <p className="font-semibold text-foreground">{displayProfile.details?.fullName || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-semibold text-foreground text-sm break-all">{displayProfile.details?.email || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Country</p>
                        <p className="font-semibold text-foreground">{displayProfile.details?.country || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Timezone</p>
                        <p className="font-semibold text-foreground">{displayProfile.details?.timeZone || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Primary Domain</p>
                        <p className="font-semibold text-foreground">{displayProfile.details?.primaryDomain || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={displayProfile.status === "ACCEPTED" ? "bg-green-500" : "bg-yellow-500"}>
                          {displayProfile.status || "PENDING"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Elite Skills */}
                  {displayProfile.details?.eliteSkillCards && displayProfile.details.eliteSkillCards.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#003087] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                        Elite Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.details.eliteSkillCards.map((skill: string, index: number) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools & Technologies */}
                  {displayProfile.details?.tools && displayProfile.details.tools.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#003087] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                        Tools & Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.details.tools.map((tool: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Domain Experience */}
                  {displayProfile.domainExperiences && displayProfile.domainExperiences.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#003087] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                        Professional Experience
                      </h3>
                      <div className="space-y-2">
                        {displayProfile.domainExperiences.map((exp: any, index: number) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-foreground">{exp.roleTitle}</span>
                            <Badge variant="outline" className="bg-[#003087] text-white">
                              {exp.years} {exp.years === 1 ? 'year' : 'years'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {displayProfile.availabilityWorkflow && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#003087] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                        Availability & Workflow
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayProfile.availabilityWorkflow.weeklyCommitmentMinHours && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Weekly Commitment</p>
                            <p className="font-semibold text-foreground">
                              {displayProfile.availabilityWorkflow.weeklyCommitmentMinHours}
                              {displayProfile.availabilityWorkflow.weeklyCommitmentMaxHours
                                ? `-${displayProfile.availabilityWorkflow.weeklyCommitmentMaxHours}`
                                : "+"}{" "}
                              hours/week
                            </p>
                          </div>
                        )}
                        {displayProfile.availabilityWorkflow.preferredTeamStyle && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Team Style</p>
                            <p className="font-semibold text-foreground">
                              {displayProfile.availabilityWorkflow.preferredTeamStyle.replace(/_/g, " ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Professional Links */}
                  {displayProfile.details?.professionalLinks && displayProfile.details.professionalLinks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#003087] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF6B35] rounded"></span>
                        Professional Links
                      </h3>
                      <div className="space-y-2">
                        {displayProfile.details.professionalLinks.map((link: string, index: number) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-gray-50 p-2 rounded"
                          >
                            <Globe className="h-4 w-4" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading profile data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Avatar className="w-24 h-24 mx-auto border-4 border-[#4C63D2]">
                <AvatarImage src={avatar || "/placeholder-user.jpg"} alt={displayProfile?.details?.fullName} />
                <AvatarFallback>
                  {displayProfile?.details?.fullName
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{displayProfile?.details?.fullName || user?.username}</p>
                <p className="text-sm text-muted-foreground">{displayProfile?.details?.primaryDomain || "Freelancer"}</p>
              </div>
              <Button className="w-full bg-[#4C63D2] hover:bg-[#3d4fa8] text-sm">View Profile</Button>
            </CardContent>
          </Card>

          {/* Current Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base md:text-lg">Current Projects</CardTitle>
              <Button variant="ghost" size="sm">
                <span className="text-xs">More</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-r from-[#4C63D2] to-[#6B5DD6] rounded-lg p-4 text-white"
                >
                  <p className="font-semibold text-sm">{project.name}</p>
                  <p className="text-xs text-blue-100 mb-2 capitalize">{project.status}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
