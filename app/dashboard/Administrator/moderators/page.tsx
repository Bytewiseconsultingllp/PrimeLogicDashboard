"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { 
  Shield,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  BarChart3
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const createModeratorSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
  projectId: z.string().optional(),
})

interface Moderator {
  id: string
  username: string
  email: string
  fullName: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  moderatedProjects?: Array<{
    id: string
    createdAt: string
    updatedAt: string
    paymentStatus: string
    details: any
  }>
}

interface ModeratorStats {
  totalModerators: number
  activeModerators: number
  inactiveModerators: number
  totalProjectsModerated: number
}

export default function ModeratorsPage() {
  const { isAuthorized } = useAuth(["ADMIN"])
  const router = useRouter()
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [moderatorDetails, setModeratorDetails] = useState<Moderator | null>(null)
  const [projects, setProjects] = useState<Array<{id: string; title: string}>>([])
  const [stats, setStats] = useState<ModeratorStats>({
    totalModerators: 0,
    activeModerators: 0,
    inactiveModerators: 0,
    totalProjectsModerated: 0
  })
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewingModeratorId, setViewingModeratorId] = useState<string | null>(null)
  const [isModeratorDialogOpen, setIsModeratorDialogOpen] = useState(false)
  const [newModerator, setNewModerator] = useState<{id: string; fullName: string; email: string} | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const itemsPerPage = 12

  const form = useForm<z.infer<typeof createModeratorSchema>>({
    resolver: zodResolver(createModeratorSchema),
    defaultValues: {
      email: "",
      fullName: "",
      projectId: "",
    },
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchModerators()
      fetchProjects()
    }
  }, [isAuthorized, currentPage, includeInactive])

  const fetchProjects = async () => {
    setProjectsLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        console.error("❌ No access token found")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/projects?limit=100`, // Adjust limit as needed
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setProjects(data.data?.projects || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setProjectsLoading(false)
    }
  }

  const fetchModerators = async () => {
    setLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        console.error("❌ No access token found")
        toast.error("Authentication required. Please login again.")
        router.push('/login')
        return
      }

      console.log("🔄 Fetching moderators...")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/moderators?page=${currentPage}&limit=${itemsPerPage}&includeInactive=${includeInactive}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Moderators data:", data)
        setModerators(data.data?.moderators || [])
        setTotalPages(data.data?.pagination?.totalPages || 1)
        
        // Calculate stats
        const moderatorList = data.data?.moderators || []
        const activeMods = moderatorList.filter((mod: Moderator) => mod.isActive)
        const totalProjects = moderatorList.reduce((sum: number, mod: Moderator) => 
          sum + (mod.moderatedProjects?.length || 0), 0)
        
        setStats({
          totalModerators: moderatorList.length,
          activeModerators: activeMods.length,
          inactiveModerators: moderatorList.length - activeMods.length,
          totalProjectsModerated: totalProjects
        })
        
        toast.success(`Loaded ${moderatorList.length} moderators`)
      } else if (response.status === 401) {
        console.error("❌ Authentication failed - token may be expired")
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch moderators:", errorData)
        toast.error(`Failed to load moderators: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching moderators:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const createModerator = async (data: z.infer<typeof createModeratorSchema>) => {
    setActionLoading("create")
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      // First, create the moderator
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/moderators`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: data.email,
          fullName: data.fullName
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Failed to create moderator')
      }

      const result = await response.json()
      console.log("Moderator creation response:", result)
      
      // Extract moderator data from the response
      const moderatorData = result.data?.moderator || result.data || result
      
      if (!moderatorData) {
        throw new Error('No moderator data in response')
      }
      
      const moderatorId = moderatorData.uid || moderatorData.id || moderatorData._id
      const fullName = moderatorData.fullName || data.fullName
      const email = moderatorData.email || data.email
      
      if (!moderatorId) {
        throw new Error('No moderator ID in response')
      }

      // If a project was selected, assign it to the moderator
      if (data.projectId) {
        try {
          const assignResponse = await fetch(
            `${process.env.NEXT_PUBLIC_PLS}/admin/moderators/${moderatorId}/projects/${data.projectId}`,
            {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          )

          if (!assignResponse.ok) {
            console.warn("Moderator created but failed to assign project")
          }
        } catch (assignError) {
          console.error("Error assigning project:", assignError)
          // Don't fail the whole operation if project assignment fails
        }
      }

      console.log("✅ Moderator created:", moderatorData)
      setNewModerator({
        id: moderatorId,
        fullName: fullName,
        email: email
      })
      form.reset()
      fetchModerators()
    } catch (error) {
      console.error("Error creating moderator:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create moderator")
    } finally {
      setActionLoading(null)
    }
  }

  const toggleModeratorStatus = async (moderatorId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this moderator?`)) {
      return;
    }
    
    setActionLoading(moderatorId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/moderators/${moderatorId}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Moderator ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchModerators()
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to update moderator:", errorData)
        toast.error("Failed to update moderator status")
      }
    } catch (error) {
      console.error("Error updating moderator:", error)
      toast.error("Failed to update moderator status")
    } finally {
      setActionLoading(null)
    }
  }

  const deleteModerator = async (moderatorId: string) => {
    if (!confirm("Are you sure you want to delete this moderator? This action cannot be undone.")) {
      return
    }

    setActionLoading(moderatorId)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/moderators/${moderatorId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        toast.success("Moderator deleted successfully")
        fetchModerators()
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to delete moderator:", errorData)
        toast.error("Failed to delete moderator")
      }
    } catch (error) {
      console.error("Error deleting moderator:", error)
      toast.error("Failed to delete moderator")
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewModerator = async (e: React.MouseEvent, moderatorId: string) => {
    e.stopPropagation()
    setViewingModeratorId(moderatorId)
    setActionLoading(`view-${moderatorId}`)
    
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log(`🔄 Fetching details for moderator ${moderatorId}...`)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/admin/moderators/${moderatorId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          cache: 'no-store' // Prevent caching to get fresh data
        }
      )

      if (response.ok) {
        const { data } = await response.json()
        console.log('✅ Moderator details:', data)
        
        // Transform the data to match our Moderator interface
        const moderatorData = {
          ...data,
          // Map any fields if necessary to match the Moderator interface
          id: data.uid || data.id, // Use uid if available, fallback to id
          moderatedProjects: data.projects || [], // Map projects to moderatedProjects if needed
          // Ensure all required fields are present
          username: data.username || data.email?.split('@')[0] || '',
          fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'N/A',
          email: data.email || 'N/A',
          phone: data.phone || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        }
        
        setModeratorDetails(moderatorData)
        setIsModeratorDialogOpen(true)
      } else if (response.status === 404) {
        toast.error("Moderator not found")
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch moderator details:", errorData)
        toast.error(`Failed to load moderator details: ${response.statusText}`)
        // Fallback to basic view if detailed fetch fails
        const fallbackModerator = moderators.find((m: { id: string }) => m.id === moderatorId)
        if (fallbackModerator) {
          setModeratorDetails(fallbackModerator)
          setIsModeratorDialogOpen(true)
        }
      }
    } catch (error) {
      console.error("Error fetching moderator details:", error)
      toast.error("An error occurred while fetching moderator details")
      // Fallback to basic view if there's an error
      const fallbackModerator = moderators.find((m: { id: string }) => m.id === viewingModeratorId)
      if (fallbackModerator) {
        setModeratorDetails(fallbackModerator)
        setIsModeratorDialogOpen(true)
      }
    } finally {
      if (actionLoading === `view-${viewingModeratorId}`) {
        setActionLoading(null)
      }
    }
  }

  // Filter moderators based on search term
  const filteredModerators = (moderators || []).filter((moderator: { fullName?: string; email?: string; username?: string }) =>
    (moderator.fullName?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (moderator.email?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (moderator.username?.toLowerCase() || '').includes((searchTerm || '').toLowerCase())
  )

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading moderators...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderators</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Moderator
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Moderators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModerators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeModerators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveModerators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Projects Moderated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjectsModerated}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search moderators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={includeInactive ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              {includeInactive ? 'Hide Inactive' : 'Show Inactive'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModerators.map((moderator) => (
                  <TableRow key={moderator.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(moderator.fullName || '')}&background=003087&color=fff`} />
                          <AvatarFallback>{moderator.fullName?.charAt(0) || 'M'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{moderator.fullName}</div>
                          <div className="text-sm text-muted-foreground">@{moderator.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          {moderator.email}
                        </div>
                        {moderator.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            {moderator.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {moderator.moderatedProjects?.length || 0} Projects
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={moderator.isActive ? 'default' : 'secondary'}>
                        {moderator.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(moderator.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleViewModerator(e, moderator.id)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleModeratorStatus(moderator.id, moderator.isActive)}
                          disabled={!!actionLoading}
                          className="text-amber-600 hover:bg-amber-50"
                        >
                          {actionLoading === moderator.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : moderator.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Moderator Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              Add New Moderator
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Enter the moderator's details below. An email will be sent with login instructions.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(createModerator)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="John Doe"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project ID to assign"
                        className="w-full"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-[#003087] hover:bg-[#003087]/90"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Moderator
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Moderator Details Dialog */}
      <Dialog open={isModeratorDialogOpen} onOpenChange={setIsModeratorDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {moderatorDetails?.fullName}
                </DialogTitle>
                <DialogDescription>
                  Moderator Details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewingModeratorId && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {moderatorDetails?.email}
                        </span>
                      </div>
                      {moderatorDetails?.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {moderatorDetails.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Joined on {moderatorDetails?.createdAt ? new Date(moderatorDetails.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-2">
                      <Badge variant={moderatorDetails?.isActive ? 'default' : 'secondary'}>
                        {moderatorDetails?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Assigned Projects</h3>
                  <div className="mt-2 space-y-2">
                    {moderatorDetails?.moderatedProjects?.length ? (
                      <div className="space-y-2">
                        {moderatorDetails.moderatedProjects?.map(project => (
                          <div key={project.id} className="p-3 border rounded-md">
                            <div className="font-medium">
                              {project.details?.title || `Project ${project.id.substring(0, 8)}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {project.paymentStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No projects assigned yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant={moderatorDetails?.isActive ? 'destructive' : 'outline'}
                  onClick={() => {
                    if (moderatorDetails && confirm(`Are you sure you want to ${moderatorDetails.isActive ? 'deactivate' : 'activate'} this moderator?`)) {
                      toggleModeratorStatus(moderatorDetails.id, moderatorDetails.isActive);
                      setIsModeratorDialogOpen(false);
                    }
                  }}
                  disabled={!!actionLoading}
                >
                  {actionLoading === viewingModeratorId ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {moderatorDetails?.isActive ? 'Deactivate' : 'Activate'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this moderator?')) {
                      deleteModerator(viewingModeratorId);
                      setIsModeratorDialogOpen(false);
                    }
                  }}
                  disabled={!!actionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Success Dialog */}
      <Dialog open={!!newModerator} onOpenChange={(open) => !open && setNewModerator(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              Moderator Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Credentials have been sent to the moderator's email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Moderator ID:</span>
              <span className="font-mono text-sm font-medium">{newModerator?.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <span className="font-medium">{newModerator?.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="font-medium">{newModerator?.email}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              type="button" 
              className="w-full bg-[#003087] hover:bg-[#003087]/90"
              onClick={() => setNewModerator(null)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
