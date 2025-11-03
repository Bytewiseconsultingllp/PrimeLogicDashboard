"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight, Briefcase } from "lucide-react"
import { getAssignedProjects, getProjectMilestones } from "@/lib/api/freelancers"
import { MilestoneCard } from "@/components/freelancer/MilestoneCard"
import { toast } from "sonner"

interface ProjectWithMilestones {
  id: string
  details?: {
    companyName: string
    fullName: string
  }
  milestones?: any[]
  paymentStatus?: string
}

export default function ProjectStatusPage() {
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectsAndMilestones = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch assigned projects
        const projectsResponse = await getAssignedProjects()
        
        if (projectsResponse.success && projectsResponse.data?.projects) {
          // Filter for projects where freelancer has accepted bids
          const assignedProjects = projectsResponse.data.projects.filter(
            (p: any) => p.bids?.some((b: any) => b.status === "ACCEPTED")
          )

          // Fetch milestones for each project
          const projectsWithMilestones = await Promise.all(
            assignedProjects.map(async (project: any) => {
              try {
                const milestonesResponse = await getProjectMilestones(project.id)
                return {
                  ...project,
                  milestones: milestonesResponse.success ? milestonesResponse.data : []
                }
              } catch (error) {
                console.error(`Failed to fetch milestones for project ${project.id}:`, error)
                return { ...project, milestones: [] }
              }
            })
          )

          setProjects(projectsWithMilestones)
        } else {
          throw new Error(projectsResponse.message || "Failed to fetch projects")
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

    fetchProjectsAndMilestones()
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Project Status & Milestones</h1>
        <p className="text-muted-foreground mt-2">Track your active projects and their milestones</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">{error}</div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active projects assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => (
            <div key={project.id} className="space-y-4">
              <Card className="border-2 border-[#003087]/20">
                <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-2xl text-[#003087]">
                        {project.details?.companyName || "Project"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Client: {project.details?.fullName}
                      </p>
                    </div>
                    <Badge className={project.paymentStatus === "SUCCEEDED" ? "bg-green-500" : "bg-yellow-500"}>
                      {project.paymentStatus || "PENDING"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Milestones</p>
                      <p className="text-2xl font-bold text-[#003087]">
                        {project.milestones?.filter((m: any) => m.isMilestoneCompleted).length || 0} / {project.milestones?.length || 0}
                      </p>
                    </div>
                    <Link href={`/dashboard/freelancer/projects/${project.id}`}>
                      <Button variant="outline">
                        View Project <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              {project.milestones && project.milestones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.milestones.map((milestone: any) => (
                    <MilestoneCard key={milestone.id} milestone={milestone} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No milestones defined for this project yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
