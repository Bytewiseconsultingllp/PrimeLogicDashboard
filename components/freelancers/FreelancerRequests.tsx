"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, CheckCircle, XCircle, Loader2, User, Mail, MapPin, Clock, Briefcase, Award, Globe } from "lucide-react"
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
        toast.error("Authentication required")
        return
      }

      // Using the new admin API endpoint for freelancers with PENDING_REVIEW status
      console.log("🔄 Fetching freelancer requests with API:", `${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?status=PENDING_REVIEW&page=1&limit=100`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers?status=PENDING_REVIEW&page=1&limit=100`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Freelancer requests:", data)
        setFreelancers(data.data?.freelancers || [])
        setFilteredFreelancers(data.data?.freelancers || [])
        toast.success(`Loaded ${data.data?.freelancers?.length || 0} pending requests`)
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch freelancer requests:", errorData)
        toast.error("Failed to load freelancer requests")
      }
    } catch (error) {
      console.error("Error fetching freelancer requests:", error)
      toast.error("Failed to load freelancer requests")
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/accept`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        toast.success("Freelancer accepted successfully")
        fetchFreelancerRequests() // Refresh the list
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to accept freelancer:", errorData)
        toast.error("Failed to accept freelancer")
      }
    } catch (error) {
      console.error("Error accepting freelancer:", error)
      toast.error("Failed to accept freelancer")
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/freelancers/${freelancerId}/reject`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rejectionReason: reason || "Profile does not meet requirements"
        })
      })

      if (response.ok) {
        toast.success("Freelancer rejected")
        fetchFreelancerRequests() // Refresh the list
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to reject freelancer:", errorData)
        toast.error("Failed to reject freelancer")
      }
    } catch (error) {
      console.error("Error rejecting freelancer:", error)
      toast.error("Failed to reject freelancer")
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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Freelancer Requests ({filteredFreelancers.length})</span>
            <Button onClick={fetchFreelancerRequests} variant="outline" size="sm">
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
                          {freelancer.details.country}
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
