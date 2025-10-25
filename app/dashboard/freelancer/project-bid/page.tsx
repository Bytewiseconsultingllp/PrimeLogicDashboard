"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"

interface Bid {
  id: string
  projectId: string
  projectName: string
  bidAmount: number
  bidDate: string
  status: string
}

export default function ProjectBidListPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/bids", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (data.success) {
          setBids(data.data)
        } else {
          setError(data.error || "Failed to fetch bids")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch bids")
        console.error("[v0] Error fetching bids:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [])

  const paginatedBids = bids.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(bids.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Bids</h1>
        <p className="text-muted-foreground mt-2">Track all your project bids</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Project Name</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Bid Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBids.map((bid) => (
                  <tr key={bid.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground">{bid.projectName}</td>
                    <td className="py-3 px-4 font-bold text-[#003087]">${bid.bidAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-foreground">{new Date(bid.bidDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/freelancer/projects/${bid.projectId}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
