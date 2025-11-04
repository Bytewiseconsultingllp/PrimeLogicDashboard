"use client"

import { useState } from "react"

interface IndustryItem {
  name: string
  selected: boolean
}

interface IndustryCategory {
  title: string
  items: IndustryItem[]
}

interface IndustriesSelectionProps {
  selectedIndustries?: any[]
  onUpdate?: (industries: any[]) => void
}

export default function IndustriesSelection({ selectedIndustries = [], onUpdate }: IndustriesSelectionProps) {
  // Industry categories data
  const industryCategories: IndustryCategory[] = [
    {
      title: "Healthcare & Life Sciences",
      items: [
        {
          name: "Healthcare Providers",
          selected: false,
        },
        {
          name: "Pharmaceuticals",
          selected: false,
        },
        {
          name: "Medical Devices",
          selected: false,
        },
        {
          name: "Biotechnology",
          selected: false,
        },
        {
          name: "Health Insurance",
          selected: false,
        },
      ],
    },
    {
      title: "Financial Services",
      items: [
        {
          name: "Banking",
          selected: false,
        },
        {
          name: "Insurance",
          selected: false,
        },
        {
          name: "Investment Management",
          selected: false,
        },
        {
          name: "Payments",
          selected: false,
        },
        {
          name: "Lending",
          selected: false,
        },
        {
          name: "Blockchain & Crypto",
          selected: false,
        },
      ],
    },
    {
      title: "Retail & E-commerce",
      items: [
        {
          name: "Online Retail",
          selected: false,
        },
        {
          name: "Brick & Mortar",
          selected: false,
        },
        {
          name: "Omnichannel",
          selected: false,
        },
        {
          name: "Fashion & Apparel",
          selected: false,
        },
        {
          name: "Consumer Goods",
          selected: false,
        },
      ],
    },
    {
      title: "Manufacturing",
      items: [
        {
          name: "Automotive",
          selected: false,
        },
        {
          name: "Industrial Equipment",
          selected: false,
        },
        {
          name: "Electronics",
          selected: false,
        },
        {
          name: "Aerospace & Defense",
          selected: false,
        },
        {
          name: "Chemical & Materials",
          selected: false,
        },
        {
          name: "Smart Manufacturing",
          selected: false,
        },
      ],
    },
    {
      title: "Education",
      items: [
        {
          name: "K-12 Education",
          selected: false,
        },
        {
          name: "Higher Education",
          selected: false,
        },
        {
          name: "Professional Training",
          selected: false,
        },
        {
          name: "EdTech",
          selected: false,
        },
        {
          name: "Research & Development",
          selected: false,
        },
      ],
    },
    {
      title: "Government & Public Sector",
      items: [
        {
          name: "Federal Government",
          selected: false,
        },
        {
          name: "State & Local",
          selected: false,
        },
        {
          name: "Public Healthcare",
          selected: false,
        },
        {
          name: "Public Infrastructure",
          selected: false,
        },
        {
          name: "Civic Technology",
          selected: false,
        },
      ],
    },
  ]

  const [localSelectedIndustries, setLocalSelectedIndustries] =
    useState<{ category: string; industry: string }[]>(selectedIndustries)

  // Remove the useEffect that was causing the loop

  const toggleIndustrySelection = (categoryTitle: string, industryName: string) => {
    // Update the selectedIndustries array
    const existingIndex = localSelectedIndustries.findIndex(
      (item) => item.category === categoryTitle && item.industry === industryName,
    )

    let updatedIndustries
    if (existingIndex >= 0) {
      // Remove if already selected
      updatedIndustries = localSelectedIndustries.filter((_, index) => index !== existingIndex)
    } else {
      // Add if not selected
      updatedIndustries = [...localSelectedIndustries, { category: categoryTitle, industry: industryName }]
    }

    setLocalSelectedIndustries(updatedIndustries)

    // Call onUpdate with the new industries array
    if (onUpdate) {
      onUpdate(updatedIndustries)
    }
  }

  const isIndustrySelected = (categoryTitle: string, industryName: string) => {
    return localSelectedIndustries.some((item) => item.category === categoryTitle && item.industry === industryName)
  }

  return (
    <div className="p-6 flex-grow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Select Your Industries</h1>
        <p className="text-gray-600">Choose the industries relevant to your project</p>
      </div>

      {/* Industries grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industryCategories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#003087] mb-3">{category.title}</h3>
            <ul className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIndustrySelected(category.title, item.name)}
                      onChange={() => toggleIndustrySelection(category.title, item.name)}
                      className="mt-1 rounded border-gray-300 text-[#003087] focus:ring-[#003087]"
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Selected industries horizontal card */}
      <div className="mt-8 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Selected Industries</h3>
          <span className="text-sm text-gray-500">{localSelectedIndustries.length} selected</span>
        </div>

        {localSelectedIndustries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localSelectedIndustries.map((item, index) => (
              <div
                key={index}
                className="bg-[#003087]/10 text-[#003087] px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{item.industry}</span>
                <button
                  className="ml-2 text-[#003087]/70 hover:text-[#003087]"
                  onClick={() => {
                    toggleIndustrySelection(item.category, item.industry)
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No industries selected yet. Please select industries from the options above.
          </p>
        )}
      </div>
    </div>
  )
}
