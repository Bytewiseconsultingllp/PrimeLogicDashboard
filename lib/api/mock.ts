import { getAuthToken } from "./storage"
import { USE_MOCK_API, mockGetCurrentUserDetails, mockUpdateUserProfile, mockChangePassword } from "@/lib/mock/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export interface UserDetailsResponse {
  data: {
    id: string
    email: string
    fullName: string
    role: string
    username: string
    address?: string
    phoneNumber?: string
  }
}

/**
 * Fetch current user details from the backend
 */
export async function getCurrentUserDetails(): Promise<UserDetailsResponse> {
  try {
    if (USE_MOCK_API) {
      const mockResponse = await mockGetCurrentUserDetails()
      return {
        data: mockResponse.data,
      }
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching user details:", error)
    throw error
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(profileData: {
  fullName?: string
  address?: string
  phoneNumber?: string
  username?: string
}): Promise<UserDetailsResponse> {
  try {
    if (USE_MOCK_API) {
      const mockResponse = await mockUpdateUserProfile(profileData)
      return {
        data: mockResponse.data,
      }
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    throw error
  }
}

/**
 * Change user password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    if (USE_MOCK_API) {
      const mockResponse = await mockChangePassword(currentPassword, newPassword)
      return {
        success: mockResponse.success,
        message: mockResponse.message || "Password changed successfully",
      }
    }

    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
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

    if (!response.ok) {
      throw new Error(`Failed to change password: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Error changing password:", error)
    throw error
  }
}
