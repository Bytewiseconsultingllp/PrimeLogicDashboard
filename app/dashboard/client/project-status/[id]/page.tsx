"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageCircle } from "lucide-react"
import { USE_MOCK_API, mockGetProjectById } from "@/lib/mock/api"

interface Milestone {
  id: string
  name: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string
  progress: number
}

interface ProjectDetail {
  id: string
  projectName: string
  projectDescription: string
  projectType: string
  technologies: string[]
  features: string[]
  budget: number
  timeline: string
  priority: "HIGH" | "MEDIUM" | "LOW" | "URGENT"
  status: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientCompany: string
  additionalNotes: string
  createdAt: string
  updatedAt: string
  milestones?: Milestone[]
  amountPaid?: number
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)

        if (USE_MOCK_API) {
          const mockResponse = await mockGetProjectById(projectId)
          setProject(mockResponse.data)
          return
        }

        const token = localStorage.getItem("authToken") || "YOUR_JWT_TOKEN"
        const response = await fetch(`http://localhost:8000/api/v1/projectBuilder/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch project details")
        }

        const data = await response.json()
        setProject(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("[v0] Project detail fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Project Details</h1>
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          {error || "Project not found"}
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500"
      case "IN_PROGRESS":
        return "bg-yellow-500"
      default:
        return "bg-gray-300"
    }
  }

  const amountPaid = project.amountPaid || Math.floor(project.budget * 0.6)
  const amountRemaining = project.budget - amountPaid
  const paymentPercentage = (amountPaid / project.budget) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{project.projectName}</h1>
        <p className="text-muted-foreground mt-2">{project.projectDescription}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Type</p>
                  <p className="text-foreground font-medium">{project.projectType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-foreground font-medium">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-foreground font-medium">{project.timeline}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(project.status)} variant="outline">
                    {project.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.milestones && project.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{milestone.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getMilestoneStatusColor(milestone.status)} variant="outline">
                        {milestone.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#003087] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{milestone.progress}% Complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Payment Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Amount Paid</p>
                  <p className="font-bold text-[#003087]">${amountPaid.toLocaleString()}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#003087] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${paymentPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{paymentPercentage.toFixed(1)}% Paid</p>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">Amount Remaining</p>
                  <p className="font-bold text-red-500">${amountRemaining.toLocaleString()}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${100 - paymentPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {(100 - paymentPercentage).toFixed(1)}% Remaining
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{project.additionalNotes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Priority</p>
                <Badge className="text-base px-3 py-1">{project.priority}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Status</p>
                <Badge className={getStatusColor(project.status)} variant="outline">
                  {project.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Created</p>
                <p className="text-sm text-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Freelancer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Company</p>
                <p className="text-foreground font-medium">{project.clientCompany}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Contact</p>
                <p className="text-sm text-foreground">{project.clientEmail}</p>
                <p className="text-sm text-foreground">{project.clientPhone}</p>
              </div>
              <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060]">
                <MessageCircle className="w-4 h-4" />
                Connect on Discord
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
