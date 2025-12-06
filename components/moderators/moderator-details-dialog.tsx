"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, Calendar, Users, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface ModeratorDetailsDialogProps {
  moderatorId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ModeratorDetails {
  id: string
  fullName: string
  email: string
  phone?: string
  username: string
  isActive: boolean
  createdAt: string
  moderatedProjects: Array<{
    id: string
    title: string
    status: string
    createdAt: string
  }>
}

export function ModeratorDetailsDialog({ moderatorId, open, onOpenChange }: ModeratorDetailsDialogProps) {
  const [moderator, setModerator] = useState<ModeratorDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && moderatorId) {
      fetchModeratorDetails()
    } else {
      setModerator(null)
    }
  }, [open, moderatorId])

  const fetchModeratorDetails = async () => {
    if (!moderatorId) return
    
    setLoading(true)
    try {
      const userDetails = JSON.parse(localStorage.getItem('user') || '{}')
      const token = userDetails?.accessToken

      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/moderators/${moderatorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch moderator details')
      }
      
      const data = await response.json()
      setModerator(data)
    } catch (error) {
      console.error('Error fetching moderator details:', error)
      toast.error('Failed to load moderator details')
    } finally {
      setLoading(false)
    }
  }

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Moderator Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : moderator ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-white text-xl">
                  {moderator.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{moderator.fullName}</h3>
                  <Badge variant={moderator.isActive ? 'default' : 'secondary'}>
                    {moderator.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">@{moderator.username}</p>
                
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{moderator.email}</span>
                  </div>
                  {moderator.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{moderator.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>Joined on {formatDate(moderator.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Projects Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <h4 className="font-medium">Assigned Projects</h4>
                  <Badge variant="outline" className="ml-auto">
                    {moderator.moderatedProjects.length} projects
                  </Badge>
                </div>
                
                {moderator.moderatedProjects.length > 0 ? (
                  <div className="space-y-3">
                    {moderator.moderatedProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors">
                        <div>
                          <p className="font-medium">{project.title || `Project ${project.id.substring(0, 6)}`}</p>
                          <p className="text-sm text-muted-foreground">
                            Added on {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <Badge 
                          variant={project.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {project.status?.toLowerCase() || 'unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No projects assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No moderator data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
