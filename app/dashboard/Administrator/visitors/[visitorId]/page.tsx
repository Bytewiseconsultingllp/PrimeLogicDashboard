"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
  Hash,
  Monitor,
  Clock
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface VisitorDetails {
  id: string
  fullName: string
  businessEmail: string
  phoneNumber?: string
  companyName?: string
  companyWebsite?: string
  businessAddress?: string
  businessType?: string
  referralSource?: string
}

interface Visitor {
  id: string
  clientId?: string
  ipAddress?: string
  isConverted: boolean
  convertedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  details?: VisitorDetails
}

export default function VisitorDetailPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"])
  const router = useRouter()
  const params = useParams()
  const visitorId = Array.isArray(params.visitorId) ? params.visitorId[0] : params.visitorId

  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 Debug - params:", params)
    console.log("🔍 Debug - visitorId:", visitorId)
    console.log("🔍 Debug - isAuthorized:", isAuthorized)
    
    if (isAuthorized && visitorId) {
      fetchVisitorDetails()
    }
  }, [isAuthorized, visitorId])

  const fetchVisitorDetails = async () => {
    if (!visitorId) {
      console.error("❌ No visitorId provided")
      toast.error("Invalid visitor ID")
      router.push('/dashboard/Administrator/visitors')
      return
    }

    setLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log("🔄 Fetching visitor details for ID:", visitorId)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/visitors/${visitorId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Visitor details:", data)
        setVisitor(data.data)
        toast.success("Visitor details loaded")
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to fetch visitor details:", errorData)
        toast.error("Failed to load visitor details")
        router.push('/dashboard/Administrator/visitors')
      }
    } catch (error) {
      console.error("Error fetching visitor details:", error)
      toast.error("Failed to load visitor details")
      router.push('/dashboard/Administrator/visitors')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
        <p className="ml-3 text-muted-foreground">Loading visitor details...</p>
      </div>
    )
  }

  if (!visitor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Visitor Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested visitor could not be found.</p>
        <Button onClick={() => router.push('/dashboard/Administrator/visitors')}>
          Back to Visitors
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/Administrator/visitors')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Visitors
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#003087]">
            {visitor.details?.fullName || "Visitor Details"}
          </h1>
          <p className="text-muted-foreground">Complete Visitor Information & Activity</p>
        </div>
        <div className="flex items-center gap-2">
          {visitor.isConverted ? (
            <Badge className="bg-green-500 text-white flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Converted Client
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Visitor
            </Badge>
          )}
        </div>
      </div>

      {/* Visitor Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Visitor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-[#003087] text-white text-2xl">
                {visitor.details?.fullName
                  ?.split(" ")
                  .map(word => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "VI"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{visitor.details?.fullName || "N/A"}</h3>
              <p className="text-muted-foreground text-lg">{visitor.details?.businessEmail || "N/A"}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">ID: {visitor.id}</span>
                </div>
                {visitor.ipAddress && (
                  <div className="flex items-center gap-1">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">IP: {visitor.ipAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact & Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Business Email</p>
                    <p className="font-medium">{visitor.details?.businessEmail || "N/A"}</p>
                  </div>
                </div>
                {visitor.details?.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{visitor.details.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {visitor.details?.businessAddress && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Business Address</p>
                      <p className="font-medium">{visitor.details.businessAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{visitor.details?.companyName || "N/A"}</p>
                  </div>
                </div>
                {visitor.details?.companyWebsite && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company Website</p>
                      <a 
                        href={visitor.details.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {visitor.details.companyWebsite}
                      </a>
                    </div>
                  </div>
                )}
                {visitor.details?.businessType && (
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Business Type</p>
                      <Badge variant="outline">{visitor.details.businessType}</Badge>
                    </div>
                  </div>
                )}
                {visitor.details?.referralSource && (
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">How They Found Us</p>
                      <Badge variant="secondary">{visitor.details.referralSource}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity & Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">First Visit</p>
                    <p className="font-medium">{new Date(visitor.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(visitor.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                {visitor.convertedAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Converted On</p>
                      <p className="font-medium text-green-600">{new Date(visitor.convertedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Status Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${visitor.isConverted ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Status</p>
                    <p className={`font-medium ${visitor.isConverted ? 'text-green-600' : 'text-gray-600'}`}>
                      {visitor.isConverted ? "Converted to Client" : "Still a Visitor"}
                    </p>
                  </div>
                </div>
                {visitor.clientId && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Client ID</p>
                      <p className="font-medium font-mono">{visitor.clientId}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Visitor ID</p>
                    <p className="font-medium font-mono text-[#003087]">{visitor.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg mb-2">Available Actions</h4>
              <p className="text-muted-foreground">Manage this visitor's information and status</p>
            </div>
            <div className="flex items-center gap-3">
              {visitor.isConverted && visitor.clientId && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/Administrator/client-profiles/${visitor.clientId}`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Client Profile
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/Administrator/visitors')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Visitors
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
