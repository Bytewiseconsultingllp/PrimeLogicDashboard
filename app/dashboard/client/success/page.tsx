'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')

  useEffect(() => {
    // Show success toast when component mounts
    toast.success("Payment completed successfully!")
    
    // Clear the payment session from localStorage
    localStorage.removeItem("paymentSession")
    
    // Update the project status in localStorage if projectId is available
    if (projectId) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      const updatedProjects = projects.map((project: any) => 
        project.id === projectId 
          ? { 
              ...project, 
              paymentStatus: 'SUCCEEDED',
              paymentDetails: {
                ...project.paymentDetails,
                status: 'SUCCEEDED',
                paidAt: new Date().toISOString()
              }
            } 
          : project
      )
      localStorage.setItem('projects', JSON.stringify(updatedProjects))
    }
  }, [projectId])

  const handleBackToDashboard = () => {
    router.push('/dashboard/client')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your payment. Your transaction has been completed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              A receipt for your purchase has been sent to your email.
            </p>
            {projectId && (
              <p className="text-sm text-gray-600">
                Project ID: <span className="font-medium">{projectId}</span>
              </p>
            )}
          </div>
          <Button 
            onClick={handleBackToDashboard}
            className="w-full bg-[#003087] hover:bg-[#003087]/90 text-white"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
