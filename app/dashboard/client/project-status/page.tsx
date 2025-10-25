"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, Briefcase, Zap, Code, Users } from "lucide-react"
import { USE_MOCK_API, mockGetProjects } from "@/lib/mock/api"

interface Project {
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
  assignedFreelancer?: string
}

export default function ProjectStatusPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)

        if (USE_MOCK_API) {
          const mockResponse = await mockGetProjects(10)
          setProjects(mockResponse.data.projectBuilders)
          return
        }

        const token = localStorage.getItem("authToken") || "YOUR_JWT_TOKEN"
        const response = await fetch("http://localhost:8000/api/v1/projectBuilder?limit=10", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }

        const data = await response.json()
        setProjects(data.data?.projectBuilders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("[v0] Projects fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Status</h1>
        <p className="text-muted-foreground mt-2">Manage and track all your projects</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">{error}</div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects found. Start by creating a new project!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{project.projectName}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.projectDescription}</p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>

                {/* Project Type */}
                <div className="flex items-center gap-3 pt-2">
                  <Briefcase className="w-4 h-4 text-[#003087]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Project Type</p>
                    <p className="text-sm font-medium text-foreground">{project.projectType}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#003087] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {project.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                          {feature}
                        </Badge>
                      ))}
                      {project.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                          +{project.features.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div className="flex items-start gap-3">
                  <Code className="w-4 h-4 text-[#003087] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Freelancer */}
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#003087]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Freelancer</p>
                    <p className="text-sm font-medium text-foreground">
                      {project.assignedFreelancer || "Sarah Johnson"}
                    </p>
                  </div>
                </div>

                {/* Budget and Timeline */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm font-bold text-foreground">${project.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-sm font-bold text-foreground">{project.timeline}</p>
                  </div>
                </div>

                {/* View More Button */}
                <Link href={`/dashboard/client/project-status/${project.id}`} className="block pt-2">
                  <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060] text-white">
                    View More <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
