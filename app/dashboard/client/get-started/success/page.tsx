"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, ArrowRight, Users, Loader2, Calendar, Clock, DollarSign, Mail, Building, Globe, Download, Star, Trophy, Rocket, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { enhancedToast, handleApiError } from "@/utils/enhanced-toast"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId")
  const projectIdParam = searchParams.get("projectId") || searchParams.get("project_id")

  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadingQuote, setIsDownloadingQuote] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const verifyOnce = async () => {
      if (!sessionId) {
        setError('No session ID found')
        setIsVerifying(false)
        return
      }

      try {
        console.log("Verifying payment for session:", sessionId)

        // Get auth token and project ID (prefer URL param, fallback to localStorage)
        const authToken = localStorage.getItem('authToken')
        const paymentSession = localStorage.getItem('paymentSession')
        
        if (!authToken) {
          enhancedToast.authError('Authentication required. Please login again.')
          throw new Error('Authentication required. Please login again.')
        }

        // Derive projectId
        let projectId: string | null = projectIdParam || null
        if (!projectId) {
          if (!paymentSession) {
            enhancedToast.error('Payment session not found. Please try again.')
            throw new Error('Payment session not found')
          }
          const parsed = JSON.parse(paymentSession)
          projectId = parsed?.projectId || null
        }
        
        if (!projectId) {
          enhancedToast.error('Project ID not found. Please contact support.')
          throw new Error('Project ID not found')
        }

        // 1) Prefer checking checkout session status (faster, avoids stale project state)
        try {
          const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/checkout-session/${sessionId}/status`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          })
          if (sessionRes.ok) {
            const sessionJson = await sessionRes.json()
            const s = String(sessionJson?.data?.status || '').toUpperCase()
            const ps = String(sessionJson?.data?.paymentStatus || '').toUpperCase()
            if ((s === 'COMPLETE' || s === 'COMPLETED') && (ps === 'PAID' || ps === 'SUCCEEDED' || ps === 'NO_PAYMENT_REQUIRED')) {
              setPaymentVerified(true)
              try { localStorage.setItem('paymentVerified', 'true') } catch {}
              setIsVerifying(false)
              return
            }
          }
        } catch (e) {
          // ignore and fallback to project fetch
        }

        console.log('Fetching project details for:', projectId)

        // 2) Fallback: Fetch project details and infer payment status
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to fetch project: ${response.status}`)
        }

        const result = await response.json()
        console.log('Project data received:', result)

        if (result.success && result.data) {
          setProjectData(result.data)
          
          // Verify payment status
          const status = String(result.data.paymentStatus || '').toUpperCase()
          if (status === 'SUCCEEDED' || status === 'PAID' || status === 'COMPLETED') {
            setPaymentVerified(true)
            try { localStorage.setItem('paymentVerified', 'true') } catch {}
          } else if (status && status !== 'FAILED' && status !== 'CANCELED' && status !== 'REFUNDED') {
            // Pending/processing states: keep polling, don't set a hard error yet
            setError(`Payment status: ${result.data.paymentStatus}`)
          } else {
            setError(`Payment status: ${result.data.paymentStatus || 'UNKNOWN'}`)
          }
        } else {
          throw new Error('Invalid response from server')
        }

        // 3) Second fallback: explicit project payment status endpoint (if available)
        try {
          const payStatusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/project/${projectId}/status`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          })
          if (payStatusRes.ok) {
            const payJson = await payStatusRes.json()
            const st = String(payJson?.data?.status || '').toUpperCase()
            if (st === 'SUCCEEDED' || st === 'PAID' || st === 'COMPLETED') {
              setPaymentVerified(true)
              try { localStorage.setItem('paymentVerified', 'true') } catch {}
              setIsVerifying(false)
              return
            } else if (st && st !== 'FAILED' && st !== 'CANCELED' && st !== 'REFUNDED') {
              setError(`Payment status: ${st}`)
            }
          }
        } catch (_) {
          // ignore if endpoint not available
        }

        setIsVerifying(false)
      } catch (error) {
        console.error('Payment verification error:', error)
        setError(error instanceof Error ? error.message : 'Failed to verify payment')
        setIsVerifying(false)
      }
    }

    // Polling logic to handle eventual consistency/webhook delays
    let attempts = 0
    const maxAttempts = 40 // ~80 seconds at 2s interval
    const intervalMs = 2000

    const poll = async () => {
      attempts += 1
      await verifyOnce()
      const verifiedFlag = typeof window !== 'undefined' ? localStorage.getItem('paymentVerified') === 'true' : false
      if (!verifiedFlag && !paymentVerified && attempts < maxAttempts) {
        // If still pending/processing, try again
        setIsVerifying(true)
        setTimeout(poll, intervalMs)
      } else {
        setIsVerifying(false)
        if (!paymentVerified && !verifiedFlag) {
          setTimedOut(true)
          if (error) {
            enhancedToast.warning(error, { title: 'Payment Verification' })
          }
        }
      }
    }

    poll()
  }, [sessionId])

  // Calculate deposit amount (25% of total)
  const getDepositAmount = () => {
    if (!projectData?.estimate) return 0
    const total = parseFloat(projectData.estimate.calculatedTotal || '0')
    return Math.round(total * 0.25)
  }

  // Handle quote download from backend API
  const handleDownloadQuote = async () => {
    const visitorId = localStorage.getItem('project_builder_visitor_id')
    
    if (!visitorId) {
      setError('Visitor ID not found. Please complete previous steps.')
      return
    }

    setIsDownloadingQuote(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/visitors/${visitorId}/quote`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Project_Quote_${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('Quote downloaded successfully from backend')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download quote'
      setError(errorMessage)
      console.error('Error downloading quote from backend:', error)
    } finally {
      setIsDownloadingQuote(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 to-orange-300 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#003087] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-[#003087] animate-spin" />
              </div>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (!paymentVerified && !isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-[#ff6b35] rounded-full"></div>
              </div>
              <CardTitle>Payment Verification Failed</CardTitle>
              <CardDescription>{error || "We couldn't verify your payment. Please contact support."}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => (window.location.href = "/get-started")}
                className="bg-[#003087] hover:bg-[#002060]"
              >
                Return to Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Success Header with Animation */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-[#003087] to-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <Check className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="h-4 w-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#003087] to-[#003087] bg-clip-text text-transparent mb-6">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-[#003087] max-w-3xl mx-auto mb-6">
            Welcome to the Prime Logic Solutions family, <span className="font-semibold text-[#003087]">{projectData?.details?.fullName || projectData?.client?.fullName}</span>! 
            Your project is now secured and we're excited to bring your vision to life.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge className="bg-[#003087] text-white px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Project Secured
            </Badge>
            <Badge className="bg-[#003087] text-white px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Premium Support
            </Badge>
            <Badge className="bg-[#003087] text-white px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Priority Queue
            </Badge>
          </div>
        </div>

        {/* Enhanced Payment & Client Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Details */}
          <Card className="border-[#003087] bg-gradient-to-br from-[#003087] from-5% to-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003087]">
                <DollarSign className="h-6 w-6 text-[#003087]" />
                Payment Confirmed
              </CardTitle>
              <CardDescription className="text-[#003087] opacity-80">
                Your deposit has been successfully processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-[#003087]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#003087] font-semibold">Deposit Paid (25%)</span>
                  <span className="text-2xl font-bold text-[#003087]">${getDepositAmount().toLocaleString()}</span>
                </div>
                <div className="text-xs text-[#003087]">Remaining: ${(parseFloat(projectData?.estimate?.calculatedTotal || '0') - getDepositAmount()).toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">Total Project Cost:</span>
                  <span className="font-semibold text-white">${projectData?.estimate?.calculatedTotal ? parseFloat(projectData.estimate.calculatedTotal).toLocaleString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Payment Method:</span>
                  <span className="flex items-center gap-1 text-white">
                    <Check className="h-4 w-4 text-white" />
                    Stripe
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Transaction ID:</span>
                  <span className="text-xs font-mono bg-white text-[#003087] px-2 py-1 rounded">{sessionId?.slice(-8) || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Status:</span>
                  <Badge className="bg-white text-[#003087]">
                    <Check className="w-3 h-3 mr-1" />
                    {projectData?.paymentStatus || "Completed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card className="border-[#003087] bg-gradient-to-br from-white to-gray-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003087]">
                <Users className="h-6 w-6 text-[#003087]" />
                Client Information
              </CardTitle>
              <CardDescription className="text-[#003087] opacity-80">
                Your account and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-[#003087]">
                <div className="w-10 h-10 bg-[#003087] bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#003087]" />
                </div>
                <div>
                  <div className="font-semibold text-[#003087]">{projectData?.details?.fullName || projectData?.client?.fullName}</div>
                  <div className="text-sm text-[#003087]">Primary Contact</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#003087]" />
                  <span className="text-sm text-[#003087]">{projectData?.details?.businessEmail || projectData?.client?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#003087]" />
                  <span className="text-sm text-[#003087]">{projectData?.details?.companyName || "Individual Client"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#003087]" />
                  <span className="text-sm text-[#003087]">{projectData?.details?.companyWebsite || "Not provided"}</span>
                </div>
                <div className="pt-2">
                  <Badge className="bg-[#003087] text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium Client
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Next Steps Timeline */}
        <Card className="mb-8 border-2 border-[#003087] bg-gradient-to-r from-white to-gray-50 shadow-lg">
          <CardHeader className="bg-[#003087] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-6 w-6" />
              Your Project Journey Starts Now!
            </CardTitle>
            <CardDescription className="text-white opacity-90">
              Here's your personalized roadmap to project success
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#003087]">
                <div className="w-12 h-12 bg-[#003087] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#003087]">Welcome Package</h4>
                    <Badge className="bg-[#003087] bg-opacity-20 text-[#003087] text-xs">Within 1 hour</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Comprehensive welcome email with project timeline, team introductions, and access credentials.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#003087]">
                    <Check className="h-3 w-3" />
                    <span>Project documentation • Team contacts • Timeline overview</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#003087]">
                <div className="w-12 h-12 bg-[#003087] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#003087]">Project Kickoff Call</h4>
                    <Badge className="bg-[#003087] bg-opacity-20 text-[#003087] text-xs">Within 24 hours</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Meet your dedicated project manager and development team to discuss requirements in detail.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#003087]">
                    <Calendar className="h-3 w-3" />
                    <span>Requirements review • Team introduction • Communication setup</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border-l-4 border-[#003087]">
                <div className="w-12 h-12 bg-[#003087] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#003087]">Development Kickoff</h4>
                    <Badge className="bg-[#003087] bg-opacity-20 text-[#003087] text-xs">Within 48 hours</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Your dedicated development team begins working on your project with priority status.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#003087]">
                    <Trophy className="h-3 w-3" />
                    <span>Priority queue • Daily updates • Milestone tracking</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-[#003087]">
                <div className="w-12 h-12 bg-[#003087] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#003087]">Premium Support Active</h4>
                    <Badge className="bg-[#003087] bg-opacity-20 text-[#003087] text-xs">24/7 Available</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Dedicated support channel, priority response, and direct access to your project team.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">Slack Channel</Badge>
                    <Badge variant="outline" className="text-xs">Weekly Reports</Badge>
                    <Badge variant="outline" className="text-xs">Live Updates</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-[#003087] bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-[#003087] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-[#003087]" />
              </div>
              <h3 className="font-bold text-[#003087] mb-2">Download Project Quote</h3>
              <p className="text-sm text-gray-600 mb-4">Get a detailed PDF quote for your records and stakeholders</p>
              <Button 
                onClick={handleDownloadQuote}
                disabled={isDownloadingQuote}
                className="bg-[#003087] hover:bg-blue-800 text-white w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isDownloadingQuote ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Quote
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#003087] bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-[#003087] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-[#003087]" />
              </div>
              <h3 className="font-bold text-[#003087] mb-2">Schedule Kickoff Call</h3>
              <p className="text-sm text-gray-600 mb-4">Book your project kickoff call with our team</p>
              <Button 
                onClick={() => window.location.href = '/consultation'}
                className="bg-[#003087] hover:bg-blue-800 text-white w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Project Summary */}
        <Card className="mb-8 border-2 border-[#003087] bg-gradient-to-br from-white to-gray-50 shadow-lg">
          <CardHeader className="bg-[#003087] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Complete Project Summary
            </CardTitle>
            <CardDescription className="text-white opacity-90">
              Your project details and specifications at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#003087] rounded-full"></div>
                    <span className="font-semibold text-gray-800">Project Identification</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project ID:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{projectData?.id?.slice(-12) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-[#003087] text-white">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#003087] rounded-full"></div>
                    <span className="font-semibold text-gray-800">Timeline & Delivery</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Duration:</span>
                      <span className="font-semibold">{projectData?.timeline?.estimatedDays || "TBD"} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority Level:</span>
                      <Badge className="bg-[#003087] text-white">High Priority</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Type:</span>
                      <span>{projectData?.timeline?.option?.replace(/_/g, ' ') || "Standard"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#003087] rounded-full"></div>
                    <span className="font-semibold text-gray-800">Project Scope</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Services Selected:</span>
                      <Badge variant="outline">{projectData?.services?.length || 0} items</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Technologies:</span>
                      <Badge variant="outline">{projectData?.technologies?.length || 0} items</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Features:</span>
                      <Badge variant="outline">{projectData?.features?.length || 0} items</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#003087] rounded-full"></div>
                    <span className="font-semibold text-gray-800">Investment Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Investment:</span>
                      <span className="font-bold text-lg">${projectData?.estimate?.calculatedTotal ? parseFloat(projectData.estimate.calculatedTotal).toLocaleString() : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Paid:</span>
                      <span className="text-[#003087] font-semibold">${getDepositAmount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold">${(parseFloat(projectData?.estimate?.calculatedTotal || '0') - getDepositAmount()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Support Information */}
        <Card className="bg-gradient-to-r from-white to-gray-50 border-2 border-[#003087] shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#003087] rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#003087] mb-4">We're Here to Help!</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our dedicated support team is available 24/7 to assist you throughout your project journey. 
              Don't hesitate to reach out with any questions or concerns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-[#003087]">
                <Mail className="h-5 w-5 text-[#003087]" />
                <a href="mailto:support@primelogicsolutions.com" className="text-[#003087] hover:text-[#ff6b35] font-semibold transition-colors">
                  support@primelogicsolutions.com
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-[#003087]">
                <Clock className="h-5 w-5 text-[#003087]" />
                <span className="text-[#003087] font-semibold">24/7 Support</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button className="bg-[#003087] hover:bg-blue-800 text-white">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button 
                onClick={() => window.open('https://cms.primelogicsol.com', '_blank')}
                className="bg-[#003087] hover:bg-blue-800 text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
