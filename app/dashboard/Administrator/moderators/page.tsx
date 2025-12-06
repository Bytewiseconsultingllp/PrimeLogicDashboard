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
import { ModeratorDetailsDialog } from "@/components/moderators/moderator-details-dialog"
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
  const [stats, setStats] = useState<ModeratorStats>({
    totalModerators: 0,
    activeModerators: 0,
    inactiveModerators: 0,
    totalProjectsModerated: 0
  })
  const [loading, setLoading] = useState(true)
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
    },
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchModerators()
    }
  }, [isAuthorized, currentPage, includeInactive])

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/moderators`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Moderator created:", result)
        setNewModerator({
          id: result.id,
          fullName: result.fullName,
          email: result.email
        })
        form.reset()
        fetchModerators()
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to create moderator:", errorData)
        toast.error("Failed to create moderator")
      }
    } catch (error) {
      console.error("Error creating moderator:", error)
      toast.error("Failed to create moderator")
    } finally {
      setActionLoading(null)
    }
  }

  const toggleModeratorStatus = async (moderatorId: string, currentStatus: boolean) => {
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

  const handleViewModerator = (e: React.MouseEvent, moderatorId: string) => {
    e.stopPropagation()
    setViewingModeratorId(moderatorId)
    setIsModeratorDialogOpen(true)
  }

  const filteredModerators = (moderators || []).filter(moderator =>
    moderator.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moderator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moderator.username?.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Moderator Details Dialog */}
      <ModeratorDetailsDialog
        moderatorId={viewingModeratorId}
        open={isModeratorDialogOpen}
        onOpenChange={setIsModeratorDialogOpen}
      />

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
