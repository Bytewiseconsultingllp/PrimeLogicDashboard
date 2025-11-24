"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Briefcase, Eye } from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { useAuth } from "@/hooks/useAuth"

interface Project {
  id: string
  createdAt: string
  paymentStatus?: string
  details?: { companyName?: string; businessType?: string }
  client?: { fullName?: string }
}

export default function ModeratorProjectsPage() {
  const { isAuthorized } = useAuth(["MODERATOR"]) 
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const user = getUserDetails()
        const token = user?.accessToken
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/moderator/my-projects?page=1&limit=50`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const data = await res.json()
          setProjects(data?.data?.projects || [])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <Card key={p.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-[#003087]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.details?.companyName || "Unknown Company"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.client?.fullName || "Unknown Client"}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">ID: {p.id}</span>
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(p.id))}>Copy</Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {p.paymentStatus && (
                  <Badge className={p.paymentStatus === "SUCCEEDED" ? "bg-green-500" : "bg-yellow-500"}>{p.paymentStatus}</Badge>
                )}
                <Link href={`/dashboard/Administrator/project-status/${p.id}`}>
                  <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1"/> View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!projects.length && (
        <div className="text-center py-12 text-muted-foreground">No projects assigned to you yet.</div>
      )}
    </div>
  )
}
