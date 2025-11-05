"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  Cpu,
  Star,
  TrendingUp,
  Calculator,
  AlertCircle
} from "lucide-react"
import { getUserDetails } from "@/lib/api/storage"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const serviceSchema = z.object({
  category: z.string().min(2, "Category must be at least 2 characters").max(100, "Category must be less than 100 characters"),
  basePrice: z.coerce.number().min(0, "Base price must be positive"),
  description: z.string().optional(),
})

const technologySchema = z.object({
  technology: z.string().min(2, "Technology name must be at least 2 characters").max(100, "Technology name must be less than 100 characters"),
  additionalCost: z.coerce.number().min(0, "Additional cost must be positive"),
})

const featureSchema = z.object({
  feature: z.string().min(2, "Feature name must be at least 2 characters").max(100, "Feature name must be less than 100 characters"),
  additionalCost: z.coerce.number().min(0, "Additional cost must be positive"),
})

interface ServiceCategory {
  id: string
  category: string
  basePrice: number
  description?: string
  childServices?: string[]
  createdAt: string
  updatedAt: string
}

interface Industry {
  id: string
  category: string
  basePrice: number
  description?: string
  subIndustries?: string[]
  createdAt: string
  updatedAt: string
}

interface Technology {
  id: string
  technology: string
  additionalCost: number
  createdAt: string
  updatedAt: string
}

interface Feature {
  id: string
  feature: string
  additionalCost: number
  createdAt: string
  updatedAt: string
}

interface PricingStats {
  totalServices: number
  totalIndustries: number
  totalTechnologies: number
  totalFeatures: number
  averageBasePrice: number
}

