"use client"

import { useState, useEffect } from "react"
import { Check, FileText, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import * as api from "../utils/api"

interface ServiceAgreementProps {
  agreementData: {
    accepted: boolean
  }
  buyerName?: string
  visitorId?: string | null
  selectedServices?: Array<{
    id: string
    name: string
    price: number
    description?: string
  }>
  appliedDiscount?: number
  totalPrice?: number
  onUpdate: (data: { accepted: boolean; pdfUrl?: string; submitFunction?: () => Promise<boolean> }) => void
  onNext?: () => void
}

export default function ServiceAgreement({
  agreementData,
  buyerName = "",
  visitorId = null,
  selectedServices = [],
  appliedDiscount = 0,
  totalPrice,
  onUpdate,
  onNext,
}: ServiceAgreementProps) {
  const [accepted, setAccepted] = useState(false) // Always start unchecked
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [agreementPdfUrl, setAgreementPdfUrl] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Submit function to be called by parent component's Next button
  const submitAgreementToAPI = async (): Promise<boolean> => {
    if (!accepted) {
      setAcceptError('Please accept the service agreement to proceed.')
      return false
    }

    if (!visitorId) {
      setAcceptError('Visitor ID not found. Please complete previous steps.')
      return false
    }

    setIsAccepting(true)
    setAcceptError(null)

    try {
      console.log('🚀 Submitting service agreement for visitor:', visitorId)
      const result = await api.acceptServiceAgreement(visitorId, true)
      console.log('✅ Service agreement accepted successfully:', result)
      
      // Store PDF URL if provided
      if (result.data?.pdfUrl) {
        setAgreementPdfUrl(result.data.pdfUrl)
      }
      
      setIsSubmitted(true)
      
      onUpdate({ 
        accepted: true,
        pdfUrl: result.data?.pdfUrl,
        submitFunction: submitAgreementToAPI
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept agreement'
      setAcceptError(errorMessage)
      console.error('❌ Error accepting agreement:', error)
      return false
    } finally {
      setIsAccepting(false)
    }
  }

  const handleAcceptChange = (checked: boolean) => {
    setAccepted(checked)
    setAcceptError(null)
    
    // Update parent with checkbox state and submit function
    onUpdate({ 
      accepted: checked,
      submitFunction: submitAgreementToAPI
    })
  }

  // Expose submit function to parent component
  useEffect(() => {
    onUpdate({
      accepted: accepted,
      submitFunction: submitAgreementToAPI
    })
  }, [accepted, isSubmitted])


  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#003087]" />
          SERVICE AGREEMENT
        </CardTitle>
        <CardDescription>Please review and accept our service agreement</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {buyerName && (
          <div className="mb-6 p-4 bg-gray-50 border rounded-md">
            <p className="font-medium text-lg">Client: {buyerName}</p>
            <p className="text-sm text-muted-foreground mt-1">Agreement Date: {new Date().toLocaleDateString()}</p>
          </div>
        )}

        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-base mb-2">1. SCOPE OF SERVICES</h3>
            <p>
              Prime Logic Solutions ("Provider") agrees to provide the Client with software development services as
              outlined in the Statement of Requirements and Estimate. The services include design, development, testing,
              and deployment of the software solution according to the specifications agreed upon by both parties.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">2. TIMELINE AND DELIVERY</h3>
            <p>
              The Provider will deliver the project according to the timeline selected by the Client. Any changes to the
              timeline must be agreed upon in writing by both parties. The Provider will make reasonable efforts to meet
              all deadlines but is not responsible for delays caused by the Client or circumstances beyond the
              Provider's control.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">3. PAYMENT TERMS</h3>
            <p>
              The Client agrees to pay the Provider according to the payment schedule outlined in the Estimate. All
              payments are due within 15 days of invoice receipt. Late payments may result in project delays and
              additional fees. The Client is responsible for all applicable taxes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">4. INTELLECTUAL PROPERTY</h3>
            <p>
              Upon full payment, the Client will own all rights to the custom code developed specifically for this
              project. The Provider retains rights to any pre-existing code, frameworks, or tools used in the
              development process. The Provider may use general knowledge and techniques learned during the project for
              future work.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">5. CONFIDENTIALITY</h3>
            <p>
              Both parties agree to maintain the confidentiality of any proprietary information shared during the
              project. This includes business plans, technical specifications, and any other sensitive information. This
              obligation continues for two years after the completion of the project.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">6. CHANGES AND REVISIONS</h3>
            <p>
              Any changes to the project scope, timeline, or deliverables must be documented and approved by both
              parties. Additional work beyond the original scope may result in additional charges and timeline
              adjustments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">7. WARRANTY AND SUPPORT</h3>
            <p>
              The Provider warrants that the delivered software will function according to the agreed specifications for
              a period of 30 days after delivery. The Provider will fix any bugs or issues covered by this warranty at
              no additional cost. Extended support and maintenance are available under separate agreements.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">8. LIMITATION OF LIABILITY</h3>
            <p>
              The Provider's liability is limited to the amount paid by the Client for the services. The Provider is not
              liable for any indirect, consequential, or incidental damages, including loss of profits or data.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">9. TERMINATION</h3>
            <p>
              Either party may terminate this agreement with 30 days' written notice. If the Client terminates the
              agreement, they are responsible for paying for all work completed up to the termination date. If the
              Provider terminates the agreement, they will provide a reasonable transition period and assist in
              transferring the project to another developer if requested.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">10. GOVERNING LAW</h3>
            <p>
              This agreement is governed by the laws of the jurisdiction where the Provider is located. Any disputes
              arising from this agreement will be resolved through arbitration according to the rules of the American
              Arbitration Association.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">11. PRICING AND SERVICES</h3>
            <p>
              The Client agrees to pay for the following services as outlined in the Estimate. All prices are in USD
              unless otherwise specified.
            </p>

            {selectedServices && selectedServices.length > 0 ? (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedServices.map((service, index) => (
                      <tr key={service.id || index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{service.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ${service.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {appliedDiscount && appliedDiscount > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Discount</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">-{appliedDiscount}%</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        ${totalPrice ? totalPrice.toLocaleString() : "To be determined"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 italic">No services have been selected yet.</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        {acceptError && (
          <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{acceptError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start space-x-2 mb-6">
          <Checkbox 
            id="accept" 
            checked={accepted} 
            onCheckedChange={handleAcceptChange}
            disabled={isSubmitted}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="accept"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and accept the Service Agreement
            </Label>
            <p className="text-sm text-muted-foreground">
              By checking this box, you agree to be bound by the terms and conditions outlined in this agreement.
            </p>
          </div>
        </div>

        {isSubmitted && (
          <div className="w-full mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-2">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800">Agreement Successfully Submitted</p>
                <p className="text-sm text-green-700 mt-1">
                  Your service agreement has been processed and saved. You can now proceed to the next step.
                </p>
                {agreementPdfUrl && (
                  <a 
                    href={agreementPdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    <FileText className="h-4 w-4" />
                    Download Agreement PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
