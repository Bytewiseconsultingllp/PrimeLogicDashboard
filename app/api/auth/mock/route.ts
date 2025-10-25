import { type NextRequest, NextResponse } from "next/server"
import { mockFreelancerUser, USE_MOCK_DATA } from "@/lib/api/mock-freelancer"

export async function GET(request: NextRequest) {
  try {
    if (USE_MOCK_DATA) {
      return NextResponse.json({
        success: true,
        data: mockFreelancerUser,
      })
    }

    // TODO: Replace with actual backend API call
    // const token = request.headers.get("authorization")?.split(" ")[1]
    // const response = await fetch("http://localhost:8000/api/v1/freelancer/profile", {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // const data = await response.json()
    // return NextResponse.json({ success: true, data })

    return NextResponse.json({ success: false, error: "API not configured" }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch user details" }, { status: 500 })
  }
}
