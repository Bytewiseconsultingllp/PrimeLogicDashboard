"use client"

import { useState } from "react"
import { AlertCircle, Check } from "lucide-react"

interface DiscountOption {
  id: string
  name: string
  discount: number
  selected: boolean
}

interface SpecialOffersProps {
  discountData?: any
  onUpdate?: (data: any) => void
}

export default function SpecialOffers({
  discountData = { discounts: [], appliedDiscount: 10 },
  onUpdate,
}: SpecialOffersProps) {
  const [discountOptions, setDiscountOptions] = useState<DiscountOption[]>([
    { id: "startup", name: "Startup Founder", discount: 10, selected: true },
    { id: "veteran", name: "Veteran-Owned Business", discount: 15, selected: false },
    { id: "nonprofit", name: "Nonprofit Organization", discount: 15, selected: false },
    { id: "none", name: "Not Eligible", discount: 0, selected: false },
  ])

  const [showDiscountMessage, setShowDiscountMessage] = useState(true)
  const [appliedDiscount, setAppliedDiscount] = useState<number>(discountData.appliedDiscount || 10)

  // ✅ Updated to allow only one selection at a time
  const handleDiscountSelection = (selectedId: string) => {
    const selectedOption = discountOptions.find(option => option.id === selectedId)
    if (!selectedOption) return

    const updatedOptions = discountOptions.map(option => ({
      ...option,
      selected: option.id === selectedId,
    }))

    const newAppliedDiscount = selectedOption.discount
    const newShowDiscountMessage = selectedOption.discount > 0

    setDiscountOptions(updatedOptions)
    setAppliedDiscount(newAppliedDiscount)
    setShowDiscountMessage(newShowDiscountMessage)

    if (onUpdate) {
      const selectedDiscounts = updatedOptions
        .filter(option => option.selected && option.id !== "none")
        .map(option => option.id)

      onUpdate({
        discounts: selectedDiscounts,
        appliedDiscount: newAppliedDiscount,
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

        <div className="space-y-4">
          {discountOptions.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id={option.id}
                  type="checkbox"
                  checked={option.selected}
                  onChange={() => handleDiscountSelection(option.id)}
                  className="h-4 w-4 rounded border-gray-300 text-[#003087] focus:ring-[#003087]"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={option.id} className="font-medium text-gray-700 cursor-pointer">
                  {option.name} {option.discount > 0 && `(${option.discount}% Off)`}
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Discount message */}
        {showDiscountMessage && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Discount Applied</h3>
              <div className="mt-1 text-sm text-green-700">{appliedDiscount}% off your base project cost.</div>
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
