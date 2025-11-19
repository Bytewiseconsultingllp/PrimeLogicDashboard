"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Edit, Trash2, Loader2, User, Mail, MapPin, Clock, Briefcase, Award, Globe, Target, Users, DollarSign, RefreshCw, Star, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"

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
  domainExperiences?: Array<{
    roleTitle: string
    years: number
  }>
  availabilityWorkflow?: {
    weeklyCommitmentMinHours: number
    weeklyCommitmentMaxHours?: number
    timeZone: string
    workingWindows: string[]
    collaborationTools: string[]
    preferredTeamStyle: string
    liveScreenSharingPreference: string
  }
  softSkills?: {
    preferredCollaborationStyle: string
    communicationFrequency: string
    conflictResolutionStyle: string
    languages: string[]
    teamVsSoloPreference: string
  }
  certifications?: Array<{
    certificateName: string
    certificateUrl: string
  }>
  projectBidding?: {
    compensationPreference: string
    smallProjectMin?: number
    smallProjectMax?: number
    midProjectMin?: number
    midProjectMax?: number
    longTermMin?: number
    longTermMax?: number
    milestonePaymentTerms: string
    proposalSubmission: string
  }
  user?: {
    uid: string
    username: string
    fullName: string
    email: string
  }
  assignedProjects?: Array<{
    id: string
    details: {
      title: string
      companyName: string
    }
    status: string
    progress?: number
  }>
  completedProjects?: Array<{
    id: string
    details: {
      companyName: string
    }
    completedAt: string
  }>
  kpi?: {
    points: number
    rank: string
  }
}

