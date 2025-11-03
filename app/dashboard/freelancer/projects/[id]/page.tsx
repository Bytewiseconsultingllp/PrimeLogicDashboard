"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Building2, Mail, Phone, Globe, Calendar, DollarSign } from "lucide-react"
import { getProjectDetails } from "@/lib/api/freelancers"
import { toast } from "sonner"
import Link from "next/link"

interface ProjectDetail {
  id: string
  details?: {
    fullName: string
    businessEmail: string
    companyName: string
    businessType?: string
    phoneNumber?: string
    companyWebsite?: string
    businessAddress?: string
  }
  services?: any[]
  industries?: any[]
  technologies?: any[]
  features?: any[]
  timeline?: {
    option: string
    estimatedDays: number
    description?: string
  }
  estimate?: {
    estimateFinalPriceMin: number
    estimateFinalPriceMax: number
  }
  paymentStatus?: string
  acceptingBids?: boolean
  createdAt?: string
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
        const response = await getProjectDetails(projectId)
        
        if (response.success && response.data) {
          setProject(response.data)
        } else {
          throw new Error(response.message || "Failed to fetch project details")
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
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Button>
        <Badge className={project.acceptingBids ? "bg-green-500" : "bg-gray-500"}>
          {project.acceptingBids ? "Accepting Bids" : "Closed"}
        </Badge>
      </div>

      <div className="bg-gradient-to-r from-[#003087] to-[#4C63D2] text-white rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold">{project.details?.companyName || "Project Details"}</h1>
        <p className="text-blue-100 mt-2">Client: {project.details?.fullName}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p className="text-foreground font-medium">{project.details?.businessType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Budget</p>
                  <p className="text-foreground font-medium">
                    {project.estimate 
                      ? `$${project.estimate.estimateFinalPriceMin.toLocaleString()} - $${project.estimate.estimateFinalPriceMax.toLocaleString()}`
                      : "Contact for quote"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-foreground font-medium">
                    {project.timeline?.estimatedDays ? `${project.timeline.estimatedDays} days` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                  <Badge className={project.paymentStatus === "SUCCEEDED" ? "bg-green-500" : "bg-yellow-500"}>
                    {project.paymentStatus || "PENDING"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.technologies && project.technologies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: any, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tech.category || JSON.stringify(tech)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.features && project.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.features.map((feature: any, idx) => (
                    <Badge key={idx} variant="outline">
                      {feature.category || JSON.stringify(feature)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.services && project.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.services.map((service: any, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#003087] font-bold">•</span>
                      <span className="text-foreground">{service.name || JSON.stringify(service)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.timeline?.description && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{project.timeline.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-foreground font-medium">{project.details?.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                <p className="text-foreground font-medium">{project.details?.fullName}</p>
              </div>
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

          {project.acceptingBids && (
            <Link href={`/dashboard/freelancer/place-bid?projectId=${project.id}`}>
              <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                Place Your Bid
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
