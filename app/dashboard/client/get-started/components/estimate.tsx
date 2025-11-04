"use client"

import { useState, useEffect } from "react"
import { Calculator, Check, DollarSign, Loader2, AlertCircle, TrendingUp, Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as api from "../utils/api"

interface EstimateProps {
  selectedServices?: any[]
  selectedIndustries?: any[]
  selectedTechnologies?: any[]
  selectedFeatures?: any[]
  selectedTimeline?: string
  appliedDiscount?: number
  visitorId?: string | null
  onUpdate?: (data: any) => void
}

export default function Estimate({
  visitorId = null,
  onUpdate,
}: EstimateProps) {
  const [apiEstimate, setApiEstimate] = useState<any>(null)
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [isAcceptingEstimate, setIsAcceptingEstimate] = useState(false)
  const [estimateAccepted, setEstimateAccepted] = useState(false)
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false)

  // Fetch estimate from API
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!visitorId) {
        setEstimateError('Visitor ID not found. Please complete previous steps.')
        return
      }

      setIsLoadingEstimate(true)
      setEstimateError(null)

      try {
        const result = await api.getVisitorEstimate(visitorId)
        console.log('Estimate fetched:', result)
        setApiEstimate(result.data)
        setEstimateAccepted(result.data?.estimateAccepted || false)
        
        // Update parent component
        if (onUpdate && result.data) {
          onUpdate({
            accepted: result.data.estimateAccepted,
            finalPrice: {
              min: result.data.estimateFinalPriceMin,
              max: result.data.estimateFinalPriceMax
            }
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch estimate'
        setEstimateError(errorMessage)
        console.error('Error fetching estimate:', error)
      } finally {
        setIsLoadingEstimate(false)
      }
    }

    fetchEstimate()
  }, [visitorId])

  // Accept estimate
  const handleAcceptEstimate = async () => {
    if (!visitorId) {
      setEstimateError('Visitor ID not found')
      return
    }

    setIsAcceptingEstimate(true)
    setEstimateError(null)

    try {
      const result = await api.acceptVisitorEstimate(visitorId)
      console.log('Estimate accepted:', result)
      setEstimateAccepted(true)
      
      // Update parent component
      if (onUpdate) {
        onUpdate({
          accepted: true,
          finalPrice: {
            min: apiEstimate?.estimateFinalPriceMin,
            max: apiEstimate?.estimateFinalPriceMax
          }
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept estimate'
      setEstimateError(errorMessage)
      console.error('Error accepting estimate:', error)
    } finally {
      setIsAcceptingEstimate(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Loading state
  if (isLoadingEstimate) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-[#003087] animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading Your Estimate...</h2>
        <p className="text-gray-500 mt-2">Calculating your project costs</p>
      </div>
    )
  }

  // Error state
  if (estimateError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">Error Loading Estimate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{estimateError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No estimate data
  if (!apiEstimate) {
    return (
      <div className="p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <CardTitle className="text-yellow-900">No Estimate Available</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Please complete all previous steps to generate your project estimate.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#003087] flex items-center gap-2">
          <Calculator className="w-8 h-8" />
          Your Project Estimate
        </h1>
        <p className="text-gray-600 mt-2">
          Review your customized project estimate based on your selections
        </p>
      </div>

      {/* Main Estimate Card */}
      <Card className="mb-6 border-2 border-[#003087]">
        <CardHeader className="bg-gradient-to-r from-[#003087] to-[#0047AB] text-white">
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>Estimated Project Cost</span>
            {estimateAccepted && (
              <Badge className="bg-green-500 text-white">
                <Check className="w-4 h-4 mr-1" />
                Accepted
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-white/80">
            Final price range for your project
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-[#003087] mb-2">
              {formatCurrency(apiEstimate.estimateFinalPriceMin)} - {formatCurrency(apiEstimate.estimateFinalPriceMax)}
            </div>
            <p className="text-gray-600">
              Price range based on project complexity and requirements
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Base Cost</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(apiEstimate.baseCost)}
              </div>
            </div>

            {apiEstimate.discountPercent > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Discount Applied</span>
                  <Gift className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-700">
                  -{apiEstimate.discountPercent}%
                </div>
                <div className="text-sm text-green-600">
                  Saves {formatCurrency(apiEstimate.discountAmount)}
                </div>
              </div>
            )}

            {apiEstimate.rushFeePercent > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-600">Rush Fee</span>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  +{apiEstimate.rushFeePercent}%
                </div>
                <div className="text-sm text-orange-600">
                  Adds {formatCurrency(apiEstimate.rushFeeAmount)}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">Calculated Total</span>
                <Calculator className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(apiEstimate.calculatedTotal)}
              </div>
            </div>
          </div>

          {/* Manual Adjustment Notice */}
          {apiEstimate.isManuallyAdjusted && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900">Custom Pricing Applied</h4>
                  <p className="text-sm text-purple-700">
                    This estimate has been manually adjusted by our team to better fit your project requirements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Accept Button with Checkbox */}
          {!estimateAccepted && (
            <div className="border-t pt-6">
              {/* Checkbox for agreement */}
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={isAgreedToTerms}
                  onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#FF6B35] bg-gray-100 border-gray-300 rounded focus:ring-[#FF6B35] focus:ring-2"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to proceed with this price range for my project and understand the terms and conditions
                </label>
              </div>
              
              {/* Accept Button with reduced width */}
              <div className="flex justify-center">
                <Button
                  onClick={handleAcceptEstimate}
                  disabled={isAcceptingEstimate || !isAgreedToTerms}
                  className="bg-[#FF6B35] hover:bg-[#e55a29] text-white py-6 text-lg px-8 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isAcceptingEstimate ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Accepting Estimate...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Accept This Estimate
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                By accepting, you agree to proceed with this price range for your project
              </p>
            </div>
          )}

          {estimateAccepted && (
            <div className="border-t pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-900">Estimate Accepted!</h3>
                <p className="text-green-700">
                  You can now proceed to the next step
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Included?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>All selected services, features, and technologies</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Industry-specific customizations and requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Timeline-based delivery schedule</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Applied discounts and special offers</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Post-launch support and maintenance</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
