"use client"

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Mail,
  Phone,
  Building,
  Globe,
  MapPin,
  Users,
  UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Visitor {
  id: string
  fullName: string
  businessEmail: string
  phoneNumber?: string
  companyName?: string
  companyWebsite?: string
  businessAddress?: string
  businessType?: string
  referralSource?: string
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

interface ApiResponse {
  success: boolean
  status: number
  message: string
  data: {
    visitors?: Visitor[]
    pagination?: PaginationData
  } | Visitor | null
}

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  })

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [businessTypeFilter, setBusinessTypeFilter] = useState('')
  const [referralSourceFilter, setReferralSourceFilter] = useState('')

  // Modal states
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Visitor>>({})

  // Auth token - you should get this from your auth context/localStorage
  const [authToken, setAuthToken] = useState('')

  useEffect(() => {
    // Get auth token from localStorage or your auth context
    const token = localStorage.getItem('authToken') || process.env.NEXT_PUBLIC_JWT_TOKEN
    setAuthToken(token || '')
  }, [])

  useEffect(() => {
    if (authToken) {
      fetchVisitors()
    }
  }, [authToken, pagination.currentPage, businessTypeFilter, referralSourceFilter])

  const API_BASE_URL =`${process.env.NEXT_PUBLIC_API_URL}/visitor/register`

  const fetchVisitors = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
      })

      if (businessTypeFilter) {
        params.append('businessType', businessTypeFilter)
      }

      if (referralSourceFilter) {
        params.append('referralSource', referralSourceFilter)
      }

      const response = await fetch(`${API_BASE_URL}/visitors?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data: ApiResponse = await response.json()

      if (data.success && data.data && 'visitors' in data.data) {
        setVisitors(data.data.visitors || [])
        if (data.data.pagination) {
          setPagination(data.data.pagination)
        }
      } else {
        toast.error(data.message || 'Failed to fetch visitors')
      }
    } catch (error) {
      console.error('Error fetching visitors:', error)
      toast.error('Failed to fetch visitors')
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleVisitor = async (visitorId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data: ApiResponse = await response.json()

      if (data.success && data.data) {
        return data.data as Visitor
      } else {
        toast.error(data.message || 'Failed to fetch visitor details')
        return null
      }
    } catch (error) {
      console.error('Error fetching visitor:', error)
      toast.error('Failed to fetch visitor details')
      return null
    }
  }

  const updateVisitor = async (visitorId: string, updateData: Partial<Visitor>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        toast.success('Visitor updated successfully')
        fetchVisitors() // Refresh the list
        return true
      } else {
        toast.error(data.message || 'Failed to update visitor')
        return false
      }
    } catch (error) {
      console.error('Error updating visitor:', error)
      toast.error('Failed to update visitor')
      return false
    }
  }

  const deleteVisitor = async (visitorId: string) => {
    if (!confirm('Are you sure you want to delete this visitor?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        toast.success('Visitor deleted successfully')
        fetchVisitors() // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete visitor')
      }
    } catch (error) {
      console.error('Error deleting visitor:', error)
      toast.error('Failed to delete visitor')
    }
  }

  const handleViewVisitor = async (visitor: Visitor) => {
    const fullVisitorData = await fetchSingleVisitor(visitor.id)
    if (fullVisitorData) {
      setSelectedVisitor(fullVisitorData)
      setIsViewModalOpen(true)
    }
  }

  const handleEditVisitor = async (visitor: Visitor) => {
    const fullVisitorData = await fetchSingleVisitor(visitor.id)
    if (fullVisitorData) {
      setSelectedVisitor(fullVisitorData)
      setEditFormData(fullVisitorData)
      setIsEditModalOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedVisitor) return

    const success = await updateVisitor(selectedVisitor.id, editFormData)
    if (success) {
      setIsEditModalOpen(false)
      setSelectedVisitor(null)
      setEditFormData({})
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const filteredVisitors = visitors.filter(visitor =>
    visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.businessEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (visitor.companyName && visitor.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const businessTypes = ["Startup", "SME", "Nonprofit", "Enterprise", "Government", "Freelancer", "Other"]
  const referralSources = ["Google", "Social Media", "Referral", "Email", "Advertisement", "Conference/Event", "Other"]

  if (!authToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please login to view visitors</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitors Dashboard</h1>
        <p className="text-gray-600">Manage and view all registered visitors</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Page</p>
              <p className="text-2xl font-bold text-gray-900">{filteredVisitors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.filter(v => v.companyName).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Websites</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.filter(v => v.companyWebsite).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Business Type Filter */}
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Business Types</option>
            {businessTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Referral Source Filter */}
          <select
            value={referralSourceFilter}
            onChange={(e) => setReferralSourceFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Referral Sources</option>
            {referralSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('')
              setBusinessTypeFilter('')
              setReferralSourceFilter('')
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading visitors...</p>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No visitors found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {visitor.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {visitor.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {visitor.companyName || 'Individual'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.businessEmail}</div>
                        {visitor.phoneNumber && (
                          <div className="text-sm text-gray-500">{visitor.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {visitor.businessType || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.referralSource || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visitor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewVisitor(visitor)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditVisitor(visitor)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteVisitor(visitor.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((pagination.currentPage - 1) * pagination.limit) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalCount}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Visitor Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedVisitor.fullName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedVisitor.businessEmail}</span>
                    </div>
                  </div>

                  {selectedVisitor.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedVisitor.phoneNumber}</span>
                      </div>
                    </div>
                  )}

                  {selectedVisitor.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedVisitor.companyName}</span>
                      </div>
                    </div>
                  )}

                  {selectedVisitor.companyWebsite && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <a 
                          href={selectedVisitor.companyWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {selectedVisitor.companyWebsite}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedVisitor.businessType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {selectedVisitor.businessType}
                      </span>
                    </div>
                  )}

                  {selectedVisitor.referralSource && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referral Source
                      </label>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {selectedVisitor.referralSource}
                      </span>
                    </div>
                  )}
                </div>

                {selectedVisitor.businessAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <span className="text-gray-900">{selectedVisitor.businessAddress}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registered Date
                    </label>
                    <span className="text-gray-900">
                      {new Date(selectedVisitor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Updated
                    </label>
                    <span className="text-gray-900">
                      {new Date(selectedVisitor.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditVisitor(selectedVisitor)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Visitor
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Visitor</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={editFormData.businessEmail || ''}
                      onChange={(e) => setEditFormData({...editFormData, businessEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phoneNumber || ''}
                      onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.companyName || ''}
                      onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Website
                    </label>
                    <input
                      type="url"
                      value={editFormData.companyWebsite || ''}
                      onChange={(e) => setEditFormData({...editFormData, companyWebsite: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <select
                      value={editFormData.businessType || ''}
                      onChange={(e) => setEditFormData({...editFormData, businessType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Source
                    </label>
                    <select
                      value={editFormData.referralSource || ''}
                      onChange={(e) => setEditFormData({...editFormData, referralSource: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select referral source</option>
                      {referralSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <textarea
                    value={editFormData.businessAddress || ''}
                    onChange={(e) => setEditFormData({...editFormData, businessAddress: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitorsPage
