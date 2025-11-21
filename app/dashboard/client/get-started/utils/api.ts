// API utilities for the get-started flow

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  statusCode?: number
}

export interface ApiError {
  success: false
  message: string
  error?: string
}

// Generic API call function
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(errorMessage)
  }
}

// Check if visitor exists by email
export async function checkVisitorByEmail(email: string): Promise<ApiResponse> {
  return apiCall('/api/v1/visitors/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

// Step 1: Create visitor
export async function createVisitor(visitorData: {
  fullName: string
  businessEmail: string
  phoneNumber?: string
  companyName: string
  companyWebsite?: string
  businessAddress?: string
  businessType: string
  referralSource: string
}): Promise<ApiResponse> {
  return apiCall('/api/v1/visitors/create', {
    method: 'POST',
    body: JSON.stringify(visitorData),
  })
}

// Step 2: Add services
export async function addVisitorServices(
  visitorId: string,
  services: Array<{
    name: string
    childServices: string[]
  }>
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/services`, {
    method: 'POST',
    body: JSON.stringify(services),
  })
}

// Step 3: Add industries
export async function addVisitorIndustries(
  visitorId: string,
  industries: Array<{
    category: string
    subIndustries: string[]
  }>
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/industries`, {
    method: 'POST',
    body: JSON.stringify(industries),
  })
}

// Step 4: Add technologies
export async function addVisitorTechnologies(
  visitorId: string,
  technologies: Array<{
    category: string
    technologies: string[]
  }>
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/technologies`, {
    method: 'POST',
    body: JSON.stringify(technologies),
  })
}

// Step 5: Add features
export async function addVisitorFeatures(
  visitorId: string,
  features: Array<{
    category: string
    features: string[]
  }>
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/features`, {
    method: 'POST',
    body: JSON.stringify(features),
  })
}

// Step 6: Add discount
export async function addVisitorDiscount(
  visitorId: string,
  discount: {
    type: string
    percent: number
    notes?: string
  }
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/discount`, {
    method: 'POST',
    body: JSON.stringify(discount),
  })
}

// Step 7: Add timeline
export async function addVisitorTimeline(
  visitorId: string,
  timeline: {
    option: string
    rushFeePercent: number
    estimatedDays: number
    description?: string
  }
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/timeline`, {
    method: 'POST',
    body: JSON.stringify(timeline),
  })
}

// Step 8: Get estimate (auto-calculated after timeline)
export async function getVisitorEstimate(visitorId: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/estimate`, {
    method: 'GET',
  })
}

// Step 8: Accept estimate
export async function acceptVisitorEstimate(visitorId: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/estimate/accept`, {
    method: 'POST',
  })
}

// Step 9: Accept service agreement
export async function acceptServiceAgreement(
  visitorId: string,
  accepted: boolean
): Promise<ApiResponse> {
  return apiCall(`/api/v1/visitors/${visitorId}/service-agreement`, {
    method: 'POST',
    body: JSON.stringify({ accepted }),
  })
}

// Auth: Register user
export async function registerUser(userData: {
  username: string
  fullName: string
  email: string
  password: string
}): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

// Auth: Verify email with OTP
export async function verifyEmail(email: string, OTP: string): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/verifyEmail', {
    method: 'POST',
    body: JSON.stringify({ email, OTP }),
  })
}

// Auth: Resend OTP
export async function resendOTP(email: string): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/sendOTP', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

// Payment: Create checkout session
export async function createCheckoutSession(
  projectId: string,
  successUrl: string,
  cancelUrl: string,
  accessToken: string
): Promise<ApiResponse> {
  return apiCall('/api/v1/payment/project/create-checkout-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      projectId,
      successUrl,
      cancelUrl,
    }),
  })
}
