import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { pdfService } from '@/services/pdfService'
import { PDFUploadProgress } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface PDFUploadProps {
  onUploadComplete?: (pdfId: string) => void
  onUploadError?: (error: string) => void
  className?: string
}

export const PDFUpload = ({ onUploadComplete, onUploadError, className }: PDFUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<PDFUploadProgress | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const updateProgress = (stage: PDFUploadProgress['stage'], progress: number, message: string) => {
    setUploadProgress({ stage, progress, message })
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadedFile(file)
    
    try {
      // Stage 1: Validating
      updateProgress('validating', 10, 'Validating PDF file...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX

      // Stage 2: Processing with OCR
      updateProgress('processing', 25, 'Processing PDF with AI OCR...')
      
      // Stage 3: Uploading to storage
      updateProgress('uploading', 60, 'Uploading to secure storage...')
      
      // Stage 4: Saving to database
      updateProgress('saving', 85, 'Saving processed data...')

      // Call the actual service
      const result = await pdfService.uploadAndProcessPDF(file)

      if (result.success && result.data) {
        updateProgress('complete', 100, 'Upload completed successfully!')
        
        toast({
          title: "PDF Processed Successfully",
          description: `${file.name} has been processed and is ready for AI analysis.`,
        })

        // Call success callback
        onUploadComplete?.(result.data.id)
        
        // Reset after a short delay
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(null)
          setUploadedFile(null)
        }, 2000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })

      onUploadError?.(errorMessage)
      setIsUploading(false)
      setUploadProgress(null)
      setUploadedFile(null)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      handleUpload(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading
  })

  const cancelUpload = () => {
    setIsUploading(false)
    setUploadProgress(null)
    setUploadedFile(null)
  }

  if (isUploading && uploadProgress) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              {uploadProgress.stage === 'complete' ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <FileText className="w-8 h-8 text-white animate-pulse" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {uploadedFile?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {uploadProgress.message}
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={uploadProgress.progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {uploadProgress.progress}% complete
              </p>
            </div>

            {uploadProgress.stage !== 'complete' && (
              <Button
                variant="outline"
                size="sm"
                onClick={cancelUpload}
                className="glass-card"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop a PDF file, or click to browse
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                PDF only
              </span>
              <span>•</span>
              <span>Max 5MB</span>
            </div>

            <Button className="btn-gradient">
              Choose File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}