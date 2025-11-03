import { getAuthToken } from "@/lib/api/storage"
import { USE_MOCK_API, mockChangePassword } from "@/lib/mock/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return Response.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (USE_MOCK_API) {
      const mockResponse = await mockChangePassword(currentPassword, newPassword)
      return Response.json(mockResponse)
    }

    const token = getAuthToken()
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Error changing password:", error)
    return Response.json({ error: "Failed to change password" }, { status: 500 })
  }
}
