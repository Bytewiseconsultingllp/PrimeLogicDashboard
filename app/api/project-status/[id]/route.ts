// import { type NextRequest, NextResponse } from "next/server"

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.headers.get("authorization")?.split(" ")[1]

//     if (!token) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
//     }

//     const response = await fetch(`http://localhost:8000/api/v1/projectBuilder/${params.id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })

//     if (!response.ok) {
//       if (response.status === 404) {
//         return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
//       }
//       throw new Error(`Backend returned ${response.status}`)
//     }

//     const data = await response.json()
//     return NextResponse.json({ success: true, data: data.data })
//   } catch (error) {
//     console.error("[v0] Error fetching project status:", error)
//     return NextResponse.json({ success: false, error: "Failed to fetch project status" }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const token = request.headers.get("authorization")?.split(" ")[1]

//     if (!token) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await request.json()

//     const response = await fetch(`http://localhost:8000/api/v1/projectBuilder/${params.id}`, {
//       method: "PUT",
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
//     return NextResponse.json({ success: true, message: "Milestone updated successfully", data: data.data })
//   } catch (error) {
//     console.error("[v0] Error updating project status:", error)
//     return NextResponse.json({ success: false, error: "Failed to update project status" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { mockProjectStatus, USE_MOCK_DATA } from "@/lib/mock-freelancer"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (USE_MOCK_DATA) {
      const project = mockProjectStatus.find((p) => p.id === params.id)
      if (!project) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: project })
    }

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`http://localhost:8000/api/v1/projectBuilder/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data: data.data })
  } catch (error) {
    console.error("[v0] Error fetching project status:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch project status" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (USE_MOCK_DATA) {
      // Mock update - just return success
      return NextResponse.json({ success: true, message: "Milestone updated successfully" })
    }

    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`http://localhost:8000/api/v1/projectBuilder/${params.id}`, {
      method: "PUT",
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
    return NextResponse.json({ success: true, message: "Milestone updated successfully", data: data.data })
  } catch (error) {
    console.error("[v0] Error updating project status:", error)
    return NextResponse.json({ success: false, error: "Failed to update project status" }, { status: 500 })
  }
}
