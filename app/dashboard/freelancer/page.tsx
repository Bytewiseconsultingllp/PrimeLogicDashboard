"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Briefcase, DollarSign, TrendingUp, Users, Star } from "lucide-react"

interface FreelancerData {
  fullName: string
  email: string
  totalProjects: number
  totalEarnings: number
  activeProjects: number
  completedProjects: number
  averageRating: number
  totalReviews: number
}

export default function HomePage() {
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (data.success) {
          setFreelancer(data.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching freelancer data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFreelancerData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003087] to-[#002060] text-white p-6 md:p-8 rounded-lg">
        <h1 className="text-2xl md:text-4xl font-bold">Welcome, {freelancer?.fullName}!</h1>
        <p className="text-blue-100 mt-2 text-sm md:text-base">Manage your projects and bids efficiently</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="w-4 h-4 text-[#003087]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{freelancer?.totalProjects}</div>
            <p className="text-xs text-muted-foreground">All time projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-[#003087]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">${freelancer?.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="w-4 h-4 text-[#003087]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{freelancer?.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="w-4 h-4 text-[#003087]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{freelancer?.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="w-4 h-4 text-[#FF6B35]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{freelancer?.averageRating}</div>
            <p className="text-xs text-muted-foreground">From {freelancer?.totalReviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium text-sm md:text-base">{freelancer?.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-sm md:text-base break-all">{freelancer?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
