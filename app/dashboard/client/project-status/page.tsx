"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { CheckCircle2, Star, CheckSquare, AlertCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Project {
  id: number
  title: string
  detail: string
  deadline: string
  bounty: number
  progressPercentage: number
  niche: string
  difficultyLevel: "EASY" | "MEDIUM" | "HARD"
  projectType: string
  projectStatus: string
  projectSlug: string
  createdAt: string
  selectedFreelancers?: {
    uid: string
    fullName: string
    username: string
    email: string
    phone?: string
    yearsOfExperience?: number
    niche?: string
    kpiRank: string
  }[]
}

const statusConfig: any = {
  PENDING: {
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500",
    icon: Clock,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  CANCELLED: {
    color: "bg-red-500",
    textColor: "text-red-500",
    borderColor: "border-red-500",
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  ONGOING: {
    color: "bg-blue-500",
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
    icon: AlertCircle,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  COMPLETED: {
    color: "bg-green-500",
    textColor: "text-green-500",
    borderColor: "border-green-500",
    icon: CheckCircle2,
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
}

export const difficultyColors = {
  EASY: "text-green-500",
  MEDIUM: "text-yellow-500",
  HARD: "text-red-500",
}

export default function ClientDashboard() {
  const router = useRouter()

  // State hooks
  const [projects, setProjects] = useState<Project[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageLoading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackProject, setFeedbackProject] = useState<Project | null>(null)
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [clientData, setClientData] = useState<any>(null)

  useEffect(() => {
    // Get client data from localStorage
    const storedVisitor = localStorage.getItem("visitorData")
    const storedPayment = localStorage.getItem("paymentSession")

    if (storedVisitor) {
      const visitor = JSON.parse(storedVisitor)
      const payment = storedPayment ? JSON.parse(storedPayment) : null

      setClientData({
        ...visitor,
        paymentInfo: payment,
      })

      const mockProject: Project = {
        id: 1,
        title: `Custom ${visitor.selectedServices?.join(", ") || "Web Application"} Project`,
        detail: `A comprehensive ${visitor.selectedIndustries?.join(", ") || "business"} solution with ${visitor.selectedFeatures?.join(", ") || "modern features"}.`,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        bounty: payment?.amount || 1350,
        progressPercentage: 5,
        niche: visitor.selectedIndustries?.[0] || "Business",
        difficultyLevel: "MEDIUM" as const,
        projectType: visitor.selectedServices?.[0] || "Web Development",
        projectStatus: "ONGOING",
        projectSlug: "custom-project-1",
        createdAt: new Date().toISOString(),
        selectedFreelancers: [
          {
            uid: "dev-1",
            fullName: "John Developer",
            username: "johndev",
            email: "john@company.com",
            yearsOfExperience: 5,
            niche: "Full Stack Development",
            kpiRank: "Senior",
          },
        ],
      }

      setProjects([mockProject])
      setTotalPages(1)
    }

    setLoading(false)
  }, [])

  const handleSubmitFeedback = async (project: Project) => {
    setFeedbackProject(project)
    setFeedbackDialogOpen(true)
    setRating(3)
    setComment("")
  }

  const submitFeedback = async () => {
    if (!feedbackProject) return

    setSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })

      setFeedbackDialogOpen(false)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please complete the payment process to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/get-started")} className="bg-[#003087] hover:bg-[#002060]">
              Go to Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status.toUpperCase()] || statusConfig.PENDING
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-1">Welcome back, {clientData.fullName}!</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Active Client
        </Badge>
      </div>

      {pageLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-xl font-semibold mb-4">You have not been assigned any projects.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Suspense fallback={<div>Loading...</div>}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const statusConf = getStatusConfig(project.projectStatus)
                return (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className={cn("pb-2", statusConf.bgColor)}>
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-2 h-[3rem]">{project.title}</CardTitle>
                        <statusConf.icon className={cn("h-5 w-5", statusConf.textColor)} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{project.progressPercentage}%</span>
                        </div>
                        <Progress value={project.progressPercentage} className="h-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge
                            className={cn("border", statusConf.borderColor, statusConf.textColor, statusConf.bgColor)}
                            variant="outline"
                          >
                            {project.projectStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Deadline</span>
                          <span className="text-sm font-medium">
                            {format(new Date(project.deadline), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button onClick={() => setSelectedProject(project)} variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Suspense>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                <DialogDescription className="mt-4">{selectedProject.detail}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Project Details</h4>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Deadline</span>
                        <span className="text-sm font-medium">
                          {format(new Date(selectedProject.deadline), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Budget</span>
                        <span className="text-sm font-medium">${selectedProject.bounty.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Status Information</h4>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge
                          className={cn(
                            "border",
                            getStatusConfig(selectedProject.projectStatus).borderColor,
                            getStatusConfig(selectedProject.projectStatus).textColor,
                            getStatusConfig(selectedProject.projectStatus).bgColor,
                          )}
                          variant="outline"
                        >
                          {selectedProject.projectStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{selectedProject.progressPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Assigned Developers</h4>
                  {selectedProject?.selectedFreelancers && selectedProject.selectedFreelancers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.selectedFreelancers.map((freelancer) => (
                        <Badge key={freelancer.uid} className="flex items-center gap-1.5">
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>{freelancer.fullName}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No Developers assigned yet</p>
                  )}
                </div>
                {selectedProject.progressPercentage === 100 && (
                  <Button
                    variant="default"
                    className="flex items-center gap-2 text-sm text-green-600"
                    onClick={() => handleSubmitFeedback(selectedProject)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Give Feedback
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Project Feedback</DialogTitle>
            <DialogDescription>Please rate your experience and provide feedback for this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star
                      className={`h-8 w-8 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about this project..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitFeedback} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
