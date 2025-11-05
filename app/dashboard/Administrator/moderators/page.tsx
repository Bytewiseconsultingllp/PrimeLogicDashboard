"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
        toast.success("Moderator created successfully! Credentials sent via email.")
        setIsCreateDialogOpen(false)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Moderator Management</h1>
          <p className="text-muted-foreground">Manage moderators and their project assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Moderator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Moderator</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(createModerator)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="moderator@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading === "create"}>
                    {actionLoading === "create" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Moderator"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Moderators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModerators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Moderators</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeModerators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Moderators</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactiveModerators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Moderated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjectsModerated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Moderators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={includeInactive ? "default" : "outline"}
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              {includeInactive ? "Show All" : "Include Inactive"}
            </Button>
          </div>

          {/* Moderators Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModerators.map((moderator, index) => (
                  <TableRow key={moderator.id || `moderator-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-[#003087] text-white">
                            {moderator.fullName
                              ?.split(" ")
                              .map((word: string) => word[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "MD"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{moderator.fullName}</p>
                          <p className="text-sm text-muted-foreground">@{moderator.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{moderator.email}</span>
                        </div>
                        {moderator.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{moderator.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {moderator.moderatedProjects?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={moderator.isActive ? "default" : "secondary"}>
                        {moderator.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(moderator.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/Administrator/moderators/${moderator.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModeratorStatus(moderator.id, moderator.isActive)}
                          disabled={actionLoading === moderator.id}
                        >
                          {actionLoading === moderator.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : moderator.isActive ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModerator(moderator.id)}
                          disabled={actionLoading === moderator.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {actionLoading === moderator.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
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
    </div>
  )
}
