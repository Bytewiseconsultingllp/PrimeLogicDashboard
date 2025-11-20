"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function FreelancerStripeSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountId = searchParams.get("accountId")

  useEffect(() => {
    // Optional toast so the user clearly sees success when arriving from Stripe
    toast.success("Stripe account connected successfully")
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg border border-[#003087]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#003087] to-[#FF6B35] text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Stripe Connected</CardTitle>
              <p className="text-xs text-blue-100">
                Your Stripe account is now linked for freelancer payouts.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            You can now receive payouts to your connected Stripe account. You&apos;ll see the updated
            connection status on your Payments page.
          </p>

          {accountId && (
            <div className="rounded-md border border-[#003087]/20 bg-[#003087]/5 p-3 text-xs">
              <p className="font-semibold text-[#003087]">Connected account ID</p>
              <p className="mt-1 font-mono break-all text-[#003087]">{accountId}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              className="bg-[#003087] text-white hover:bg-[#002060]"
              onClick={() => router.push("/dashboard/freelancer/payments")}
            >
              Go to Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
