// Mock API layer - can be toggled on/off for development
// This file provides mock implementations of all API endpoints

import { MOCK_USER, MOCK_PAYMENT_HISTORY, MOCK_PROJECTS } from "./data"

// Toggle this flag to switch between mock and real API
export const USE_MOCK_API = true

// Simulate network delay for more realistic behavior
const MOCK_DELAY = 500 // milliseconds

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface MockApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Mock implementation of getCurrentUserDetails
 */
export async function mockGetCurrentUserDetails(): Promise<MockApiResponse<typeof MOCK_USER>> {
  await delay(MOCK_DELAY)
  return {
    success: true,
    data: MOCK_USER,
    message: "User details fetched successfully",
  }
}

/**
 * Mock implementation of payment history fetch
 */
export async function mockGetPaymentHistory(): Promise<MockApiResponse<{ payments: typeof MOCK_PAYMENT_HISTORY }>> {
  await delay(MOCK_DELAY)
  return {
    success: true,
    data: {
      payments: MOCK_PAYMENT_HISTORY,
    },
    message: "Payment history fetched successfully",
  }
}

/**
 * Mock implementation of projects list fetch
 */
export async function mockGetProjects(limit: number = 10): Promise<MockApiResponse<{ projectBuilders: typeof MOCK_PROJECTS }>> {
  await delay(MOCK_DELAY)
  return {
    success: true,
    data: {
      projectBuilders: MOCK_PROJECTS.slice(0, limit),
    },
    message: "Projects fetched successfully",
  }
}

/**
 * Mock implementation of single project fetch
 */
export async function mockGetProjectById(projectId: string): Promise<MockApiResponse<(typeof MOCK_PROJECTS)[0]>> {
  await delay(MOCK_DELAY)
  const project = MOCK_PROJECTS.find((p) => p.id === projectId)

  if (!project) {
    throw new Error("Project not found")
  }

  return {
    success: true,
    data: project,
    message: "Project details fetched successfully",
  }
}

/**
 * Mock implementation of update user profile
 */
export async function mockUpdateUserProfile(profileData: Partial<typeof MOCK_USER>): Promise<MockApiResponse<typeof MOCK_USER>> {
  await delay(MOCK_DELAY)
  const updatedUser = { ...MOCK_USER, ...profileData }
  return {
    success: true,
    data: updatedUser,
    message: "Profile updated successfully",
  }
}

/**
 * Mock implementation of change password
 */
export async function mockChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<MockApiResponse<{ message: string }>> {
  await delay(MOCK_DELAY)

  // Mock validation
  if (currentPassword !== "password123") {
    throw new Error("Current password is incorrect")
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters")
  }

  return {
    success: true,
    data: { message: "Password changed successfully" },
    message: "Password changed successfully",
  }
}

/**
 * Mock implementation of contact form submission
 */
export async function mockSubmitContactForm(formData: {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}): Promise<MockApiResponse<{ message: string }>> {
  await delay(MOCK_DELAY)

  // Mock validation
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
    throw new Error("All fields are required")
  }

  console.log("[v0] Mock contact form submission:", formData)

  return {
    success: true,
    data: { message: "Message sent successfully" },
    message: "Your message has been sent successfully",
  }
}
