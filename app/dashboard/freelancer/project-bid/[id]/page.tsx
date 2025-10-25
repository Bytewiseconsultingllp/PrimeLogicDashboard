"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"

interface ProjectForBid {
  id: string
  projectName: string
  projectDescription: string
  budget: number
  timeline: string
  technologies: string[]
  features: string[]
}

interface ExistingBid {
  id: string
  bidAmount: number
  bidDate: string
  status: string
}

export default function ProjectBidPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectForBid | null>(null)
  const [existingBid, setExistingBid] = useState<ExistingBid | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProjectAndBid = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API calls
        setProject({
          id: projectId,
          projectName: "E-commerce Platform",
          projectDescription: "Build a full-featured e-commerce platform with payment integration",
          budget: 5000,
          timeline: "3 months",
          technologies: ["React", "Node.js", "MongoDB", "Stripe"],
          features: ["User authentication", "Product catalog", "Shopping cart", "Payment processing"],
        })

        // Check if freelancer already bid on this project
        // const bidResponse = await fetch(`http://localhost:8000/api/v1/bids/${projectId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        // if (bidResponse.ok) {
        //   const bidData = await bidResponse.json()
        //   setExistingBid(bidData.data)
        // }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProjectAndBid()
    }
  }, [projectId])

  const handlePlaceBid = async () => {
    if (!bidAmount || Number.parseFloat(bidAmount) <= 0) {
      alert("Please enter a valid bid amount")
      return
    }

    try {
      setSubmitting(true)
      // const token = localStorage.getItem("authToken")
      // const response = await fetch("http://localhost:8000/api/v1/bids", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     projectId,
      //     bidAmount: parseFloat(bidAmount),
      //   }),
      // })
      // if (response.ok) {
      //   alert("Bid placed successfully!")
      //   router.push("/dashboard/project-bid")
      // }

      // Mock success
      alert("Bid placed successfully!")
      router.push("/dashboard/project-bid")
    } catch (error) {
      console.error("[v0] Error placing bid:", error)
      alert("Failed to place bid")
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
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Place Your Bid</h1>
        <p className="text-muted-foreground mt-2">{project.projectName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-foreground mt-1">{project.projectDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold text-[#003087]">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-lg font-bold text-foreground">{project.timeline}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                <ul className="space-y-1">
                  {project.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-[#003087]">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {existingBid && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Your Existing Bid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-green-700">Bid Amount</p>
                  <p className="text-2xl font-bold text-green-900">${existingBid.bidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Status</p>
                  <p className="text-foreground">{existingBid.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Bid Date</p>
                  <p className="text-sm text-foreground">{new Date(existingBid.bidDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Bid Amount ($)</label>
                <Input
                  type="number"
                  placeholder="Enter your bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="mt-2"
                  min="0"
                  step="100"
                />
              </div>
              <Button onClick={handlePlaceBid} disabled={submitting} className="w-full bg-[#003087] hover:bg-[#002060]">
                {submitting ? "Placing Bid..." : "Place Bid"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
