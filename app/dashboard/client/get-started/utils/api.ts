// API utilities for the project draft flow
import axios, { AxiosRequestConfig } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  statusCode?: number
}

export interface ApiError extends Omit<ApiResponse, 'success'> {
  success: false
  error?: string
}

// Project Draft Types
export interface ProjectDraft {
  id: string
  clientId: string
  isFinalized: boolean
  projectId?: string
  details?: ProjectDraftDetails
  services?: ProjectDraftService[]
  industries?: ProjectDraftIndustry[]
  technologies?: ProjectDraftTechnology[]
  features?: ProjectDraftFeature[]
  discount?: ProjectDraftDiscount
  timeline?: ProjectDraftTimeline
  estimate?: ProjectDraftEstimate
  serviceAgreement?: ProjectDraftServiceAgreement
  createdAt: string
  updatedAt: string
}

export interface ProjectDraftDetails {
  fullName: string
  businessEmail: string
  phoneNumber?: string
  companyName: string
  companyWebsite?: string
  businessAddress?: string
  businessType: string
}

export interface ProjectDraftService {
  name: string
  childServices: string[]
}

export interface ProjectDraftIndustry {
  category: string
  subIndustries: string[]
}

export interface ProjectDraftTechnology {
  category: string
  technologies: string[]
}

export interface ProjectDraftFeature {
  category: string
  features: string[]
}

export interface ProjectDraftDiscount {
  type: 'STARTUP_FOUNDER' | 'VETERAN_OWNED_BUSINESS' | 'NONPROFIT_ORGANIZATION' | 'NOT_ELIGIBLE'
  percent: number
  notes?: string
}

export interface ProjectDraftTimeline {
  option: 'STANDARD' | 'FAST_TRACK' | 'CUSTOM'
  rushFeePercent: number
  estimatedDays: number
  description?: string
}

export interface ProjectDraftEstimate {
  basePrice: number
  discountAmount: number
  rushFeeAmount: number
  totalPrice: number
  currency: string
  validUntil: string
}

export interface ProjectDraftServiceAgreement {
  accepted: boolean
  acceptedAt?: string
  ipAddress?: string
}

// Generic API call function
async function apiCall<T = any>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      headers: {
        ...options.headers,
      },
    })

    return response.data
  } catch (error: any) {
    console.error(`API call failed: ${endpoint}`, error)
    throw new Error(error.response?.data?.message || error.message || 'API request failed')
  }
}

// Project Draft API

/**
 * Step 1: Create a new project draft with business details
 */
export async function createProjectDraft(details: {
  companyName: string
  companyWebsite?: string
  businessAddress?: string
  businessType: string
}): Promise<ApiResponse<{ id: string }>> {
  // Get user email from localStorage or any other auth context
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''
  
  return apiCall('/api/v1/projects/draft/create', {
    method: 'POST',
    data: {
      ...details,
      fullName: details.companyName, // Using company name as full name
      businessEmail: userEmail,
    },
  })
}

/**
 * Get all drafts for the authenticated client
 */
export async function getProjectDrafts(): Promise<ApiResponse<ProjectDraft[]>> {
  return apiCall('/api/v1/projects/draft/my-drafts')
}

/**
 * Get a single draft by ID
 */
export async function getProjectDraft(draftId: string): Promise<ApiResponse<ProjectDraft>> {
  return apiCall(`/api/v1/projects/draft/${draftId}`)
}

/**
 * Step 2: Add services to draft
 */
export async function addDraftServices(
  draftId: string,
  services: ProjectDraftService[]
): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/services`, {
    method: 'POST',
    data: services,
  })
}

/**
 * Step 3: Add industries to draft
 */
export async function addDraftIndustries(
  draftId: string,
  industries: ProjectDraftIndustry[]
): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/industries`, {
    method: 'POST',
    data: industries,
  })
}

/**
 * Step 4: Add technologies to draft
 */
export async function addDraftTechnologies(
  draftId: string,
  technologies: ProjectDraftTechnology[]
): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/technologies`, {
    method: 'POST',
    data: technologies,
  })
}

/**
 * Step 5: Add features to draft
 */
export async function addDraftFeatures(
  draftId: string,
  features: ProjectDraftFeature[]
): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/features`, {
    method: 'POST',
    data: features,
  })
}

/**
 * Step 6: Add discount to draft
 */
export async function addDraftDiscount(
  draftId: string,
  discount: ProjectDraftDiscount
): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/discount`, {
    method: 'POST',
    data: discount,
  })
}

/**
 * Step 7: Add timeline to draft (auto-calculates estimate)
 */
export async function addDraftTimeline(
  draftId: string,
  timeline: ProjectDraftTimeline
): Promise<ApiResponse<{ estimate: ProjectDraftEstimate }>> {
  return apiCall(`/api/v1/projects/draft/${draftId}/timeline`, {
    method: 'POST',
    data: timeline,
  })
}

/**
 * Get draft estimate
 */
export async function getDraftEstimate(draftId: string): Promise<ApiResponse<ProjectDraftEstimate>> {
  return apiCall(`/api/v1/projects/draft/${draftId}/estimate`)
}

/**
 * Accept draft estimate
 */
export async function acceptDraftEstimate(draftId: string): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/estimate/accept`, {
    method: 'POST',
  })
}

/**
 * Accept service agreement
 */
export async function acceptDraftServiceAgreement(
  draftId: string,
  accepted: boolean
): Promise<ApiResponse> {
  return apiCall(`/api/v1/projects/draft/${draftId}/service-agreement`, {
    method: 'POST',
    data: { accepted },
  })
}

/**
 * Finalize draft and create project
 */
export async function finalizeDraft(
  draftId: string,
  paymentMethod: 'STRIPE' | 'BANK_TRANSFER' | 'CRYPTO'
): Promise<ApiResponse<{ projectId: string; paymentUrl?: string }>> {
  return apiCall(`/api/v1/projects/draft/${draftId}/finalize`, {
    method: 'POST',
    data: { paymentMethod },
  })
}

// Auth API

export interface RegisterUserData {
  username: string
  fullName: string
  email: string
  password: string
}

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterUserData): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/register', {
    method: 'POST',
    data: userData,
  })
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(email: string, otp: string): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/verify-email', {
    method: 'POST',
    data: { email, otp },
  })
}

/**
 * Resend OTP
 */
export async function resendOTP(email: string): Promise<ApiResponse> {
  return apiCall('/api/v1/auth/resend-otp', {
    method: 'POST',
    data: { email },
  })
}

// Payment API

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  projectId: string,
  successUrl: string,
  cancelUrl: string
): Promise<ApiResponse<{ sessionId: string; url: string }>> {
  return apiCall('/api/v1/payments/checkout-session', {
    method: 'POST',
    data: {
      projectId,
      successUrl,
      cancelUrl,
    },
  })
}
// These functions are no longer needed as they've been replaced with the draft equivalents
// Keeping them for backward compatibility
export function getVisitorEstimate(visitorId: string) {
  return getDraftEstimate(visitorId)
}

export function acceptVisitorEstimate(visitorId: string) {
  return acceptDraftEstimate(visitorId)
}

