import { supabase } from '@/lib/supabase'
import { ProcessedPDF } from '@/types'

// Types for PDF processing
export interface PDFUploadResponse {
  success: boolean
  data?: ProcessedPDF
  error?: string
}

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const PROCESSING_API_URL = import.meta.env.VITE_PROCESSING_API_URL

class PDFService {
  /**
   * Validate PDF file before processing
   */
  private validatePDFFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are allowed' }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` }
    }

    return { valid: true }
  }

  /**
   * Process PDF using the main.py endpoint
   */
  private async processPDFWithAPI(file: File): Promise<{ extracted_text: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${PROCESSING_API_URL}/process-pdf`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Upload PDF file to Supabase storage
   */
  private async uploadToSupabaseStorage(file: File, fileName: string): Promise<string> {
    console.log('Uploading file:', fileName)
    
    const { data, error } = await supabase.storage
      .from('pdf')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error(`Storage upload failed: ${error.message}. Please check your Supabase storage policies.`)
    }

    if (!data) {
      throw new Error('Storage upload failed: No data returned')
    }

    console.log('Upload successful:', data.path)
    return data.path
  }

  /**
   * Save PDF metadata and extracted text to database
   */
  private async savePDFToDatabase(
    userId: string,
    fileName: string,
    extractedText: string,
    fileSize: number,
    storagePath: string
  ): Promise<ProcessedPDF> {
    const { data, error } = await supabase
      .from('processed_pdfs')
      .insert({
        user_id: userId,
        pdf_name: fileName,
        extracted_text: extractedText,
        size: fileSize
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database save failed: ${error.message}`)
    }

    // Add storage_path to the returned data for compatibility
    return {
      ...data,
      storage_path: storagePath
    }
  }

  /**
   * Get current authenticated user
   */
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      throw new Error(`Authentication error: ${error.message}`)
    }
    
    if (!user) {
      throw new Error('User not authenticated. Please sign in again.')
    }

    return user
  }

  /**
   * Main method to upload and process PDF
   */
  async uploadAndProcessPDF(file: File): Promise<PDFUploadResponse> {
    try {
      // Validate file
      const validation = this.validatePDFFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Get authenticated user
      const user = await this.getCurrentUser()

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const uniqueFileName = `${user.id}/${timestamp}_${sanitizedName}`

      // Step 1: Process PDF with the API endpoint
      console.log('Processing PDF with OCR...')
      const processingResult = await this.processPDFWithAPI(file)

      // Step 2: Upload to Supabase storage
      console.log('Uploading to Supabase storage...')
      const storagePath = await this.uploadToSupabaseStorage(file, uniqueFileName)

      // Step 3: Save to database
      console.log('Saving to database...')
      const dbResult = await this.savePDFToDatabase(
        user.id,
        file.name,
        processingResult.extracted_text,
        file.size,
        storagePath
      )

      return {
        success: true,
        data: dbResult
      }

    } catch (error) {
      console.error('PDF processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get user's processed PDFs
   */
  async getUserPDFs(): Promise<ProcessedPDF[]> {
    try {
      const user = await this.getCurrentUser()

      const { data, error } = await supabase
        .from('processed_pdfs')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch PDFs: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user PDFs:', error)
      throw error
    }
  }

  /**
   * Get a specific PDF by ID
   */
  async getPDFById(id: string): Promise<ProcessedPDF | null> {
    try {
      const user = await this.getCurrentUser()

      const { data, error } = await supabase
        .from('processed_pdfs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw new Error(`Failed to fetch PDF: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching PDF by ID:', error)
      throw error
    }
  }

  /**
   * Delete a PDF (from storage and database)
   */
  async deletePDF(id: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()

      // First get the PDF to get storage path
      const pdf = await this.getPDFById(id)
      if (!pdf) {
        throw new Error('PDF not found')
      }

      // Try to delete from storage using the constructed path
      // Since we don't store storage_path in DB, we reconstruct it
      const timestamp = new Date(pdf.uploaded_at).getTime()
      const sanitizedName = pdf.pdf_name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `${user.id}/${timestamp}_${sanitizedName}`

      const { error: storageError } = await supabase.storage
        .from('pdf')
        .remove([storagePath])

      if (storageError) {
        console.warn('Storage deletion failed:', storageError.message)
      }

      // Delete from database
      const { error } = await supabase
        .from('processed_pdfs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Failed to delete PDF: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting PDF:', error)
      throw error
    }
  }

  /**
   * Get PDF download URL from storage
   */
  async getPDFDownloadUrl(pdfId: string): Promise<string> {
    try {
      const pdf = await this.getPDFById(pdfId)
      if (!pdf) {
        throw new Error('PDF not found')
      }

      // Reconstruct storage path since it's not stored in DB
      const timestamp = new Date(pdf.uploaded_at).getTime()
      const sanitizedName = pdf.pdf_name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `${pdf.user_id}/${timestamp}_${sanitizedName}`

      const { data, error } = await supabase.storage
        .from('pdf')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry

      if (error) {
        throw new Error(`Failed to get download URL: ${error.message}`)
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  }
}

export const pdfService = new PDFService()