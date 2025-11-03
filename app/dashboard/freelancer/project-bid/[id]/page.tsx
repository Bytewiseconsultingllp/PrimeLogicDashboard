"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import { getProjectDetails, submitBid } from "@/lib/api/freelancers"
import { toast } from "sonner"

interface ProjectForBid {
  id: string
  details?: {
    companyName: string
    fullName: string
    businessType?: string
  }
  estimate?: {
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  timeline?: {
    estimatedDays: number
    option: string
  }
  technologies?: any[]
  features?: any[]
  services?: any[]
}

export default function ProjectBidPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectForBid | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [proposalText, setProposalText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
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

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const handlePlaceBid = async () => {
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
        router.push("/dashboard/freelancer/project-bid")
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

  if (!project) {
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

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Button>

      <div className="bg-gradient-to-r from-[#003087] to-[#4C63D2] text-white rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Place Your Bid</h1>
        <p className="text-blue-100 mt-2">{project.details?.companyName || "Project"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-foreground font-medium">{project.details?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p className="text-foreground font-medium">{project.details?.businessType || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
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
              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: any, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tech.category || JSON.stringify(tech)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {project.features && project.features.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {project.features.map((feature: any, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {feature.category || JSON.stringify(feature)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Suggested: ${project.estimate?.estimateFinalPriceMin.toLocaleString() || "N/A"}
                </p>
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
                disabled={submitting} 
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
