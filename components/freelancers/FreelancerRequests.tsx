"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, CheckCircle, XCircle, Loader2, User, Mail, MapPin, Clock, Briefcase, Award, Globe, RefreshCw } from "lucide-react"
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
}

export default function FreelancerRequests() {
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
    fetchFreelancerRequests()
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

  const fetchFreelancerRequests = async () => {
    setIsLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        console.error("❌ No access token found")
        toast.error("Authentication required. Please login again.")
        return
      }

      // Using the correct admin API endpoint for freelancers with PENDING_REVIEW status
      const apiUrl = `${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?status=PENDING_REVIEW&page=1&limit=100`
      console.log("🔄 Fetching freelancer requests:")
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
        console.log("✅ Freelancer requests response:", data)
        
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
        // Only include freelancers with PENDING_REVIEW status and valid data
        const transformedFreelancers = freelancersList
          .filter((freelancer: any) => {
            // Only include freelancers with PENDING_REVIEW status
            const isPendingReview = freelancer.status === "PENDING_REVIEW"
            
            // Check if freelancer has valid details
            const details = freelancer.details
            const hasValidDetails = details && details.fullName && details.email
            
            if (!isPendingReview) {
              console.log("🚫 Filtering out non-pending freelancer:", freelancer.status, freelancer.id)
            }
            
            if (!hasValidDetails) {
              console.log("🚫 Filtering out freelancer with invalid details:", freelancer.id)
            }
            
            return isPendingReview && hasValidDetails
          })
          .map((freelancer: any) => {
            // Extract details from the nested structure
            const details = freelancer.details
            
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
              user: freelancer.user
            }
          })
        
        console.log("✅ Transformed freelancers:", transformedFreelancers)
        setFreelancers(transformedFreelancers)
        setFilteredFreelancers(transformedFreelancers)
        
        if (transformedFreelancers.length === 0) {
          toast.info("No pending freelancer requests found")
        } else {
          toast.success(`Loaded ${transformedFreelancers.length} pending requests`)
        }
      } else if (response.status === 401) {
        console.error("❌ Authentication failed")
        toast.error("Session expired. Please login again.")
        // Clear any existing data
        setFreelancers([])
        setFilteredFreelancers([])
      } else if (response.status === 403) {
        console.error("❌ Access forbidden")
        toast.error("You don't have permission to view freelancer requests.")
        setFreelancers([])
        setFilteredFreelancers([])
      } else if (response.status === 404) {
        console.error("❌ Endpoint not found")
        toast.error("Freelancer requests endpoint not available.")
        setFreelancers([])
        setFilteredFreelancers([])
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch freelancer requests:", response.status, errorData)
        toast.error(`Failed to load freelancer requests: ${response.status}`)
        // Don't clear existing data on server errors, user might want to retry
      }
    } catch (error) {
      console.error("❌ Error fetching freelancer requests:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptFreelancer = async (freelancerId: string) => {
    setActionLoading(freelancerId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log("🔄 Accepting freelancer:", freelancerId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/review`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "ACCEPT"
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Freelancer accepted:", result)
        toast.success("Freelancer accepted successfully")
        fetchFreelancerRequests() // Refresh the list
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
      } else {
        try {
          const errorData = await response.json()
          console.error("❌ Failed to accept freelancer:", response.status, errorData)
          toast.error(errorData.message || `Failed to accept freelancer: ${response.status}`)
        } catch {
          const errorText = await response.text()
          console.error("❌ Failed to accept freelancer:", response.status, errorText)
          toast.error(`Failed to accept freelancer: ${response.status}`)
        }
      }
    } catch (error) {
      console.error("❌ Error accepting freelancer:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectFreelancer = async (freelancerId: string, reason?: string) => {
    setActionLoading(freelancerId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log("🔄 Rejecting freelancer:", freelancerId, "with reason:", reason)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/review`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "REJECT",
          reason: reason || "Profile does not meet requirements"
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Freelancer rejected:", result)
        toast.success("Freelancer rejected successfully")
        fetchFreelancerRequests() // Refresh the list
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
      } else {
        try {
          const errorData = await response.json()
          console.error("❌ Failed to reject freelancer:", response.status, errorData)
          toast.error(errorData.message || `Failed to reject freelancer: ${response.status}`)
        } catch {
          const errorText = await response.text()
          console.error("❌ Failed to reject freelancer:", response.status, errorText)
          toast.error(`Failed to reject freelancer: ${response.status}`)
        }
      }
    } catch (error) {
      console.error("❌ Error rejecting freelancer:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const viewFreelancer = (freelancer: FreelancerProfile) => {
    setSelectedFreelancer(freelancer)
    setIsDialogOpen(true)
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
      'SR': 'Suriname',
      'FK': 'Falkland Islands',
      'GF': 'French Guiana',
      'UZ': 'Uzbekistan',
      'KZ': 'Kazakhstan',
      'KG': 'Kyrgyzstan',
      'TJ': 'Tajikistan',
      'TM': 'Turkmenistan',
      'AF': 'Afghanistan',
      'IR': 'Iran',
      'IQ': 'Iraq',
      'SY': 'Syria',
      'LB': 'Lebanon',
      'JO': 'Jordan',
      'PS': 'Palestine',
      'YE': 'Yemen',
      'OM': 'Oman',
      'QA': 'Qatar',
      'BH': 'Bahrain',
      'KW': 'Kuwait',
      'LY': 'Libya',
      'TN': 'Tunisia',
      'DZ': 'Algeria',
      'MA': 'Morocco',
      'SD': 'Sudan',
      'ET': 'Ethiopia',
      'SO': 'Somalia',
      'DJ': 'Djibouti',
      'ER': 'Eritrea',
      'UG': 'Uganda',
      'TZ': 'Tanzania',
      'RW': 'Rwanda',
      'BI': 'Burundi',
      'CD': 'Democratic Republic of Congo',
      'CG': 'Republic of Congo',
      'CF': 'Central African Republic',
      'TD': 'Chad',
      'CM': 'Cameroon',
      'GA': 'Gabon',
      'GQ': 'Equatorial Guinea',
      'ST': 'São Tomé and Príncipe',
      'CV': 'Cape Verde',
      'GW': 'Guinea-Bissau',
      'GN': 'Guinea',
      'SL': 'Sierra Leone',
      'LR': 'Liberia',
      'CI': 'Ivory Coast',
      'BF': 'Burkina Faso',
      'ML': 'Mali',
      'NE': 'Niger',
      'SN': 'Senegal',
      'GM': 'Gambia',
      'MR': 'Mauritania',
      'EH': 'Western Sahara',
      'MW': 'Malawi',
      'ZM': 'Zambia',
      'ZW': 'Zimbabwe',
      'BW': 'Botswana',
      'NA': 'Namibia',
      'SZ': 'Eswatini',
      'LS': 'Lesotho',
      'MG': 'Madagascar',
      'MU': 'Mauritius',
      'SC': 'Seychelles',
      'KM': 'Comoros',
      'YT': 'Mayotte',
      'RE': 'Réunion',
      'MZ': 'Mozambique',
      'AO': 'Angola'
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
        <p className="ml-3 text-muted-foreground">Loading freelancer requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-[#003087] to-[#0066cc] text-white rounded-t-lg">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Freelancer Requests</h2>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {filteredFreelancers.length} pending application{filteredFreelancers.length !== 1 ? 's' : ''} awaiting review
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Badge className="bg-white/20 text-white border-white/30 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                {filteredFreelancers.length} Pending
              </Badge>
              <Button 
                onClick={fetchFreelancerRequests} 
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
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell>
                        <Badge variant="outline">{freelancer.details.primaryDomain}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {getCountryName(freelancer.details.country)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(freelancer.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {new Date(freelancer.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewFreelancer(freelancer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAcceptFreelancer(freelancer.id)}
                            disabled={actionLoading === freelancer.id}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {actionLoading === freelancer.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectFreelancer(freelancer.id)}
                            disabled={actionLoading === freelancer.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
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
                        <p className="text-muted-foreground">No freelancer requests found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredFreelancers.length)} of {filteredFreelancers.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Freelancer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {selectedFreelancer?.details.fullName
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase() || "FL"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{selectedFreelancer?.details.fullName}</h3>
                <p className="text-sm text-muted-foreground">{selectedFreelancer?.details.email}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Review freelancer profile and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedFreelancer && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{selectedFreelancer.details.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="font-semibold">{selectedFreelancer.details.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Country</p>
                      <p className="font-semibold">{selectedFreelancer.details.country}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                      <p className="font-semibold">{selectedFreelancer.details.timeZone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Primary Domain</p>
                      <Badge className="bg-[#003087]">{selectedFreelancer.details.primaryDomain}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      {getStatusBadge(selectedFreelancer.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills and Experience */}
              {(selectedFreelancer.details.eliteSkillCards?.length || selectedFreelancer.domainExperiences?.length) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Skills & Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedFreelancer.details.eliteSkillCards?.length && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Elite Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedFreelancer.details.eliteSkillCards.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedFreelancer.domainExperiences?.length && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Domain Experience</p>
                        <div className="space-y-2">
                          {selectedFreelancer.domainExperiences.map((exp, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{exp.roleTitle}</span>
                              <Badge variant="outline">{exp.years} years</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tools and Technologies */}
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Professional Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFreelancer.details.professionalLinks.map((link: string, index: number) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          {link}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes */}
              {selectedFreelancer.details.otherNote && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedFreelancer.details.otherNote}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRejectFreelancer(selectedFreelancer.id)
                    setIsDialogOpen(false)
                  }}
                  disabled={actionLoading === selectedFreelancer.id}
                >
                  {actionLoading === selectedFreelancer.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleAcceptFreelancer(selectedFreelancer.id)
                    setIsDialogOpen(false)
                  }}
                  disabled={actionLoading === selectedFreelancer.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === selectedFreelancer.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
