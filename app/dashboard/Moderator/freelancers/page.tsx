"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getUserDetails } from "@/lib/api/storage"

interface FreelancerLite {
  id?: string
  userId?: string
  fullName?: string
  email?: string
  primaryDomain?: string
  username?: string
}

export default function ModeratorFreelancersPage() {
  const { isAuthorized } = useAuth(["MODERATOR"]) 
  const [loading, setLoading] = useState(true)
  const [freelancers, setFreelancers] = useState<FreelancerLite[]>([])

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true)
        const user = getUserDetails()
        const token = user?.accessToken
        if (!token) return
        // Derive freelancers from moderator's assigned projects
        const res = await fetch(`${process.env.NEXT_PUBLIC_PLS}/moderator/my-projects?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const data = await res.json()
          const projects = data?.data?.projects || []
          const list: FreelancerLite[] = []
          for (const p of projects) {
            const selected = p?.selectedFreelancers || p?.freelancers || []
            for (const f of selected) {
              list.push({
                id: f?.id || f?.userId || f?.uid,
                userId: f?.userId || f?.uid,
                fullName: f?.details?.fullName || f?.fullName,
                email: f?.details?.email || f?.email,
                primaryDomain: f?.details?.primaryDomain,
                username: f?.username,
              })
            }
          }
          // de-duplicate by userId or username
          const dedup = new Map<string, FreelancerLite>()
          for (const fl of list) {
            const key = String(fl.userId || fl.username || fl.id)
            if (!dedup.has(key)) dedup.set(key, fl)
          }
          setFreelancers(Array.from(dedup.values()))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchFreelancers()
  }, [])

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading freelancers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-[#003087]" />
        <h2 className="text-xl font-semibold">Assigned Freelancers</h2>
        <Badge variant="secondary" className="ml-2">{freelancers.length}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((f) => (
          <Card key={String(f.userId || f.id)} className="border border-gray-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{(f.fullName || "F").slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold truncate">{f.fullName || "Unknown"}</p>
                <p className="text-sm text-muted-foreground truncate">{f.email || "—"}</p>
                <div className="mt-1">
                  <Badge className="bg-[#003087] text-white">{f.primaryDomain || "—"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!freelancers.length && (
        <div className="text-center text-muted-foreground py-12">No freelancers assigned to you yet.</div>
      )}
    </div>
  )
}