export default function PricingManagementPage() {
  const { isAuthorized } = useAuth(["ADMIN"])
  const router = useRouter()
  const [services, setServices] = useState<ServiceCategory[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [stats, setStats] = useState<PricingStats>({
    totalServices: 0,
    totalIndustries: 0,
    totalTechnologies: 0,
    totalFeatures: 0,
    averageBasePrice: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("services")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const serviceForm = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { category: "", basePrice: 0, description: "" },
  })

  const technologyForm = useForm<z.infer<typeof technologySchema>>({
    resolver: zodResolver(technologySchema),
    defaultValues: { technology: "", additionalCost: 0 },
  })

  const featureForm = useForm<z.infer<typeof featureSchema>>({
    resolver: zodResolver(featureSchema),
    defaultValues: { feature: "", additionalCost: 0 },
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchAllPricingData()
    }
  }, [isAuthorized])

  const fetchAllPricingData = async () => {
    setLoading(true)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        console.error("❌ No access token found")
        toast.error("Authentication required. Please login again.")
        router.push('/login')
        return
      }

      console.log("🔄 Fetching pricing data...")
      console.log("🔄 API Base URL:", process.env.NEXT_PUBLIC_PLS)

      // Initialize with empty arrays
      let servicesList: ServiceCategory[] = []
      let industriesList: Industry[] = []
      let techList: Technology[] = []
      let featuresList: Feature[] = []

      // Fetch services with predefined categories and subcategories
      try {
        console.log("🔄 Fetching service categories...")
        const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/categories`, {
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        })

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          console.log("✅ Services response:", servicesData)
          servicesList = Array.isArray(servicesData.data) ? servicesData.data : []
          
          // If no services from API, create predefined service categories
          if (servicesList.length === 0) {
            servicesList = [
              {
                id: 'software-dev',
                category: 'SOFTWARE_DEVELOPMENT',
                basePrice: 5000,
                description: 'Custom software development services',
                childServices: ['Web Development', 'Mobile Development', 'Desktop Applications', 'API Development'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'data-analytics',
                category: 'DATA_AND_ANALYTICS',
                basePrice: 4000,
                description: 'Data analysis and business intelligence',
                childServices: ['Data Visualization', 'Business Intelligence', 'Machine Learning', 'Data Mining'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'cloud-devops',
                category: 'CLOUD_AND_DEVOPS',
                basePrice: 3500,
                description: 'Cloud infrastructure and DevOps services',
                childServices: ['AWS Services', 'Azure Services', 'CI/CD Pipeline', 'Infrastructure as Code'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'emerging-tech',
                category: 'EMERGING_TECHNOLOGIES',
                basePrice: 6000,
                description: 'Cutting-edge technology solutions',
                childServices: ['AI/ML Solutions', 'Blockchain', 'IoT Development', 'AR/VR Applications'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'creative-design',
                category: 'CREATIVE_AND_DESIGN',
                basePrice: 2500,
                description: 'Creative and design services',
                childServices: ['UI/UX Design', 'Graphic Design', 'Brand Identity', 'Web Design'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'digital-marketing',
                category: 'DIGITAL_MARKETING',
                basePrice: 2000,
                description: 'Digital marketing and promotion services',
                childServices: ['SEO Optimization', 'Social Media Marketing', 'Content Marketing', 'PPC Advertising'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          }
          setServices(servicesList)
        } else if (servicesRes.status === 401) {
          console.error("❌ Authentication failed for services")
          toast.error("Session expired. Please login again.")
          localStorage.removeItem('userDetails')
          sessionStorage.removeItem('userDetails')
          router.push('/login')
          return
        } else {
          const errorText = await servicesRes.text()
          console.error("❌ Failed to fetch services:", servicesRes.status, errorText)
        }
      } catch (error) {
        console.error("❌ Error fetching services:", error)
      }

      // Fetch industries with predefined categories and subcategories
      try {
        console.log("🔄 Fetching industry categories...")
        // Since there's no specific industry pricing endpoint, we'll create predefined industries
        industriesList = [
          {
            id: 'healthcare',
            category: 'HEALTHCARE_AND_LIFE_SCIENCES',
            basePrice: 7000,
            description: 'Healthcare and life sciences industry solutions',
            subIndustries: ['Hospitals', 'Pharmaceuticals', 'Medical Devices', 'Telemedicine'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'financial',
            category: 'FINANCIAL_SERVICES',
            basePrice: 8000,
            description: 'Financial services and fintech solutions',
            subIndustries: ['Banking', 'Insurance', 'Investment Management', 'Payment Processing'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'retail',
            category: 'RETAIL_AND_ECOMMERCE',
            basePrice: 4500,
            description: 'Retail and e-commerce solutions',
            subIndustries: ['Online Retail', 'Fashion & Apparel', 'Food & Beverage', 'Consumer Electronics'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'manufacturing',
            category: 'MANUFACTURING',
            basePrice: 6000,
            description: 'Manufacturing and industrial solutions',
            subIndustries: ['Automotive', 'Aerospace', 'Industrial Equipment', 'Supply Chain'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'education',
            category: 'EDUCATION',
            basePrice: 3500,
            description: 'Education and e-learning solutions',
            subIndustries: ['K-12 Education', 'Higher Education', 'Corporate Training', 'Online Learning'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'government',
            category: 'GOVERNMENT_AND_PUBLIC_SECTOR',
            basePrice: 9000,
            description: 'Government and public sector solutions',
            subIndustries: ['Federal Government', 'State & Local', 'Public Safety', 'Smart Cities'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        setIndustries(industriesList)
      } catch (error) {
        console.error("❌ Error setting up industries:", error)
      }

      // Fetch technologies
      try {
        console.log("🔄 Fetching technologies...")
        const technologiesRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/technologies`, {
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        })

        if (technologiesRes.ok) {
          const technologiesData = await technologiesRes.json()
          console.log("✅ Technologies response:", technologiesData)
          // Handle both direct array and nested data structure
          if (technologiesData.data && technologiesData.data.technologies) {
            techList = Array.isArray(technologiesData.data.technologies) ? technologiesData.data.technologies : []
          } else if (Array.isArray(technologiesData.data)) {
            techList = technologiesData.data
          } else if (Array.isArray(technologiesData)) {
            techList = technologiesData
          }
          setTechnologies(techList)
        } else if (technologiesRes.status === 401) {
          console.error("❌ Authentication failed for technologies")
          toast.error("Session expired. Please login again.")
          localStorage.removeItem('userDetails')
          sessionStorage.removeItem('userDetails')
          router.push('/login')
          return
        } else {
          const errorText = await technologiesRes.text()
          console.error("❌ Failed to fetch technologies:", technologiesRes.status, errorText)
        }
      } catch (error) {
        console.error("❌ Error fetching technologies:", error)
      }

      // Fetch features
      try {
        console.log("🔄 Fetching features...")
        const featuresRes = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/features`, {
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        })

        if (featuresRes.ok) {
          const featuresData = await featuresRes.json()
          console.log("✅ Features response:", featuresData)
          // Handle both direct array and nested data structure
          if (featuresData.data && featuresData.data.features) {
            featuresList = Array.isArray(featuresData.data.features) ? featuresData.data.features : []
          } else if (Array.isArray(featuresData.data)) {
            featuresList = featuresData.data
          } else if (Array.isArray(featuresData)) {
            featuresList = featuresData
          }
          setFeatures(featuresList)
        } else if (featuresRes.status === 401) {
          console.error("❌ Authentication failed for features")
          toast.error("Session expired. Please login again.")
          localStorage.removeItem('userDetails')
          sessionStorage.removeItem('userDetails')
          router.push('/login')
          return
        } else {
          const errorText = await featuresRes.text()
          console.error("❌ Failed to fetch features:", featuresRes.status, errorText)
        }
      } catch (error) {
        console.error("❌ Error fetching features:", error)
      }

      // Calculate stats using the parsed data
      const allPrices = [
        ...servicesList.map(s => s.basePrice || 0),
        ...industriesList.map(i => i.basePrice || 0),
        ...techList.map(t => t.additionalCost || 0),
        ...featuresList.map(f => f.additionalCost || 0)
      ]
      const avgPrice = allPrices.length > 0 
        ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length
        : 0

      setStats({
        totalServices: servicesList.length,
        totalIndustries: industriesList.length,
        totalTechnologies: techList.length,
        totalFeatures: featuresList.length,
        averageBasePrice: Math.round(avgPrice * 100) / 100 // Round to 2 decimal places
      })

      console.log("✅ Final stats:", {
        services: servicesList.length,
        industries: industriesList.length,
        technologies: techList.length,
        features: featuresList.length,
        avgPrice: Math.round(avgPrice * 100) / 100
      })

      toast.success(`Loaded ${servicesList.length + industriesList.length + techList.length + featuresList.length} pricing items`)
    } catch (error) {
      console.error("❌ Error in fetchAllPricingData:", error)
      toast.error("Failed to load pricing data. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const createService = async (data: z.infer<typeof serviceSchema>) => {
    setActionLoading("create")
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log("🔄 Creating service category:", data)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/categories`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Service created:", result)
        toast.success("Service category created successfully")
        setIsCreateDialogOpen(false)
        serviceForm.reset()
        fetchAllPricingData()
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to create service:", response.status, errorData)
        toast.error(`Failed to create service category: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error creating service:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const createTechnology = async (data: z.infer<typeof technologySchema>) => {
    setActionLoading("create")
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log("🔄 Creating technology:", data)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/technologies`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Technology created:", result)
        toast.success("Technology created successfully")
        setIsCreateDialogOpen(false)
        technologyForm.reset()
        fetchAllPricingData()
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to create technology:", response.status, errorData)
        toast.error(`Failed to create technology: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error creating technology:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const createFeature = async (data: z.infer<typeof featureSchema>) => {
    setActionLoading("create")
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log("🔄 Creating feature:", data)
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/features`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Feature created:", result)
        toast.success("Feature created successfully")
        setIsCreateDialogOpen(false)
        featureForm.reset()
        fetchAllPricingData()
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error("❌ Failed to create feature:", response.status, errorData)
        toast.error(`Failed to create feature: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error creating feature:", error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const updateItemPrice = async (type: string, id: string, newPrice: number) => {
    setActionLoading(id)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log(`🔄 Updating ${type} price:`, { id, newPrice })
      
      let endpoint = ''
      let updateData: any = {}
      
      if (type === 'service' || type === 'industry') {
        endpoint = 'categories'
        updateData = { basePrice: newPrice }
      } else if (type === 'technology') {
        endpoint = 'technologies'
        updateData = { additionalCost: newPrice }
      } else if (type === 'feature') {
        endpoint = 'features'
        updateData = { additionalCost: newPrice }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${type} price updated:`, result)
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} price updated successfully`)
        setIsEditDialogOpen(false)
        setEditingItem(null)
        fetchAllPricingData()
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error(`❌ Failed to update ${type} price:`, response.status, errorData)
        toast.error(`Failed to update ${type} price: ${response.status}`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${type} price:`, error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const deleteItem = async (type: string, id: string) => {
    setActionLoading(id)
    try {
      const userDetails = getUserDetails()
      const token = userDetails?.accessToken

      if (!token) {
        toast.error("Authentication required")
        return
      }

      console.log(`🔄 Deleting ${type}:`, id)
      
      let endpoint = ''
      if (type === 'service' || type === 'industry') {
        endpoint = 'categories'
      } else if (type === 'technology') {
        endpoint = 'technologies'
      } else if (type === 'feature') {
        endpoint = 'features'
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/admin/pricing/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        console.log(`✅ ${type} deleted successfully`)
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`)
        setIsDeleteDialogOpen(false)
        setDeletingItem(null)
        fetchAllPricingData()
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('userDetails')
        sessionStorage.removeItem('userDetails')
        router.push('/login')
      } else {
        const errorData = await response.text()
        console.error(`❌ Failed to delete ${type}:`, response.status, errorData)
        toast.error(`Failed to delete ${type}: ${response.status}`)
      }
    } catch (error) {
      console.error(`❌ Error deleting ${type}:`, error)
      toast.error("Network error. Please check your connection.")
    } finally {
      setActionLoading(null)
    }
  }

  const openEditDialog = (item: any, type: string) => {
    setEditingItem({ ...item, type })
    setEditPrice(type === 'service' || type === 'industry' ? item.basePrice : item.additionalCost)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: any, type: string) => {
    setDeletingItem({ ...item, type })
    setIsDeleteDialogOpen(true)
  }

  const getCreateForm = () => {
    switch (activeTab) {
      case 'services':
        return (
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(createService)} className="space-y-4">
              <FormField
                control={serviceForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SOFTWARE_DEVELOPMENT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Base price for software development services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading === "create"}>
                  {actionLoading === "create" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Service"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )
      case 'technologies':
        return (
          <Form {...technologyForm}>
            <form onSubmit={technologyForm.handleSubmit(createTechnology)} className="space-y-4">
              <FormField
                control={technologyForm.control}
                name="technology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Node.js" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={technologyForm.control}
                name="additionalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Cost ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="500" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading === "create"}>
                  {actionLoading === "create" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Technology"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )
      case 'features':
        return (
          <Form {...featureForm}>
            <form onSubmit={featureForm.handleSubmit(createFeature)} className="space-y-4">
              <FormField
                control={featureForm.control}
                name="feature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., User Authentication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureForm.control}
                name="additionalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Cost ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="800" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading === "create"}>
                  {actionLoading === "create" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Feature"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )
      default:
        return null
    }
  }

  if (!isAuthorized) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087] mx-auto mb-4"></div>
          <p className="text-lg font-medium text-[#003087] mb-2">Loading Pricing Data</p>
          <p className="text-muted-foreground">Please wait while we fetch the pricing information...</p>
        </div>
      </div>
    )
  }

  // Show error state if no data loaded and not loading
  const hasNoData = !loading && services.length === 0 && industries.length === 0 && technologies.length === 0 && features.length === 0
  
  if (hasNoData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003087]">Pricing Management</h1>
            <p className="text-muted-foreground">Manage service categories, technologies, and features pricing</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pricing Data Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Unable to load pricing data. This could be due to:
            </p>
            <ul className="text-sm text-muted-foreground mb-6 space-y-1">
              <li>• API endpoints not available</li>
              <li>• Network connectivity issues</li>
              <li>• Authentication problems</li>
            </ul>
            <Button onClick={fetchAllPricingData} className="flex items-center gap-2">
              <Loader2 className="w-4 h-4" />
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#003087]">Pricing Management</h1>
          <p className="text-muted-foreground">Manage service categories, technologies, and features pricing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create New {activeTab === 'services' ? 'Service Category' : 
                           activeTab === 'technologies' ? 'Technology' : 'Feature'}
              </DialogTitle>
            </DialogHeader>
            {getCreateForm()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIndustries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technologies</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTechnologies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeatures}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="services">Service Categories</TabsTrigger>
              <TabsTrigger value="industries">Industries</TabsTrigger>
              <TabsTrigger value="technologies">Technologies</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative mt-4 mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <TabsContent value="services">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(services || [])
                      .filter(service => 
                        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{service.category.replace(/_/g, ' ')}</span>
                              </div>
                              {service.childServices && service.childServices.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {service.childServices.slice(0, 3).map((childService, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {childService}
                                    </Badge>
                                  ))}
                                  {service.childServices.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{service.childServices.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                {service.basePrice.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {service.description || "No description"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(service.updatedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(service, 'service')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(service, 'service')}
                                disabled={actionLoading === service.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {actionLoading === service.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="industries">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Industry Category</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(industries || [])
                      .filter(industry => 
                        industry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (industry.description && industry.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((industry) => (
                        <TableRow key={industry.id}>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{industry.category.replace(/_/g, ' ')}</span>
                              </div>
                              {industry.subIndustries && industry.subIndustries.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {industry.subIndustries.slice(0, 3).map((subIndustry, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {subIndustry}
                                    </Badge>
                                  ))}
                                  {industry.subIndustries.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{industry.subIndustries.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-green-600" />
                              <span className="font-medium text-green-600">
                                {industry.basePrice.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {industry.description || "No description"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(industry.updatedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(industry, 'industry')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(industry, 'industry')}
                                disabled={actionLoading === industry.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {actionLoading === industry.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="technologies">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Technology</TableHead>
                      <TableHead>Additional Cost</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(technologies || [])
                      .filter(tech => 
                        tech.technology.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((technology) => (
                        <TableRow key={technology.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{technology.technology}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-blue-600" />
                              <span className="font-medium text-blue-600">
                                {technology.additionalCost.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(technology.updatedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(technology, 'technology')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(technology, 'technology')}
                                disabled={actionLoading === technology.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {actionLoading === technology.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="features">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Additional Cost</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(features || [])
                      .filter(feature => 
                        feature.feature.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{feature.feature}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-purple-600" />
                              <span className="font-medium text-purple-600">
                                {feature.additionalCost.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(feature.updatedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditDialog(feature, 'feature')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(feature, 'feature')}
                                disabled={actionLoading === feature.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {actionLoading === feature.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Price Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl leading-tight">
              Edit {editingItem?.type === 'service' ? 'Service' : 
                   editingItem?.type === 'industry' ? 'Industry' :
                   editingItem?.type === 'technology' ? 'Technology' : 'Feature'} Price
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Item Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="break-words">
                    <strong>Name:</strong> 
                    <span className="ml-1">
                      {(editingItem.category || editingItem.technology || editingItem.feature)?.replace(/_/g, ' ')}
                    </span>
                  </p>
                  <p>
                    <strong>Current Price:</strong> 
                    <span className="ml-1 text-green-600 font-medium">
                      ${(editingItem.basePrice || editingItem.additionalCost || 0).toLocaleString()}
                    </span>
                  </p>
                  {editingItem.description && (
                    <p className="break-words">
                      <strong>Description:</strong> 
                      <span className="ml-1">{editingItem.description}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  New {editingItem.type === 'service' || editingItem.type === 'industry' ? 'Base Price' : 'Additional Cost'} ($)
                </label>
                <Input
                  type="number"
                  placeholder="Enter new price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="text-base" // Better for mobile input
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingItem(null)
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingItem && editPrice >= 0) {
                      updateItemPrice(editingItem.type, editingItem.id, editPrice)
                    }
                  }}
                  disabled={editPrice < 0 || actionLoading === editingItem.id}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                >
                  {actionLoading === editingItem.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">Updating</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Update Price</span>
                      <span className="sm:hidden">Update</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl leading-tight">
              Delete {deletingItem?.type === 'service' ? 'Service' : 
                     deletingItem?.type === 'industry' ? 'Industry' :
                     deletingItem?.type === 'technology' ? 'Technology' : 'Feature'}
            </DialogTitle>
          </DialogHeader>
          {deletingItem && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium mb-2 text-red-800 text-sm sm:text-base">⚠️ Confirm Deletion</h4>
                <p className="text-red-700 text-sm break-words">
                  Are you sure you want to delete <strong className="break-words">
                    {(deletingItem.category || deletingItem.technology || deletingItem.feature)?.replace(/_/g, ' ')}
                  </strong>?
                </p>
                <p className="text-xs sm:text-sm text-red-600 mt-2">
                  This action cannot be undone and will permanently remove this item from the pricing system.
                </p>
              </div>
              
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Item Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="break-words">
                    <strong>Name:</strong> 
                    <span className="ml-1">
                      {(deletingItem.category || deletingItem.technology || deletingItem.feature)?.replace(/_/g, ' ')}
                    </span>
                  </p>
                  <p>
                    <strong>Price:</strong> 
                    <span className="ml-1 text-green-600 font-medium">
                      ${(deletingItem.basePrice || deletingItem.additionalCost || 0).toLocaleString()}
                    </span>
                  </p>
                  {deletingItem.description && (
                    <p className="break-words">
                      <strong>Description:</strong> 
                      <span className="ml-1">{deletingItem.description}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    setDeletingItem(null)
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (deletingItem) {
                      deleteItem(deletingItem.type, deletingItem.id)
                    }
                  }}
                  disabled={actionLoading === deletingItem.id}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 order-1 sm:order-2"
                >
                  {actionLoading === deletingItem.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Deleting...</span>
                      <span className="sm:hidden">Deleting</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Delete Permanently</span>
                      <span className="sm:hidden">Delete</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
