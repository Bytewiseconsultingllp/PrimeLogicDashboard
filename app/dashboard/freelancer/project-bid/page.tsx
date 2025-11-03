// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Loader2, Eye } from "lucide-react"

// interface Bid {
//   id: string
//   projectId: string
//   projectName: string
//   bidAmount: number
//   bidDate: string
//   status: string
// }

// export default function ProjectBidListPage() {
//   const [bids, setBids] = useState<Bid[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 10

//   useEffect(() => {
//     const fetchBids = async () => {
//       try {
//         setLoading(true)
//         const token = localStorage.getItem("authToken")
//         const response = await fetch("/api/bids", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         const data = await response.json()

//         if (data.success) {
//           setBids(data.data)
//         } else {
//           setError(data.error || "Failed to fetch bids")
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to fetch bids")
//         console.error("[v0] Error fetching bids:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchBids()
//   }, [])

//   const paginatedBids = bids.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
//   const totalPages = Math.ceil(bids.length / itemsPerPage)

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "ACCEPTED":
//         return "bg-green-100 text-green-800"
//       case "REJECTED":
//         return "bg-red-100 text-red-800"
//       default:
//         return "bg-yellow-100 text-yellow-800"
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">My Bids</h1>
//         <p className="text-muted-foreground mt-2">Track all your project bids</p>
//       </div>

//       {error && (
//         <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">{error}</div>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Bid History</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-border">
//                   <th className="text-left py-3 px-4 font-medium text-foreground">Project Name</th>
//                   <th className="text-left py-3 px-4 font-medium text-foreground">Bid Amount</th>
//                   <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
//                   <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
//                   <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedBids.map((bid) => (
//                   <tr key={bid.id} className="border-b border-border hover:bg-muted/50">
//                     <td className="py-3 px-4 text-foreground">{bid.projectName}</td>
//                     <td className="py-3 px-4 font-bold text-[#003087]">${bid.bidAmount.toLocaleString()}</td>
//                     <td className="py-3 px-4 text-foreground">{new Date(bid.bidDate).toLocaleDateString()}</td>
//                     <td className="py-3 px-4">
//                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bid.status)}`}>
//                         {bid.status}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <Link href={`/dashboard/freelancer/projects/${bid.projectId}`}>
//                         <Button variant="ghost" size="sm" className="gap-2">
//                           <Eye className="w-4 h-4" />
//                         </Button>
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
//             <p className="text-sm text-muted-foreground">
//               Page {currentPage} of {totalPages}
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye } from "lucide-react"
import { getFreelancerBids, getBidDetails } from "@/lib/api/freelancers"
import { toast } from "sonner"

interface Bid {
  id: string
  projectId: string
  bidAmount: string
  status: string
  submittedAt: string
  project?: {
    id: string
    details?: {
      companyName: string
    }
  }
}

export default function ProjectBidListPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [loadingBidDetails, setLoadingBidDetails] = useState(false)

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await getFreelancerBids(currentPage, itemsPerPage)
        
        if (response.success && response.data?.bids) {
          setBids(response.data.bids)
        } else {
          throw new Error(response.message || "Failed to fetch bids")
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch bids"
        setError(errorMsg)
        toast.error(errorMsg)
        console.error("Error fetching bids:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [currentPage])

  const paginatedBids = bids.slice(0, itemsPerPage)
  const totalPages = Math.ceil(bids.length / itemsPerPage)

  const handleViewBid = async (bid: Bid) => {
    try {
      setLoadingBidDetails(true)
      setBidDialogOpen(true)
      
      const response = await getBidDetails(bid.id)
      
      if (response.success && response.data) {
        setSelectedBid(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch bid details")
      }
    } catch (error) {
      console.error("Error fetching bid details:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load bid details")
      setBidDialogOpen(false)
    } finally {
      setLoadingBidDetails(false)
    }
  }

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
        <p className="text-muted-foreground mt-2">Track all your project bids and their status</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Bid Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBids.map((bid) => (
                  <tr key={bid.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground text-sm">
                      {bid.project?.details?.companyName || `Project ${bid.projectId.slice(0, 8)}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#003087] text-sm">
                      ${Number.parseFloat(bid.bidAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-foreground text-sm">
                      {new Date(bid.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleViewBid(bid)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {paginatedBids.map((bid) => (
              <div key={bid.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm break-words">
                      {bid.project?.details?.companyName || `Project ${bid.projectId.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(bid.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(bid.status)}`}
                  >
                    {bid.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="font-bold text-[#003087] text-sm">
                    ${Number.parseFloat(bid.bidAmount).toLocaleString()}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleViewBid(bid)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-6 border-t border-border">
            <p className="text-xs md:text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none text-xs md:text-sm"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex-1 sm:flex-none text-xs md:text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid Details Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#003087]">Bid Details</DialogTitle>
          </DialogHeader>
          
          {loadingBidDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
            </div>
          ) : selectedBid ? (
            <div className="space-y-4 py-4">
              {/* Bid ID */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bid ID</p>
                <code className="text-xs bg-gray-100 px-3 py-2 rounded block break-all">
                  {selectedBid.id}
                </code>
              </div>

              {/* Project ID */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Project ID</p>
                <code className="text-xs bg-gray-100 px-3 py-2 rounded block break-all">
                  {selectedBid.projectId}
                </code>
              </div>

              {/* Bid Amount */}
              <div className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Bid Amount</p>
                <p className="text-3xl font-bold text-[#003087]">
                  ${Number.parseFloat(selectedBid.bidAmount).toLocaleString()}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                <Badge className={getStatusColor(selectedBid.status)}>
                  {selectedBid.status}
                </Badge>
              </div>

              {/* Submitted At */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Submitted At</p>
                <p className="text-sm text-foreground">
                  {new Date(selectedBid.submittedAt).toLocaleString()}
                </p>
              </div>

              {/* Proposal Text */}
              {selectedBid.proposalText && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Proposal</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedBid.proposalText}
                    </p>
                  </div>
                </div>
              )}

              {/* Reviewed Info */}
              {selectedBid.reviewedAt && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reviewed At</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedBid.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <Button 
                onClick={() => {
                  setBidDialogOpen(false)
                  setSelectedBid(null)
                }}
                className="w-full bg-[#003087] hover:bg-[#002060]"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No bid details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