export default function AllFreelancers() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([])
  const [filteredFreelancers, setFilteredFreelancers] = useState<FreelancerProfile[]>([])
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAcceptedFreelancers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = freelancers.filter(
        (freelancer) =>
          freelancer.details.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.details.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.details.primaryDomain.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredFreelancers(filtered)
    } else {
      setFilteredFreelancers(freelancers)
    }
    setCurrentPage(1)
  }, [searchTerm, freelancers])

  const fetchAcceptedFreelancers = async () => {
    setIsLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        console.error("❌ No access token found")
        toast.error("Authentication required. Please login again.")
        return
      }

      // Using the admin API endpoint for freelancers with ACCEPTED status
      const apiUrl = `${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?status=ACCEPTED&page=1&limit=100`
      console.log("🔄 Fetching accepted freelancers:")
      console.log("   API URL:", apiUrl)
      console.log("   Token present:", !!token)
      console.log("   Token preview:", token ? `${token.substring(0, 20)}...` : "None")

      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      console.log("📡 API Response:")
      console.log("   Status:", response.status)
      console.log("   Status Text:", response.statusText)
      console.log("   Headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Accepted freelancers response:", data)
        
        // Handle different possible API response structures
        let freelancersList: any[] = []
        
        if (Array.isArray(data)) {
          // Direct array response
          freelancersList = data
        } else if (data.data) {
          if (Array.isArray(data.data)) {
            // data.data is array
            freelancersList = data.data
          } else if (data.data.freelancers && Array.isArray(data.data.freelancers)) {
            // data.data.freelancers is array
            freelancersList = data.data.freelancers
          } else if (data.data.items && Array.isArray(data.data.items)) {
            // data.data.items is array (pagination structure)
            freelancersList = data.data.items
          }
        } else if (data.freelancers && Array.isArray(data.freelancers)) {
          // data.freelancers is array
          freelancersList = data.freelancers
        }
        
        console.log("📋 Extracted freelancers list:", freelancersList)
        console.log("📋 Number of freelancers from API:", freelancersList.length)
        
        // Log first freelancer structure for debugging
        if (freelancersList.length > 0) {
          console.log("📋 First freelancer structure:", JSON.stringify(freelancersList[0], null, 2))
        }
        
        // Transform and filter the API data to match our interface
        // Only include freelancers with ACCEPTED status and valid data
        const transformedFreelancers = freelancersList
          .filter((freelancer: any) => {
            // Only include freelancers with ACCEPTED status
            const isAccepted = freelancer.status === "ACCEPTED"
            
            // Check if freelancer has valid details
            const details = freelancer.details
            const hasValidDetails = details && details.fullName && details.email
            
            if (!isAccepted) {
              console.log("🚫 Filtering out non-accepted freelancer:", freelancer.status, freelancer.id)
            }
            
            if (!hasValidDetails) {
              console.log("🚫 Filtering out freelancer with invalid details:", freelancer.id)
            }
            
            return isAccepted && hasValidDetails
          })
          .map((freelancer: any) => {
            // Extract details from the nested structure
            const details = freelancer.details
            const user = freelancer.user
            
            return {
              id: freelancer.id,
              status: freelancer.status,
              userId: freelancer.userId,
              createdAt: freelancer.createdAt,
              updatedAt: freelancer.updatedAt,
              reviewedBy: freelancer.reviewedBy,
              reviewedAt: freelancer.reviewedAt,
              rejectionReason: freelancer.rejectionReason,
              details: {
                fullName: details.fullName,
                email: details.email,
                country: details.country,
                timeZone: details.timeZone,
                primaryDomain: details.primaryDomain,
                professionalLinks: details.professionalLinks || [],
                eliteSkillCards: details.eliteSkillCards || [],
                tools: details.tools || [],
                selectedIndustries: details.selectedIndustries || [],
                otherNote: details.otherNote || ""
              },
              domainExperiences: freelancer.domainExperiences || [],
              availabilityWorkflow: freelancer.availabilityWorkflow,
              softSkills: freelancer.softSkills,
              certifications: freelancer.certifications || [],
              projectBidding: freelancer.projectBidding,
              user: user,
              kpi: user ? {
                points: user.kpiRankPoints || 0,
                rank: user.kpiRank || "BRONZE"
              } : undefined,
              assignedProjects: freelancer.assignedProjects || [],
              completedProjects: freelancer.completedProjects || []
            }
          })
        
        console.log("✅ Transformed freelancers:", transformedFreelancers)
        setFreelancers(transformedFreelancers)
        setFilteredFreelancers(transformedFreelancers)
        
        if (transformedFreelancers.length === 0) {
          toast.info("No accepted freelancers found")
        } else {
          toast.success(`Loaded ${transformedFreelancers.length} accepted freelancers`)
        }
      } else if (response.status === 401) {
        console.error("❌ Authentication failed")
        toast.error("Session expired. Please login again.")
        setFreelancers([])
        setFilteredFreelancers([])
      } else if (response.status === 403) {
        console.error("❌ Access forbidden")
        toast.error("You don't have permission to view freelancers.")
        setFreelancers([])
        setFilteredFreelancers([])
      } else if (response.status === 404) {
        console.error("❌ Endpoint not found")
        toast.error("Freelancers endpoint not available.")
        setFreelancers([])
        setFilteredFreelancers([])
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch freelancers:", response.status, errorData)
        toast.error(`Failed to load freelancers: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching freelancers:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFreelancer = async (freelancerId: string) => {
    setActionLoading(freelancerId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        toast.success("Freelancer deleted successfully")
        fetchAcceptedFreelancers() // Refresh the list
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to delete freelancer:", errorData)
        toast.error("Failed to delete freelancer")
      }
    } catch (error) {
      console.error("Error deleting freelancer:", error)
      toast.error("Failed to delete freelancer")
    } finally {
      setActionLoading(null)
    }
  }

  const viewFreelancerDetails = async (freelancer: FreelancerProfile) => {
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      // Fetch detailed freelancer profile including projects and KPI
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancer.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Detailed freelancer data:", data)
        setSelectedFreelancer(data.data || freelancer)
        setIsDialogOpen(true)
      } else {
        // Fallback to basic data if detailed fetch fails
        setSelectedFreelancer(freelancer)
        setIsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching freelancer details:", error)
      // Fallback to basic data
      setSelectedFreelancer(freelancer)
      setIsDialogOpen(true)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return <Badge className="bg-yellow-500">Pending Review</Badge>
      case "ACCEPTED":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "REJECTED":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
    return <Badge className={colors[rank as keyof typeof colors] || "bg-gray-500"}>{rank}</Badge>
  }

  const getCountryName = (countryCode: string) => {
    const countryMap: { [key: string]: string } = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'CN': 'China',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'IT': 'Italy',
      'ES': 'Spain',
      'RU': 'Russia',
      'KR': 'South Korea',
      'NL': 'Netherlands',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'GR': 'Greece',
      'PT': 'Portugal',
      'IE': 'Ireland',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'IL': 'Israel',
      'TR': 'Turkey',
      'SA': 'Saudi Arabia',
      'AE': 'UAE',
      'EG': 'Egypt',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'GH': 'Ghana',
      'SG': 'Singapore',
      'MY': 'Malaysia',
      'TH': 'Thailand',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'VN': 'Vietnam',
      'BD': 'Bangladesh',
      'PK': 'Pakistan',
      'LK': 'Sri Lanka',
      'NP': 'Nepal',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'VE': 'Venezuela',
      'UY': 'Uruguay',
      'EC': 'Ecuador',
      'BO': 'Bolivia',
      'PY': 'Paraguay',
      'CR': 'Costa Rica',
      'PA': 'Panama',
      'GT': 'Guatemala',
      'HN': 'Honduras',
      'SV': 'El Salvador',
      'NI': 'Nicaragua',
      'DO': 'Dominican Republic',
      'JM': 'Jamaica',
      'TT': 'Trinidad and Tobago',
      'BB': 'Barbados',
      'BS': 'Bahamas',
      'BZ': 'Belize',
      'GY': 'Guyana',
      'SR': 'Suriname'
    }
    return countryMap[countryCode] || countryCode
  }

  // Pagination
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFreelancers = filteredFreelancers.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading freelancers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-[#003087] to-[#0066cc] text-white rounded-t-lg">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">All Freelancers</h2>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {filteredFreelancers.length} active freelancer{filteredFreelancers.length !== 1 ? 's' : ''} in the platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Badge className="bg-white/20 text-white border-white/30 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                {filteredFreelancers.length} Active
              </Badge>
              <Button 
                onClick={fetchAcceptedFreelancers} 
                variant="secondary" 
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#003087] focus:ring-[#003087]"
                />
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 justify-center sm:justify-start">
                <Star className="w-4 h-4" />
                <span className="whitespace-nowrap">Active freelancers</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 min-w-[200px]">Freelancer</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Domain</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Country</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">KPI Rank</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden xl:table-cell">Joined</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {currentFreelancers.length > 0 ? (
                  currentFreelancers.map((freelancer) => (
                    <TableRow key={freelancer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {freelancer.details.fullName
                                ?.split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .toUpperCase() || "FL"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{freelancer.details.fullName}</p>
                            <p className="text-sm text-muted-foreground">{freelancer.details.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{freelancer.details.primaryDomain}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{getCountryName(freelancer.details.country)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {freelancer.kpi ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                            {getKPIBadge(freelancer.kpi.rank)}
                            <span className="text-xs text-muted-foreground">
                              {freelancer.kpi.points} pts
                            </span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">No KPI</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{new Date(freelancer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewFreelancerDetails(freelancer)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 px-2 sm:px-3"
                          >
                            <Eye className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/Administrator/freelancer-profiles/${freelancer.id}/edit`)}
                            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 px-2 sm:px-3"
                          >
                            <Edit className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFreelancer(freelancer.id)}
                            disabled={actionLoading === freelancer.id}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-2 sm:px-3"
                          >
                            {actionLoading === freelancer.id ? (
                              <Loader2 className="w-4 h-4 animate-spin sm:mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 sm:mr-1" />
                            )}
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <User className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No freelancers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredFreelancers.length)} of {filteredFreelancers.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <span className="text-xs sm:text-sm px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Freelancer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl lg:max-w-7xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#003087] to-[#0066cc] text-white p-4 sm:p-6 rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/30">
                    <AvatarFallback className="text-lg sm:text-xl bg-white/20 text-white">
                      {selectedFreelancer?.details.fullName
                        ?.split(" ")
                        .map((word: string) => word[0])
                        .join("")
                        .toUpperCase() || "FL"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedFreelancer?.details.fullName}</h2>
                    <p className="text-blue-100 flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{selectedFreelancer?.details.email}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                        {selectedFreelancer?.details.primaryDomain}
                      </Badge>
                      {selectedFreelancer && getStatusBadge(selectedFreelancer.status)}
                      {selectedFreelancer?.kpi && (
                        <Badge className="bg-yellow-500 text-white text-xs sm:text-sm">
                          {selectedFreelancer.kpi.rank} - {selectedFreelancer.kpi.points} pts
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-xs sm:text-sm text-blue-100">Freelancer ID</p>
                  <p className="font-mono text-[11px] sm:text-xs bg-white/10 px-2 py-1 rounded inline-block break-all">
                    {selectedFreelancer?.id || "-"}
                  </p>
                </div>
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-2 text-sm">
                Complete freelancer profile with all details and KPI information
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedFreelancer && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Personal & Contact Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Information */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                            <p className="text-lg font-semibold text-gray-900">{selectedFreelancer.details.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {selectedFreelancer.details.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {getCountryName(selectedFreelancer.details.country)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Timezone</p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {selectedFreelancer.details.timeZone}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                            <p className="font-mono text-sm text-gray-600">{selectedFreelancer.userId || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Primary Domain</p>
                            <p className="text-gray-900 flex items- gap-2">
                            <Badge className="bg-[#003087] text-white px-3 py-1 text-sm">
                              {selectedFreelancer.details.primaryDomain}
                            </Badge>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                {/* Projects Assigned */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Projects Assigned
                      {selectedFreelancer.assignedProjects && (
                        <Badge variant="secondary">{selectedFreelancer.assignedProjects.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedFreelancer.assignedProjects?.length ? (
                      <div className="space-y-3">
                        {selectedFreelancer.assignedProjects.map((project, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{project.details?.companyName || project.details?.title || "Untitled Project"}</p>
                              <p className="text-xs text-muted-foreground break-all">
                                ID: {project.id}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">Status: {project.status}</p>
                            </div>
                            {project.progress !== undefined && (
                              <div className="text-right">
                                <p className="text-sm font-medium">{project.progress}% Complete</p>
                                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-[#003087] h-2 rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No assigned projects</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Projects Completed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Projects Completed
                      {selectedFreelancer.completedProjects && (
                        <Badge variant="secondary">{selectedFreelancer.completedProjects.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedFreelancer.completedProjects?.length ? (
                      <div className="space-y-3">
                        {selectedFreelancer.completedProjects.map((project, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium">{project.details.companyName}</p>
                              <p className="text-sm text-muted-foreground">
                                Completed: {new Date(project.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className="bg-green-500">Completed</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No completed projects</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - KPI and Skills */}
              <div className="space-y-6">
                {/* Right Column - KPI & Skills */}
                <div className="space-y-6">
                  {/* KPI Information */}
                  {selectedFreelancer.kpi && (
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="bg-purple-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                          <Award className="w-5 h-5" />
                          KPI Rank
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 text-center">
                        <div className="space-y-4">
                          <div className="text-4xl font-bold text-purple-600">
                            {selectedFreelancer.kpi.points}
                          </div>
                          <div className="text-sm text-gray-500">Points</div>
                          {getKPIBadge(selectedFreelancer.kpi.rank)}
                          <Separator />
                          <div className="text-xs text-gray-500">
                            Current KPI Status
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Skills */}
                {selectedFreelancer.details.eliteSkillCards?.length && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Elite Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedFreelancer.details.eliteSkillCards.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tools */}
                {selectedFreelancer.details.tools?.length && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Tools & Technologies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedFreelancer.details.tools.map((tool: string, index: number) => (
                          <Badge key={index} variant="outline">{tool}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                  {/* Professional Links */}
                  {selectedFreelancer.details.professionalLinks?.length && (
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardHeader className="bg-indigo-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
                          <Globe className="w-5 h-5" />
                          Professional Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {selectedFreelancer.details.professionalLinks.map((link: string, index: number) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                            >
                              <Globe className="w-4 h-4 text-indigo-600" />
                              <span className="text-blue-600 hover:underline">{link}</span>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end gap-3 pt-6 border-t bg-gray-50 p-6 -mx-6 -mb-6 rounded-b-lg">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
