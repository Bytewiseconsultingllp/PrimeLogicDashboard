"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { createProjectCheckoutSession } from "@/lib/api/payment"

interface ProjectPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  totalAmount: number
  paidAmount: number
}

interface PaymentOption {
  value: string
  amount: number
  label: string
  isPaid: boolean
  remaining: number
  minAmount: number
  maxAmount: number
  amountPaid: number
}

export function ProjectPaymentModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  totalAmount,
  paidAmount,
}: ProjectPaymentModalProps) {
  // Calculate available payment options based on what's already paid
  const getAvailableOptions = () => {
    const options = [
      { 
        value: "25", 
        amount: totalAmount * 0.25, 
        label: "25% Deposit",
        minAmount: 0,
        maxAmount: totalAmount * 0.25
      },
      { 
        value: "50", 
        amount: totalAmount * 0.5, 
        label: "50% Payment",
        minAmount: totalAmount * 0.25,
        maxAmount: totalAmount * 0.5
      },
      { 
        value: "100", 
        amount: totalAmount, 
        label: "Full Payment (100%)",
        minAmount: totalAmount * 0.5,
        maxAmount: totalAmount
      },
    ]
    
    // Calculate payment options with correct remaining amounts
    return options.map(option => {
      // Calculate how much has been paid towards this specific option
      const paidForThisOption = Math.min(Math.max(0, paidAmount - option.minAmount), option.maxAmount - option.minAmount);
      const remaining = Math.max(0, option.amount - paidForThisOption);
      
      return {
        ...option,
        isPaid: paidAmount >= option.amount,
        remaining: remaining,
        amountPaid: paidForThisOption
      };
    })
  }

  const [availableOptions, setAvailableOptions] = useState<PaymentOption[]>(getAvailableOptions())
  const defaultOption = availableOptions.find(opt => !opt.isPaid)?.value || "100"
  const [selectedOption, setSelectedOption] = useState<string>(defaultOption)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFullyPaid, setIsFullyPaid] = useState(paidAmount >= totalAmount)
  
  // Update available options when paidAmount changes
  useEffect(() => {
    setAvailableOptions(getAvailableOptions())
    setIsFullyPaid(paidAmount >= totalAmount)
  }, [paidAmount, totalAmount])
  
  // Get the currently selected option details
  const selectedOptionDetails = useMemo(() => {
    return availableOptions.find(opt => opt.value === selectedOption)
  }, [selectedOption, availableOptions])

  // Function to get the selected option details
  const getSelectedOption = useCallback(() => {
    return availableOptions.find(opt => opt.value === selectedOption)
  }, [selectedOption, availableOptions])

  const handlePayment = async () => {
    if (!projectId) return

    const option = getSelectedOption()
    if (!option) return

    // If already paid, just close the modal
    if (option.isPaid) {
      onOpenChange(false)
      return
    }

    setIsProcessing(true)
    try {
      const response = await createProjectCheckoutSession({
        projectId,
        amount: option.remaining,
        description: `Payment for ${projectName} (${option.label})`,
        successUrl: `${window.location.origin}/dashboard/client/projects/${projectId}?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard/client/projects/${projectId}?payment=cancel`
      })

      if (response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to initiate payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            {paidAmount > 0 ? (
              <span>You've already paid ${paidAmount.toFixed(2)} of ${totalAmount.toFixed(2)}</span>
            ) : (
              `Select a payment option for ${projectName}`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Label>Payment Amount</Label>
            <RadioGroup 
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="grid gap-3"
            >
              {availableOptions.map((option) => {
                const isFullyPaid = option.remaining <= 0;
                const isPartiallyPaid = option.amount > option.remaining && option.remaining > 0;
                
                return (
                  <div 
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg border ${
                      isFullyPaid 
                        ? 'bg-green-50 border-green-100' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start h-5 mt-0.5">
                      <RadioGroupItem 
                        value={option.value}
                        id={`option-${option.value}`}
                        disabled={isFullyPaid}
                        className={isFullyPaid ? 'opacity-50' : ''}
                        checked={selectedOption === option.value || isFullyPaid}
                      />
                    </div>
                    <Label 
                      htmlFor={`option-${option.value}`}
                      className={`flex-1 cursor-pointer ml-3 ${isFullyPaid ? 'opacity-70' : ''}`}
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span>{option.label}</span>
                          <span className="font-medium">
                            ${option.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {isFullyPaid ? (
                          <span className="text-sm text-green-600 mt-1 flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                            Paid (${option.amount.toFixed(2)})
                          </span>
                        ) : isPartiallyPaid ? (
                          <span className="text-sm text-blue-600 mt-1">
                            Pay remaining: ${option.remaining.toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
          
          <div className={`p-3 rounded-lg text-sm border ${
            isFullyPaid 
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-blue-50 border-blue-100 text-blue-700'
          }`}>
            <p>
              {isFullyPaid ? (
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  Your payment is complete. Thank you for your business!
                </span>
              ) : getSelectedOption()?.isPaid ? (
                'This payment option is already paid. Please select another option if you need to make an additional payment.'
              ) : (
                `You will be redirected to a secure payment page to pay $${(selectedOptionDetails?.amount || 0).toFixed(2)}`
              )}
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button 
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || isFullyPaid || (selectedOptionDetails?.isPaid ?? false)}
            className={`w-full sm:w-auto text-white ${
              isFullyPaid || selectedOptionDetails?.isPaid 
                ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                : ''
            }`}
            style={{
              backgroundColor: !isFullyPaid && !selectedOptionDetails?.isPaid ? '#003087' : undefined,
              opacity: isFullyPaid || selectedOptionDetails?.isPaid ? 0.7 : 1
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isFullyPaid ? (
              'Payment Complete'
            ) : selectedOptionDetails?.isPaid ? (
              'Already Paid'
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ${(selectedOptionDetails?.amount || 0).toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
