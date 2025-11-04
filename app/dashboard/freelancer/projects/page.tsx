// // "use client"

// // import { useEffect, useState } from "react"
// // import Link from "next/link"
// // import { Card, CardContent } from "@/components/ui/card"
// // import { Button } from "@/components/ui/button"
// // import { Badge } from "@/components/ui/badge"
// // import { Loader2, ArrowRight } from "lucide-react"

// // interface Project {
// //   id: string
// //   projectName: string
// //   projectDescription: string
// //   budget: number
// //   timeline: string
// //   status: string
// // }

// // export default function ProjectsPage() {
// //   const [projects, setProjects] = useState<Project[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)

// //   useEffect(() => {
// //     const fetchProjects = async () => {
// //       try {
// //         setLoading(true)
// //         const token = localStorage.getItem("authToken")
// //         const response = await fetch("/api/projects", {
// //           headers: { Authorization: `Bearer ${token}` },
// //         })
// //         const data = await response.json()

// //         if (data.success) {
// //           setProjects(data.data)
// //         } else {
// //           setError(data.error || "Failed to fetch projects")
// //         }
// //       } catch (err) {
// //         setError(err instanceof Error ? err.message : "Failed to fetch projects")
// //         console.error("[v0] Error fetching projects:", err)
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     fetchProjects()
// //   }, [])

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[60vh]">
// //         <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Projects</h1>
// //         <p className="text-muted-foreground mt-2 text-sm md:text-base">Browse and bid on projects</p>
// //       </div>

// //       {error && (
// //         <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
// //           {error}
// //         </div>
// //       )}

// //       {projects.length === 0 ? (
// //         <Card>
// //           <CardContent className="py-12 text-center">
// //             <p className="text-muted-foreground">No projects available at the moment</p>
// //           </CardContent>
// //         </Card>
// //       ) : (
// //         <div className="grid grid-cols-1 gap-4 md:gap-6">
// //           {projects.map((project) => (
// //             <Card key={project.id} className="hover:shadow-lg transition-shadow">
// //               <CardContent className="p-4 md:p-6 space-y-4">
// //                 <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
// //                   <div className="flex-1 min-w-0">
// //                     <h3 className="text-lg md:text-xl font-bold text-foreground break-words">{project.projectName}</h3>
// //                     <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
// //                       {project.projectDescription}
// //                     </p>
// //                   </div>
// //                   <Badge className="bg-green-100 text-green-800 whitespace-nowrap">{project.status}</Badge>
// //                 </div>

// //                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
// //                   <div>
// //                     <p className="text-xs text-muted-foreground">Budget</p>
// //                     <p className="text-lg md:text-xl font-bold text-[#003087]">${project.budget.toLocaleString()}</p>
// //                   </div>
// //                   <div>
// //                     <p className="text-xs text-muted-foreground">Timeline</p>
// //                     <p className="text-lg md:text-xl font-bold text-foreground">{project.timeline}</p>
// //                   </div>
// //                 </div>

// //                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
// //                   <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
// //                     <Button variant="outline" className="w-full bg-transparent">
// //                       View More
// //                     </Button>
// //                   </Link>
// //                   <Link href={`/dashboard/project-bid/${project.id}`} className="flex-1">
// //                     <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060]">
// //                       Bid <ArrowRight className="w-4 h-4" />
// //                     </Button>
// //                   </Link>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   )
// // }

// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Loader2, ArrowRight } from "lucide-react"

// interface Project {
//   id: string
//   projectName: string
//   projectDescription: string
//   budget: number
//   timeline: string
//   status: string
// }

// export default function ProjectsPage() {
//   const [projects, setProjects] = useState<Project[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         setLoading(true)
//         const token = localStorage.getItem("authToken")
//         const response = await fetch("/api/projects", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         const data = await response.json()

//         if (data.success) {
//           setProjects(data.data)
//         } else {
//           setError(data.error || "Failed to fetch projects")
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to fetch projects")
//         console.error("[v0] Error fetching projects:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchProjects()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Projects</h1>
//         <p className="text-muted-foreground mt-2 text-sm md:text-base">Browse and bid on projects</p>
//       </div>

//       {error && (
//         <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
//           {error}
//         </div>
//       )}

