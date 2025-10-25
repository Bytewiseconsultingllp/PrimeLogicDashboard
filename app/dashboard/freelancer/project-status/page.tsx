"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight } from "lucide-react"

interface ProjectStatus {
  id: string
  projectName: string
  projectDescription: string
  status: string
  currentMilestone?: number
  totalMilestones?: number
  progress?: number
}

export default function ProjectStatusPage() {
  const [projects, setProjects] = useState<ProjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/project-status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (data.success) {
          setProjects(data.data)
        } else {
          setError(data.error || "Failed to fetch projects")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch projects")
        console.error("[v0] Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Status</h1>
        <p className="text-muted-foreground mt-2">Track your active projects and milestones</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">{error}</div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active projects</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{project.projectName}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.projectDescription}</p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>

                {project.progress !== undefined && (
                  <>
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Progress</p>
                        <p className="text-sm font-bold text-[#003087]">{project.progress}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#003087] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Milestone</p>
                        <p className="text-lg font-bold text-foreground">{project.currentMilestone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Milestones</p>
                        <p className="text-lg font-bold text-foreground">{project.totalMilestones}</p>
                      </div>
                    </div>
                  </>
                )}

                <Link href={`/dashboard/freelancer/project-status/${project.id}`} className="block pt-2">
                  <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060]">
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
