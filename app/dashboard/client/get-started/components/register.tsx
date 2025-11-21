"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"

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

    // Full name validation - required and max 25 characters
    if (!localFormData.fullName.trim()) {
      errors.fullName = "Full name is required"
    } else if (localFormData.fullName.trim().length > 25) {
      errors.fullName = "Full name must be 25 characters or less"
    }

    // Email validation
    if (!localFormData.businessEmail.trim()) {
      errors.businessEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localFormData.businessEmail)) {
      errors.businessEmail = "Please enter a valid email address"
    }

    // Company name validation - required
    if (!localFormData.companyName.trim()) {
      errors.companyName = "Company name is required"
    }

    // Website validation - must match www.example.com format
    if (localFormData.companyWebsite.trim()) {
      const websitePattern = /^www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
      if (!websitePattern.test(localFormData.companyWebsite.trim())) {
        errors.companyWebsite = "Website must be in format: www.example.com (no numbers allowed)"
      }
    }

    // Phone number validation - required
    if (!localFormData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!validatePhoneNumber(localFormData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number (10-15 digits)"
    }

    // Business address validation - required
    if (!localFormData.businessAddress.trim()) {
      errors.businessAddress = "Business address is required"
    }

    // Business type validation - required
    if (!localFormData.businessType) {
      errors.businessType = "Please select a business type"
    }

    // Referral source validation - required
    if (!localFormData.referralSource) {
      errors.referralSource = "Please select how you heard about us"
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
      toast.success("You have already registered successfully!", {
        icon: <AlertCircle />,
        duration: 4000,
      })
      return
    }

    // Validate form before proceeding
    if (!validateForm()) {
      // Show specific validation errors for each field
      Object.entries(validationErrors).forEach(([field, message]) => {
        if (message) {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
          toast.error(`${fieldName}: ${message}`)
        }
      })
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

        // Show success toast
        toast.success(result.message || "Registration successful! Welcome to Prime Logic Solutions.", {
          duration: 4000
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
          toast("Check your email for next steps!", {
            icon: "ℹ️",
            duration: 3000
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
            toast.error(errorMessage, {
              duration: 5000
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

        toast.error(`${response.status}: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Registration error:", error)

      // Handle errors with a simple toast
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Registration failed: ${errorMessage}`)
    } finally {
      setIsRegistering(false)
    }
  }

  // Function to reset registration state (for re-registration)
  const handleReRegister = () => {
    setRegisterClicked(false)
    toast("You can now register again", {
      icon: "ℹ️",
      duration: 3000
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
    let processedValue = value

    // Special validation for full name - limit to 25 characters
    if (name === "fullName" && value.length > 25) {
      processedValue = value.substring(0, 25)
    }

    // Special validation for company website - prevent numbers and disallowed symbols
    if (name === "companyWebsite") {
      // Remove numbers and disallow symbols like []';!#$ and similar (allow only letters, dot, hyphen)
      const withoutNumbers = value.replace(/[0-9]/g, "")
      const withoutSymbols = withoutNumbers.replace(/[\[\]'!#;$%^&*+=<>?{}|\\/~`\s]/g, "")
      processedValue = withoutSymbols
    }

    // Special validation for company name - disallow symbols like []';!#$ and similar
    if (name === "companyName") {
      // Allow letters, numbers, spaces, basic punctuation (.,-&), remove disallowed symbols
      const filteredValue = value.replace(/[\[\]'!#;$%^&*+=<>?{}|\\/~`]/g, "")
      processedValue = filteredValue
    }

    // Update local form data
    setLocalFormData((prev: any) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Real-time validation for specific fields
    if (name === "businessEmail") {
      if (processedValue.trim() === "") {
        setValidationStatus((prev) => ({ ...prev, businessEmail: "untouched" }))
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          businessEmail: validateEmail(processedValue) ? "valid" : "invalid",
        }))
      }
    }

    if (name === "phoneNumber") {
      if (processedValue.trim() === "") {
        setValidationStatus((prev) => ({ ...prev, phoneNumber: "untouched" }))
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          phoneNumber: validatePhoneNumber(processedValue) ? "valid" : "invalid",
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
        [name]: processedValue,
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
                placeholder="Enter your full name (max 25 characters)"
                maxLength={25}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] ${
                  validationErrors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                required
                disabled={registerClicked}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {validationErrors.fullName && <p className="text-red-500 text-xs">{validationErrors.fullName}</p>}
                </div>
                <p className="text-xs text-gray-400">{localFormData.fullName.length}/25</p>
              </div>
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
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] ${
                  validationErrors.companyName ? "border-red-500" : "border-gray-300"
                }`}
                required
                disabled={registerClicked}
              />
              {validationErrors.companyName && <p className="text-red-500 text-xs mt-1">{validationErrors.companyName}</p>}
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
                  validationErrors.phoneNumber
                    ? "border-red-500 focus:ring-red-500"
                    : validationStatus.phoneNumber === "valid"
                      ? "border-green-500 focus:ring-green-500"
                      : validationStatus.phoneNumber === "invalid"
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#003087]"
                }`}
                required
                disabled={registerClicked}
              />
              {validationErrors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
              )}
              {!validationErrors.phoneNumber && validationStatus.phoneNumber === "valid" && (
                <p className="text-green-500 text-xs mt-1">✓ Valid phone number</p>
              )}
              {!validationErrors.phoneNumber && validationStatus.phoneNumber === "invalid" && (
                <p className="text-red-500 text-xs mt-1">✗ Please enter a valid phone number (10-15 digits)</p>
              )}
            </div>
          </div>

          {/* Company Website */}
          <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium mb-1">
              Company Website
            </label>
            <input
              type="text"
              id="companyWebsite"
              name="companyWebsite"
              value={localFormData.companyWebsite}
              onChange={handleInputChange}
              placeholder="www.example.com"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] ${
                validationErrors.companyWebsite ? "border-red-500" : "border-gray-300"
              }`}
              disabled={registerClicked}
            />
            {validationErrors.companyWebsite && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.companyWebsite}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Format: www.example.com (numbers not allowed)</p>
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
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] min-h-[80px] ${
                validationErrors.businessAddress ? "border-red-500" : "border-gray-300"
              }`}
              required
              disabled={registerClicked}
            />
            {validationErrors.businessAddress && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.businessAddress}</p>
            )}
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
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] appearance-none ${
                  validationErrors.businessType ? "border-red-500" : "border-gray-300"
                }`}
                required
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
            {validationErrors.businessType && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.businessType}</p>
            )}
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
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] appearance-none ${
                  validationErrors.referralSource ? "border-red-500" : "border-gray-300"
                }`}
                required
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
            {validationErrors.referralSource && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.referralSource}</p>
            )}
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
