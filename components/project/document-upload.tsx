'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, FileText, Download, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DocumentUploadProps {
  projectId: string
  documentUrl?: string
  fileName?: string
  onDocumentUploaded: (url: string, fileName: string) => void
}

export function DocumentUpload({ 
  projectId, 
  documentUrl, 
  fileName,
  onDocumentUploaded 
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxFileSize = 5 * 1024 * 1024 // 5MB in bytes

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported')
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('document', file)

    try {
      setIsUploading(true)
      const response = await fetch(`/api/v1/projects/${projectId}/client-brief/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document')
      }

      toast.success('Document uploaded successfully')
      onDocumentUploaded(data.data.documentUrl, data.data.fileName)
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async () => {
    if (!documentUrl) return
    
    try {
      setIsDownloading(true)
      const response = await fetch(`/api/v1/projects/${projectId}/client-brief`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to download document')
      }

      const data = await response.json()
      
      // Open the document URL in a new tab for download
      window.open(data.data.documentUrl, '_blank')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download document')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileText className="w-5 h-5 text-[#003087]" />
          Project Documentation
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Upload and manage your project documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documentUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-md">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{fileName || 'project_document.pdf'}</p>
                  <Badge variant="outline" className="mt-1">PDF Document</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                disabled={isDownloading}
                className="ml-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Document has been uploaded successfully
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="p-3 mb-4 bg-blue-100 rounded-full">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="mb-1 text-sm font-medium text-gray-700">Upload Project Brief</p>
              <p className="mb-4 text-xs text-gray-500">
                Upload a PDF document with your project requirements (max 5MB)
              </p>
              <Input
                id="document"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-white hover:bg-gray-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
