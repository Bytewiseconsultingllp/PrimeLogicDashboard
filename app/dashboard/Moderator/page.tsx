"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Briefcase, Users, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getCurrentUserDetails } from "@/lib/api/auth"
import { getUserDetails } from "@/lib/api/storage"

interface ModeratorProfile {
  uid: string
  fullName: string
  email: string
  username: string
  role: string
  createdAt?: string
  updatedAt?: string
  profilePicture?: string
}

interface Project {
  id: string
  createdAt: string
  updatedAt: string
  paymentStatus?: string
  details?: {
    companyName?: string
  }
  client?: {
    fullName?: string
  }
}

export default function ModeratorDashboard() {
  const { isAuthorized } = useAuth(["MODERATOR"]) 
  const [profile, setProfile] = useState<ModeratorProfile | null>(null)
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const me = await getCurrentUserDetails()
        if (me?.success) setProfile(me.data)

        const user = getUserDetails()
        const token = user?.accessToken
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/moderator/my-projects?page=1&limit=5`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          })
          if (res.ok) {
            const data = await res.json()
            const list = data?.data?.projects || []
            setMyProjects(list)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading moderator dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white rounded-xl p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center shadow-lg">
        <div className="space-y-3">
          <div>
            <p className="text-blue-100 text-sm md:text-base font-medium">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{profile?.fullName || "Moderator"}</h1>
          </div>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            My Projects: {myProjects?.length || 0}
          </p>
        </div>
        <div className="hidden md:flex justify-end items-center">
          <div className="text-7xl font-bold text-blue-200 opacity-60">🛡️</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">My Projects</p>
                <p className="text-3xl font-bold text-[#FF6B35]">{myProjects?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-[#FF6B35]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Assigned Freelancers</p>
                <p className="text-3xl font-bold text-[#003087]">—</p>
              </div>
              <div className="w-12 h-12 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#003087]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Profile</p>
                <p className="text-3xl font-bold text-purple-600">{profile?.username || "—"}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
              <CardTitle className="text-xl text-[#003087] flex items-center justify-between">
                <span>Recent Projects</span>
                <Link href="/dashboard/Moderator/project-status">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {myProjects?.length ? (
                <div className="space-y-4">
                  {myProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-[#003087]" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{project.details?.companyName || "Unknown Company"}</p>
                            <p className="text-sm text-muted-foreground">{project.client?.fullName || "Unknown Client"}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="font-mono">ID: {project.id}</span>
                              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(project.id))}>Copy</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {project.paymentStatus && (
                          <Badge className={project.paymentStatus === "SUCCEEDED" ? "bg-green-500" : "bg-yellow-500"}>
                            {project.paymentStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No projects assigned yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Moderator Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Avatar className="w-24 h-24 mx-auto border-4 border-[#003087]">
                <AvatarImage src={profile?.profilePicture || "/placeholder-user.jpg"} alt={profile?.fullName} />
                <AvatarFallback className="bg-[#003087] text-white text-xl">
                  {(profile?.fullName || "MD").split(" ").map(w=>w[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{profile?.fullName || "Moderator"}</p>
                <p className="text-sm text-muted-foreground">{profile?.role || "MODERATOR"}</p>
              </div>
              <Link href="/dashboard/Moderator/settings">
                <Button className="w-full bg-[#003087] hover:bg-[#002060] text-sm">Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
