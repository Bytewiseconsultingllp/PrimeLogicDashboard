"use client"

import { useState } from "react"

interface TechnologyItem {
  name: string
  selected: boolean
}

// Update the TechnologyCategory interface to include a required flag
interface TechnologyCategory {
  title: string
  items: TechnologyItem[]
  required?: boolean
}

interface TechnologiesSelectionProps {
  selectedTechnologies?: any[]
  onUpdate?: (technologies: any[]) => void
}

export default function TechnologiesSelection({ selectedTechnologies = [], onUpdate }: TechnologiesSelectionProps) {
  // Technology categories data - 6 main categories with 6 items each
  // Update the technology categories data with the new order and required flags
  const technologyCategories: TechnologyCategory[] = [
    {
      title: "Frontend Technologies",
      items: [
        { name: "React", selected: false },
        { name: "Angular", selected: false },
        { name: "Vue.js", selected: false },
        { name: "Next.js", selected: false },
        { name: "Svelte", selected: false },
        { name: "jQuery", selected: false },
      ],
      required: true,
    },
    {
      title: "Backend Technologies",
      items: [
        { name: "Node.js", selected: false },
        { name: "Python/Django", selected: false },
        { name: "Java/Spring", selected: false },
        { name: "PHP/Laravel", selected: false },
        { name: "Ruby on Rails", selected: false },
        { name: ".NET Core", selected: false },
      ],
      required: true,
    },
    {
      title: "Database Technologies",
      items: [
        { name: "PostgreSQL", selected: false },
        { name: "MongoDB", selected: false },
        { name: "MySQL", selected: false },
        { name: "Redis", selected: false },
        { name: "Firebase", selected: false },
        { name: "SQL Server", selected: false },
      ],
      required: true,
    },
    {
      title: "AI & Data Science",
      items: [
        { name: "TensorFlow", selected: false },
        { name: "PyTorch", selected: false },
        { name: "OpenAI API", selected: false },
        { name: "Scikit-learn", selected: false },
        { name: "Pandas", selected: false },
        { name: "Computer Vision", selected: false },
      ],
    },
    {
      title: "DevOps & Infrastructure",
      items: [
        { name: "AWS", selected: false },
        { name: "Docker", selected: false },
        { name: "Kubernetes", selected: false },
        { name: "GitHub Actions", selected: false },
        { name: "Terraform", selected: false },
        { name: "Jenkins", selected: false },
      ],
    },
    {
      title: "Mobile Technologies",
      items: [
        { name: "React Native", selected: false },
        { name: "Flutter", selected: false },
        { name: "Swift/iOS", selected: false },
        { name: "Kotlin/Android", selected: false },
        { name: "Xamarin", selected: false },
        { name: "Ionic", selected: false },
      ],
    },
  ]

  // Initialize state with the prop value
  const [localSelectedTechnologies, setLocalSelectedTechnologies] =
    useState<{ category: string; technology: string }[]>(selectedTechnologies)

  // Remove the useEffect that was causing the loop

  const toggleTechnologySelection = (categoryTitle: string, technologyName: string) => {
    // Update the selectedTechnologies array
    const existingIndex = localSelectedTechnologies.findIndex(
      (item) => item.category === categoryTitle && item.technology === technologyName,
    )

    let updatedTechnologies
    if (existingIndex >= 0) {
      // Remove if already selected
      updatedTechnologies = localSelectedTechnologies.filter((_, index) => index !== existingIndex)
    } else {
      // Add if not selected
      updatedTechnologies = [...localSelectedTechnologies, { category: categoryTitle, technology: technologyName }]
    }

    setLocalSelectedTechnologies(updatedTechnologies)

    // Call onUpdate with the new technologies array
    if (onUpdate) {
      onUpdate(updatedTechnologies)
    }
  }

  const isTechnologySelected = (categoryTitle: string, technologyName: string) => {
    return localSelectedTechnologies.some(
      (item) => item.category === categoryTitle && item.technology === technologyName,
    )
  }

  // Update the return statement to include required indicators in the UI
  return (
    <div className="p-6 flex-grow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Select Your Technologies</h1>
        <p className="text-gray-600">Choose the technologies you want to use in your project</p>
      </div>

      {/* Technologies grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technologyCategories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#003087] mb-1 flex items-center">
              {category.title}
              {category.required && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {category.required ? "At least one selection required" : "Optional - select if needed"}
            </p>
            <ul className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTechnologySelected(category.title, item.name)}
                      onChange={() => toggleTechnologySelection(category.title, item.name)}
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

      {/* Selected technologies horizontal card */}
      <div className="mt-8 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Selected Technologies</h3>
          <span className="text-sm text-gray-500">{localSelectedTechnologies.length} selected</span>
        </div>

        {localSelectedTechnologies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localSelectedTechnologies.map((item, index) => (
              <div
                key={index}
                className="bg-[#003087]/10 text-[#003087] px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{item.technology}</span>
                <button
                  className="ml-2 text-[#003087]/70 hover:text-[#003087]"
                  onClick={() => {
                    toggleTechnologySelection(item.category, item.technology)
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No technologies selected yet. Please select technologies from the options above.
          </p>
        )}
      </div>

      {/* Required categories warning */}
      {technologyCategories
        .filter((cat) => cat.required)
        .some((cat) => !localSelectedTechnologies.some((tech) => tech.category === cat.title)) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <p className="font-medium">Please select at least one technology from each required category:</p>
          <ul className="mt-1 list-disc list-inside">
            {technologyCategories
              .filter((cat) => cat.required && !localSelectedTechnologies.some((tech) => tech.category === cat.title))
              .map((cat, idx) => (
                <li key={idx}>{cat.title}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
