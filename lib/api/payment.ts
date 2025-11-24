import { apiInstance } from "./axiosInstance"

export interface CreateCheckoutSessionParams {
  projectId: string
  amount: number
  description: string
  currency?: string
  successUrl?: string
  cancelUrl?: string
}

export interface CheckoutSessionResponse {
  id: string
  url: string
  amount: number
  currency: string
  status: string
  clientSecret?: string
}

export const createProjectCheckoutSession = async ({
  projectId,
  amount,
  description,
  currency = 'usd',
  successUrl = `${window.location.origin}/dashboard/client/projects/${projectId}?payment=success`,
  cancelUrl = `${window.location.origin}/dashboard/client/projects/${projectId}?payment=cancel`
}: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> => {
  const response = await apiInstance.post('/payment/project/create-checkout-session', {
    projectId,
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    description,
    successUrl,
    cancelUrl
  })
  
  return response.data.data
}

export const getProjectPaymentStatus = async (projectId: string) => {
  const response = await apiInstance.get(`/payment/project/${projectId}/status`)
  return response.data.data
}
