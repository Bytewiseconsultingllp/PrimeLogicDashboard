"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { getCurrentUserDetails, updateUserInfo, updatePassword } from "@/lib/api/auth"
import { getUserDetails } from "@/lib/api/storage"
import { useAuth } from "@/hooks/useAuth"

const profileFormSchema = z.object({
  username: z.string().min(4, { message: "Username must be at least 4 characters." }),
  fullName: z.string().min(4, { message: "Full Name must be at least 4 characters." }),
  address: z.string().min(4, { message: "Address must be at least 4 characters." }),
  phone: z.string().min(10, { message: "Phone Number must be at least 10 digits." }),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function SettingsPage() {
  const { isAuthorized } = useAuth(["CLIENT"])
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      fullName: "",
      address: "",
      phone: "",
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    getUserDetailsData()
  }, [])

  const getUserDetailsData = async () => {
    try {
      setLoadingProfile(true)
      const response = await getCurrentUserDetails()
      const data = response.data || response
      profileForm.reset({
        username: data.username || "",
        fullName: data.fullName || "",
        address: data.address || "",
        phone: data.phone || data.phoneNumber || "",
      })
    } catch (error: any) {
      console.error("[v0] Error fetching user details:", error)
      toast.error(error?.message || "An error occurred while fetching user details.")
    } finally {
      setLoadingProfile(false)
    }
  }

  async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    try {
      setLoading(true)
      await updateUserInfo(data.username, data.fullName, data.address, data.phone)
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      console.error("[v0] Error updating profile:", error)
      toast.error(error?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    try {
      setLoading(true)
      const userDetails = getUserDetails() // Use imported getUserDetails function
      if (!userDetails?.id) {
        throw new Error("User ID not found")
      }
      await updatePassword(data.newPassword, userDetails.id)
      toast.success("Password changed successfully!")
      passwordForm.reset()
      setShowPasswords({ current: false, new: false, confirm: false })
    } catch (error: any) {
      console.error("[v0] Error changing password:", error)
      toast.error(error?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthorized) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Update Your Info Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Update Your Info</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid gap-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your username" disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your full name" disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid gap-4">
                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your address" disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your phone number" disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={loading || loadingProfile} className="w-50 group bg-[#003087] hover:bg-[#002663]">
                  {loading ? "Updating..." : "Update Info"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Reset Password Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Enter current password"
                            disabled={loading}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="Enter new password"
                            disabled={loading}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            disabled={loading}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                              }))
                            }
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading} className="w-50 group bg-[#003087] hover:bg-[#002663]">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Save className="h-5 w-5 text-gray-300 group-hover:text-gray-400" aria-hidden="true" />
                  </span>
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
