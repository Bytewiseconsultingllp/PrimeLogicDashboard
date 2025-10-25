"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"

interface ProjectDetail {
  id: string
  projectName: string
  projectDescription: string
  projectType: string
  technologies: string[]
  features: string[]
  budget: number
  timeline: string
  priority: string
  status: string
  clientName: string
  clientEmail: string
  clientPhone: string
  additionalNotes: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API call
        setProject({
          id: projectId,
          projectName: "E-commerce Platform",
          projectDescription: "Build a full-featured e-commerce platform with payment integration",
          projectType: "Web Application",
          technologies: ["React", "Node.js", "MongoDB", "Stripe"],
          features: [
            "User authentication and authorization",
            "Product catalog with search and filters",
            "Shopping cart and checkout",
            "Payment processing",
            "Order management",
            "Admin dashboard",
          ],
          budget: 5000,
          timeline: "3 months",
          priority: "HIGH",
          status: "OPEN",
          clientName: "John Smith",
          clientEmail: "john@company.com",
          clientPhone: "+1-555-0123",
          additionalNotes: "This is a critical project for our business. We need a robust and scalable solution.",
        })
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
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge className="bg-red-100 text-red-800">{project.priority}</Badge>
                </div>
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
                    <span className="text-[#003087] font-bold">•</span>
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

        <div className="space-y-6">
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
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">{project.clientPhone}</p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => (window.location.href = `/dashboard/project-bid/${project.id}`)}
            className="w-full bg-[#003087] hover:bg-[#002060]"
          >
            Place Bid
          </Button>
        </div>
      </div>
    </div>
  )
}
