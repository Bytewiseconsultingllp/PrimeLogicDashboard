"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { USE_MOCK_API, mockGetPaymentHistory, mockGetProjects } from "@/lib/mock/api"

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
  clientName: string
  clientEmail: string
  createdAt: string
  paidAt?: string
}

interface Project {
  id: string
  projectName: string
  status: string
}

export default function DashboardHome() {
  const [clientName, setClientName] = useState("John Doe")
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasUnpaidPayments = payments.some((p) => p.status === "PENDING")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        if (USE_MOCK_API) {
          const paymentResponse = await mockGetPaymentHistory()
          setPayments(paymentResponse.data.payments)

          const projectResponse = await mockGetProjects(10)
          setProjects(projectResponse.data.projectBuilders)
          return
        }

        const token = localStorage.getItem("authToken") || "YOUR_JWT_TOKEN"

        const paymentRes = await fetch("http://localhost:8000/api/v1/payment/history", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (paymentRes.ok) {
          const data = await paymentRes.json()
          setPayments(data.data?.payments || [])
        }

        const projectRes = await fetch("http://localhost:8000/api/v1/projectBuilder?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (projectRes.ok) {
          const data = await projectRes.json()
          setProjects(data.data?.projectBuilders || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("[v0] Data fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "FAILED":
      case "CANCELED":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#003087] text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold">Prime Logic Solutions</h2>
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold text-foreground">{clientName}</p>
        <p className="text-base text-muted-foreground">
          Thank you for choosing Primelogic Solutions. We're excited to work with you!
        </p>
      </div>

      {payments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Payment Status</p>
              <p className="text-foreground font-semibold">
                {payments[0].status === "SUCCEEDED" ? "✓ Paid" : "⏳ Pending"}
              </p>
            </div>
            {projects.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-600">Current Project</p>
                <p className="text-foreground font-semibold">{projects[0].projectName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Access Denied Card - Show if unpaid */}
      {hasUnpaidPayments && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              To access all features and continue with your projects, please complete the payment. Your account is
              currently restricted until payment is processed.
            </p>
            <Link href="/payment">
              <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Complete Payment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent transactions and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payment history...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payment records found</div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium text-foreground">${payment.amount / 100}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.status === "SUCCEEDED"
                        ? "default"
                        : payment.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
