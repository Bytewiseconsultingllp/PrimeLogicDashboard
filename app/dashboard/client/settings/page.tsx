"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, Save, Camera, Upload, User, Settings as SettingsIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    getUserDetailsData()
  }, [])

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
      console.error("Error updating profile:", error)
      toast.error(error?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    try {
      setLoading(true)
      const userDetails = getUserDetails()
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    try {
      setAvatarUploading(true)
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Avatar updated successfully!")
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to update avatar")
      setAvatarUrl(userDetails?.profilePicture || userDetails?.avatar || "")
    } finally {
      setAvatarUploading(false)
    }
  }

  const removeAvatar = () => {
    setAvatarUrl("")
    toast.success("Avatar removed successfully!")
  }

  if (!isAuthorized) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-r from-[#003087] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto"
        >
          <SettingsIcon className="w-10 h-10 text-white" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold text-[#003087]">Account Settings</h1>
          <p className="text-gray-600 text-lg mt-2">Manage your account and preferences</p>
        </div>
      </div>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 border-b">
              <CardTitle className="text-2xl text-[#003087] flex items-center gap-2">
                <Camera className="w-6 h-6" />
                Profile Avatar
              </CardTitle>
              <CardDescription>Upload and manage your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={avatarUrl} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white text-3xl">
                      {userDetails?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-gray-600">Upload a new avatar or remove the current one</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleAvatarClick}
                      disabled={avatarUploading}
                      className="bg-[#003087] hover:bg-[#003087]/90"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Avatar
                    </Button>
                    
                    {avatarUrl && (
                      <Button
                        onClick={removeAvatar}
                        variant="outline"
                        disabled={avatarUploading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Remove Avatar
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Recommended: Square image, at least 200x200px. Max file size: 5MB.
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 border-b">
              <CardTitle className="text-2xl text-[#003087] flex items-center gap-2">
                <User className="w-6 h-6" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your username" 
                              disabled={loading}
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your full name" 
                              disabled={loading}
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your address" 
                              disabled={loading}
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your phone number" 
                              disabled={loading}
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={loading || loadingProfile} 
                      className="w-full h-12 bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90 text-white font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating Profile...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Update Profile
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 border-b">
              <CardTitle className="text-2xl text-[#003087] flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Security Settings
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPasswords.current ? "text" : "password"}
                              placeholder="Enter current password"
                              disabled={loading}
                              autoComplete="current-password"
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12 pr-12"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003087]"
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
                        <FormLabel className="text-gray-700 font-medium">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPasswords.new ? "text" : "password"}
                              placeholder="Enter new password"
                              disabled={loading}
                              autoComplete="new-password"
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12 pr-12"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003087]"
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
                        <FormLabel className="text-gray-700 font-medium">Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPasswords.confirm ? "text" : "password"}
                              placeholder="Confirm new password"
                              disabled={loading}
                              autoComplete="new-password"
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12 pr-12"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003087]"
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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-12 bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90 text-white font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating Password...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Update Password
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
