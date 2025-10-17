import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

// In-memory storage for demo (replace with database in production)
const clientsDatabase: Map<string, any> = new Map()
const paymentsDatabase: Map<string, any> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentSessionId, clientEmail, clientData } = body

    if (!clientEmail) {
      return NextResponse.json(
        {
          isPaymentComplete: false,
          isClientRegistered: false,
          paymentStatus: "INVALID_REQUEST",
          message: "Missing client email",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Verifying payment for email:", clientEmail)

    const existingClient = checkClientRegistration(clientEmail)
    if (existingClient) {
      console.log("[v0] Returning client found:", existingClient.id)
      return NextResponse.json({
        isPaymentComplete: true,
        isClientRegistered: true,
        paymentStatus: "COMPLETED",
        clientId: existingClient.id,
        message: "Welcome back! Your payment is verified.",
      })
    }

    let paymentVerified = false

    if (paymentSessionId) {
      paymentVerified = await verifyPaymentWithStripe(paymentSessionId)
    }

    if (!paymentVerified && clientEmail) {
      paymentVerified = await verifyPaymentByEmail(clientEmail)
    }

    if (!paymentVerified) {
      return NextResponse.json({
        isPaymentComplete: false,
        isClientRegistered: false,
        paymentStatus: "PAYMENT_FAILED",
        message: "No completed payment found for this email. Please complete the payment process.",
      })
    }

    const clientId = await registerClient(clientEmail, clientData, paymentSessionId)

    if (paymentSessionId) {
      paymentsDatabase.set(paymentSessionId, {
        clientId,
        clientEmail,
        paymentStatus: "COMPLETED",
        verifiedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      isPaymentComplete: true,
      isClientRegistered: true,
      paymentStatus: "COMPLETED",
      clientId,
      message: "Payment verified and client registered successfully",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        isPaymentComplete: false,
        isClientRegistered: false,
        paymentStatus: "ERROR",
        message: "An error occurred while verifying payment",
      },
      { status: 500 },
    )
  }
}

async function verifyPaymentWithStripe(sessionId: string): Promise<boolean> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log("[v0] Stripe session retrieved:", { sessionId, paymentStatus: session.payment_status })
    return session.payment_status === "paid"
  } catch (error) {
    console.error("[v0] Stripe session verification error:", error)
    return paymentsDatabase.has(sessionId)
  }
}

async function verifyPaymentByEmail(email: string): Promise<boolean> {
  try {
    console.log("[v0] Checking Stripe payment history for email:", email)

    // Search for customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      console.log("[v0] No Stripe customer found for email:", email)
      return false
    }

    const customerId = customers.data[0].id
    console.log("[v0] Found Stripe customer:", customerId)

    // Get payment intents for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 10,
    })

    // Check if any payment intent succeeded
    const hasSuccessfulPayment = paymentIntents.data.some((intent) => intent.status === "succeeded")

    if (hasSuccessfulPayment) {
      console.log("[v0] Found successful payment for customer:", customerId)
      return true
    }

    // Also check for successful charges
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 10,
    })

    const hasSuccessfulCharge = charges.data.some((charge) => charge.paid === true)

    if (hasSuccessfulCharge) {
      console.log(" Found successful charge for customer:", customerId)
      return true
    }

    console.log("No successful payments found for customer:", customerId)
    return false
  } catch (error) {
    console.error("Error checking Stripe payment history:", error)
    return false
  }
}

function checkClientRegistration(email: string): any {
  for (const [, client] of clientsDatabase) {
    if (client.email === email) {
      return client
    }
  }
  return null
}

async function registerClient(email: string, clientData: any, paymentSessionId?: string): Promise<string> {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const newClient = {
    id: clientId,
    email,
    fullName: clientData?.fullName || "Client",
    phone: clientData?.phone || "",
    company: clientData?.company || "",
    paymentSessionId: paymentSessionId || "",
    registeredAt: new Date().toISOString(),
    status: "ACTIVE",
    ...clientData,
  }

  clientsDatabase.set(clientId, newClient)
  console.log("[v0] Client registered:", { clientId, email })

  return clientId
}

export function getClientById(clientId: string): any {
  return clientsDatabase.get(clientId)
}

export function getAllClients(): any[] {
  return Array.from(clientsDatabase.values())
}
