'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DocumentUpload } from './document-upload'

interface DocumentViewerProps {
  projectId: string
  role: 'ADMIN' | 'MODERATOR' | 'FREELANCER' | 'CLIENT'
  canUpload?: boolean
  onUploadSuccess?: (url: string, fileName: string) => void
}

export function DocumentViewer({ projectId, role, canUpload = false, onUploadSuccess }: DocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('accessToken')
        if (!token) {
          console.log('No auth token found')
          setDocumentUrl(null)
          return
        }

        console.log('Using token:', token.substring(0, 10) + '...')
        console.log('API URL:', `${process.env.NEXT_PUBLIC_PLS}/projects/${projectId}/client-brief`)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PLS}/projects/${projectId}/client-brief`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            credentials: 'include',
          }
        )

        console.log('Response status:', response.status)
        
        // Handle 401 specifically
        if (response.status === 401) {
          console.error('Authentication failed. Token might be invalid or expired.')
          setError('Your session has expired. Please log in again.')
          return
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          
          if (response.status === 404) {
            // Document not found is an expected case
            setDocumentUrl(null)
            return
          }
          
          throw new Error(errorData.message || 'Failed to fetch document')
        }

        const data = await response.json()
        console.log('API Response:', data)
        
        if (data.success && data.data?.documentUrl) {
          setDocumentUrl(data.data.documentUrl)
          setDocumentName(data.data.fileName || 'project_document.pdf')
          onUploadSuccess?.(data.data.documentUrl, data.data.fileName)
        } else {
          setDocumentUrl(null)
        }
      } catch (err) {
        console.error('Error fetching document:', err)
        setError('Failed to load document. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [projectId, onUploadSuccess])

  const handleDownload = async () => {
    if (!documentUrl) return
    
    try {
      setIsDownloading(true)
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        toast.error('Please log in to download the document')
        return
      }

      console.log('Downloading document with token:', token.substring(0, 10) + '...')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}projects/${projectId}/client-brief`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        }
      )

      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to download document')
      }

      const data = await response.json()
      
      if (data.success && data.data?.documentUrl) {
        window.open(data.data.documentUrl, '_blank')
      } else {
        throw new Error('No document URL found')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download document')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Project Documentation
          </CardTitle>
          <CardDescription>Loading document information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Error Loading Document</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Project Documentation</CardTitle>
          </div>
          {documentUrl ? (
            <Badge variant="outline" className="border-green-100 bg-green-50 text-green-700">
              Document Available
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-100 bg-amber-50 text-amber-700">
              No Document
            </Badge>
          )}
        </div>
        <CardDescription>
          {documentUrl 
            ? 'Review the project documentation and requirements.'
            : 'No documentation has been uploaded for this project yet.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {documentUrl ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{documentName}</p>
                <p className="text-xs text-muted-foreground">PDF Document</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
            
            {role === 'CLIENT' && (
              <p className="text-xs text-muted-foreground">
                This document was uploaded by you and cannot be modified or deleted.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h4 className="mt-2 text-sm font-medium text-muted-foreground">
              {role === 'CLIENT' 
                ? 'No document uploaded yet' 
                : 'No document available'}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground/60">
              {role === 'CLIENT' 
                ? 'Upload the project requirements document to get started.'
                : 'The client has not uploaded any documentation yet.'}
            </p>
            
            {canUpload && role === 'CLIENT' && onUploadSuccess && (
              <div className="mt-4">
                <DocumentUpload 
                  projectId={projectId}
                  onDocumentUploaded={onUploadSuccess}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
