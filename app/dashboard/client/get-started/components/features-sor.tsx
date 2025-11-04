"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import StatementOfRequirements from "../components/sor"

interface FeatureItem {
  name: string
  description: string
  selected: boolean
}

interface FeatureCategory {
  title: string
  description: string
  items: FeatureItem[]
}

interface FeaturesSelectionProps {
  selectedFeatures?: any[]
  selectedServices?: any[]
  selectedIndustries?: any[]
  selectedTechnologies?: any[]
  formData?: any
  onUpdate?: (features: any[]) => void
}

export default function FeaturesSelection({
  selectedFeatures = [],
  selectedServices = [],
  selectedIndustries = [],
  selectedTechnologies = [],
  formData = {},
  onUpdate,
}: FeaturesSelectionProps) {
  // Feature categories data with descriptions
  const featureCategories: FeatureCategory[] = [
    {
      title: "User Management",
      description: "Authentication and user access control features",
      items: [
        {
          name: "Authentication",
          description: "User login, registration, and account management",
          selected: false,
        },
        {
          name: "Role-Based Access Control",
          description: "Different permission levels for different user types",
          selected: false,
        },
        {
          name: "User Profiles",
          description: "Customizable user profiles with avatars and preferences",
          selected: false,
        },
        {
          name: "Social Login",
          description: "Sign in with Google, Facebook, Apple, etc.",
          selected: false,
        },
      ],
    },
    {
      title: "Content Management",
      description: "Tools for creating and managing digital content",
      items: [
        {
          name: "Rich Text Editor",
          description: "Advanced content editing capabilities",
          selected: false,
        },
        {
          name: "Media Library",
          description: "Upload and manage images, videos, and documents",
          selected: false,
        },
        {
          name: "Content Versioning",
          description: "Track changes and restore previous versions",
          selected: false,
        },
        {
          name: "Content Scheduling",
          description: "Schedule content to be published at specific times",
          selected: false,
        },
      ],
    },
    {
      title: "E-commerce",
      description: "Online selling and transaction processing features",
      items: [
        {
          name: "Product Catalog",
          description: "Manage products, categories, and attributes",
          selected: false,
        },
        {
          name: "Shopping Cart",
          description: "Add to cart, checkout, and order management",
          selected: false,
        },
        {
          name: "Payment Processing",
          description: "Integration with payment gateways",
          selected: false,
        },
        {
          name: "Inventory Management",
          description: "Track stock levels and manage inventory",
          selected: false,
        },
      ],
    },
    {
      title: "Analytics & Reporting",
      description: "Data analysis and business intelligence tools",
      items: [
        {
          name: "Dashboard",
          description: "Visual overview of key metrics and KPIs",
          selected: false,
        },
        {
          name: "Custom Reports",
          description: "Generate and export custom reports",
          selected: false,
        },
        {
          name: "User Analytics",
          description: "Track user behavior and engagement",
          selected: false,
        },
        {
          name: "Performance Metrics",
          description: "Monitor system performance and usage",
          selected: false,
        },
      ],
    },
    {
      title: "Communication",
      description: "Features for user notifications and messaging",
      items: [
        {
          name: "Email Notifications",
          description: "Automated emails for various system events",
          selected: false,
        },
        {
          name: "In-App Messaging",
          description: "Chat and messaging between users",
          selected: false,
        },
        {
          name: "Push Notifications",
          description: "Real-time alerts for mobile and web",
          selected: false,
        },
        {
          name: "Comments & Feedback",
          description: "Allow users to comment and provide feedback",
          selected: false,
        },
      ],
    },
    {
      title: "Integration & API",
      description: "Connect with external systems and services",
      items: [
        {
          name: "RESTful API",
          description: "API endpoints for third-party integration",
          selected: false,
        },
        {
          name: "Webhooks",
          description: "Event-based notifications to external systems",
          selected: false,
        },
        {
          name: "Third-Party Integrations",
          description: "Connect with popular services and platforms",
          selected: false,
        },
        {
          name: "Data Import/Export",
          description: "Import and export data in various formats",
          selected: false,
        },
      ],
    },
  ]

  const [localSelectedFeatures, setLocalSelectedFeatures] =
    useState<{ category: string; feature: string }[]>(selectedFeatures)
  const [showSOR, setShowSOR] = useState(false)

  const toggleFeatureSelection = (categoryTitle: string, featureName: string) => {
    // Update the selectedFeatures array
    const existingIndex = localSelectedFeatures.findIndex(
      (item) => item.category === categoryTitle && item.feature === featureName,
    )

    let updatedFeatures
    if (existingIndex >= 0) {
      // Remove if already selected
      updatedFeatures = localSelectedFeatures.filter((_, index) => index !== existingIndex)
    } else {
      // Add if not selected
      updatedFeatures = [...localSelectedFeatures, { category: categoryTitle, feature: featureName }]
    }

    setLocalSelectedFeatures(updatedFeatures)

    // Call onUpdate with the new features array
    if (onUpdate) {
      onUpdate(updatedFeatures)
    }
  }

  const isFeatureSelected = (categoryTitle: string, featureName: string) => {
    return localSelectedFeatures.some((item) => item.category === categoryTitle && item.feature === featureName)
  }

  return (
    <div className="p-6 flex-grow">
      <div className="mb-6">
        <h1 className="text-2xl text-[#FF6B35] font-bold">Let's build your Statement of Requirements</h1>
        <h1 className="text-2xl font-bold">Select Core Features</h1>
        <p className="text-gray-600">Choose the essential features for your project</p>
      </div>

      {/* Features grid - 3 cards per row, 2 rows total */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featureCategories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-[#003087]">{category.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            </div>

            <div className="p-4">
              <ul className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="mb-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatureSelected(category.title, item.name)}
                        onChange={() => toggleFeatureSelection(category.title, item.name)}
                        className="mt-1 rounded border-gray-300 text-[#003087] focus:ring-[#003087]"
                      />
                      <div>
                        <span className="text-sm font-medium block">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Selected features horizontal card */}
      <div className="mt-8 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Selected Features</h3>
          <span className="text-sm text-gray-500">{localSelectedFeatures.length} selected</span>
        </div>

        {localSelectedFeatures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localSelectedFeatures.map((item, index) => (
              <div
                key={index}
                className="bg-[#003087]/10 text-[#003087] px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{item.feature}</span>
                <button
                  className="ml-2 text-[#003087]/70 hover:text-[#003087]"
                  onClick={() => {
                    toggleFeatureSelection(item.category, item.feature)
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No features selected yet. Please select features from the options above.
          </p>
        )}
      </div>

      {/* Generate SOR button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowSOR(!showSOR)}
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-md bg-[#003087] text-white hover:bg-[#002060] transition-colors"
        >
          {showSOR ? "Hide Statement of Requirements" : "Generate Statement of Requirements"}
          {showSOR ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Statement of Requirements */}
      {showSOR && (
        <div className="mt-8 border border-gray-200 rounded-lg">
          <div className="p-4 bg-[#003087] text-white">
            <h3 className="font-bold text-lg">Statement of Requirements</h3>
            <p className="text-sm opacity-80">Based on your selections</p>
          </div>
          <div className="p-0">
            <StatementOfRequirements
              selectedServices={selectedServices}
              selectedIndustries={selectedIndustries}
              selectedTechnologies={selectedTechnologies}
              selectedFeatures={localSelectedFeatures}
              userName={formData?.registerYourself?.fullName || ""}
            />
          </div>
        </div>
      )}
    </div>
  )
}
