"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Github, MessageCircle, Plus, Minus } from "lucide-react"

interface Milestone {
  id: string
  name: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string
  progress: number
}

interface ProjectStatusDetail {
  id: string
  projectName: string
  projectDescription: string
  status: string
  budget: number
  timeline: string
  currentMilestone: number
  totalMilestones: number
  milestones: Milestone[]
  githubUrl: string
  discordUrl: string
  clientName: string
  clientEmail: string
}

export default function ProjectStatusDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectStatusDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [milestoneCount, setMilestoneCount] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API call
        const mockProject: ProjectStatusDetail = {
          id: projectId,
          projectName: "E-commerce Platform",
          projectDescription: "Build a full-featured e-commerce platform with payment integration",
          status: "IN_PROGRESS",
          budget: 5000,
          timeline: "3 months",
          currentMilestone: 2,
          totalMilestones: 5,
          milestones: [
            {
              id: "1",
              name: "Project Setup & Architecture",
              status: "COMPLETED",
              dueDate: "2024-01-15",
              progress: 100,
            },
            {
              id: "2",
              name: "Frontend Development",
              status: "IN_PROGRESS",
              dueDate: "2024-02-15",
              progress: 60,
            },
            {
              id: "3",
              name: "Backend API Development",
              status: "PENDING",
              dueDate: "2024-03-15",
              progress: 0,
            },
            {
              id: "4",
              name: "Payment Integration",
              status: "PENDING",
              dueDate: "2024-04-15",
              progress: 0,
            },
            {
              id: "5",
              name: "Testing & Deployment",
              status: "PENDING",
              dueDate: "2024-05-15",
              progress: 0,
            },
          ],
          githubUrl: "https://github.com/example/ecommerce",
          discordUrl: "https://discord.gg/example",
          clientName: "John Smith",
          clientEmail: "john@company.com",
        }
        setProject(mockProject)
        setMilestoneCount(mockProject.currentMilestone)
      } catch (error) {
        console.error("[v0] Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const handleSaveMilestone = async () => {
    try {
      setSaving(true)
      // const token = localStorage.getItem("authToken")
      // const response = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/milestone`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ currentMilestone: milestoneCount }),
      // })
      // if (response.ok) {
      //   alert("Milestone updated successfully!")
      // }

      alert("Milestone updated successfully!")
    } catch (error) {
      console.error("[v0] Error saving milestone:", error)
      alert("Failed to save milestone")
    } finally {
      setSaving(false)
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{project.projectName}</h1>
        <p className="text-muted-foreground mt-2">{project.projectDescription}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className="bg-blue-100 text-blue-800 mt-1">{project.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-foreground font-medium">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-foreground font-medium">{project.timeline}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="space-y-2 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getMilestoneStatusColor(milestone.status)}>{milestone.status}</Badge>
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

          <Card>
            <CardHeader>
              <CardTitle>Update Milestone Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Current Milestone: {milestoneCount} of {project.totalMilestones}
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMilestoneCount(Math.max(0, milestoneCount - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={milestoneCount}
                    onChange={(e) =>
                      setMilestoneCount(Math.min(project.totalMilestones, Number.parseInt(e.target.value) || 0))
                    }
                    className="text-center text-lg font-bold"
                    min="0"
                    max={project.totalMilestones}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMilestoneCount(Math.min(project.totalMilestones, milestoneCount + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSaveMilestone}
                disabled={saving}
                className="w-full bg-[#003087] hover:bg-[#002060]"
              >
                {saving ? "Saving..." : "Save Milestone"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => window.open(project.githubUrl, "_blank")}
                className="w-full gap-2 bg-gray-800 hover:bg-gray-900"
              >
                <Github className="w-4 h-4" />
                GitHub Repository
              </Button>
              <Button
                onClick={() => window.open(project.discordUrl, "_blank")}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <MessageCircle className="w-4 h-4" />
                Discord Channel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-foreground font-medium">{project.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{project.clientEmail}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
