"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserDetails } from "@/lib/api/storage"

type FreelancerRegistration = {
  id: string
  userId: string | null
  isAccepted: boolean
  trashedAt: string | null
  trashedBy: string | null
  whoYouAre: {
    id: string
    fullName: string
    email: string
    timeZone: string
    country: string
    professionalLinks: {
      github?: string
      linkedin?: string
      personalSite?: string
    }
    phone: string | null
  }
  coreRole: {
    id: string
    primaryDomain: string
  }
  eliteSkillCards: {
    id: string
    selectedSkills: string[]
  }
  toolstackProficiency: {
    id: string
    selectedTools: {
      category: string
      tools: string[]
    }[]
  }
  domainExperience: {
    id: string
    roles: {
      title: string
      years: number
    }[]
  }
  industryExperience: {
    id: string
    selectedIndustries: string[]
  }
  availabilityWorkflow: {
    id: string
    weeklyCommitment: number
    workingHours: string[]
    collaborationTools: string[]
    teamStyle: string
    screenSharing: string
    availabilityExceptions: string
  }
  softSkills: {
    id: string
    collaborationStyle: string
    communicationFrequency: string
    conflictResolution: string
    languages: string[]
    teamVsSolo: string
  }
  certifications: {
    id: string
    certificates: {
      name: string
      url: string
    }[]
  }
  projectQuoting: {
    id: string
    compensationPreference: string
    smallProjectPrice: number
    midProjectPrice: number
    longTermPrice: number
    milestoneTerms: string
    willSubmitProposals: string
  }
  legalAgreements: {
    id: string
    agreements: {
      id: string
      accepted: boolean
    }[]
    identityVerification: {
      id: string
      idType: string
      taxDocType: string
      addressVerified: boolean
    }
    workAuthorization: {
      id: string
      interested: boolean
    }
  }
}

type ApiResponse = {
  success: boolean
  status: number
  message: string
  data: FreelancerRegistration[] | FreelancerRegistration | null
  requestInfo: {
    ip: string
    url: string
    method: string
  }
}

export default function AcceptedFreelancersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [freelancers, setFreelancers] = useState<FreelancerRegistration[]>([])
  const [filteredFreelancers, setFilteredFreelancers] = useState<FreelancerRegistration[]>([])
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerRegistration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    fetchAcceptedFreelancers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = freelancers.filter(
        (freelancer) =>
          freelancer.whoYouAre.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.whoYouAre.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.coreRole.primaryDomain.toLowerCase().includes(searchTerm.toLowerCase()),
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
        toast({
          title: "Error",
          description: "Please login to view accepted freelancers",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/freelancer/admin/freelancers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const result: ApiResponse = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setFreelancers(result.data)
        setFilteredFreelancers(result.data)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch accepted freelancers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching accepted freelancers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch accepted freelancers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const viewFreelancer = async (id: string) => {
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      const response = await fetch(`https://api.primelogicsol.com/api/v1/freelancer/registrations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const result: ApiResponse = await response.json()

      if (result.success && result.data && !Array.isArray(result.data)) {
        setSelectedFreelancer(result.data)
        setIsDialogOpen(true)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch freelancer details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching freelancer:", error)
      toast({
        title: "Error",
        description: "Failed to fetch freelancer details",
        variant: "destructive",
      })
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFreelancers = filteredFreelancers.slice(startIndex, endIndex)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Accepted Freelancers</h1>
        <p className="text-muted-foreground">View all accepted freelancers in the system</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="rounded-lg bg-muted py-12 text-center">
          <p className="text-lg text-muted-foreground">No accepted freelancers found</p>
        </div>
      ) : (
        <>
          {/* Accepted Freelancers Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFreelancers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No freelancers available
                    </TableCell>
                  </TableRow>
                ) : (
                  currentFreelancers.map((freelancer) => (
                    <TableRow key={freelancer.id}>
                      <TableCell className="font-medium">{freelancer.whoYouAre.fullName}</TableCell>
                      <TableCell>{freelancer.whoYouAre.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{freelancer.coreRole.primaryDomain}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {freelancer.eliteSkillCards.selectedSkills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {freelancer.eliteSkillCards.selectedSkills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{freelancer.eliteSkillCards.selectedSkills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {freelancer.domainExperience.roles.reduce((total, role) => total + role.years, 0)} years
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => viewFreelancer(freelancer.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredFreelancers.length)} of{" "}
              {filteredFreelancers.length} freelancers
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Freelancer Details</DialogTitle>
            <DialogDescription>Complete information about the accepted freelancer</DialogDescription>
          </DialogHeader>

          {selectedFreelancer && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.whoYouAre.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.whoYouAre.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time Zone</p>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.whoYouAre.timeZone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.whoYouAre.country}</p>
                  </div>
                  {selectedFreelancer.whoYouAre.professionalLinks.github && (
                    <div>
                      <p className="text-sm font-medium">GitHub</p>
                      <a
                        href={selectedFreelancer.whoYouAre.professionalLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedFreelancer.whoYouAre.professionalLinks.github}
                      </a>
                    </div>
                  )}
                  {selectedFreelancer.whoYouAre.professionalLinks.linkedin && (
                    <div>
                      <p className="text-sm font-medium">LinkedIn</p>
                      <a
                        href={selectedFreelancer.whoYouAre.professionalLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedFreelancer.whoYouAre.professionalLinks.linkedin}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Core Role & Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Role & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Primary Domain</p>
                    <Badge>{selectedFreelancer.coreRole.primaryDomain}</Badge>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Elite Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.eliteSkillCards.selectedSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Toolstack */}
              <Card>
                <CardHeader>
                  <CardTitle>Toolstack Proficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFreelancer.toolstackProficiency.selectedTools.map((toolGroup, idx) => (
                    <div key={idx}>
                      <p className="mb-2 text-sm font-medium">{toolGroup.category}</p>
                      <div className="flex flex-wrap gap-2">
                        {toolGroup.tools.map((tool, toolIdx) => (
                          <Badge key={toolIdx} variant="outline">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Domain Experience</p>
                    <div className="space-y-2">
                      {selectedFreelancer.domainExperience.roles.map((role, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{role.title}</span>
                          <Badge variant="secondary">{role.years} years</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Industry Experience</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.industryExperience.selectedIndustries.map((industry, idx) => (
                        <Badge key={idx} variant="outline">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability & Workflow</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Weekly Commitment</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFreelancer.availabilityWorkflow.weeklyCommitment} hours/week
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Team Style</p>
                    <p className="text-sm text-muted-foreground">{selectedFreelancer.availabilityWorkflow.teamStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Working Hours</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFreelancer.availabilityWorkflow.workingHours.map((hour, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Collaboration Tools</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFreelancer.availabilityWorkflow.collaborationTools.map((tool, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Quoting */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Quoting</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Compensation Preference</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFreelancer.projectQuoting.compensationPreference}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Small Project Rate</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedFreelancer.projectQuoting.smallProjectPrice}/hr
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mid Project Rate</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedFreelancer.projectQuoting.midProjectPrice}/hr
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Long-term Rate</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedFreelancer.projectQuoting.longTermPrice}/hr
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              {selectedFreelancer.certifications.certificates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFreelancer.certifications.certificates.map((cert, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{cert.name}</span>
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
