"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Building2, Mail, Phone, Globe, Calendar, DollarSign, CheckCircle2 } from "lucide-react"
import { getProjectDetails, submitBid } from "@/lib/api/freelancers"
import { toast } from "sonner"

interface ProjectForBid {
  id: string
  details?: {
    companyName: string
    fullName: string
    businessEmail: string
    businessType?: string
    phoneNumber?: string
    companyWebsite?: string
  }
  estimate?: {
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  timeline?: {
    estimatedDays: number
    option: string
    description?: string
  }
  technologies?: any[]
  features?: any[]
  services?: any[]
  acceptingBids?: boolean
}

export default function PlaceBidPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get("projectId")
  
  const [project, setProject] = useState<ProjectForBid | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [proposalText, setProposalText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bidPlaced, setBidPlaced] = useState(false)
  const [placedBidData, setPlacedBidData] = useState<any>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        toast.error("No project ID provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await getProjectDetails(projectId)
        
        if (response.success && response.data) {
          setProject(response.data)
        } else {
          throw new Error(response.message || "Failed to fetch project")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load project")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handlePlaceBid = async () => {
    if (!projectId) {
      toast.error("Project ID is missing")
      return
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount")
      return
    }

    try {
      setSubmitting(true)
      const response = await submitBid(
        projectId,
        parseFloat(bidAmount),
        proposalText
      )
      
      if (response.success) {
        toast.success("Bid submitted successfully!")
        setBidPlaced(true)
        setPlacedBidData(response.data)
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
      </div>
    )
  }

  if (!projectId || !project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          Project not found
        </div>
      </div>
    )
  }

  // Success UI after bid is placed
  if (bidPlaced && placedBidData) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 md:p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold">Bid Placed Successfully!</h1>
          <p className="text-green-100 mt-2">Your bid has been submitted and is now pending review</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bid Details Card */}
          <Card className="border-2 border-green-500/20">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-lg text-green-800">Bid Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bid ID</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1 break-all">
                  {placedBidData.bid?.id || "N/A"}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project ID</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1 break-all">
                  {projectId}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bid Amount</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${parseFloat(bidAmount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className="bg-yellow-500 mt-1">
                  {placedBidData.bid?.status || "PENDING"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                <p className="text-sm text-foreground mt-1">
                  {placedBidData.bid?.submittedAt 
                    ? new Date(placedBidData.bid.submittedAt).toLocaleString()
                    : new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-foreground font-medium mt-1">{project.details?.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-foreground font-medium mt-1">{project.details?.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                <p className="text-foreground font-medium mt-1">{project.details?.businessType || "N/A"}</p>
              </div>
              {proposalText && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Proposal</p>
                  <p className="text-sm text-foreground mt-1 bg-gray-50 p-3 rounded">
                    {proposalText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => router.push("/dashboard/freelancer/project-bid")}
            className="bg-[#003087] hover:bg-[#002060]"
          >
            View All My Bids
          </Button>
          <Button 
            onClick={() => router.push("/dashboard/freelancer/projects")}
            variant="outline"
          >
            Browse More Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Button>

      <div className="bg-gradient-to-r from-[#003087] to-[#4C63D2] text-white rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Place Your Bid</h1>
        <p className="text-blue-100 mt-2">{project.details?.companyName || "Project"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-foreground font-medium">{project.details?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p className="text-foreground font-medium">{project.details?.businessType || "N/A"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Budget</p>
                  <p className="text-lg font-bold text-[#003087]">
                    {project.estimate 
                      ? `$${project.estimate.estimateFinalPriceMin.toLocaleString()} - $${project.estimate.estimateFinalPriceMax.toLocaleString()}`
                      : "Contact for quote"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-lg font-bold text-foreground">
                    {project.timeline?.estimatedDays ? `${project.timeline.estimatedDays} days` : "N/A"}
                  </p>
                </div>
              </div>

              {project.timeline?.description && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Timeline Details</p>
                  <p className="text-sm text-foreground">{project.timeline.description}</p>
                </div>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: any, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tech.category || tech.name || JSON.stringify(tech)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.features && project.features.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {project.features.map((feature: any, idx) => (
                      <Badge key={idx} variant="outline">
                        {feature.category || feature.name || JSON.stringify(feature)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.services && project.services.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Services Required</p>
                  <div className="space-y-2">
                    {project.services.map((service: any, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#003087] font-bold">•</span>
                        <span className="text-sm text-foreground">{service.name || JSON.stringify(service)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-foreground break-all">{project.details?.businessEmail}</p>
                </div>
              </div>
              {project.details?.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{project.details.phoneNumber}</p>
                </div>
              )}
              {project.details?.companyWebsite && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href={project.details.companyWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {project.details.companyWebsite}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bid Form - Right Side */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Submit Your Bid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bidAmount">Bid Amount (USD)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  placeholder="Enter your bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="mt-2"
                  min="0"
                  step="100"
                />
                {project.estimate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Suggested: ${project.estimate.estimateFinalPriceMin.toLocaleString()} - ${project.estimate.estimateFinalPriceMax.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="proposal">Proposal / Cover Letter</Label>
                <Textarea
                  id="proposal"
                  placeholder="Explain why you're the best fit for this project..."
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="mt-2 min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add details about your experience and approach
                </p>
              </div>

              <Button 
                onClick={handlePlaceBid} 
                disabled={submitting || !project.acceptingBids} 
                className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Bid...
                  </>
                ) : (
                  "Submit Bid"
                )}
              </Button>

              {!project.acceptingBids && (
                <p className="text-xs text-center text-destructive">
                  This project is not accepting bids at the moment
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
