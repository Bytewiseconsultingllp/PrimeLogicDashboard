import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          status: 401,
          message: "Unauthorized - No token provided",
          data: null,
          requestInfo: {
            ip,
            url: request.url,
            method: request.method,
          },
        },
        { status: 401 },
      )
    }

    const response = await fetch("https://api.primelogicsol.com/api/v1/freelancer/registrations?isAccepted=true", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          message: data.message || "Failed to fetch accepted freelancers",
          data: null,
          requestInfo: {
            ip,
            url: request.url,
            method: request.method,
          },
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Accepted freelancers fetched successfully",
      data: data.data || [],
      requestInfo: {
        ip,
        url: request.url,
        method: request.method,
      },
    })
  } catch (error) {
    console.error("Error fetching accepted freelancers:", error)
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: "Internal server error",
        data: null,
        requestInfo: {
          ip,
          url: request.url,
          method: request.method,
        },
      },
      { status: 500 },
    )
  }
}
