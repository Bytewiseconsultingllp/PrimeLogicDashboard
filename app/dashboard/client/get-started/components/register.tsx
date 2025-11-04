"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface RegisterYourselfProps {
  formData?: any
  onUpdate?: (data: any) => void
  onRegistrationSuccess?: (userData: any) => void
  onShowLoginModal?: () => void
}

interface RegistrationResponse {
  success: boolean
  message: string
  user?: any
}

export default function RegisterYourself({
  formData = {},
  onUpdate,
  onRegistrationSuccess,
  onShowLoginModal,
}: RegisterYourselfProps) {
  const [localFormData, setLocalFormData] = useState({
    fullName: "",
    businessEmail: "",
    phoneNumber: "",
    companyName: "",
    companyWebsite: "",
    businessAddress: "",
    businessType: "",
    referralSource: "",
    ...formData,
  })

  const [registerClicked, setRegisterClicked] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [validationStatus, setValidationStatus] = useState<{ [key: string]: "valid" | "invalid" | "untouched" }>({
    businessEmail: "untouched",
    phoneNumber: "untouched",
  })

  // Visitor API endpoint
  const VISITOR_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/visitor/create`

  // Form validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!localFormData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!localFormData.businessEmail.trim()) {
      errors.businessEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localFormData.businessEmail)) {
      errors.businessEmail = "Please enter a valid email address"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9]{10,15}$/
    return phoneRegex.test(phone.replace(/\D/g, ""))
  }

  // Generate a simple client ID for tracking
  const generateClientId = () => {
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 15)
    return `client_${timestamp}_${randomString}`
  }

  const handleRegisterClick = async () => {
    // Check if already registered (prevent double submission)
    if (registerClicked) {
      toast("You have already registered successfully!", {
        duration: 4000,
        style: {
          background: "#6B7280",
          color: "white",
          fontWeight: "bold",
        },
        iconTheme: {
          primary: "white",
          secondary: "#6B7280",
        },
      })
      return
    }

    // Validate form before proceeding
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setIsRegistering(true)
    setValidationErrors({})

    try {
      // Prepare the data to send
      const registrationData = {
        fullName: localFormData.fullName.trim(),
        businessEmail: localFormData.businessEmail.trim(),
        phoneNumber: localFormData.phoneNumber.trim(),
        companyName: localFormData.companyName.trim(),
        companyWebsite: localFormData.companyWebsite.trim(),
        businessAddress: localFormData.businessAddress.trim(),
        businessType: localFormData.businessType,
        referralSource: localFormData.referralSource,
        timestamp: new Date().toISOString(),
        clientId: generateClientId(),
      }

      console.log("Sending registration data:", registrationData)

      // Send registration data to visitor API
      const response = await fetch(VISITOR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      // Handle different response types
      let result: RegistrationResponse
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json()
      } else {
        const text = await response.text()
        result = {
          success: response.ok,
          message: text || "Registration completed successfully!",
        }
      }

      if (response.ok && result.success !== false) {
        // Success case
        setRegisterClicked(true)

        // Show success toast with custom styling
        toast.success(result.message || "🎉 Registration successful! Welcome aboard!", {
          duration: 4000,
          style: {
            background: "#10B981",
            color: "white",
            fontWeight: "bold",
          },
          iconTheme: {
            primary: "white",
            secondary: "#10B981",
          },
        })

        // Call success callback if provided
        if (onRegistrationSuccess) {
          onRegistrationSuccess({
            ...registrationData,
            registrationId: result.user?.id || Date.now().toString(),
            registeredAt: new Date().toISOString(),
          })
        }

        console.log("Registration successful!")

        // Optional: Show additional success message after a delay
        setTimeout(() => {
          toast.success("Check your email for next steps!", {
            duration: 3000,
            style: {
              background: "#3B82F6",
              color: "white",
            },
          })
        }, 1000)
      } else {
        // Handle different HTTP error codes
        let errorMessage = "Registration failed. Please try again."

        switch (response.status) {
          case 400:
            errorMessage = result.message || "Invalid data provided. Please check your information."
            break
          case 409:
            errorMessage = result.message || "This email is already registered."
            // Show specific toast for existing email
            toast.error("📧 " + errorMessage, {
              duration: 5000,
              style: {
                background: "#F59E0B",
                color: "white",
              },
            })
            return
          case 422:
            errorMessage = result.message || "Please check your information and try again."
            break
          case 500:
            errorMessage = "Server error. Please try again later."
            break
          case 503:
            errorMessage = "Service temporarily unavailable. Please try again later."
            break
          default:
            errorMessage = result.message || `Error ${response.status}: Registration failed.`
        }

        toast.error(errorMessage, {
          duration: 4000,
          style: {
            background: "#EF4444",
            color: "white",
          },
        })
      }
    } catch (error) {
      console.error("Registration error:", error)

      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("🌐 Network error. Please check your connection and try again.", {
          duration: 5000,
          style: {
            background: "#EF4444",
            color: "white",
          },
        })
      } else if (error instanceof SyntaxError) {
        toast.error("Server response error. Please try again later.", {
          duration: 4000,
          style: {
            background: "#EF4444",
            color: "white",
          },
        })
      } else {
        toast.error("❌ Registration failed. Please try again.", {
          duration: 4000,
          style: {
            background: "#EF4444",
            color: "white",
          },
        })
      }
    } finally {
      setIsRegistering(false)
    }
  }

  // Function to reset registration state (for re-registration)
  const handleReRegister = () => {
    setRegisterClicked(false)
    toast("You can now register again", {
      duration: 3000,
      style: {
        background: "#6B7280",
        color: "white",
      },
    })
  }

  // Add useEffect to ensure parent component gets updated
  useEffect(() => {
    if (onUpdate) {
      console.log("Updating parent with register data:", localFormData)
      onUpdate(localFormData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFormData])

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Special validation for company website - prevent numbers
    if (name === "companyWebsite") {
      // Remove any numbers from the input
      const filteredValue = value.replace(/[0-9]/g, '')
      
      // Update local form data with filtered value
      setLocalFormData((prev: any) => ({
        ...prev,
        [name]: filteredValue
      }))

      // Update parent component with filtered value
      if (onUpdate) {
        onUpdate({
          ...localFormData,
          [name]: filteredValue
        })
      }
      return
    }
    
    // Update local form data
    setLocalFormData((prev: any) => ({
      ...prev,
      [name]: value
    }))

    // Real-time validation for specific fields
    if (name === "businessEmail") {
      if (value.trim() === "") {
        setValidationStatus((prev) => ({ ...prev, businessEmail: "untouched" }))
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          businessEmail: validateEmail(value) ? "valid" : "invalid",
        }))
      }
    }

    if (name === "phoneNumber") {
      if (value.trim() === "") {
        setValidationStatus((prev) => ({ ...prev, phoneNumber: "untouched" }))
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          phoneNumber: validatePhoneNumber(value) ? "valid" : "invalid",
        }))
      }
    }

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Update parent component
    if (onUpdate) {
      onUpdate({
        ...localFormData,
        [name]: value
      })
    }
  }

  // Business type options
  const businessTypes = ["Startup", "SME", "Nonprofit", "Enterprise", "Government", "Freelancer", "Other"]

  // Referral sources
  const referralSources = ["Google", "Social Media", "Referral", "Email", "Advertisement", "Conference/Event", "Other"]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-left">Let's Start Shaping Your Idea</h1>
          <p className="text-left text-gray-600">Tell us where you are, and we'll take you further.</p>
        </div>
        <button
          onClick={onShowLoginModal}
          className="px-6 py-2 bg-[#003087] text-white rounded-md hover:bg-[#002060] transition-colors font-medium whitespace-nowrap ml-4"
        >
          Already a user?
        </button>
      </div>

      {/* Show success banner if registered */}
      {registerClicked && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">✅ Registration Complete!</p>
              <p className="text-green-600 text-sm">Thank you for registering! We'll be in touch soon.</p>
            </div>
            <button onClick={handleReRegister} className="text-green-700 hover:text-green-800 text-sm underline">
              Register Again?
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-[#003087] text-white flex items-center justify-center mr-2 text-sm">
            1
          </div>
          <h3 className="text-xl font-bold">Who Are You?</h3>
        </div>
        <p className="text-gray-600 text-sm ml-8 mb-6">
          Help us understand who you are, what you do, and what you might need.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={localFormData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] ${
                  validationErrors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                required
                disabled={registerClicked}
              />
              {validationErrors.fullName && <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                Company or Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={localFormData.companyName}
                onChange={handleInputChange}
                placeholder="Your company or brand"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
                disabled={registerClicked}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Email */}
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={localFormData.businessEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationStatus.businessEmail === "valid"
                    ? "border-green-500 focus:ring-green-500"
                    : validationStatus.businessEmail === "invalid"
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#003087]"
                }`}
                required
                disabled={registerClicked}
              />
              {validationErrors.businessEmail && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.businessEmail}</p>
              )}
              {validationStatus.businessEmail === "valid" && (
                <p className="text-green-500 text-xs mt-1">✓ Valid email address</p>
              )}
              {validationStatus.businessEmail === "invalid" && (
                <p className="text-red-500 text-xs mt-1">✗ Please enter a valid email address</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Don't worry — no spam, ever.</p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={localFormData.phoneNumber}
                onChange={handleInputChange}
                placeholder="For WhatsApp or calls"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationStatus.phoneNumber === "valid"
                    ? "border-green-500 focus:ring-green-500"
                    : validationStatus.phoneNumber === "invalid"
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#003087]"
                }`}
                disabled={registerClicked}
              />
              {validationStatus.phoneNumber === "valid" && (
                <p className="text-green-500 text-xs mt-1">✓ Valid phone number</p>
              )}
              {validationStatus.phoneNumber === "invalid" && (
                <p className="text-red-500 text-xs mt-1">✗ Please enter a valid phone number (10-15 digits)</p>
              )}
            </div>
          </div>

          {/* Company Website */}
          <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium mb-1">
              Company Website <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="companyWebsite"
              name="companyWebsite"
              value={localFormData.companyWebsite}
              onChange={handleInputChange}
              placeholder="https://yourcompany.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
              disabled={registerClicked}
            />
            <p className="text-xs text-gray-500 mt-1">Numbers are not allowed in website URL</p>
          </div>

          {/* Business Address */}
          <div>
            <label htmlFor="businessAddress" className="block text-sm font-medium mb-1">
              Business Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="businessAddress"
              name="businessAddress"
              value={localFormData.businessAddress}
              onChange={handleInputChange}
              placeholder="Street address, city, state, zip/postal code, country"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] min-h-[80px]"
              disabled={registerClicked}
            />
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium mb-1">
              What best describes your business type? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="businessType"
                name="businessType"
                value={localFormData.businessType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] appearance-none"
                disabled={registerClicked}
              >
                <option value="" disabled>
                  Select your business type
                </option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
            </div>
          </div>

          {/* How did you hear about us */}
          <div>
            <label htmlFor="referralSource" className="block text-sm font-medium mb-1">
              How did you hear about us? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="referralSource"
                name="referralSource"
                value={localFormData.referralSource}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] appearance-none"
                disabled={registerClicked}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {referralSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Skip form option */}
      {!registerClicked && (
        <div className="mt-8 p-4 text-left border-t border-gray-200">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Want to skip the form?</span>
          </div>
          <a href="#" className="text-[#003087] text-sm font-medium hover:underline">
            Book a free discovery call instead →
          </a>
        </div>
      )}
    </div>
  )
}
