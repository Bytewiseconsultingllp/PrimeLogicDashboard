"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function FreelancerStripeErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  useEffect(() => {
    // Optional toast so the user clearly sees there was an issue
    toast.error("Stripe connection was not completed")
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg border border-red-500/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-600 to-[#FF6B35] text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Stripe Connection Failed</CardTitle>
              <p className="text-xs text-red-100">
                We couldn&apos;t complete the connection to your Stripe account.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            This can happen if you closed the Stripe window, denied access, or there was a temporary
            issue. You can try connecting again from your Payments page.
          </p>

          {(error || errorDescription) && (
            <div className="rounded-md border border-red-500/30 bg-red-50 p-3 text-xs text-red-700">
              {error && (
                <p className="font-semibold">
                  Error code: <span className="font-mono">{error}</span>
                </p>
              )}
              {errorDescription && <p className="mt-1">{errorDescription}</p>}
            </div>
          )}

          <div className="flex justify-end pt-2 gap-2">
            <Button
              variant="outline"
              className="border-[#003087] text-[#003087] hover:bg-[#003087]/5"
              onClick={() => router.push("/dashboard/freelancer/payments")}
            >
              Back to Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
