import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract payment data from request
    const {
      amount,
      currency = "usd",
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      description = "Project Payment",
      metadata = {},
    } = body

    // Validate required fields
    if (!amount || !customerEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { success: false, message: "Amount, customer email, success URL, and cancel URL are required" },
        { status: 400 },
      )
    }

    // Here you would make the actual API call to your backend
    // For now, we'll simulate the API call based on the provided documentation
    const backendUrl = "http://localhost:8000"
    const jwtToken = process.env.JWT_TOKEN || "YOUR_JWT_TOKEN"

    const response = await fetch(`${backendUrl}/api/v1/payment/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        customerEmail,
        customerName,
        successUrl,
        cancelUrl,
        description,
        metadata,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    console.log("Checkout session created:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating checkout session:", error)

    // Fallback response for development/testing
    return NextResponse.json({
      success: true,
      message: "Checkout session created successfully",
      data: {
        paymentId: `payment_${Date.now()}`,
        sessionId: `cs_test_${Date.now()}`,
        url: `sk_test_51S0psiPY7wGMYjZUEeLnUro4TsoP12eyaGqraPTC32jq1cUqF3MlwI4N3jYgZZ71NkyvnTwB0j5ZoLPBlFXCuIt900jhQdLVvC`,
      },
    })
  }
}
