"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Edit, Trash2, Loader2, User, Mail, MapPin, Clock, Briefcase, Award, Globe, Target, Users, DollarSign } from "lucide-react"
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
        toast.error("Authentication required")
        return
      }

      // Using the new admin API endpoint for freelancers with ACCEPTED status
      console.log("🔄 Fetching accepted freelancers with API:", `${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?status=ACCEPTED&page=1&limit=100`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?status=ACCEPTED&page=1&limit=100`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Accepted freelancers:", data)
        setFreelancers(data.data?.freelancers || [])
        setFilteredFreelancers(data.data?.freelancers || [])
        toast.success(`Loaded ${data.data?.freelancers?.length || 0} accepted freelancers`)
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch freelancers:", errorData)
        toast.error("Failed to load freelancers")
      }
    } catch (error) {
      console.error("Error fetching freelancers:", error)
      toast.error("Failed to load freelancers")
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Freelancers ({filteredFreelancers.length})</span>
            <Button onClick={fetchAcceptedFreelancers} variant="outline" size="sm">
              Refresh
            </Button>
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
                  <TableHead>KPI Rank</TableHead>
                  <TableHead>Joined</TableHead>
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
                          {freelancer.details.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        {freelancer.kpi ? (
                          <div className="flex items-center gap-2">
                            {getKPIBadge(freelancer.kpi.rank)}
                            <span className="text-sm text-muted-foreground">
                              {freelancer.kpi.points} pts
                            </span>
                          </div>
                        ) : (
                          <Badge variant="secondary">No KPI</Badge>
                        )}
                      </TableCell>
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
                            onClick={() => viewFreelancerDetails(freelancer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFreelancer(freelancer.id)}
                            disabled={actionLoading === freelancer.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {actionLoading === freelancer.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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

      {/* Detailed Freelancer Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg">
                  {selectedFreelancer?.details.fullName
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase() || "FL"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{selectedFreelancer?.details.fullName}</h3>
                <p className="text-sm text-muted-foreground">{selectedFreelancer?.details.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedFreelancer && getStatusBadge(selectedFreelancer.status)}
                  {selectedFreelancer?.kpi && getKPIBadge(selectedFreelancer.kpi.rank)}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Complete freelancer profile with projects and KPI information
            </DialogDescription>
          </DialogHeader>

          {selectedFreelancer && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Information
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
                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm">{selectedFreelancer.userId || "N/A"}</p>
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
                              <p className="font-medium">{project.details.companyName}</p>
                              <p className="text-sm text-muted-foreground">Status: {project.status}</p>
                            </div>
                            {project.progress !== undefined && (
                              <div className="text-right">
                                <p className="text-sm font-medium">{project.progress}% Complete</p>
                                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
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
                {/* KPI Rank */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      KPI Rank
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {selectedFreelancer.kpi ? (
                      <div className="space-y-4">
                        <div className="text-3xl font-bold text-[#003087]">
                          {selectedFreelancer.kpi.points}
                        </div>
                        <div className="text-sm text-muted-foreground">Points</div>
                        {getKPIBadge(selectedFreelancer.kpi.rank)}
                        <Separator />
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Update KPI Rank
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Adjust freelancer's KPI points and rank
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Award className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">No KPI data available</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Assign KPI Rank
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                            className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                          >
                            <Globe className="w-3 h-3" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
