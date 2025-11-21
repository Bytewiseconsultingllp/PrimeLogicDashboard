"use client"

import { useState } from "react"
import { Calculator, CreditCard, DollarSign, Landmark, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface BudgetProps {
    selectedServices?: any[];
    selectedIndustries?: any[];
    selectedTechnologies?: any[];
    selectedFeatures?: any[];
    selectedTimeline?: string;
    appliedDiscount?: number;
    onUpdate?: (data: any) => void;
  }

export default function Budget({
  selectedServices = [],
  selectedFeatures = [],
  selectedTimeline = "fast-track",
  appliedDiscount = 10,
  onUpdate,
}: BudgetProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("milestone")

  // Calculate base price range
  const baseMinPrice = 5400
  const baseMaxPrice = 10800

  // Calculate discounts
  const discountPercentage = appliedDiscount || 0
  const discountAmount = {
    min: Math.round(baseMinPrice * (discountPercentage / 100)),
    max: Math.round(baseMaxPrice * (discountPercentage / 100)),
  }

  // Calculate rush fee if fast track
  const rushFeePercentage = selectedTimeline === "fast-track" ? 20 : 0
  const rushFeeAmount = {
    min: Math.round((baseMinPrice - discountAmount.min) * (rushFeePercentage / 100)),
    max: Math.round((baseMaxPrice - discountAmount.max) * (rushFeePercentage / 100)),
  }

  // Calculate final price
  const finalPrice = {
    min: baseMinPrice - discountAmount.min + rushFeeAmount.min,
    max: baseMaxPrice - discountAmount.max + rushFeeAmount.max,
  }

  // Remove the useEffect that was causing the loop

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)

    // Call onUpdate with the new payment method
    if (onUpdate) {
      // Calculate all the values needed for the budget
      const baseMinPrice = 5400
      const baseMaxPrice = 10800

      const discountPercentage = appliedDiscount || 0
      const discountAmount = {
        min: Math.round(baseMinPrice * (discountPercentage / 100)),
        max: Math.round(baseMaxPrice * (discountPercentage / 100)),
      }

      const rushFeePercentage = selectedTimeline === "fast-track" ? 20 : 0
      const rushFeeAmount = {
        min: Math.round((baseMinPrice - discountAmount.min) * (rushFeePercentage / 100)),
        max: Math.round((baseMaxPrice - discountAmount.max) * (rushFeePercentage / 100)),
      }

      const finalPrice = {
        min: baseMinPrice - discountAmount.min + rushFeeAmount.min,
        max: baseMaxPrice - discountAmount.max + rushFeeAmount.max,
      }

      onUpdate({
        paymentMethod: value,
        finalPrice,
        basePrice: { min: baseMinPrice, max: baseMaxPrice },
        discount: { percentage: discountPercentage, amount: discountAmount },
        rushFee: { percentage: rushFeePercentage, amount: rushFeeAmount },
      })
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Here's Your Tailored Project Estimate</CardTitle>
        <CardDescription>Based on your selected services, features, timeline, and applicable discounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border">
          <div className="text-center mb-4">
            <h3 className="text-3xl font-bold text-slate-900">
              {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
            </h3>
            <p className="text-sm text-slate-600 mt-1">(Transparent. Professional. No hidden fees.)</p>
          </div>

          {/* Bonus Badge */}
          <div className="relative w-full max-w-md p-4 bg-amber-50 border border-amber-200 rounded-lg mt-4 animate-pulse">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">
                  Congratulations: You qualify for 3-Months Free Maintenance Support
                </p>
                <p className="text-sm text-amber-700 mt-1">(Value: {formatCurrency(600)})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown} className="border rounded-md">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span>Cost Breakdown</span>
              </div>
              <span className="text-sm text-muted-foreground">{showBreakdown ? "Hide" : "Show"}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span>Base Estimate</span>
                <span>
                  {formatCurrency(baseMinPrice)} – {formatCurrency(baseMaxPrice)}
                </span>
              </div>

              {selectedServices.length > 0 && (
                <div className="flex justify-between py-1">
                  <span>Selected Services ({selectedServices.length})</span>
                  <span>Included</span>
                </div>
              )}

              {selectedFeatures.length > 0 && (
                <div className="flex justify-between py-1">
                  <span>Selected Features ({selectedFeatures.length})</span>
                  <span>Included</span>
                </div>
              )}

              {discountPercentage > 0 && (
                <div className="flex justify-between py-1 text-green-600">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>
                    -{formatCurrency(discountAmount.min)} – -{formatCurrency(discountAmount.max)}
                  </span>
                </div>
              )}

              {rushFeePercentage > 0 && (
                <div className="flex justify-between py-1">
                  <span>Rush Fee ({rushFeePercentage}%)</span>
                  <span>
                    +{formatCurrency(rushFeeAmount.min)} – +{formatCurrency(rushFeeAmount.max)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Final Estimate</span>
                <span>
                  {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Timeline: {selectedTimeline === "fast-track" ? "Fast-Track Delivery (30 Days)" : "Standard Delivery"}
                  {selectedTimeline === "fast-track" && (
                    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                      VIP
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Payment Options */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Payment Options</h3>
          <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-3">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="full" id="payment-full" className="mt-1" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="payment-full" className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Full Payment
                </Label>
                <p className="text-sm text-muted-foreground ml-6">
                  Pay the full amount upfront and receive a 5% discount
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="milestone" id="payment-milestone" className="mt-1" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="payment-milestone" className="text-base font-medium flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-600" />
                  Milestone-Based
                </Label>
                <p className="text-sm text-muted-foreground ml-6">
                  Pay in 3 installments as project milestones are completed
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="subscription" id="payment-subscription" className="mt-1" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="payment-subscription" className="text-base font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  Monthly Subscription
                </Label>
                <p className="text-sm text-muted-foreground ml-6">
                  Spread payments over 6 months with our subscription plan
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <div>
          <p className="text-sm font-medium">Estimated Project Cost:</p>
          <p className="text-lg font-bold">
            {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
