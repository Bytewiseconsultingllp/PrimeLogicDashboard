"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, ArrowLeft, Check, Menu, X } from "lucide-react"
import * as api from "./utils/api"
import { enhancedToast, handleApiError } from "@/utils/enhanced-toast"

// Import all step components
import RegisterYourself from "./components/register"
import ServicesSelection from "./components/services"
import IndustriesSelection from "./components/industries"
import TechnologiesSelection from "./components/technologies"
import FeaturesSelection from "./components/features-sor"
import SpecialOffers from "./components/special-offers"
import Timeline from "./components/timeline"
import Estimate from "./components/estimate"
import ServiceAgreement from "./components/agreement"
import ProceedOptions from "./components/payment"

// Define proper interfaces for type safety
interface RegisterYourselfData {
  fullName: string
  businessEmail: string
  phoneNumber: string
  companyName: string
  companyWebsite: string
  businessAddress: string
  businessType: string
  referralSource: string
  [key: string]: string // Add index signature for dynamic access
}

interface FormData {
  registerYourself: RegisterYourselfData
  services: any[]
  industries: any[]
  technologies: any[]
  features: any[]
  specialOffers: {
    discounts: any[]
    appliedDiscount: number
    submitted?: boolean
    submitFunction?: () => Promise<boolean>
  }
  timeline: string
  budget: {
    paymentMethod: string
  }
  estimate: {
    accepted: boolean
  }
  agreement: {
    accepted: boolean
    submitFunction?: () => Promise<boolean>
  }
  proceedOptions: {
    selectedOption: string | null
    completed: boolean
  }
}

interface Step {
  number: number
  name: string
  component: React.ReactNode
  isValid: boolean
  requiredFields?: string[]
}

