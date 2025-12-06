"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { User, Mail, Phone, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ModeratorDetailsProps {
  moderatorId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Moderator {
  id: string
  fullName: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  moderatedProjects?: Array<{
    id: string
    title: string
    status: string
  }>
}

export function ModeratorDetails({ moderatorId, open, onOpenChange }: ModeratorDetailsProps) {
  const [moderator, setModerator] = useState<Moderator | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession() as { data: { accessToken: string } | null }

  useEffect(() => {
    if (open && moderatorId) {
      fetchModeratorDetails()
    } else {
      setModerator(null)
    }
  }, [open, moderatorId])

  const fetchModeratorDetails = async () => {
    if (!moderatorId) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/moderators/${moderatorId}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch moderator details')
      
      const data = await response.json()
      setModerator(data.data)
    } catch (error) {
      console.error('Error fetching moderator details:', error)
      toast.error('Failed to load moderator details')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Moderator Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : moderator ? (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={moderator.fullName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {moderator.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{moderator.fullName}</h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {moderator.email}
                </p>
                <div className="flex items-center mt-2">
                  <Badge variant={moderator.isActive ? 'default' : 'secondary'} className="flex items-center">
                    {moderator.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {moderator.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <div className="space-y-1">
                  {moderator.phone && (
                    <p className="text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {moderator.phone}
                    </p>
                  )}
                  <p className="text-sm flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {moderator.email}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Account Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {moderator.role}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    Member since {new Date(moderator.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {moderator.moderatedProjects && moderator.moderatedProjects.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Assigned Projects</h4>
                <div className="space-y-2">
                  {moderator.moderatedProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">{project.title}</span>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No moderator details available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
