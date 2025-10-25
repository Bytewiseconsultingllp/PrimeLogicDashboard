// import { type NextRequest, NextResponse } from "next/server"

// export async function GET(request: NextRequest) {
//   try {
//     const token = request.headers.get("authorization")?.split(" ")[1]

//     if (!token) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
//     }

//     const response = await fetch("http://localhost:8000/api/v1/freelancer/bids", {
//       headers: { Authorization: `Bearer ${token}` },
//     })

//     if (!response.ok) {
//       throw new Error(`Backend returned ${response.status}`)
//     }

//     const data = await response.json()
//     return NextResponse.json({ success: true, data: data.data || [] })
//   } catch (error) {
//     console.error("[v0] Error fetching bids:", error)
//     return NextResponse.json({ success: false, error: "Failed to fetch bids" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const token = request.headers.get("authorization")?.split(" ")[1]

//     if (!token) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await request.json()

//     const response = await fetch("http://localhost:8000/api/v1/bids", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(body),
//     })

//     if (!response.ok) {
//       throw new Error(`Backend returned ${response.status}`)
//     }

//     const data = await response.json()
//     return NextResponse.json({ success: true, message: "Bid placed successfully", data: data.data })
//   } catch (error) {
//     console.error("[v0] Error placing bid:", error)
//     return NextResponse.json({ success: false, error: "Failed to place bid" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { mockBids, USE_MOCK_DATA } from "@/lib/mock-freelancer"

export async function GET(request: NextRequest) {
  try {
    if (USE_MOCK_DATA) {
      return NextResponse.json({
        success: true,
        data: mockBids,
      })
    }

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch("http://localhost:8000/api/v1/freelancer/bids", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data: data.data || [] })
  } catch (error) {
    console.error("[v0] Error fetching bids:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bids" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (USE_MOCK_DATA) {
      // Mock bid placement - just return success
      const body = await request.json()
      return NextResponse.json({ success: true, message: "Bid placed successfully", data: body })
    }

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch("http://localhost:8000/api/v1/bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, message: "Bid placed successfully", data: data.data })
  } catch (error) {
    console.error("[v0] Error placing bid:", error)
    return NextResponse.json({ success: false, error: "Failed to place bid" }, { status: 500 })
  }
}
