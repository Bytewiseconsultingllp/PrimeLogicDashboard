// import { type NextRequest, NextResponse } from "next/server"

// export async function GET(request: NextRequest) {
//   try {
//     const token = request.headers.get("authorization")?.split(" ")[1]
    
//     if (!token) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
//     }

//     // <CHANGE> Updated to call real backend API endpoint
//     const response = await fetch("http://localhost:8000/api/v1/projectBuilder", {
//       headers: { Authorization: `Bearer ${token}` },
//     })

//     if (!response.ok) {
//       throw new Error(`Backend returned ${response.status}`)
//     }

//     const data = await response.json()
//     return NextResponse.json({ success: true, data: data.data?.projectBuilders || [] })
//   } catch (error) {
//     console.error("[v0] Error fetching projects:", error)
//     return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { mockProjects, USE_MOCK_DATA } from "@/lib/mock-freelancer"

export async function GET(request: NextRequest) {
  try {
    if (USE_MOCK_DATA) {
      return NextResponse.json({
        success: true,
        data: mockProjects,
      })
    }

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch("http://localhost:8000/api/v1/projectBuilder", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data: data.data?.projectBuilders || [] })
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 })
  }
}
