"use client"

import toast from "react-hot-toast"
import { AlertCircle, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  action?: {
    label: string
    onClick: () => void
  }
}

// Enhanced toast styles
const toastStyles = {
  success: {
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "white",
    border: "1px solid #059669",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "420px",
  },
  error: {
    background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    color: "white",
    border: "1px solid #DC2626",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "420px",
  },
  warning: {
    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    color: "white",
    border: "1px solid #D97706",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(245, 158, 11, 0.3)",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "420px",
  },
  info: {
    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    color: "white",
    border: "1px solid #2563EB",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "420px",
  },
  validation: {
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "white",
    border: "1px solid #EA580C",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "420px",
  }
}

// Enhanced toast functions
export const enhancedToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(
      options?.title ? `${options.title}: ${message}` : message,
      {
        duration: options?.duration || 4000,
        style: toastStyles.success,
        icon: "✅",
        position: options?.position || "top-right",
      }
    )
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(
      options?.title ? `${options.title}: ${message}` : message,
      {
        duration: options?.duration || 6000,
        style: toastStyles.error,
        icon: "❌",
        position: options?.position || "top-right",
      }
    )
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast(
      options?.title ? `${options.title}: ${message}` : message,
      {
        duration: options?.duration || 5000,
        style: toastStyles.warning,
        icon: "⚠️",
        position: options?.position || "top-right",
      }
    )
  },

  info: (message: string, options?: ToastOptions) => {
    return toast(
      options?.title ? `${options.title}: ${message}` : message,
      {
        duration: options?.duration || 4000,
        style: toastStyles.info,
        icon: "ℹ️",
        position: options?.position || "top-right",
      }
    )
  },

  // Specific validation error toast
  validationError: (fieldName: string, message: string, options?: ToastOptions) => {
    return toast.error(
      `${fieldName}: ${message}`,
      {
        duration: options?.duration || 5000,
        style: toastStyles.validation,
        icon: "🚫",
        position: options?.position || "top-right",
      }
    )
  },

  // Network error toast
  networkError: (message?: string, options?: ToastOptions) => {
    return toast.error(
      message || "Network connection failed. Please check your internet connection and try again.",
      {
        duration: options?.duration || 7000,
        style: toastStyles.error,
        icon: "🌐",
        position: options?.position || "top-right",
      }
    )
  },

  // Server error toast
  serverError: (statusCode?: number, message?: string, options?: ToastOptions) => {
    const defaultMessage = statusCode 
      ? `Server Error (${statusCode}): ${message || 'Something went wrong on our end. Please try again later.'}`
      : message || 'Server error occurred. Please try again later.'
    
    return toast.error(defaultMessage, {
      duration: options?.duration || 6000,
      style: toastStyles.error,
      icon: "🔧",
      position: options?.position || "top-right",
    })
  },

  // Authentication error toast
  authError: (message?: string, options?: ToastOptions) => {
    return toast.error(
      message || "Authentication failed. Please check your credentials and try again.",
      {
        duration: options?.duration || 6000,
        style: toastStyles.error,
        icon: "🔐",
        position: options?.position || "top-right",
      }
    )
  },

  // Data validation error toast
  dataError: (field: string, issue: string, suggestion?: string, options?: ToastOptions) => {
    const message = suggestion 
      ? `${field}: ${issue}. ${suggestion}`
      : `${field}: ${issue}`
    
    return toast.error(message, {
      duration: options?.duration || 6000,
      style: toastStyles.validation,
      icon: "📝",
      position: options?.position || "top-right",
    })
  },

  // Loading toast
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      style: {
        background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
        color: "white",
        border: "1px solid #4B5563",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(107, 114, 128, 0.3)",
        padding: "16px 20px",
        fontSize: "14px",
        fontWeight: "500",
        maxWidth: "420px",
      },
      position: options?.position || "top-right",
    })
  },

  // Custom toast with full control
  custom: (message: string, type: 'success' | 'error' | 'warning' | 'info', options?: ToastOptions) => {
    const icons = {
      success: "✅",
      error: "❌", 
      warning: "⚠️",
      info: "ℹ️"
    }

    return toast(message, {
      duration: options?.duration || 4000,
      style: toastStyles[type],
      icon: icons[type],
      position: options?.position || "top-right",
    })
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss()
  },

  // Promise-based toast for async operations
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: toastStyles.info,
        position: options?.position || "top-right",
        success: {
          duration: options?.duration || 4000,
          style: toastStyles.success,
          icon: "✅",
        },
        error: {
          duration: options?.duration || 6000,
          style: toastStyles.error,
          icon: "❌",
        },
        loading: {
          style: {
            background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
            color: "white",
            border: "1px solid #4B5563",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(107, 114, 128, 0.3)",
            padding: "16px 20px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "420px",
          },
        },
      }
    )
  }
}

// Error handling utility functions
export const handleApiError = (error: any, context?: string) => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    enhancedToast.networkError()
    return
  }

  // HTTP errors
  if (error.response) {
    const { status, data } = error.response
    const message = data?.message || data?.error || 'An error occurred'
    
    switch (status) {
      case 400:
        enhancedToast.dataError('Invalid Request', message, 'Please check your input and try again.')
        break
      case 401:
        enhancedToast.authError('Authentication failed. Please log in again.')
        break
      case 403:
        enhancedToast.error('Access denied. You don\'t have permission to perform this action.')
        break
      case 404:
        enhancedToast.error('Resource not found. The requested item may have been deleted or moved.')
        break
      case 409:
        enhancedToast.warning('Conflict detected. ' + message)
        break
      case 422:
        enhancedToast.validationError('Validation Failed', message)
        break
      case 429:
        enhancedToast.warning('Too many requests. Please wait a moment and try again.')
        break
      case 500:
        enhancedToast.serverError(500, 'Internal server error. Our team has been notified.')
        break
      case 502:
        enhancedToast.serverError(502, 'Service temporarily unavailable. Please try again in a few minutes.')
        break
      case 503:
        enhancedToast.serverError(503, 'Service maintenance in progress. Please try again later.')
        break
      default:
        enhancedToast.serverError(status, message)
    }
  } else if (error.message) {
    // Generic errors with message
    enhancedToast.error(error.message)
  } else {
    // Unknown errors
    enhancedToast.error('An unexpected error occurred. Please try again.')
  }
}

// Validation error helper
export const handleValidationErrors = (errors: Record<string, string[]> | Record<string, string>) => {
  Object.entries(errors).forEach(([field, messages]) => {
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
    const message = Array.isArray(messages) ? messages[0] : messages
    enhancedToast.validationError(fieldName, message)
  })
}

export default enhancedToast
