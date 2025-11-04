"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Edit, Download, Check, X } from "lucide-react"

interface SoRProps {
  selectedServices: { category: string; service: string }[]
  selectedIndustries: { category: string; industry: string }[]
  selectedTechnologies: { category: string; technology: string }[]
}

export default function StatementOfRequirements({
  selectedServices = [],
  selectedIndustries = [],
  selectedTechnologies = [],
}: SoRProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    scope: true,
    technical: true,
    industry: true,
  })
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})
  const [customText, setCustomText] = useState<Record<string, string>>({})

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleEditing = (section: string) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateCustomText = (section: string, text: string) => {
    setCustomText((prev) => ({
      ...prev,
      [section]: text,
    }))
  }

  const saveCustomText = (section: string) => {
    toggleEditing(section)
  }

  const cancelEditing = (section: string) => {
    toggleEditing(section)
    // Reset to previous value
    setCustomText((prev) => ({
      ...prev,
      [section]: prev[section] || "",
    }))
  }

  // Generate project overview based on selections
  const generateOverview = () => {
    if (customText.overview) return customText.overview

    const servicesList = selectedServices.map((s) => s.service).join(", ")
    const industriesList = selectedIndustries.map((i) => i.industry).join(", ")

    if (selectedServices.length === 0 && selectedIndustries.length === 0) {
      return "Please select services and industries to generate a project overview."
    }

    return `This project aims to develop a solution ${
      selectedServices.length > 0 ? `focusing on ${servicesList}` : ""
    }${selectedServices.length > 0 && selectedIndustries.length > 0 ? " for the " : ""}${
      selectedIndustries.length > 0
        ? `${industriesList} ${selectedIndustries.length > 1 ? "industries" : "industry"}`
        : ""
    }. The solution will address specific business needs and challenges in ${
      selectedIndustries.length > 0 ? "these sectors" : "the target market"
    }, providing a competitive advantage through innovative technology implementation.`
  }

  // Generate scope of work based on selected services
  const generateScope = () => {
    if (customText.scope) return customText.scope

    if (selectedServices.length === 0) {
      return "Please select services to define the scope of work."
    }

    const scopeItems = selectedServices.map((service) => {
      switch (service.service) {
        case "Web Development":
          return "Development of responsive web application with modern UI/UX"
        case "Mobile Development":
          return "Creation of native/cross-platform mobile applications"
        case "SaaS Platforms":
          return "Building scalable Software-as-a-Service platform"
        case "API Integration":
          return "Integration with third-party APIs and services"
        case "Cloud Solutions":
          return "Implementation of cloud-based infrastructure and services"
        case "Data Visualization":
          return "Creation of interactive dashboards and data visualization tools"
        default:
          return `Implementation of ${service.service}`
      }
    })

    return `The scope of work includes:\n\n${scopeItems.map((item) => `• ${item}`).join("\n")}`
  }

  // Generate technical requirements based on selected technologies
  const generateTechnical = () => {
    if (customText.technical) return customText.technical

    if (selectedTechnologies.length === 0) {
      return "Please select technologies to define technical requirements."
    }

    const techByCategory: Record<string, string[]> = {}

    selectedTechnologies.forEach((tech) => {
      if (!techByCategory[tech.category]) {
        techByCategory[tech.category] = []
      }
      techByCategory[tech.category].push(tech.technology)
    })

    const techSections = Object.entries(techByCategory).map(([category, techs]) => {
      return `${category}: ${techs.join(", ")}`
    })

    return `The solution will be built using the following technologies:\n\n${techSections.map((item) => `• ${item}`).join("\n")}`
  }

  // Generate industry-specific considerations
  const generateIndustryConsiderations = () => {
    if (customText.industry) return customText.industry

    if (selectedIndustries.length === 0) {
      return "Please select industries to define industry-specific considerations."
    }

    const industryConsiderations = selectedIndustries.map((industry) => {
      switch (industry.industry) {
        case "Healthcare Providers":
          return "HIPAA compliance and patient data security"
        case "Banking":
          return "Financial regulations compliance and secure transaction processing"
        case "Online Retail":
          return "E-commerce best practices and payment gateway integration"
        case "Software & IT Services":
          return "Scalable architecture and modern development practices"
        default:
          return `${industry.industry} industry best practices and standards`
      }
    })

    return `Industry-specific considerations include:\n\n${industryConsiderations.map((item) => `• ${item}`).join("\n")}`
  }

  const downloadSoR = () => {
    const content = `
# Statement of Requirements

## Project Overview
${generateOverview().replace(/\n/g, "\n")}

## Scope of Work
${generateScope().replace(/\n/g, "\n")}

## Technical Requirements
${generateTechnical().replace(/\n/g, "\n")}

## Industry-Specific Considerations
${generateIndustryConsiderations().replace(/\n/g, "\n")}
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Statement_of_Requirements.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Project Overview Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection("overview")}
        >
          <h3 className="font-medium">Project Overview</h3>
          <div className="flex items-center">
            {!editingSections.overview && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEditing("overview")
                }}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                
              </button>
            )}
            {expandedSections.overview ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        {expandedSections.overview && (
          <div className="p-3">
            {editingSections.overview ? (
              <div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                  value={customText.overview || generateOverview()}
                  onChange={(e) => updateCustomText("overview", e.target.value)}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => cancelEditing("overview")}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </button>
                  <button
                    onClick={() => saveCustomText("overview")}
                    className="px-3 py-1 bg-[#003087] text-white rounded-md text-sm flex items-center"
                  >
                    <Check className="w-3 h-3 mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line">{generateOverview()}</div>
            )}
          </div>
        )}
      </div>

      {/* Scope of Work Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection("scope")}
        >
          <h3 className="font-medium">Scope of Work</h3>
          <div className="flex items-center">
            {!editingSections.scope && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEditing("scope")
                }}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                
              </button>
            )}
            {expandedSections.scope ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        {expandedSections.scope && (
          <div className="p-3">
            {editingSections.scope ? (
              <div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                  value={customText.scope || generateScope()}
                  onChange={(e) => updateCustomText("scope", e.target.value)}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => cancelEditing("scope")}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </button>
                  <button
                    onClick={() => saveCustomText("scope")}
                    className="px-3 py-1 bg-[#003087] text-white rounded-md text-sm flex items-center"
                  >
                    <Check className="w-3 h-3 mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line">{generateScope()}</div>
            )}
          </div>
        )}
      </div>

      {/* Technical Requirements Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection("technical")}
        >
          <h3 className="font-medium">Technical Requirements</h3>
          <div className="flex items-center">
            {!editingSections.technical && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEditing("technical")
                }}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                
              </button>
            )}
            {expandedSections.technical ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        {expandedSections.technical && (
          <div className="p-3">
            {editingSections.technical ? (
              <div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                  value={customText.technical || generateTechnical()}
                  onChange={(e) => updateCustomText("technical", e.target.value)}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => cancelEditing("technical")}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </button>
                  <button
                    onClick={() => saveCustomText("technical")}
                    className="px-3 py-1 bg-[#003087] text-white rounded-md text-sm flex items-center"
                  >
                    <Check className="w-3 h-3 mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line">{generateTechnical()}</div>
            )}
          </div>
        )}
      </div>

      {/* Industry-Specific Considerations Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection("industry")}
        >
          <h3 className="font-medium">Industry-Specific Considerations</h3>
          <div className="flex items-center">
            {!editingSections.industry && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleEditing("industry")
                }}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                
              </button>
            )}
            {expandedSections.industry ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        {expandedSections.industry && (
          <div className="p-3">
            {editingSections.industry ? (
              <div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                  value={customText.industry || generateIndustryConsiderations()}
                  onChange={(e) => updateCustomText("industry", e.target.value)}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => cancelEditing("industry")}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </button>
                  <button
                    onClick={() => saveCustomText("industry")}
                    className="px-3 py-1 bg-[#003087] text-white rounded-md text-sm flex items-center"
                  >
                    <Check className="w-3 h-3 mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line">{generateIndustryConsiderations()}</div>
            )}
          </div>
        )}
      </div>

      
    </div>
  )
}
