"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { BlogCard } from "@/components/blogs/blogCard"
import { getAllPublicBlogs, deleteABlog, updateBlogVisibility } from "@/lib/api/blogs"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export interface Blog {
  blogId: number
  blogTitle: string
  blogSlug: string
  blogThumbnail: string
  blogOverview: string
  blogBody?: string
  isPublished: boolean
  createdAt: string
}

export interface BlogsResponse {
  success: boolean
  status: number
  message: string
  data: {
    blogs: Blog[]
    pagination: PaginationInfo
  }
  requestInfo: {
    url: string
    ip: string
    method: string
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  totalBlogs: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function BlogsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for blogs data
  const [blogsData, setBlogsData] = useState<BlogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])

  // Get current page from URL or default to 1
  const currentPage = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  // Fetch blogs data
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      try {
        const response = await getAllPublicBlogs(currentPage, limit)
        setBlogsData(response)
        console.log("Fetched blogs data:", response) // Debug log
      } catch (error) {
        console.error("Error fetching blogs:", error)
        toast.error("Failed to load blogs")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [currentPage, limit])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Filter blogs based on search query
  const filteredBlogs =
    blogsData?.data.blogs.filter(
      (blog) =>
        blog.blogTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.blogOverview.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  // Handle delete blog
  const handleDeleteBlog = async (blogSlug: string, blogId: number) => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      return
    }

    try {
      const response = await deleteABlog(blogSlug)
      console.log("Delete response:", response)
      
      if (response && (response.status === 200 || response.success)) {
        toast.success("Blog deleted successfully")
        
        // Update local state after successful deletion
        if (blogsData) {
          const updatedBlogs = blogsData.data.blogs.filter((blog) => blog.blogId !== blogId)
          setBlogsData({
            ...blogsData,
            data: {
              ...blogsData.data,
              blogs: updatedBlogs,
              pagination: {
                ...blogsData.data.pagination,
                totalBlogs: blogsData.data.pagination.totalBlogs - 1,
              },
            },
          })
        }
      } else {
        throw new Error("Delete operation failed")
      }
    } catch (error: any) {
      console.error("Error deleting blog:", error)
      toast.error(error?.message || "Failed to delete blog")
    }
  }

  // Handle visibility toggle
  const handleVisibilityToggle = async (blog: Blog) => {
    try {
      const newVisibility = !blog.isPublished
      const response = await updateBlogVisibility(blog.blogSlug, newVisibility)
      console.log("Visibility toggle response:", response)

      if (response && (response.status === 200 || response.success)) {
        // Update local state after successful update
        if (blogsData) {
          const updatedBlogs = blogsData.data.blogs.map((b) =>
            b.blogId === blog.blogId ? { ...b, isPublished: newVisibility } : b,
          )

          setBlogsData({
            ...blogsData,
            data: {
              ...blogsData.data,
              blogs: updatedBlogs,
            },
          })
        }

        toast.success(`Blog is now ${newVisibility ? "public" : "private"}`)
      } else {
        throw new Error("Visibility update failed")
      }
    } catch (error: any) {
      console.error("Error updating blog visibility:", error)
      toast.error(error?.message || "Failed to change the status of the blog")
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`?page=${page}&limit=${limit}`)
  }

  // Generate pagination items
  const getPaginationItems = () => {
    if (!blogsData) return []

    const totalPages = blogsData.data.pagination.totalPages
    const current = currentPage

    // If 7 or fewer pages, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always include first page, last page, and pages around current page
    const items = []

    // Always show first page
    items.push(1)

    // Show ellipsis after first page if current page is > 3
    if (current > 3) {
      items.push("ellipsis-start")
    }

    // Calculate range around current page
    let rangeStart = Math.max(2, current - 1)
    let rangeEnd = Math.min(totalPages - 1, current + 1)

    // Adjust range to always show 3 pages if possible
    if (current <= 3) {
      rangeEnd = Math.min(4, totalPages - 1)
    } else if (current >= totalPages - 2) {
      rangeStart = Math.max(totalPages - 3, 2)
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      items.push(i)
    }

    // Show ellipsis before last page if needed
    if (current < totalPages - 2) {
      items.push("ellipsis-end")
    }

    // Always show last page
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  // Conditional rendering happens after all hooks have been called
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Blog Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[400px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthorized) return null // Prevent rendering if unauthorized

  const paginationItems = getPaginationItems()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Blog Management</h1>

      {/* Search and Add New Blog */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Button onClick={() => router.push("/dashboard/Administrator/blogs/create")}>Add New Blog</Button>
      </div>

      {/* Blog Count */}
      {blogsData && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredBlogs.length} of {blogsData.data.pagination.totalBlogs} blogs
          </p>
        </div>
      )}

      {/* Blogs Grid */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.blogId}
              blog={blog}
              onDelete={() => handleDeleteBlog(blog.blogSlug, blog.blogId)}
              onToggleVisibility={handleVisibilityToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blogs found. Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Advanced Pagination */}
      {blogsData && blogsData.data.pagination.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {/* Previous button - always show but disable if on first page */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1)
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Dynamic page numbers with ellipsis */}
            {paginationItems.map((item, index) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              return (
                <PaginationItem key={`page-${item}`}>
                  <PaginationLink
                    href="#"
                    isActive={item === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(item as number)
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {/* Next button - always show but disable if on last page */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < blogsData.data.pagination.totalPages) {
                    handlePageChange(currentPage + 1)
                  }
                }}
                className={currentPage === blogsData.data.pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
