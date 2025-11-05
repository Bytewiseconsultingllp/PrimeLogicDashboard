"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, Save, Camera, Upload, User, Settings as SettingsIcon, Shield, Mail, Phone, MapPin, Hash } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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

export default function AdministratorSettingsPage() {
  const { isAuthorized } = useAuth(["ADMIN"])
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    if (isAuthorized) {
      getUserDetailsData()
    }
  }, [isAuthorized])

  const getUserDetailsData = async () => {
    try {
      setLoadingProfile(true)
      const response = await getCurrentUserDetails()
      const data = response.data || response
      setUserDetails(data)
      setAvatarUrl(data.profilePicture || data.avatar || "")
      profileForm.reset({
        username: data.username || "",
        fullName: data.fullName || "",
        address: data.address || "",
        phone: data.phone || data.phoneNumber || "",
      })
    } catch (error: any) {
      console.error("Error fetching user details:", error)
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
      getUserDetailsData() // Refresh user details
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error?.message || "An error occurred while updating profile.")
    } finally {
      setLoading(false)
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    try {
      setLoading(true)
      await updatePassword(data.currentPassword, data.newPassword)
      toast.success("Password updated successfully!")
      passwordForm.reset()
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast.error(error?.message || "An error occurred while updating password.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.")
      return
    }

    try {
      setAvatarUploading(true)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("avatar", file)

      // This would be the actual API call for uploading avatar
      // const response = await uploadAvatar(formData)
      // setAvatarUrl(response.data.avatarUrl)
      
      // For now, create a local URL for preview
      const localUrl = URL.createObjectURL(file)
      setAvatarUrl(localUrl)
      
      toast.success("Avatar uploaded successfully!")
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar. Please try again.")
    } finally {
      setAvatarUploading(false)
    }
  }

  if (!isAuthorized) return null

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#003087]">Administrator Settings</h1>
          <p className="text-muted-foreground">Manage your administrator account settings and preferences</p>
        </div>
        <Badge variant="default" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Administrator
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-[#003087] text-white text-2xl">
                        {userDetails?.fullName
                          ?.split(" ")
                          .map((word: string) => word[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "AD"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#003087]"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{userDetails?.fullName || "Administrator"}</h3>
                  <p className="text-muted-foreground">@{userDetails?.username || "admin"}</p>
                </div>
              </div>

              <Separator />

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">ID: {userDetails?.uid || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{userDetails?.email || "N/A"}</span>
                </div>
                {userDetails?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{userDetails.phone}</span>
                  </div>
                )}
                {userDetails?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{userDetails.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
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
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Update */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
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
                                type={showPasswords.current ? "text" : "password"}
                                placeholder="Enter current password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                                }
                              >
                                {showPasswords.current ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPasswords.new ? "text" : "password"}
                                  placeholder="Enter new password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                                  }
                                >
                                  {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
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
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPasswords.confirm ? "text" : "password"}
                                  placeholder="Confirm new password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                                  }
                                >
                                  {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
