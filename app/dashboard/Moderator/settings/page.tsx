"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getCurrentUserDetails } from "@/lib/api/auth"

interface Profile {
  uid: string
  fullName: string
  email: string
  username: string
  role: string
  phone?: string
}

export default function ModeratorSettingsPage() {
  const { isAuthorized } = useAuth(["MODERATOR"]) 
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const me = await getCurrentUserDetails()
        if (me?.success) setProfile(me.data)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5">
          <CardTitle className="text-xl text-[#003087] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={profile?.fullName || ""} readOnly />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ""} readOnly />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={profile?.username || ""} readOnly />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={profile?.role || "MODERATOR"} readOnly />
            </div>
            {profile?.phone && (
              <div>
                <Label>Phone</Label>
                <Input value={profile.phone} readOnly />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Change Password</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <div className="pt-2">
              <Button disabled>Update Password</Button>
            </div>
            <p className="text-xs text-muted-foreground">Password update flow is controlled by backend. Enable when endpoint is ready.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