//       {projects.length === 0 ? (
//         <Card>
//           <CardContent className="py-12 text-center">
//             <p className="text-muted-foreground">No projects available at the moment</p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 md:gap-6">
//           {projects.map((project) => (
//             <Card key={project.id} className="hover:shadow-lg transition-shadow">
//               <CardContent className="p-4 md:p-6 space-y-4">
//                 <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-lg md:text-xl font-bold text-foreground break-words">{project.projectName}</h3>
//                     <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
//                       {project.projectDescription}
//                     </p>
//                   </div>
//                   <Badge className="bg-green-100 text-green-800 whitespace-nowrap">{project.status}</Badge>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
//                   <div>
//                     <p className="text-xs text-muted-foreground">Budget</p>
//                     <p className="text-lg md:text-xl font-bold text-[#003087]">${project.budget.toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Timeline</p>
//                     <p className="text-lg md:text-xl font-bold text-foreground">{project.timeline}</p>
//                   </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                   <Link href={`/dashboard/freelancer/projects/${project.id}`} className="flex-1">
//                     <Button variant="outline" className="w-full bg-transparent">
//                       View More
//                     </Button>
//                   </Link>
//                   <Link href={`/dashboard/freelancer/project-bid/${project.id}`} className="flex-1">
//                     <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060]">
//                       Bid <ArrowRight className="w-4 h-4" />
//                     </Button>
//                   </Link>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowRight, Briefcase, Calendar, DollarSign, Code, Building, Clock, CheckCircle2 } from "lucide-react"
import { getAvailableProjects, submitBid } from "@/lib/api/freelancers"
import { toast } from "sonner"

