"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, UserPlus, UserX, User, Mail, Phone, CheckCircle, XCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface Session {
  accessToken: string
  user?: {
    name?: string
    email?: string
    image?: string
  }
}

interface ModeratorAssignmentProps {
  projectId: string
  currentModerator?: {
    id: string
    fullName: string
    email: string
    phone?: string
  } | null
  onModeratorAssigned: (moderator: { 
    id: string; 
    fullName: string; 
    email: string;
    phone?: string;
  } | null) => void
}

export function ModeratorAssignment({ projectId, currentModerator, onModeratorAssigned }: ModeratorAssignmentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    moderatorId: ""
  })
  const { data: session } = useSession() as { data: Session | null }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateModeratorId = () => {
    return `mod_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleAssignModerator = async () => {
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }
    
    try {
      setIsLoading(true)
      const moderatorId = formData.moderatorId || generateModeratorId()
      
      // Create moderator
      const createResponse = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName
        })
      })
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.message || 'Failed to create moderator')
      }
      
      const { data: { moderator } } = await createResponse.json()
      
      // Assign moderator to project
      const assignResponse = await fetch(`/api/admin/projects/${projectId}/moderator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          moderatorId: moderator.id
        })
      })
      
      if (!assignResponse.ok) throw new Error('Failed to assign moderator to project')
      
      onModeratorAssigned({
        id: moderator.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      })
      
      toast.success('Moderator assigned successfully')
      setIsDialogOpen(false)
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        moderatorId: ""
      })
      
    } catch (error: any) {
      console.error('Error in moderator assignment:', error)
      toast.error(error.message || 'Failed to assign moderator')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveModerator = async () => {
    if (!confirm('Are you sure you want to remove this moderator?')) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/moderator`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to remove moderator')
      
      onModeratorAssigned(null)
      toast.success('Moderator removed successfully')
    } catch (error) {
      console.error('Error removing moderator:', error)
      toast.error('Failed to remove moderator')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Moderator</h3>
        
        {currentModerator ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRemoveModerator}
            disabled={isLoading}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserX className="mr-2 h-4 w-4" />
            )}
            Remove Moderator
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign New Moderator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                  Assign New Moderator
                </DialogTitle>
                <DialogDescription className="text-center text-gray-500">
                  Fill in the moderator details below
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="pl-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="pl-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number (optional)"
                      className="pl-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="moderatorId" className="text-sm font-medium text-gray-700">
                    Moderator ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="moderatorId"
                      name="moderatorId"
                      value={formData.moderatorId || generateModeratorId()}
                      onChange={handleInputChange}
                      placeholder="Will be auto-generated if left empty"
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      readOnly={!!formData.moderatorId}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAssignModerator}
                  disabled={isLoading || !formData.fullName || !formData.email}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Moderator'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {currentModerator ? (
        <div className="border border-green-100 bg-green-50 rounded-lg p-4 transition-all hover:shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-medium text-gray-900 truncate">
                  {currentModerator.fullName}
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Assigned
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500 space-y-1">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{currentModerator.email}</span>
                </div>
                {currentModerator.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{currentModerator.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <UserX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No moderator assigned</h3>
          <p className="mt-1 text-sm text-gray-500">Assign a moderator to manage this project</p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Moderator
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
