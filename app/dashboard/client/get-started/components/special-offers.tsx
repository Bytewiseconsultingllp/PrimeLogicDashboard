"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import * as api from "../utils/api"

interface DiscountOption {
  id: string
  name: string
  discount: number
  selected: boolean
  type: string
}

interface SpecialOffersProps {
  discountData?: any
  visitorId?: string | null
  onUpdate?: (data: any) => void
  onSubmitDiscount?: () => Promise<void>
}

export default function SpecialOffers({
  discountData = { discounts: [], appliedDiscount: 10 },
  visitorId = null,
  onUpdate,
  onSubmitDiscount,
}: SpecialOffersProps) {
  console.log('🔧 Component initialized with props:', { discountData, visitorId })
  const [discountOptions, setDiscountOptions] = useState<DiscountOption[]>([
    { id: "startup", name: "Startup Founder", discount: 10, selected: false, type: "STARTUP_FOUNDER" },
    { id: "veteran", name: "Veteran-Owned Business", discount: 15, selected: false, type: "VETERAN_OWNED_BUSINESS" },
    { id: "nonprofit", name: "Nonprofit Organization", discount: 15, selected: false, type: "NONPROFIT_ORGANIZATION" },
    { id: "none", name: "Not Eligible", discount: 0, selected: false, type: "NOT_ELIGIBLE" },
  ])

  const [showDiscountMessage, setShowDiscountMessage] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Expose submit function to parent component
  const submitDiscountToAPI = async (): Promise<boolean> => {
    if (!visitorId) {
      setSubmitError('Visitor ID not found. Please complete previous steps.')
      return false
    }

    const selectedOption = discountOptions.find(option => option.selected)
    if (!selectedOption) {
      setSubmitError('Please select a discount option.')
      return false
    }

    console.log('🚀 About to submit - Selected option:', selectedOption)
    console.log('🚀 Current discount options state:', discountOptions)

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const discountData = {
        type: selectedOption.type,
        percent: selectedOption.discount,
        notes: selectedOption.discount > 0 ? `${selectedOption.name} discount applied` : 'No discount applicable'
      }

      console.log('📤 Final API payload:', discountData)
      console.log('📤 Visitor ID:', visitorId)
      
      // Verify the data one more time
      if (selectedOption.type === 'NOT_ELIGIBLE' && selectedOption.discount !== 0) {
        console.error('❌ DATA MISMATCH: NOT_ELIGIBLE should have 0% discount, but got:', selectedOption.discount)
      }
      if (selectedOption.type === 'STARTUP_FOUNDER' && selectedOption.discount !== 10) {
        console.error('❌ DATA MISMATCH: STARTUP_FOUNDER should have 10% discount, but got:', selectedOption.discount)
      }
      
      const result = await api.addVisitorDiscount(visitorId, discountData)
      console.log('Discount submitted successfully:', result)
      
      setIsSubmitted(true)
      
      if (onUpdate) {
        onUpdate({
          discounts: selectedOption.id !== "none" ? [selectedOption.id] : [],
          appliedDiscount: selectedOption.discount,
          submitted: true
        })
      }
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit discount'
      setSubmitError(errorMessage)
      console.error('Error submitting discount:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Expose the submit function to parent via onUpdate
  useEffect(() => {
    if (onUpdate) {
      onUpdate({
        discounts: [],
        appliedDiscount: appliedDiscount,
        submitted: isSubmitted,
        submitFunction: submitDiscountToAPI
      })
    }
  }, [appliedDiscount, isSubmitted])

  // Handle discount selection (UI only)
  const handleDiscountSelection = (selectedId: string) => {
    const selectedOption = discountOptions.find(option => option.id === selectedId)
    if (!selectedOption) return

    console.log('🎯 User selected option:', selectedOption)

    const updatedOptions = discountOptions.map(option => ({
      ...option,
      selected: option.id === selectedId,
    }))

    const newAppliedDiscount = selectedOption.discount
    const newShowDiscountMessage = selectedOption.discount > 0

    setDiscountOptions(updatedOptions)
    setAppliedDiscount(newAppliedDiscount)
    setShowDiscountMessage(newShowDiscountMessage)
    setIsSubmitted(false) // Reset submission state when selection changes
    setSubmitError(null)

    console.log('✅ Updated state - Applied discount:', newAppliedDiscount)
    console.log('✅ Updated options:', updatedOptions)

    // Update parent component with selection
    if (onUpdate) {
      onUpdate({
        discounts: selectedOption.id !== "none" ? [selectedOption.id] : [],
        appliedDiscount: newAppliedDiscount,
        submitted: false,
        submitFunction: submitDiscountToAPI
      })
    }
  }


  return (
    <div className="p-6 flex-grow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003087]">Good News — You May Qualify for Special Offers</h1>
        <p className="text-gray-600 mt-2">
          Select any applicable options below to see if you qualify for special discounts on your project.
        </p>
      </div>

      {/* Discount options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select one option:</h2>
        
        {!discountOptions.some(option => option.selected) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              Please select one of the options below to proceed. All selections will be verified during consultation.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {discountOptions.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id={option.id}
                  name="discount-option"
                  type="radio"
                  checked={option.selected}
                  onChange={() => handleDiscountSelection(option.id)}
                  className="h-4 w-4 border-gray-300 text-[#003087] focus:ring-[#003087]"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={option.id} className="font-medium text-gray-700 cursor-pointer">
                  {option.name} {option.discount > 0 && `(${option.discount}% Off)`}
                </label>
                <div className="text-xs text-gray-500 mt-1">
                  Type: {option.type} | Discount: {option.discount}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{submitError}</div>
            </div>
          </div>
        )}

        {/* Current Selection Display */}
        {discountOptions.some(option => option.selected) && !isSubmitted && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            {(() => {
              const selected = discountOptions.find(option => option.selected)
              return selected ? (
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Current Selection</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <div><strong>Option:</strong> {selected.name}</div>
                    <div><strong>Type:</strong> {selected.type}</div>
                    <div><strong>Discount:</strong> {selected.discount}%</div>
                    {selected.discount > 0 && (
                      <div className="mt-1 text-blue-600">✅ {selected.discount}% off your base project cost</div>
                    )}
                  </div>
                </div>
              ) : null
            })()}
          </div>
        )}

        {/* Success message */}
        {isSubmitted && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Discount Submitted Successfully</h3>
              <div className="mt-1 text-sm text-green-700">
                {appliedDiscount > 0 
                  ? `${appliedDiscount}% discount has been applied to your project.`
                  : 'Your selection has been recorded.'
                }
              </div>
            </div>
          </div>
        )}


        {/* Verification note */}
        <div className="mt-6 flex items-start text-sm text-gray-500">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <p>
            Note: You may be asked to provide verification for any selected discounts during the project consultation.
          </p>
        </div>
      </div>

      {/* Additional information */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">About Our Discount Program</h2>
        <p className="text-gray-600 mb-4">
          At our company, we believe in supporting startups, veterans, and nonprofit organizations. Our discount program
          is designed to make our services more accessible to these groups.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>
            <span className="font-medium">Startup Founder:</span> Available for companies less than 3 years old with
            fewer than 10 employees.
          </li>
          <li>
            <span className="font-medium">Veteran-Owned Business:</span> Available for businesses where at least 51% is
            owned by a veteran.
          </li>
          <li>
            <span className="font-medium">Nonprofit Organization:</span> Available for registered 501(c)(3)
            organizations.
          </li>
        </ul>
      </div>
    </div>
  )
}