interface Project {
  id: string
  details?: {
    fullName: string
    businessEmail: string
    companyName: string
    businessType?: string
    phoneNumber?: string
    companyWebsite?: string
  }
  services?: any
  industries?: any
  technologies?: any
  features?: any
  timeline?: {
    option?: string
    estimatedDays?: number
    description?: string
  }
  bids?: Array<{
    id: string
    status: string
  }>
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [proposalText, setProposalText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [bidSuccess, setBidSuccess] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await getAvailableProjects(1, 20)
        
        if (response.success && response.data?.projects) {
          setProjects(response.data.projects)
        } else {
          throw new Error(response.message || "Failed to fetch projects")
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch projects"
        setError(errorMsg)
        toast.error(errorMsg)
        console.error("Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handlePlaceBid = async () => {
    if (!selectedProject) {
      toast.error("No project selected")
      return
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount")
      return
    }

    try {
      setSubmitting(true)
      const response = await submitBid(
        selectedProject.id,
        parseFloat(bidAmount),
        proposalText
      )
      
      if (response.success) {
        toast.success("Bid submitted successfully!")
        setBidSuccess(true)
      } else {
        throw new Error(response.message || "Failed to submit bid")
      }
    } catch (error) {
      console.error("Error placing bid:", error)
      toast.error(error instanceof Error ? error.message : "Failed to place bid")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Projects</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Browse and bid on projects available for freelancers
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-8 md:py-12 text-center">
            <p className="text-muted-foreground text-sm md:text-base">No projects available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-[#003087]/20">
              <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl font-bold text-[#003087] break-words">
                      {project.details?.companyName || "Project"}
                    </CardTitle>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {project.details?.fullName && `Client: ${project.details.fullName}`}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white hover:bg-green-600 flex-shrink-0">
                    <Briefcase className="w-3 h-3 mr-1" />
                    OPEN
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Building className="w-4 h-4 text-[#003087] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Business Type:</span>
                      <span className="font-medium ml-2">{project.details?.businessType || "N/A"}</span>
                    </div>
                  </div>
                  
                  {project.services && Object.keys(project.services).length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-[#003087] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Services:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(project.services).slice(0, 3).map(([key, value]: [string, any], idx) => {
                            // Handle different data structures
                            let displayName = key.replace(/([A-Z])/g, ' $1').trim();
                            if (typeof value === 'object' && value !== null) {
                              displayName = value.name || value.label || value.service || displayName;
                            } else if (typeof value === 'string') {
                              displayName = value;
                            }
                            return (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {displayName}
                              </Badge>
                            );
                          })}
                          {Object.keys(project.services).length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{Object.keys(project.services).length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {project.industries && Object.keys(project.industries).length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Building className="w-4 h-4 text-[#003087] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Industry:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(project.industries)
                            .filter(([key, value]) => value === true || (typeof value === 'object' && value !== null))
                            .slice(0, 3)
                            .map(([key, value]: [string, any], idx) => {
                              // Handle different data structures
                              let displayName = key.replace(/([A-Z_])/g, ' $1').trim().replace(/\s+/g, ' ');
                              if (typeof value === 'object' && value !== null) {
                                displayName = value.name || value.label || value.industry || displayName;
                              }
                              return (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {displayName}
                                </Badge>
                              );
                            })}
                          {Object.entries(project.industries).filter(([k, v]) => v === true || (typeof v === 'object' && v !== null)).length > 3 && (
                            <Badge variant="outline" className="text-xs">+{Object.entries(project.industries).filter(([k, v]) => v === true || (typeof v === 'object' && v !== null)).length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {project.technologies && Object.keys(project.technologies).length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Code className="w-4 h-4 text-[#003087] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Technology:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(project.technologies)
                            .filter(([key, value]) => value === true || (typeof value === 'object' && value !== null))
                            .slice(0, 4)
                            .map(([key, value]: [string, any], idx) => {
                              // Handle different data structures
                              let displayName = key.replace(/([A-Z_])/g, ' $1').trim().replace(/\s+/g, ' ');
                              if (typeof value === 'object' && value !== null) {
                                displayName = value.name || value.label || value.technology || displayName;
                              }
                              return (
                                <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  {displayName}
                                </Badge>
                              );
                            })}
                          {Object.entries(project.technologies).filter(([k, v]) => v === true || (typeof v === 'object' && v !== null)).length > 4 && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">+{Object.entries(project.technologies).filter(([k, v]) => v === true || (typeof v === 'object' && v !== null)).length - 4}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {project.timeline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-[#003087] flex-shrink-0" />
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium">
                        {project.timeline.estimatedDays ? `${project.timeline.estimatedDays} days` : project.timeline.option || "N/A"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Project ID</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">{project.id}</code>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                  {/* <Link href={`/dashboard/freelancer/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-[#003087] text-[#003087] hover:bg-[#003087] hover:text-white">
                      View Details
                    </Button>
                  </Link> */}
                  <Button 
                    onClick={() => {
                      setSelectedProject(project)
                      setBidDialogOpen(true)
                      setBidSuccess(false)
                      setBidAmount("")
                      setProposalText("")
                    }}
                    className="w-full gap-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                  >
                    Place Bid <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bid Placement Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {!bidSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-[#003087]">Place Your Bid</DialogTitle>
                <DialogDescription>
                  Submit your bid for {selectedProject?.details?.companyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Project ID */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Project ID</Label>
                  <code className="text-xs bg-gray-100 px-3 py-2 rounded block mt-1 break-all">
                    {selectedProject?.id}
                  </code>
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{selectedProject?.details?.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Business Type</p>
                    <p className="text-sm font-medium">{selectedProject?.details?.businessType || "N/A"}</p>
                  </div>
                </div>

                {/* Bid Amount */}
                <div>
                  <Label htmlFor="bidAmount">Bid Amount (USD) *</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    placeholder="Enter your bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="mt-2"
                    min="0"
                    step="100"
                    disabled={submitting}
                  />
                </div>
                
                {/* Proposal Text */}
                <div>
                  <Label htmlFor="proposal">Proposal / Cover Letter (Optional)</Label>
                  <Textarea
                    id="proposal"
                    placeholder="Explain why you're the best fit for this project..."
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    className="mt-2 min-h-[120px]"
                    disabled={submitting}
                  />
                </div>

                {/* Place Bid Button */}
                <Button 
                  onClick={handlePlaceBid} 
                  disabled={submitting || !bidAmount}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Bid...
                    </>
                  ) : (
                    "Place Bid"
                  )}
                </Button>
              </div>
            </>
          ) : (
            // Success State
            <div className="py-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-6">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h3>
                <p className="text-muted-foreground">Your bid has been placed successfully</p>
              </div>

              <Card className="border-2 border-green-500/20 bg-green-50/50">
                <CardContent className="p-6 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project</p>
                    <p className="text-base font-semibold text-foreground">{selectedProject?.details?.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your Bid Amount</p>
                    <p className="text-2xl font-bold text-green-600">${parseFloat(bidAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className="bg-yellow-500">PENDING</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => {
                    setBidDialogOpen(false)
                    setBidSuccess(false)
                    setBidAmount("")
                    setProposalText("")
                  }}
                  className="w-full bg-[#003087] hover:bg-[#002060]"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setBidDialogOpen(false)
                    setBidSuccess(false)
                    setBidAmount("")
                    setProposalText("")
                    window.location.href = "/dashboard/freelancer/project-bid"
                  }}
                  variant="outline"
                  className="w-full"
                >
                  View All My Bids
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
