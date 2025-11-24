"use client"

import { useState } from "react"

interface ServiceItem {
  name: string
  selected: boolean
}

interface ServiceCategory {
  title: string
  items: ServiceItem[]
}

interface ServicesSelectionProps {
  selectedServices?: any[]
  onUpdate?: (services: any[]) => void
}

export default function ServicesSelection({ selectedServices = [], onUpdate }: ServicesSelectionProps) {
  // Service categories data based on the image
  const serviceCategories: ServiceCategory[] = [
    {
      title: "Software Development",
      items: [
        { name: "Web Development", selected: false },
        { name: "Mobile Development", selected: false },
        { name: "SaaS Platforms", selected: false },
        { name: "API Integration", selected: false },
        { name: "Web 3.0", selected: false },
      ],
    },
    {
      title: "Data and Analytics",
      items: [
        { name: "Data Visualization", selected: false },
        { name: "Predictive Analytics", selected: false },
        { name: "Big Data", selected: false },
        { name: "Machine Learning", selected: false },
        { name: "Computer Vision", selected: false },
        { name: "Data Cleansing", selected: false },
      ],
    },
    {
      title: "Cloud and DevOps",
      items: [
        { name: "Cloud Solutions", selected: false },
        { name: "Automation", selected: false },
        { name: "CI/CD", selected: false },
        { name: "Kubernetes", selected: false },
        { name: "Docker", selected: false },
        { name: "Cost Optimization", selected: false },
      ],
    },
    {
      title: "Emerging Technologies",
      items: [
        { name: "Blockchain Solutions", selected: false },
        { name: "Voice Technology", selected: false },
        { name: "IoT Integration", selected: false },
        { name: "AI Personalization", selected: false },
        { name: "AR/VR", selected: false },
        { name: "Quantum Computing", selected: false },
      ],
    },
    {
      title: "Creative and Design",
      items: [
        { name: "Graphic Design", selected: false },
        { name: "UX/UI Design", selected: false },
        { name: "3D Modeling", selected: false },
        { name: "Motion Graphics", selected: false },
        { name: "Branding", selected: false },
        { name: "Infographic Design", selected: false },
      ],
    },
    {
      title: "Digital Marketing",
      items: [
        { name: "SEO Services", selected: false },
        { name: "Social Media", selected: false },
        { name: "Content Marketing", selected: false },
        { name: "Email Campaigns", selected: false },
        { name: "PPC Advertising", selected: false },
        { name: "Analytics & Reporting", selected: false },
      ],
    },
  ]

  // Initialize state with the prop value
  const [localSelectedServices, setLocalSelectedServices] =
    useState<{ category: string; service: string }[]>(selectedServices)

  // Remove the useEffect that was causing the loop

  const toggleServiceSelection = (categoryTitle: string, serviceName: string) => {
    // Update the selectedServices array
    const existingIndex = localSelectedServices.findIndex(
      (item) => item.category === categoryTitle && item.service === serviceName,
    )

    let updatedServices
    if (existingIndex >= 0) {
      // Remove if already selected
      updatedServices = localSelectedServices.filter((_, index) => index !== existingIndex)
    } else {
      // Add if not selected
      updatedServices = [...localSelectedServices, { category: categoryTitle, service: serviceName }]
    }

    setLocalSelectedServices(updatedServices)

    // Call onUpdate with the new services array
    if (onUpdate) {
      onUpdate(updatedServices)
    }
  }

  const isServiceSelected = (categoryTitle: string, serviceName: string) => {
    return localSelectedServices.some((item) => item.category === categoryTitle && item.service === serviceName)
  }

  return (
    <div className="p-6 flex-grow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Select Your Services</h1>
        <p className="text-gray-600">Choose the services you need for your project</p>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#003087] mb-3">{category.title}</h3>
            <ul className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isServiceSelected(category.title, item.name)}
                      onChange={() => toggleServiceSelection(category.title, item.name)}
                      className="mt-1 rounded border-gray-300 text-[#003087] focus:ring-[#003087]"
                    />
                    <span className="text-sm hover:text-[#FF6B35] transition-colors">{item.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Selected services horizontal card */}
      <div className="mt-8 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Selected Services</h3>
          <span className="text-sm text-gray-500">{localSelectedServices.length} selected</span>
        </div>

        {localSelectedServices.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localSelectedServices.map((item, index) => (
              <div
                key={index}
                className="bg-[#003087]/10 text-[#003087] px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{item.service}</span>
                <button
                  className="ml-2 text-[#003087]/70 hover:text-[#003087]"
                  onClick={() => toggleServiceSelection(item.category, item.service)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No services selected yet. Please select services from the options above.
          </p>
        )}
      </div>
    </div>
  )
}
