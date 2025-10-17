import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle Stripe webhook events
    const { type, data } = body

    console.log("Webhook received:", { type, data })

    switch (type) {
      case "checkout.session.completed":
        // Handle successful payment
        const session = data.object
        console.log("[v0] Payment successful:", session)

        // Here you would update your database with payment success
        // and trigger any post-payment actions

        break

      case "payment_intent.payment_failed":
        // Handle failed payment
        console.log("Payment failed:", data.object)
        break

      default:
        console.log("Unhandled webhook type:", type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
