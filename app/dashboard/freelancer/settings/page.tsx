"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface FreelancerProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  bio: string
  skills: string[]
  hourlyRate: number
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState<Partial<FreelancerProfile>>({})

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (data.success && data.data) {
          setProfile(data.data)
          setFormData(data.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async () => {
    try {
      setUpdating(true)
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required" })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters" })
      return
    }

    try {
      setUpdatingPassword(true)
      setPasswordMessage(null)
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage({ type: "success", text: "Password updated successfully!" })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to update password" })
      }
    } catch (error) {
      console.error("[v0] Error updating password:", error)
      setPasswordMessage({ type: "error", text: "Failed to update password" })
    } finally {
      setUpdatingPassword(false)
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
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input type="text" name="name" value={formData.name || ""} onChange={handleChange} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input type="tel" name="phone" value={formData.phone || ""} onChange={handleChange} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Hourly Rate ($)</label>
              <Input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate || ""}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Street Address</label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">City</label>
                <Input type="text" name="city" value={formData.city || ""} onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">State</label>
                <Input type="text" name="state" value={formData.state || ""} onChange={handleChange} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Zip Code</label>
                <Input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode || ""}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Country</label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Professional Information</h3>
            <div>
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="mt-2 min-h-24"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button onClick={handleUpdate} disabled={updating} className="bg-[#003087] hover:bg-[#002060]">
              {updating ? "Updating..." : "Update Profile"}
            </Button>
            <Button variant="outline" onClick={() => setFormData(profile || {})}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {passwordMessage && (
            <div
              className={`p-4 rounded-lg ${
                passwordMessage.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <div className="relative mt-2">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative mt-2">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <div className="relative mt-2">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handlePasswordUpdate}
              disabled={updatingPassword}
              className="bg-[#003087] hover:bg-[#002060]"
            >
              {updatingPassword ? "Updating..." : "Update Password"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                setPasswordMessage(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