// Storage keys
const STORAGE_KEYS = {
  FORM_DATA: "project_builder_form_data",
  CURRENT_STEP: "project_builder_current_step",
  VISITOR_ID: "project_builder_visitor_id",
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function GetStartedPage() {
  // Initialize form data from localStorage or use default values
  const [formData, setFormData] = useState<FormData>(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        if (savedData) {
          return JSON.parse(savedData)
        }
      } catch (error) {
        console.error("Error loading saved form data:", error)
      }
    }

    // Default form data if nothing in localStorage
    return {
      registerYourself: {
        fullName: "",
        businessEmail: "",
        phoneNumber: "",
        companyName: "",
        companyWebsite: "",
        businessAddress: "",
        businessType: "",
        referralSource: "",
      } as RegisterYourselfData,
      services: [],
      industries: [],
      technologies: [],
      features: [],
      specialOffers: {
        discounts: [],
        appliedDiscount: 10,
      },
      timeline: "fast-track",
      budget: {
        paymentMethod: "milestone",
      },
      estimate: {
        accepted: false,
      },
      agreement: {
        accepted: false,
      },
      proceedOptions: {
        selectedOption: null,
        completed: false,
      },
    }
  })

  // Define all steps in the onboarding process with validation
  const [steps, setSteps] = useState<Step[]>([
    {
      number: 1,
      name: "Register Yourself",
      component: <RegisterYourself />,
      isValid: false,
      requiredFields: ["fullName", "businessEmail"],
    },
    {
      number: 2,
      name: "Services",
      component: <ServicesSelection />,
      isValid: false,
      requiredFields: [],
    },
    {
      number: 3,
      name: "Industries",
      component: <IndustriesSelection />,
      isValid: false,
      requiredFields: [],
    },
    {
      number: 4,
      name: "Technologies",
      component: <TechnologiesSelection />,
      isValid: false,
      requiredFields: [],
    },
    {
      number: 5,
      name: "Features",
      component: <FeaturesSelection />,
      isValid: false,
      requiredFields: [],
    },
    {
      number: 6,
      name: "Special Offers",
      component: <SpecialOffers />,
      isValid: formData.specialOffers.discounts.length > 0 || formData.specialOffers.appliedDiscount !== undefined, // Valid when an option is selected
      requiredFields: [],
    },
    {
      number: 7,
      name: "Timeline",
      component: <Timeline />,
      isValid: true, // Always valid as it has default selection
      requiredFields: [],
    },
    {
      number: 8,
      name: "Estimate",
      component: <Estimate />,
      isValid: false, // Requires explicit acceptance
      requiredFields: [],
    },
    {
      number: 9,
      name: "Agreement",
      component: (
        <ServiceAgreement
          agreementData={{
            accepted: false,
          }}
          onUpdate={(data: { accepted: boolean }): void => {
            throw new Error("Function not implemented.")
          }}
        />
      ),
      isValid: false, // Requires explicit acceptance
      requiredFields: [],
    },
    {
      number: 10,
      name: "Proceed Options",
      component: (
        <ProceedOptions
          projectData={undefined}
          onUpdate={(data: { selectedOption: string | null; completed: boolean }): void => {
            throw new Error("Function not implemented.")
          }}
        />
      ),
      isValid: false, // Requires selection and completion
      requiredFields: [],
    },
  ])

  // State for loading and error handling
  const [isSubmittingVisitor, setIsSubmittingVisitor] = useState(false)
  const [visitorSubmissionError, setVisitorSubmissionError] = useState<string | null>(null)
  const [isSubmittingStep, setIsSubmittingStep] = useState(false)
  const [stepSubmissionError, setStepSubmissionError] = useState<string | null>(null)

  // State for visitorId
  const [visitorId, setVisitorId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(STORAGE_KEYS.VISITOR_ID)
      } catch (error) {
        console.error("Error loading visitor ID:", error)
      }
    }
    return null
  })

  // Initialize current step from localStorage or default to 0
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP)
        if (savedStep !== null) {
          return Number.parseInt(savedStep, 10)
        }
      } catch (error) {
        console.error("Error loading saved step:", error)
      }
    }
    return 0
  })

  const [showPreviousStepsDropdown, setShowPreviousStepsDropdown] = useState(false)

  // State for sidebar visibility in mobile/tablet view
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
      } catch (error) {
        console.error("Error saving form data:", error)
      }
    }
  }, [formData])

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStepIndex.toString())
      } catch (error) {
        console.error("Error saving current step:", error)
      }
    }
  }, [currentStepIndex])

  // Update step validation based on form data
  useEffect(() => {
    setSteps((prevSteps) => {
      return prevSteps.map((step, index) => {
        switch (index) {
          case 0: // Register Yourself
            const registerValid =
              step.requiredFields?.every((field) => {
                // Type assertion to fix TypeScript error
                return formData.registerYourself[field] && formData.registerYourself[field].trim() !== ""
              }) || false
            return { ...step, isValid: registerValid }

          case 1: // Services
            return { ...step, isValid: formData.services.length > 0 }

          case 2: // Industries
            return { ...step, isValid: formData.industries.length > 0 }

          case 3: // Technologies
            // Check if all required technology categories have at least one selection
            const requiredCategories = ["Frontend Technologies", "Backend Technologies", "Database Technologies"]
            const hasAllRequiredCategories = requiredCategories.every((category) =>
              formData.technologies.some((tech) => tech.category === category),
            )
            return { ...step, isValid: hasAllRequiredCategories }

          case 4: // Features
            return { ...step, isValid: formData.features.length > 0 }

          case 7: // Estimate
            return { ...step, isValid: formData.estimate.accepted }

          case 8: // Agreement
            return { ...step, isValid: formData.agreement.accepted } // Valid when checkbox is checked

          case 9: // Proceed Options
            return { ...step, isValid: formData.proceedOptions.completed }

          default:
            return step
        }
      })
    })
  }, [formData])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [currentStepIndex])

  // Save visitorId to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && visitorId) {
      try {
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId)
      } catch (error) {
        console.error("Error saving visitor ID:", error)
      }
    }
  }, [visitorId])

  // Helper function to transform services data for API
  const transformServicesForAPI = (services: any[]) => {
    const grouped = services.reduce((acc: any, item: any) => {
      const categoryMap: any = {
        "Software Development": "SOFTWARE_DEVELOPMENT",
        "Data and Analytics": "DATA_AND_ANALYTICS",
        "Cloud and DevOps": "CLOUD_AND_DEVOPS",
        "Emerging Technologies": "EMERGING_TECHNOLOGIES",
        "Creative and Design": "CREATIVE_AND_DESIGN",
        "Digital Marketing": "DIGITAL_MARKETING"
      }
      
      const apiCategory = categoryMap[item.category] || item.category
      if (!acc[apiCategory]) {
        acc[apiCategory] = []
      }
      if (item.service) {
        acc[apiCategory].push(item.service)
      }
      return acc
    }, {})

    return Object.entries(grouped).map(([name, childServices]) => ({
      name,
      childServices: (childServices as string[]).filter(Boolean)
    }))
  }

  // Helper function to transform industries data for API
  const transformIndustriesForAPI = (industries: any[]) => {
    const categoryMap: any = {
      "Healthcare & Life Sciences": "HEALTHCARE_AND_LIFE_SCIENCES",
      "Financial Services": "FINANCIAL_SERVICES",
      "Retail & E-commerce": "RETAIL_AND_ECOMMERCE",
      "Manufacturing": "MANUFACTURING",
      "Education": "EDUCATION",
      "Government & Public Sector": "GOVERNMENT_AND_PUBLIC_SECTOR"
    }

    // Map UI-friendly industry names to backend enum values
    const subIndustryMap: any = {
      // Healthcare & Life Sciences
      "Healthcare Providers": "HEALTHCARE_PROVIDERS",
      "Pharmaceuticals": "PHARMACEUTICALS",
      "Medical Devices": "MEDICAL_DEVICES",
      "Biotechnology": "BIOTECHNOLOGY",
      "Health Insurance": "HEALTH_INSURANCE",
      
      // Financial Services
      "Banking": "BANKING",
      "Insurance": "INSURANCE",
      "Investment Management": "INVESTMENT_MANAGEMENT",
      "Payments": "PAYMENTS",
      "Lending": "LENDING",
      "Blockchain & Crypto": "BLOCKCHAIN_AND_CRYPTO",
      
      // Retail & E-commerce
      "Online Retail": "ONLINE_RETAIL",
      "Brick & Mortar": "BRICK_AND_MORTAR",
      "Omnichannel": "OMNICHANNEL",
      "Fashion & Apparel": "FASHION_AND_APPAREL",
      "Consumer Goods": "CONSUMER_GOODS",
      
      // Manufacturing
      "Automotive": "AUTOMOTIVE",
      "Industrial Equipment": "INDUSTRIAL_EQUIPMENT",
      "Electronics": "ELECTRONICS",
      "Aerospace & Defense": "AEROSPACE_AND_DEFENSE",
      "Chemical & Materials": "CHEMICAL_AND_MATERIALS",
      "Smart Manufacturing": "SMART_MANUFACTURING",
      
      // Education
      "K-12 Education": "K_12_EDUCATION",
      "Higher Education": "HIGHER_EDUCATION",
      "Professional Training": "PROFESSIONAL_TRAINING",
      "EdTech": "EDTECH",
      "Research & Development": "RESEARCH_AND_DEVELOPMENT",
      
      // Government & Public Sector
      "Federal Government": "FEDERAL_GOVERNMENT",
      "State & Local": "STATE_AND_LOCAL",
      "Public Healthcare": "PUBLIC_HEALTHCARE",
      "Public Infrastructure": "PUBLIC_INFRASTRUCTURE",
      "Civic Technology": "CIVIC_TECHNOLOGY"
    }
    
    const grouped = industries.reduce((acc: any, item: any) => {
      const apiCategory = categoryMap[item.category] || item.category
      if (!acc[apiCategory]) {
        acc[apiCategory] = []
      }
      // Use 'industry' field and map to backend enum
      if (item.industry) {
        const apiSubIndustry = subIndustryMap[item.industry] || item.industry
        acc[apiCategory].push(apiSubIndustry)
      }
      return acc
    }, {})

    return Object.entries(grouped).map(([category, subIndustries]) => ({
      category,
      subIndustries: (subIndustries as string[]).filter(Boolean) // Filter out any null/undefined values
    }))
  }

  // Helper function to transform technologies data for API
  const transformTechnologiesForAPI = (technologies: any[]) => {
    const categoryMap: any = {
      "Frontend Technologies": "FRONTEND",
      "Backend Technologies": "BACKEND",
      "Database Technologies": "DATABASE",
      "AI & Data Science": "AI_AND_DATA_SCIENCE",
      "DevOps & Infrastructure": "DEVOPS_AND_INFRASTRUCTURE",
      "Mobile Technologies": "MOBILE"
    }

    // Map UI-friendly technology names to backend enum values
    const technologyMap: any = {
      // Frontend
      "React": "REACT",
      "Angular": "ANGULAR",
      "Vue.js": "VUE_JS",
      "Next.js": "NEXT_JS",
      "Svelte": "SVELTE",
      "jQuery": "JQUERY",
      
      // Backend
      "Node.js": "NODE_JS",
      "Python/Django": "PYTHON_DJANGO",
      "Java/Spring": "JAVA_SPRING",
      "PHP/Laravel": "PHP_LARAVEL",
      "Ruby on Rails": "RUBY_ON_RAILS",
      ".NET Core": "DOTNET_CORE",
      
      // Database
      "PostgreSQL": "POSTGRESQL",
      "MongoDB": "MONGODB",
      "MySQL": "MYSQL",
      "Redis": "REDIS",
      "Firebase": "FIREBASE",
      "SQL Server": "SQL_SERVER",
      
      // AI & Data Science
      "TensorFlow": "TENSORFLOW",
      "PyTorch": "PYTORCH",
      "OpenAI API": "OPENAI_API",
      "Scikit-learn": "SCIKIT_LEARN",
      "Pandas": "PANDAS",
      "Computer Vision": "COMPUTER_VISION",
      
      // DevOps & Infrastructure
      "AWS": "AWS",
      "Docker": "DOCKER",
      "Kubernetes": "KUBERNETES",
      "GitHub Actions": "GITHUB_ACTIONS",
      "Terraform": "TERRAFORM",
      "Jenkins": "JENKINS",
      
      // Mobile
      "React Native": "REACT_NATIVE",
      "Flutter": "FLUTTER",
      "Swift/iOS": "SWIFT_IOS",
      "Kotlin/Android": "KOTLIN_ANDROID",
      "Xamarin": "XAMARIN",
      "Ionic": "IONIC"
    }
    
    const grouped = technologies.reduce((acc: any, item: any) => {
      const apiCategory = categoryMap[item.category] || item.category
      if (!acc[apiCategory]) {
        acc[apiCategory] = []
      }
      if (item.technology) {
        const apiTechnology = technologyMap[item.technology] || item.technology
        acc[apiCategory].push(apiTechnology)
      }
      return acc
    }, {})

    return Object.entries(grouped).map(([category, technologies]) => ({
      category,
      technologies: (technologies as string[]).filter(Boolean)
    }))
  }

  // Helper function to transform features data for API
  const transformFeaturesForAPI = (features: any[]) => {
    const categoryMap: any = {
      "User Management": "USER_MANAGEMENT",
      "Content Management": "CONTENT_MANAGEMENT",
      "E-commerce": "ECOMMERCE",
      "Analytics & Reporting": "ANALYTICS_AND_REPORTING",
      "Communication": "COMMUNICATION",
      "Integration & API": "INTEGRATION_AND_API"
    }

    // Map UI-friendly feature names to backend enum values
    const featureMap: any = {
      // User Management
      "Authentication": "AUTHENTICATION",
      "Role-Based Access Control": "ROLE_BASED_ACCESS_CONTROL",
      "User Profiles": "USER_PROFILES",
      "Social Login": "SOCIAL_LOGIN",
      
      // Content Management
      "Rich Text Editor": "RICH_TEXT_EDITOR",
      "Media Library": "MEDIA_LIBRARY",
      "Content Versioning": "CONTENT_VERSIONING",
      "Content Scheduling": "CONTENT_SCHEDULING",
      
      // E-commerce
      "Product Catalog": "PRODUCT_CATALOG",
      "Shopping Cart": "SHOPPING_CART",
      "Payment Processing": "PAYMENT_PROCESSING",
      "Inventory Management": "INVENTORY_MANAGEMENT",
      
      // Analytics & Reporting
      "Dashboard": "DASHBOARD",
      "Custom Reports": "CUSTOM_REPORTS",
      "User Analytics": "USER_ANALYTICS",
      "Performance Metrics": "PERFORMANCE_METRICS",
      
      // Communication
      "Email Notifications": "EMAIL_NOTIFICATIONS",
      "In-App Messaging": "IN_APP_MESSAGING",
      "Push Notifications": "PUSH_NOTIFICATIONS",
      "Comments & Feedback": "COMMENTS_AND_FEEDBACK",
      
      // Integration & API
      "RESTful API": "RESTFUL_API",
      "Webhooks": "WEBHOOKS",
      "Third-Party Integrations": "THIRD_PARTY_INTEGRATIONS",
      "Data Import/Export": "DATA_IMPORT_EXPORT"
    }
    
    const grouped = features.reduce((acc: any, item: any) => {
      const apiCategory = categoryMap[item.category] || item.category
      if (!acc[apiCategory]) {
        acc[apiCategory] = []
      }
      if (item.feature) {
        const apiFeature = featureMap[item.feature] || item.feature
        acc[apiCategory].push(apiFeature)
      }
      return acc
    }, {})

    return Object.entries(grouped).map(([category, features]) => ({
      category,
      features: (features as string[]).filter(Boolean)
    }))
  }

  // Navigate to next step with API calls
  const goToNextStep = async () => {
    if (currentStepIndex < steps.length - 1) {
      if (!steps[currentStepIndex].isValid) {
        console.log("Current step is not valid yet")
        return
      }

      setIsSubmittingStep(true)
      setStepSubmissionError(null)

      try {
        // Handle API calls for each step before proceeding
        switch (currentStepIndex) {
          case 0: // Step 1: Register Yourself - Check and Create Visitor
            const email = formData.registerYourself.businessEmail
            
            // First, check if visitor already exists
            try {
              const checkResult = await api.checkVisitorByEmail(email)
              console.log('Visitor check result:', checkResult)
              
              if (checkResult.success && checkResult.data) {
                const { isClient, isVisitor, visitorId, message } = checkResult.data
                
                if (isClient) {
                  // Client already exists - show notification and prevent continuation
                  setStepSubmissionError('This email is already registered as a client. Please use a different email or contact support.')
                  console.log('Client already exists:', message)
                  // Show enhanced toast notification
                  enhancedToast.error('This email is already registered as a client. Please use a different email or contact support.', {
                    title: 'Email Already Registered',
                    duration: 6000
                  })
                  return
                } else if (isVisitor && visitorId) {
                  // Existing visitor - use existing visitor ID
                  setVisitorId(visitorId)
                  console.log('Existing visitor found:', message)
                  // Show success message
                  enhancedToast.success('Welcome back! Continuing from where you left off.', {
                    title: 'Returning Visitor',
                    duration: 4000
                  })
                } else {
                  // New visitor - create new visitor
                  const visitorResult = await api.createVisitor({
                    fullName: formData.registerYourself.fullName,
                    businessEmail: formData.registerYourself.businessEmail,
                    phoneNumber: formData.registerYourself.phoneNumber || undefined,
                    companyName: formData.registerYourself.companyName,
                    companyWebsite: formData.registerYourself.companyWebsite || undefined,
                    businessAddress: formData.registerYourself.businessAddress || undefined,
                    businessType: formData.registerYourself.businessType,
                    referralSource: formData.registerYourself.referralSource
                  })
                  if (visitorResult.data && visitorResult.data.id) {
                    setVisitorId(visitorResult.data.id)
                  }
                  console.log('New visitor created successfully:', visitorResult)
                  // Show success message
                  enhancedToast.success('Registration successful! Welcome to Prime Logic Solutions.', {
                    title: 'Welcome Aboard!',
                    duration: 4000
                  })
                }
              } else {
                // If check fails, create new visitor as fallback
                const visitorResult = await api.createVisitor({
                  fullName: formData.registerYourself.fullName,
                  businessEmail: formData.registerYourself.businessEmail,
                  phoneNumber: formData.registerYourself.phoneNumber || undefined,
                  companyName: formData.registerYourself.companyName,
                  companyWebsite: formData.registerYourself.companyWebsite || undefined,
                  businessAddress: formData.registerYourself.businessAddress || undefined,
                  businessType: formData.registerYourself.businessType,
                  referralSource: formData.registerYourself.referralSource
                })
                if (visitorResult.data && visitorResult.data.id) {
                  setVisitorId(visitorResult.data.id)
                }
                console.log('Visitor created successfully (fallback):', visitorResult)
              }
            } catch (error) {
              console.error('Error checking/creating visitor:', error)
              // Handle the error with enhanced toast
              handleApiError(error, 'Visitor Registration')
              // Fallback to creating new visitor if check fails
              try {
                const visitorResult = await api.createVisitor({
                  fullName: formData.registerYourself.fullName,
                  businessEmail: formData.registerYourself.businessEmail,
                  phoneNumber: formData.registerYourself.phoneNumber || undefined,
                  companyName: formData.registerYourself.companyName,
                  companyWebsite: formData.registerYourself.companyWebsite || undefined,
                  businessAddress: formData.registerYourself.businessAddress || undefined,
                  businessType: formData.registerYourself.businessType,
                  referralSource: formData.registerYourself.referralSource
                })
                if (visitorResult.data && visitorResult.data.id) {
                  setVisitorId(visitorResult.data.id)
                }
                console.log('Visitor created successfully (error fallback):', visitorResult)
                enhancedToast.success('Registration completed successfully!', {
                  title: 'Welcome!',
                  duration: 4000
                })
              } catch (fallbackError) {
                handleApiError(fallbackError, 'Visitor Creation Fallback')
                throw fallbackError
              }
            }
            break

          case 1: // Step 2: Services
            if (!visitorId) {
              enhancedToast.error('Session expired. Please start over from the registration step.', {
                title: 'Session Error'
              })
              throw new Error('Visitor ID not found')
            }
            const servicesData = transformServicesForAPI(formData.services)
            await api.addVisitorServices(visitorId, servicesData)
            console.log('Services added successfully')
            enhancedToast.success('Services selection saved successfully!', {
              duration: 2000
            })
            break

          case 2: // Step 3: Industries
            if (!visitorId) {
              enhancedToast.error('Session expired. Please start over from the registration step.', {
                title: 'Session Error'
              })
              throw new Error('Visitor ID not found')
            }
            const industriesData = transformIndustriesForAPI(formData.industries)
            await api.addVisitorIndustries(visitorId, industriesData)
            console.log('Industries added successfully')
            enhancedToast.success('Industry selection saved successfully!', {
              duration: 2000
            })
            break

          case 3: // Step 4: Technologies
            if (!visitorId) {
              enhancedToast.error('Session expired. Please start over from the registration step.', {
                title: 'Session Error'
              })
              throw new Error('Visitor ID not found')
            }
            const technologiesData = transformTechnologiesForAPI(formData.technologies)
            await api.addVisitorTechnologies(visitorId, technologiesData)
            console.log('Technologies added successfully')
            enhancedToast.success('Technology stack saved successfully!', {
              duration: 2000
            })
            break

          case 4: // Step 5: Features
            if (!visitorId) {
              enhancedToast.error('Session expired. Please start over from the registration step.', {
                title: 'Session Error'
              })
              throw new Error('Visitor ID not found')
            }
            const featuresData = transformFeaturesForAPI(formData.features)
            await api.addVisitorFeatures(visitorId, featuresData)
            console.log('Features added successfully')
            enhancedToast.success('Features selection saved successfully!', {
              duration: 2000
            })
            break

          case 5: // Step 6: Special Offers/Discount
            // Call the discount submission function from the component
            if (formData.specialOffers.submitFunction) {
              const success = await formData.specialOffers.submitFunction()
              if (!success) {
                throw new Error('Failed to submit discount selection')
              }
              console.log('Discount submitted successfully via Next button')
            } else {
              throw new Error('Discount submission function not available')
            }
            break

          case 6: // Step 7: Timeline
            if (!visitorId) {
              enhancedToast.error('Session expired. Please start over from the registration step.', {
                title: 'Session Error'
              })
              throw new Error('Visitor ID not found')
            }
            const timelineMap: any = {
              "standard": { option: "STANDARD_BUILD", rushFeePercent: 0, estimatedDays: 90 },
              "priority": { option: "PRIORITY_BUILD", rushFeePercent: 15, estimatedDays: 60 },
              "accelerated": { option: "ACCELERATED_BUILD", rushFeePercent: 25, estimatedDays: 45 },
              "rapid": { option: "RAPID_BUILD", rushFeePercent: 35, estimatedDays: 30 },
              "fast-track": { option: "FAST_TRACK_BUILD", rushFeePercent: 50, estimatedDays: 20 }
            }
            const timelineData = timelineMap[formData.timeline] || timelineMap["standard"]
            await api.addVisitorTimeline(visitorId, timelineData)
            console.log('Timeline added successfully')
            enhancedToast.success('Timeline preference saved successfully!', {
              duration: 2000
            })
            break

          case 7: // Step 8: Estimate - Accept estimate
            // This will be handled in the estimate component
            break

          case 8: // Step 9: Service Agreement
            // Call the agreement submission function from the component
            if (formData.agreement.submitFunction) {
              const success = await formData.agreement.submitFunction()
              if (!success) {
                throw new Error('Failed to submit service agreement')
              }
              console.log('Service agreement submitted successfully via Next button')
            } else {
              throw new Error('Agreement submission function not available')
            }
            break

          case 9: // Step 10: Proceed Options
            // This is the final step, handled in the component
            break
        }

        // Move to next step
        setCurrentStepIndex((prevIndex) => prevIndex + 1)
        window.scrollTo(0, 0)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setStepSubmissionError(`Failed to submit step data: ${errorMessage}`)
        console.error('Failed to submit step data:', error)
        // Show enhanced error toast
        handleApiError(error, `Step ${currentStepIndex + 1} Submission`)
      } finally {
        setIsSubmittingStep(false)
      }
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prevIndex) => prevIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to a specific step
  const goToStep = (index: number) => {
    // Only allow navigation to completed steps or the current step
    if (index >= 0 && index <= currentStepIndex) {
      setCurrentStepIndex(index)
      setShowPreviousStepsDropdown(false)
      window.scrollTo(0, 0)
    }
  }

  // Update form data
  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [section]: data,
      }
      return updated
    })
  }

  // Clear saved progress
  const clearProgress = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP)
        localStorage.removeItem(STORAGE_KEYS.VISITOR_ID)
        window.location.reload()
      } catch (error) {
        console.error("Error clearing progress:", error)
      }
    }
  }

  // Calculate progress percentage
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100)

  // Get current step
  const currentStep = steps[currentStepIndex]

  // Get selection count based on current step
  const getSelectionCount = () => {
    switch (currentStepIndex) {
      case 1: // Services
        return formData.services.length
      case 2: // Industries
        return formData.industries.length
      case 3: // Technologies
        return formData.technologies.length
      case 4: // Features
        return formData.features.length
      case 5: // Special Offers
        return formData.specialOffers.appliedDiscount > 0
          ? `${formData.specialOffers.appliedDiscount}% discount applied`
          : "No discount applied"
      case 6: // Timeline
        return formData.timeline === "fast-track" ? "Fast-Track Delivery (30 Days)" : "Standard Delivery"
      case 7: // Estimate
        return formData.estimate.accepted ? "Estimate Accepted" : "Pending Acceptance"
      case 8: // Agreement
        return formData.agreement.accepted ? "Agreement Accepted" : "Pending Acceptance"
      case 9: // Proceed Options
        return formData.proceedOptions.selectedOption
          ? `Selected: ${
              formData.proceedOptions.selectedOption === "secure"
                ? "Secure My Project"
                : formData.proceedOptions.selectedOption === "quote"
                  ? "Request Formal Quote"
                  : "Schedule Consultation"
            }`
          : "No option selected"
      default:
        return ""
    }
  }

  // Render the current step component with props
  const renderCurrentStepComponent = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <RegisterYourself
            formData={formData.registerYourself}
            onUpdate={(data) => updateFormData("registerYourself", data)}
          />
        )
      case 1:
        return (
          <ServicesSelection
            selectedServices={formData.services}
            onUpdate={(data) => updateFormData("services", data)}
          />
        )
      case 2:
        return (
          <IndustriesSelection
            selectedIndustries={formData.industries}
            onUpdate={(data) => updateFormData("industries", data)}
          />
        )
      case 3:
        return (
          <TechnologiesSelection
            selectedTechnologies={formData.technologies}
            onUpdate={(data) => updateFormData("technologies", data)}
          />
        )
      case 4:
        return (
          <FeaturesSelection
            selectedFeatures={formData.features}
            selectedServices={formData.services}
            selectedIndustries={formData.industries}
            selectedTechnologies={formData.technologies}
            formData={formData}
            onUpdate={(data) => updateFormData("features", data)}
          />
        )
      case 5:
        return (
          <SpecialOffers
            discountData={formData.specialOffers}
            visitorId={visitorId}
            onUpdate={(data) => updateFormData("specialOffers", data)}
          />
        )
      case 6:
        return <Timeline selectedTimeline={formData.timeline} onUpdate={(data) => updateFormData("timeline", data)} />
      case 7:
        return (
          <Estimate
            selectedServices={formData.services}
            selectedIndustries={formData.industries}
            selectedTechnologies={formData.technologies}
            selectedFeatures={formData.features}
            appliedDiscount={formData.specialOffers.appliedDiscount}
            selectedTimeline={formData.timeline}
            visitorId={visitorId}
            onUpdate={(data) => updateFormData("estimate", data)}
          />
        )
      case 8:
        return (
          <ServiceAgreement
            agreementData={formData.agreement}
            buyerName={formData.registerYourself.fullName}
            visitorId={visitorId}
            onUpdate={(data) => updateFormData("agreement", data)}
          />
        )
      case 9:
        return <ProceedOptions projectData={formData} onUpdate={(data) => updateFormData("proceedOptions", data)} />
      default:
        return null
    }
  }

  // Render the sidebar content
  const renderSidebarContent = () => (
    <>
      <Image src="/favicon.ico" alt="Logo" width={60} height={60} className="mb-8 filter brightness-0 invert" />
      <h2 className="text-3xl font-bold mb-4">PROJECT BUILDER</h2>
      <p className="text-sm">Configure your project in a few simple steps</p>

      {/* Progress indicator */}
      <div className="mt-8">
        <div className="flex justify-between mb-2">
          <span className="text-xs">Progress</span>
          <span className="text-xs">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="mt-8 space-y-2 overflow-y-auto max-h-[calc(100vh-350px)]">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 py-1 px-2 rounded ${
              index === currentStepIndex ? "bg-white/10" : ""
            } ${index < currentStepIndex ? "cursor-pointer" : ""}`}
            onClick={() => index < currentStepIndex && goToStep(index)}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                index < currentStepIndex
                  ? "bg-[#FF6B35] text-white"
                  : index === currentStepIndex
                    ? "bg-white text-[#003087]"
                    : "bg-white/30 text-white"
              }`}
            >
              {index < currentStepIndex ? <Check className="w-3 h-3" /> : step.number}
            </div>
            <span className="text-sm">{step.name}</span>
          </div>
        ))}
      </div>

      {/* Selected count */}
      {currentStepIndex > 0 && (
        <div className="mt-8 p-4 bg-white/10 rounded-lg">
          <h3 className="font-medium mb-2">Your Selections</h3>
          <p className="text-sm">{getSelectionCount()}</p>
        </div>
      )}

      {/* Reset progress button */}
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Are you sure you want to clear all progress and start over?")) {
            clearProgress()
          }
        }}
        className="mt-auto text-xs text-white/70 hover:text-white py-2 px-3 rounded-md hover:bg-white/10 transition-colors"
      >
        Reset Progress
      </button>
    </>
  )

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6">
      <div className="w-full shadow-lg border border-gray-200 rounded-lg overflow-hidden max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row relative">
          {/* Mobile/Tablet Hamburger Menu */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-[#003087] text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-md hover:bg-white/10"
                type="button"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <span className="font-bold">PROJECT BUILDER</span>
            </div>
            <div className="text-sm">
              Step {currentStepIndex + 1}/{steps.length}
            </div>
          </div>

          {/* Mobile Progress Bar - Only visible on mobile */}
          <div className="sm:hidden px-4 py-2 bg-white border-b">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Blue sidebar - Desktop always visible, Mobile/Tablet in drawer */}
          <div
            className={`bg-[#003087] text-white lg:w-1/5 p-4 sm:p-6 lg:p-8 pt-8 lg:pt-12 flex flex-col
                        lg:relative lg:block
                        ${sidebarOpen ? "fixed inset-0 z-50 overflow-y-auto" : "hidden"}`}
          >
            {/* Close button for mobile sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-1 rounded-md hover:bg-white/10"
              type="button"
            >
              <X size={24} />
            </button>

            {renderSidebarContent()}
          </div>

          {/* Main content area */}
          <div className="w-full lg:w-4/5 flex flex-col">
            {/* Dynamic content based on current step */}
            <div className="flex-grow">{renderCurrentStepComponent()}</div>

            {/* Error message for step submission */}
            {stepSubmissionError && (
              <div className="px-4 sm:px-6 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p>{stepSubmissionError}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setStepSubmissionError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
              {currentStepIndex > 0 ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-md bg-[#FF6B35] border border-gray-300 text-white  transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" /> Previous
                  </button>
                </div>
              ) : (
                <div></div> // Empty div to maintain layout when there's no "Previous" button
              )}

              <div className="text-sm text-gray-500 hidden sm:block">
                Step {currentStepIndex + 1} of {steps.length}
              </div>

              <button
                type="button"
                onClick={goToNextStep}
                disabled={!steps[currentStepIndex]?.isValid || isSubmittingStep}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-md transition-colors ${
                  steps[currentStepIndex]?.isValid && !isSubmittingStep
                    ? "bg-[#FF6B35] text-white hover:bg-[#e55a29]"
                    : "bg-white border border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmittingStep ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    {currentStepIndex === steps.length - 1 ? "Complete" : "Next"}
                    <ArrowRight
                      className={`w-4 h-4 ${
                        steps[currentStepIndex]?.isValid && !isSubmittingStep
                          ? "text-white" 
                          : "text-gray-400"
                      }`}
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress saved notification */}
      <div
        className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md shadow-md text-sm flex items-center gap-2 opacity-0 transition-opacity duration-300"
        id="save-notification"
      >
        <Check className="w-4 h-4" />
        Progress saved
      </div>
    </div>
  )
}
